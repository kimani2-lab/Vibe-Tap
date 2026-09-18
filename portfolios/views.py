import json
import uuid
from datetime import datetime, timezone

from django.core.exceptions import ValidationError
from django.db.models import Q
from django.db import models
from django.http import Http404
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone as tz
from django.utils.text import slugify

from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.cache import never_cache
import logging

logger = logging.getLogger(__name__)

from .models import AgentProfile, NFCCard, Profile
from .serializers import (
    AgentProfileSerializer,
    ProfileSerializer,
    RegisterAgentSerializer,
    ResolveCredentialSerializer,
)


@api_view(['GET'])
@never_cache
def agent_resolver(request, identifier):
    """
    Resolves an AgentProfile by slug, agent_id, or NFC card token.
    Supports case-insensitive matching and auto-slugified inputs.
    """
    clean_identifier = identifier.strip()
    # Normalize: replace underscores with hyphens, lowercase, then slugify
    normalized_slug = slugify(clean_identifier.replace("_", "-"))

    # Match against slug (both raw & normalized), agent_id, or NFC card token
    agent = AgentProfile.objects.filter(
        Q(slug__iexact=clean_identifier) |
        Q(slug__iexact=normalized_slug) |
        Q(agent_id__iexact=clean_identifier) |
        Q(nfc_cards__card_token__iexact=clean_identifier)
    ).first()

    if not agent:
        response = Response(
            {"error": f"Agent profile '{identifier}' not found."},
            status=status.HTTP_404_NOT_FOUND
        )
        response["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response["Pragma"] = "no-cache"
        response["Expires"] = "0"
        return response

    serializer = AgentProfileSerializer(agent)
    response = Response(serializer.data, status=status.HTTP_200_OK)
    response["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response["Pragma"] = "no-cache"
    response["Expires"] = "0"
    return response


@api_view(['POST'])
def agent_create(request):
    """Create a SasaPay agent profile for the supervisor or admin app."""
    serializer = AgentProfileSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def register_agent_api(request):
    serializer = RegisterAgentSerializer(data=request.data)
    if serializer.is_valid():
        try:
            agent = serializer.save()
            payload = AgentProfileSerializer(agent).data
            card = NFCCard.objects.filter(agent_profile=agent).order_by('-created_at').first()
            if card is not None:
                payload['card_token'] = card.card_token
                payload['nfc_payload_url'] = f"https://vibe-tap-one.vercel.app/c/{card.card_token}"
            return Response(payload, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Registration Error: {str(e)}", exc_info=True)
            return Response(
                {"detail": f"Registration failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    logger.error(f"Validation Errors: {serializer.errors}")
    return Response(
        {"detail": "Validation error", "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def resolve_card_token(request, card_token):
    """Resolve an active NFC credential and its public agent profile."""
    try:
        credential = NFCCard.objects.select_related('agent_profile').get(
            card_token=card_token,
            is_active=True,
            agent_profile__isnull=False,
        )
    except (NFCCard.DoesNotExist, ValidationError, ValueError, TypeError):
        raise Http404('Not found.')
    return Response(
        {
            'status': 'success',
            'data': ResolveCredentialSerializer(credential).data,
        },
        status=status.HTTP_200_OK,
    )


def portfolio_detail(request, slug):
    profile = get_object_or_404(Profile, slug__iexact=slug)
    data = {
        'id': profile.id,
        'slug': slugify(profile.full_name),
        'full_name': profile.full_name,
        'title': profile.title,
        'headline': profile.title,
        'bio': profile.bio,
        'email': profile.email,
        'phone': profile.phone,
        'location': profile.location or '',
        'avatar_url': profile.avatar_url,
        'social_links': profile.social_links or {},
        'projects': [
            {
                'id': p.id,
                'title': p.title,
                'description': p.description,
                'project_url': p.project_url,
                'tech': [technology.strip() for technology in p.technologies.split(',') if technology.strip()],
                'cover_image': None,
            }
            for p in profile.projects.all()
        ],
    }
    return HttpResponse(json.dumps(data), content_type='application/json')


def _escape_vcard(value):
    if value is None:
        return ""
    return (
        str(value)
        .replace('\\', '\\\\')
        .replace(';', '\\;')
        .replace(',', '\\,')
        .replace('\n', '\\n')
    )


@api_view(['GET'])
def tap_resolver(request, identifier):
    """
    NFC Card Resolver API Endpoint.
    /api/v1/tap/<identifier>/
    
    If identifier matches a card_token:
      - LOCKED: Return 403 Forbidden
      - UNLINKED: Return 404 Not Found
      - ACTIVE: Return profile data
    
    Fallback: If identifier is a profile slug, serve the profile directly.
    """
    # Try to match as card_token (UUID)
    card = None
    try:
        card = NFCCard.objects.get(card_token=identifier)
    except NFCCard.DoesNotExist:
        pass
    except (ValidationError, ValueError, TypeError):
        # Identifier is not a valid UUID, fall through to slug fallback
        pass

    if card:
        if not card.is_active:
            return JsonResponse(
                {'error': 'This card has been reported lost or deactivated.'},
                status=403
            )
        elif card.agent_profile is None:
            return JsonResponse(
                {'error': 'Unassigned card.'},
                status=404
            )
        elif card.is_active:
            profile = card.agent_profile
            if profile:
                serializer = AgentProfileSerializer(profile)
                return JsonResponse(serializer.data)
            return JsonResponse(
                {'error': 'Card has no associated profile.'},
                status=404
            )

    # Fallback: try as profile slug
    profile = get_object_or_404(Profile, slug__iexact=identifier)
    serializer = ProfileSerializer(profile)
    return JsonResponse(serializer.data)


@api_view(['POST'])
def card_lock(request):
    """
    POST /api/v1/cards/lock/
    Accepts { "card_token": "<uuid>" } or { "profile_id": <id> }
    Sets card status to LOCKED and logs the revocation timestamp.
    """
    card_token = request.data.get('card_token')
    profile_id = request.data.get('profile_id')

    if card_token:
        card = get_object_or_404(NFCCard, card_token=card_token)
        card.is_active = False
        card.save(update_fields=['is_active'])
        return Response(
            {'message': 'Card locked successfully.', 'card_token': str(card.card_token)},
            status=status.HTTP_200_OK
        )

    if profile_id:
        profile = get_object_or_404(Profile, id=profile_id)
        card = NFCCard.objects.filter(agent_profile=profile).first()
        if card:
            card.is_active = False
            card.save(update_fields=['is_active'])
            return Response(
                {'message': 'Card locked successfully.', 'card_token': str(card.card_token)},
                status=status.HTTP_200_OK
            )
        # If no card exists for this profile, create one and lock it
        new_card = NFCCard.objects.create(
            agent_profile=profile,
            is_active=False,
        )
        return Response(
            {'message': 'Card created and locked.', 'card_token': str(new_card.card_token)},
            status=status.HTTP_201_CREATED
        )

    return Response(
        {'error': 'Either card_token or profile_id must be provided.'},
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
def card_reassign(request):
    """
    POST /api/v1/cards/reassign/
    Unlinks the lost card_token, generates/assigns a new card_token to the user profile,
    and sets status to ACTIVE.
    """
    card_token = request.data.get('card_token')
    profile_id = request.data.get('profile_id')

    if not card_token and not profile_id:
        return Response(
            {'error': 'Either card_token or profile_id must be provided.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get the profile
    if profile_id:
        profile = get_object_or_404(Profile, id=profile_id)
    else:
        # If only card_token provided, get profile from that card
        card = get_object_or_404(NFCCard, card_token=card_token)
        profile = card.agent_profile
        if not profile:
            return Response(
                {'error': 'Card is not linked to a profile.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Unlink any existing card from this profile (set to UNLINKED)
    NFCCard.objects.filter(agent_profile=profile).update(is_active=False, agent_profile=None)

    # Assign new card token to the profile
    new_card_token = str(uuid.uuid4())
    NFCCard.objects.create(
        agent_profile=profile,
        card_token=new_card_token,
        is_active=True
    )

    # If there was a previous card with the same token, we essentially replaced it
    return Response(
        {
            'message': 'Card reassigned successfully.',
            'profile_id': profile.id,
            'new_card_token': new_card_token,
            'status': 'ACTIVE'
        },
        status=status.HTTP_200_OK
    )


def vcard(request, slug):
    profile = get_object_or_404(Profile, slug__iexact=slug)
    social_links = profile.social_links or {}

    org_name = None
    website_url = None

    for key, value in social_links.items():
        key_lower = str(key).lower()
        if not value:
            continue
        if key_lower in {'organization', 'company', 'org'}:
            org_name = value
        elif key_lower in {'website', 'url', 'site', 'portfolio'}:
            website_url = value

    if not website_url and profile.avatar_url:
        website_url = profile.avatar_url

    full_name = _escape_vcard(profile.full_name or '')
    organization = _escape_vcard(org_name or '')
    title = _escape_vcard(profile.title or '')
    phone = _escape_vcard(profile.phone or '')
    email = _escape_vcard(profile.email or '')
    website = _escape_vcard(website_url or '')

    family_name, given_name = '', ''
    if full_name:
        parts = full_name.split(' ', 1)
        family_name = parts[0] if len(parts) == 1 else parts[-1]
        given_name = parts[0] if len(parts) == 1 else parts[0]

    vcard_lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        f'N:{family_name};{given_name};;;',
        f'FN:{full_name}',
    ]

    if title:
        vcard_lines.append(f'TITLE:{title}')
    if organization:
        vcard_lines.append(f'ORG:{organization}')
    if phone:
        vcard_lines.append(f'TEL:{phone}')
    if email:
        vcard_lines.append(f'EMAIL:{email}')
    if website:
        vcard_lines.append(f'URL:{website}')

    vcard_lines.append('END:VCARD')
    vcard_content = '\r\n'.join(vcard_lines) + '\r\n'

    response = HttpResponse(vcard_content, content_type='text/vcard; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{slug}.vcf"'
    return response


class AgentProfileViewSet(viewsets.ModelViewSet):
    queryset = AgentProfile.objects.all()
    serializer_class = AgentProfileSerializer
    lookup_field = 'slug'


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    lookup_field = 'slug'# Force redeploy trigger - Thu Sep 17 11:16:22 AM EAT 2026
