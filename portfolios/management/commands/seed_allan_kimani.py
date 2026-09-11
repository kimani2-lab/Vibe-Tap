from django.core.management.base import BaseCommand

from portfolios.models import Profile


class Command(BaseCommand):
    help = "Seed the Allan-kimani portfolio profile for production and local use."

    def handle(self, *args, **options):
        profile, created = Profile.objects.update_or_create(
            slug="Allan-kimani",
            defaults={
                "full_name": "Allan kimani",
                "headline": "Product Designer",
                "bio": "Crafting thoughtful digital experiences with a focus on design systems, interfaces, and product clarity.",
                "email": "hello@allankimani.com",
                "phone": "+254700000000",
                "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
                "social_links": {
                    "github": "https://github.com/kimani2-lab",
                    "linkedin": "https://www.linkedin.com/in/allan-kimani",
                    "website": "https://allankimani.com",
                },
            },
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f"Created profile: {profile.slug}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Updated profile: {profile.slug}"))
