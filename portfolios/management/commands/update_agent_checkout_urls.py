from django.core.management.base import BaseCommand

from portfolios.models import AgentProfile


class Command(BaseCommand):
    help = "Updates sasapay_checkout_url for specific agents in production."

    def add_arguments(self, parser):
        parser.add_argument("--slug", default="Allano-kimani", help="Agent slug to update")
        parser.add_argument("--url", default="https://checkout.sasapay.app/2102e1f2-a3c5-41e7-90ce-c0552c72df00", help="Exact live SasaPay checkout URL to store")

    def handle(self, *args, **options):
        slug = options["slug"]
        url = options["url"].strip()

        try:
            agent = AgentProfile.objects.get(slug=slug)
        except AgentProfile.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Agent '{slug}' not found in database."))
            return

        if url and not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        agent.sasapay_checkout_url = url
        agent.save(update_fields=["sasapay_checkout_url"])

        self.stdout.write(
            self.style.SUCCESS(f"Successfully updated {agent.slug} checkout URL to: {agent.sasapay_checkout_url}")
        )
