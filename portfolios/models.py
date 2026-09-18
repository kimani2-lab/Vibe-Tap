import uuid
import secrets
from django.db import models
from django.utils.text import slugify


def default_sasapay_services():
    return [
        "Cash In & Cash Out (Deposits & Withdrawals)",
        "P2P & Mobile Money Transfers",
        "C2B Till & PayBill Merchant Onboarding",
        "Utility & Bill Payments (Tokens/Airtime)",
        "Lipa Fare PSV Payment Support",
        "B2C & B2B Bulk Disbursal Registration",
    ]


class AgentProfile(models.Model):
    agent_id = models.CharField(max_length=50, unique=True, primary_key=True)
    full_name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    sasapay_checkout_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="SasaPay checkout app link assigned to this agent."
    )
    referral_code = models.CharField(max_length=20, unique=True, blank=True)
    avatar_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Direct image URL for agent avatar",
    )
    phone = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    headline = models.CharField(
        max_length=255,
        default='SasaPay Authorized Agent',
        blank=True,
    )
    services_offered = models.JSONField(
        default=default_sasapay_services,
        blank=True,
        help_text='Provide a JSON array of services, e.g., ["Cash In & Cash Out", "P2P Transfers"]',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'agent_profile'
        verbose_name = 'Agent Profile'
        verbose_name_plural = 'Agent Profiles'

    def save(self, *args, **kwargs):
        # 1. Auto-generate/normalize slug
        if not self.slug and self.full_name:
            self.slug = slugify(self.full_name)
        elif self.slug:
            self.slug = slugify(self.slug)  # Force clean slug format (e.g. Allyn_underscore -> allyn-underscore)

        # 2. Auto-generate referral_code if not present (e.g., REF-A1B2C3)
        if not self.referral_code:
            self.referral_code = f"REF-{secrets.token_hex(3).upper()}"

        super().save(*args, **kwargs)

        # 3. Automatically create an attached NFCCard on creation if none exists
        is_new = self._state.adding
        if is_new and not self.nfc_cards.exists():
            NFCCard.objects.create(
                agent_profile=self,
                card_token=f"card_{uuid.uuid4().hex}"
            )

    def __str__(self):
        return f"{self.full_name} ({self.agent_id})"


class NFCCard(models.Model):
    card_token = models.CharField(max_length=64, unique=True, db_index=True)
    agent_profile = models.ForeignKey(
        AgentProfile,
        on_delete=models.CASCADE,
        related_name='nfc_cards',
        blank=True,
        null=True,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'nfc_card'
        verbose_name = 'NFC Card'
        verbose_name_plural = 'NFC Cards'

    def save(self, *args, **kwargs):
        if not self.card_token:
            self.card_token = f"card_{uuid.uuid4().hex}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Token: {self.card_token} - Agent: {self.agent_profile_id}"


class Profile(models.Model):
    full_name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    title = models.CharField(max_length=255, help_text="e.g., Software Engineer / Full Stack Developer")
    bio = models.TextField(blank=True, null=True)
    avatar_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Direct image URL for profile avatar",
    )
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    social_links = models.JSONField(
        default=dict,
        blank=True,
        help_text='Provide key-value pairs in JSON format, e.g., {"github": "https://...", "linkedin": "https://..."}',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'profile'
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'

    def __str__(self):
        return f"{self.full_name} ({self.slug})"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.full_name)
        super().save(*args, **kwargs)


class Project(models.Model):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    technologies = models.CharField(max_length=255, help_text="Comma-separated skills (e.g. Django, Next.js, PostgreSQL)")
    project_url = models.URLField(blank=True, null=True)
    github_repository = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'project'
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'

    def __str__(self):
        return self.title