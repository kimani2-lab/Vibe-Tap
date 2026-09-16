from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('portfolios', '0004_agentprofile_slug_profile_slug'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='slug',
        ),
    ]