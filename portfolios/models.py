import uuid

from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


def nfc_card_token_generator():
    return str(uuid.uuid4())


class NFCCard(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('LOCKED', 'Locked'),
        ('UNLINKED', 'Unlinked'),
    ]

    card_token = models.UUIDField(default=nfc_card_token_generator, unique=True, editable=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    profile = models.ForeignKey('Profile', on_delete=models.SET_NULL, null=True, blank=True, related_name='nfc_cards')
    agent_profile = models.ForeignKey(
        'AgentProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='nfc_cards',
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    last_tapped_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-assigned_at']

    def __str__(self):
        return f"Card {self.card_token} - {self.status}"


class Profile(models.Model):
    slug = models.SlugField(unique=True, max_length=100, db_index=True)
    full_name = models.CharField(max_length=200)
    headline = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    email = models.EmailField(max_length=254, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    avatar_url = models.URLField(blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.full_name


class Project(models.Model):
    profile = models.ForeignKey(Profile, related_name='projects', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    project_url = models.URLField(blank=True)
    cover_image = models.URLField(blank=True)

    def __str__(self):
        return self.title


class AgentProfile(models.Model):
    agent_id = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    full_name = models.CharField(max_length=150)
    headline = models.CharField(
        max_length=200,
        default='SasaPay Authorized Agent',
    )
    phone = models.CharField(max_length=20)
    email = models.EmailField(max_length=254)
    avatar_url = models.URLField(blank=True, null=True)
    is_verified = models.BooleanField(default=True)
    referral_code = models.CharField(max_length=50, unique=True, blank=True)
    card_token = models.CharField(max_length=64, unique=True, blank=True)
    services_offered = models.JSONField(default=list, blank=True)

    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = (
                self.agent_id.upper().replace(' ', '-')
                or slugify(self.full_name).upper()
            )
        if not self.card_token:
            self.card_token = uuid.uuid4().hex
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.agent_id} - {self.full_name}'


class AgentNFCCard(models.Model):
    STATUS_ACTIVE = 'ACTIVE'
    STATUS_LOCKED = 'LOCKED'
    STATUS_UNLINKED = 'UNLINKED'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_LOCKED, 'Locked'),
        (STATUS_UNLINKED, 'Unlinked'),
    ]

    card_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    agent = models.ForeignKey(
        AgentProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='agent_nfc_cards',
    )
    status = models.CharField(
        max_length=8,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_tapped_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Agent card {self.card_token} - {self.status}'
