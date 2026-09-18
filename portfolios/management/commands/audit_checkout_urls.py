from urllib.parse import urlparse

from django.core.management.base import BaseCommand
from django.db import connection

from portfolios.models import AgentProfile


class Command(BaseCommand):
    help = "Audit all AgentProfile records for missing or invalid sasapay_checkout_url values. Read-only."

    def add_arguments(self, parser):
        parser.add_argument(
            "--missing-only",
            action="store_true",
            help="Only print agents whose sasapay_checkout_url is missing or invalid.",
        )

    def _is_valid_url(self, value):
        if value is None:
            return False
        candidate = str(value).strip()
        if not candidate:
            return False
        parsed = urlparse(candidate)
        return parsed.scheme in {"http", "https"} and bool(parsed.netloc)

    def handle(self, *args, **options):
        db_settings = connection.settings_dict
        db_name = db_settings.get("NAME") or "unknown"
        db_engine = db_settings.get("ENGINE") or "unknown"
        self.stdout.write(self.style.WARNING(f"Using database: {db_name} (engine={db_engine})"))

        queryset = AgentProfile.objects.order_by("agent_id")
        total = queryset.count()
        missing = []

        header = "agent_id|slug|full_name|status"
        self.stdout.write(header)

        for agent in queryset:
            raw_value = agent.sasapay_checkout_url
            is_present = self._is_valid_url(raw_value)
            status = "PRESENT" if is_present else "MISSING"
            row = f"{agent.agent_id}|{agent.slug}|{agent.full_name}|{status}"

            if options["missing_only"] and status == "PRESENT":
                continue

            self.stdout.write(row)
            if status == "MISSING":
                missing.append({
                    "agent_id": agent.agent_id,
                    "slug": agent.slug,
                    "full_name": agent.full_name,
                    "status": status,
                })

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"Total agents audited: {total}"))
        self.stdout.write(self.style.SUCCESS(f"Agents missing checkout URL: {len(missing)}"))

        if missing:
            self.stdout.write(self.style.WARNING("Missing agents list:"))
            for item in missing:
                self.stdout.write(
                    f"- {item['agent_id']} | {item['slug']} | {item['full_name']} | {item['status']}"
                )
