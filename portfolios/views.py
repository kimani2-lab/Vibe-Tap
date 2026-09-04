import json
from django.http import HttpResponse, Http404
from django.shortcuts import get_object_or_404
from .models import Profile


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

    vcard_lines = []

    vcard_lines.append(f"FN:{profile.full_name}")

    if profile.headline:
        vcard_lines.append(f"TITLE:{profile.headline}")

    if profile.phone:
        vcard_lines.append(f"TEL:{profile.phone}")

    if profile.email:
        vcard_lines.append(f"EMAIL:{profile.email}")

    if profile.avatar_url:
        vcard_lines.append(f"PHOTO:{profile.avatar_url}")

    social_links = profile.social_links or {}
    for key, url in social_links.items():
        vcard_lines.append(f"X-{key.upper()}:{url}")

    vcard_content = "\n".join(vcard_lines) + "\n"

    response = HttpResponse(vcard_content, content_type='text/vcard')
    response['Content-Disposition'] = f'attachment; filename="{slug}.vcf"'
    return response