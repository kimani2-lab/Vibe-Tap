from django.db import migrations, models
from django.utils.text import slugify


def populate_slugs(apps, schema_editor):
    AgentProfile = apps.get_model('portfolios', 'AgentProfile')
    Profile = apps.get_model('portfolios', 'Profile')

    for model in (AgentProfile, Profile):
        used_slugs = set(model.objects.exclude(slug__isnull=True).values_list('slug', flat=True))
        for instance in model.objects.filter(slug__isnull=True).order_by('pk'):
            base_slug = slugify(instance.full_name) or f'profile-{instance.pk}'
            candidate = base_slug
            suffix = 2
            while candidate in used_slugs:
                candidate = f'{base_slug}-{suffix}'
                suffix += 1
            instance.slug = candidate
            instance.save(update_fields=['slug'])
            used_slugs.add(candidate)


class Migration(migrations.Migration):

    dependencies = [
        ('portfolios', '0003_remove_profile_github_url_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='agentprofile',
            name='slug',
            field=models.SlugField(blank=True, max_length=255, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='slug',
            field=models.SlugField(blank=True, max_length=255, null=True, unique=True),
        ),
        migrations.RunPython(populate_slugs, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='agentprofile',
            name='slug',
            field=models.SlugField(blank=True, max_length=255, unique=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='slug',
            field=models.SlugField(blank=True, max_length=255, unique=True),
        ),
    ]