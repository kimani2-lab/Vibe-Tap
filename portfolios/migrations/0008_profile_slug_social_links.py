from django.db import migrations, models
from django.utils.text import slugify


def populate_profile_slugs(apps, schema_editor):
    Profile = apps.get_model('portfolios', 'Profile')
    used_slugs = set(Profile.objects.exclude(slug__isnull=True).values_list('slug', flat=True))

    for profile in Profile.objects.filter(slug__isnull=True).order_by('pk'):
        base_slug = slugify(profile.full_name) or f'profile-{profile.pk}'
        candidate = base_slug
        suffix = 2
        while candidate in used_slugs:
            candidate = f'{base_slug}-{suffix}'
            suffix += 1
        profile.slug = candidate
        profile.save(update_fields=['slug'])
        used_slugs.add(candidate)


class Migration(migrations.Migration):
    dependencies = [
        ('portfolios', '0007_remove_profile_slug_remove_profile_social_links_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='slug',
            field=models.SlugField(blank=True, max_length=255, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='social_links',
            field=models.JSONField(blank=True, default=dict, help_text='Provide key-value pairs in JSON format, e.g., {"github": "https://...", "linkedin": "https://..."}'),
        ),
        migrations.RunPython(populate_profile_slugs, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='profile',
            name='slug',
            field=models.SlugField(blank=True, max_length=255, unique=True),
        ),
    ]