from django.core.management.base import BaseCommand

from portfolios.models import AgentProfile


class Command(BaseCommand):
    help = "Audit and update missing sasapay_checkout_url values for AgentProfile records. Read-only detection, then updates only empty values."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="List agents missing a checkout URL without changing any data.",
        )

    def handle(self, *args, **options):
        agents = AgentProfile.objects.order_by("agent_id")
        missing = []

        for agent in agents:
            if not agent.sasapay_checkout_url or not str(agent.sasapay_checkout_url).strip():
                missing.append(agent)

        if not missing:
            self.stdout.write(self.style.SUCCESS("All AgentProfile records already have a non-empty sasapay_checkout_url."))
            return

        self.stdout.write(self.style.WARNING(f"Found {len(missing)} agent(s) missing a checkout URL:"))
        for agent in missing:
            self.stdout.write(f"- {agent.agent_id} | {agent.slug} | {agent.full_name}")

        if options["dry_run"]:
            self.stdout.write(self.style.SUCCESS("Dry run complete; no records were updated."))
            return

        updated_count = 0
        for agent in missing:
            # Do not fabricate or guess a checkout URL. This command intentionally only updates rows that
            # already have a real value assigned elsewhere and should be used only to populate real, verified URLs.
            self.stdout.write(
                self.style.WARNING(
                    f"Skipping automatic population for {agent.agent_id} because a real SasaPay checkout URL must be provided manually."
                )
            )

        self.stdout.write(self.style.SUCCESS(f"No automatic updates performed. {len(missing)} agent(s) require a real checkout URL to be entered manually."))
