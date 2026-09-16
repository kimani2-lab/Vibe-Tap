from django.core.management.base import BaseCommand

from portfolios.models import Profile, Project


class Command(BaseCommand):
    help = "Seed the Allan-kimani portfolio profile for production and local use."

    def handle(self, *args, **options):
        profile_defaults = {
            "full_name": "Allan Kimani",
            "headline": "Fullstack software engineer| backend developer",
            "bio": "Fullstack Software Developer specializing in Python, Django REST Framework, Next.js, React, and Flutter. Passionate about building high-performance backend architectures, payment integrations, and modern web interfaces. Also experienced in building scalable mobile applications with Flutter and Dart, alongside robust Django backends. Skilled in database design, REST API engineering, and secure payment processing.",
            "email": "kimania271@gmail.com",
            "phone": "0758288727",
            "avatar_url": "https://img.magnific.com/free-photo/cartoon-man-wearing-glasses_23-2151136784.jpg?semt=ais_hybrid&w=740&q=80",
            "social_links": {
                "linkedin": "https://www.linkedin.com/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BIpfK7DO%2FTvOhGr2JQvhMmQ%3D%3D",
                "whatsapp": "https://wa.me/254758288727",
                "github": "https://github.com/kimani2-lab",
                "instagram": "https://www.instagram.com/blacksnowallynde/#",
            },
        }
        profile = Profile.objects.filter(slug__iexact="allan-kimani").first()
        created = profile is None
        if profile is None:
            profile = Profile.objects.create(slug="allan-kimani", **profile_defaults)
        else:
            profile.slug = "allan-kimani"
            for field, value in profile_defaults.items():
                setattr(profile, field, value)
            profile.save()

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
                "title": "Smart Uber",
                "description": "A food delivery application for ordering and managing restaurant orders.",
                "project_url": "https://github.com/mosweta-school/deliveroo.git",
            },
        ]

        for project in projects:
            Project.objects.update_or_create(
                profile=profile,
                title=project["title"],
                defaults=project,
            )

        self.stdout.write(self.style.SUCCESS(f"Synchronized {len(projects)} projects"))
