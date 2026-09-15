import json
import uuid
from datetime import datetime, timezone

from django.core.exceptions import ValidationError
from django.db import models
from django.http import Http404
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone as tz

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import AgentNFCCard, AgentProfile, NFCCard, Profile
from .serializers import (
    AgentProfileSerializer,
    NFCCardSerializer,
    ProfileSerializer,
    ResolveCredentialSerializer,
    RegisterAgentSerializer,
)


@api_view(['GET'])
def agent_resolver(request, identifier):
    """Resolve an authorized agent by NFC card token, slug, or agent ID."""
    try:
        card = AgentNFCCard.objects.select_related('agent').get(card_token=identifier)
    except (AgentNFCCard.DoesNotExist, ValidationError, ValueError, TypeError):
        card = None

    if card is not None:
        if card.status == AgentNFCCard.STATUS_LOCKED:
            return Response(
                {'error': 'This card has been reported lost or deactivated.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if card.status == AgentNFCCard.STATUS_UNLINKED or card.agent is None:
            return Response(
                {'error': 'This card is not linked to an agent.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if card.status == AgentNFCCard.STATUS_ACTIVE:
            return Response(AgentProfileSerializer(card.agent).data)

    agent = AgentProfile.objects.filter(
        models.Q(slug__iexact=identifier) | models.Q(agent_id__iexact=identifier)
    ).first()
    if agent is None:
        return Response(
            {'error': 'Agent profile not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(AgentProfileSerializer(agent).data)


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
    serializer.is_valid(raise_exception=True)
    agent = serializer.save()
    response_data = AgentProfileSerializer(agent).data
    card = agent.nfc_cards.order_by('-assigned_at').first()
    response_data['nfc_payload_url'] = (
        f'https://vibe-tap-one.vercel.app/c/{card.card_token}'
        if card is not None
        else None
    )
    return Response(response_data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def resolve_card_token(request, card_token):
    """Resolve an active NFC credential and its public agent profile."""
    try:
        credential = NFCCard.objects.select_related('agent_profile').get(
            card_token=card_token,
            status=NFCCard.STATUS_CHOICES[0][0],
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
        'slug': profile.slug,
        'full_name': profile.full_name,
        'headline': profile.headline,
        'bio': profile.bio,
        'email': profile.email,
        'phone': profile.phone,
        'avatar_url': profile.avatar_url,
        'social_links': profile.social_links or {},
        'projects': [
            {
                'id': p.id,
                'title': p.title,
                'description': p.description,
                'project_url': p.project_url,
                'cover_image': p.cover_image,
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
        if card.status == 'LOCKED':
            return JsonResponse(
                {'error': 'This card has been reported lost or deactivated.'},
                status=403
            )
        elif card.status == 'UNLINKED':
            return JsonResponse(
                {'error': 'Unassigned card.'},
                status=404
            )
        elif card.status == 'ACTIVE':
            profile = card.profile
            if profile:
                serializer = ProfileSerializer(profile)
                return JsonResponse(serializer.data)
            return JsonResponse(
                {'error': 'Card has no associated profile.'},
                status=404
            )

    # Fallback: try as profile slug
    profile = get_object_or_404(Profile, slug=identifier)
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
        card.status = 'LOCKED'
        card.last_tapped_at = tz.now()
        card.save()
        return Response(
            {'message': 'Card locked successfully.', 'card_token': str(card.card_token)},
            status=status.HTTP_200_OK
        )

    if profile_id:
        profile = get_object_or_404(Profile, id=profile_id)
        card = NFCCard.objects.filter(profile=profile).first()
        if card:
            card.status = 'LOCKED'
            card.last_tapped_at = tz.now()
            card.save()
            return Response(
                {'message': 'Card locked successfully.', 'card_token': str(card.card_token)},
                status=status.HTTP_200_OK
            )
        # If no card exists for this profile, create one and lock it
        new_card = NFCCard.objects.create(
            profile=profile,
            status='LOCKED',
            last_tapped_at=tz.now()
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
        profile = card.profile
        if not profile:
            return Response(
                {'error': 'Card is not linked to a profile.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Unlink any existing card from this profile (set to UNLINKED)
    NFCCard.objects.filter(profile=profile).update(status='UNLINKED', profile=None)

    # Assign new card token to the profile
    new_card_token = str(uuid.uuid4())
    NFCCard.objects.create(
        profile=profile,
        card_token=new_card_token,
        status='ACTIVE'
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
    profile = get_object_or_404(Profile, slug=slug)
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
    title = _escape_vcard(profile.headline or '')
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