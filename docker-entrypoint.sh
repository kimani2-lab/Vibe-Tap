#!/bin/bash
set -e

echo "==> Running Database Migrations..."
python manage.py migrate --noinput

echo "==> Loading seed_data.json into production PostgreSQL..."
python manage.py loaddata seed_data.json || echo "Seed data load skipped or already applied."

echo "==> Normalizing and Backfilling Slugs for AgentProfiles..."
python manage.py shell -c "
from portfolios.models import AgentProfile
from django.utils.text import slugify

for agent in AgentProfile.objects.all():
    target_slug = slugify(agent.slug or agent.full_name)
    if agent.slug != target_slug:
        agent.slug = target_slug
        agent.save()
        print(f'Updated Agent Slug: {agent.agent_id} -> {agent.slug}')
"

echo "==> Normalizing and Backfilling Slugs for Profiles..."
python manage.py shell -c "
from portfolios.models import Profile
from django.utils.text import slugify

for profile in Profile.objects.all():
    target_slug = slugify(profile.slug or profile.full_name)
    if profile.slug != target_slug:
        profile.slug = target_slug
        profile.save()
        print(f'Updated Profile Slug: {profile.full_name} -> {profile.slug}')
"

echo "==> Collectstatic (if needed)..."
python manage.py collectstatic --noinput || echo "Collectstatic skipped."

echo "==> Starting Gunicorn Application Server..."
exec "$@"