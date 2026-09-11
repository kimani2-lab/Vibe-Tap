import json
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from .models import Profile


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


def portfolio_detail(request, slug):
    profile = get_object_or_404(Profile, slug=slug)
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