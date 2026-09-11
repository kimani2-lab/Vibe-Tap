from django.core.management.base import BaseCommand

from portfolios.models import Profile, Project


class Command(BaseCommand):
    help = "Seed the Allan-kimani portfolio profile for production and local use."

    def handle(self, *args, **options):
        profile, created = Profile.objects.update_or_create(
            slug="Allan-kimani",
            defaults={
                "full_name": "Allan kimani",
                "headline": "Fullstack software engineer| backend developer",
                "bio": "Fullstack Software Developer specializing in Python, Django REST Framework, Next.js, React, and Flutter. Passionate about building high-performance backend architectures, payment integrations, and modern web interfaces. Also experienced in building scalable mobile applications with Flutter and Dart, alongside robust Django backends. Skilled in database design, REST API engineering, and secure payment processing.",
                "email": "kimania271@gmail.com",
                "phone": "+254758288727",
                "avatar_url": "https://img.magnific.com/free-photo/cartoon-man-wearing-glasses_23-2151136784.jpg?semt=ais_hybrid&w=740&q=80",
                "social_links": {
                    "github": "https://github.com/kimani2-lab",
                    "linkedin": "https://www.linkedin.com/in/allan-kimani-814562417/overlay/background-photo/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BF4II2IcRQz%2B7ZLm8%2FOMHhQ%3D%3D",
                    "website": "https://allankimani.com",
                },
            },
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f"Created profile: {profile.slug}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Updated profile: {profile.slug}"))

        projects = [
            {
                "title": "Vibe~tap",
                "description": "A social media platform for sharing music and discovering new artists.",
                "project_url": "https://github.com/kimani2-lab/Vibe-Tap.git",
            },
            {
                "title": "Sasatime",
                "description": "A time management application for organizing tasks and schedules.",
                "project_url": "https://github.com/micymike/sasaTime.git",
            },
            {
                "title": "Kikapu",
                "description": "A community-driven platform for sharing local news and events.",
                "project_url": "https://github.com/leonkoome4-rgb/kikapu.git",
            },
            {
                "title": "Deliveroo",
                "description": "A food delivery application for ordering and managing restaurant orders.",
                "project_url": "https://github.com/mosweta-school/Deliveroo.git",
            },
        ]

        for project in projects:
            Project.objects.update_or_create(
                profile=profile,
                title=project["title"],
                defaults=project,
            )

        self.stdout.write(self.style.SUCCESS(f"Synchronized {len(projects)} projects"))
