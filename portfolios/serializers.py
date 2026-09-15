from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import serializers
from .models import AgentProfile, NFCCard, Profile, Project


class AgentPublicProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentProfile
        fields = ['agent_id', 'full_name', 'phone', 'email', 'headline', 'services_offered']


class ResolveCredentialSerializer(serializers.ModelSerializer):
    referral_code = serializers.CharField(source='agent_profile.referral_code', read_only=True)
    is_active = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(
        source='assigned_at',
        read_only=True,
        default_timezone=timezone.UTC,
    )
    agent = AgentPublicProfileSerializer(source='agent_profile', read_only=True)

    class Meta:
        model = NFCCard
        fields = ['card_token', 'referral_code', 'is_active', 'created_at', 'agent']

    def get_is_active(self, obj):
        return obj.status == NFCCard.STATUS_CHOICES[0][0]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'project_url', 'cover_image']


class ProfileSerializer(serializers.ModelSerializer):
    projects = ProjectSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'slug', 'full_name', 'headline', 'bio',
            'email', 'phone', 'avatar_url', 'social_links',
            'projects'
        ]


class NFCCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = NFCCard
        fields = [
            'id',
            'card_token',
            'status',
            'profile',
            'agent_profile',
            'assigned_at',
            'last_tapped_at',
        ]


class AgentProfileSerializer(serializers.ModelSerializer):
    app_download_url = serializers.SerializerMethodField()

    class Meta:
        model = AgentProfile
        fields = [
            'id',
            'agent_id',
            'slug',
            'full_name',
            'headline',
            'phone',
            'email',
            'avatar_url',
            'is_verified',
            'referral_code',
            'card_token',
            'services_offered',
            'app_download_url',
        ]

    def get_app_download_url(self, obj):
        return f"https://play.google.com/store/apps/details?id=ke.co.sasapay.sasapay_app&pcampaignid=web_share{obj.referral_code}"


class RegisterAgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentProfile
        fields = [
            'agent_id',
            'full_name',
            'phone',
            'email',
            'avatar_url',
            'headline',
            'referral_code',
            'card_token',
            'services_offered',
        ]
        read_only_fields = ['referral_code', 'card_token']

    def validate_agent_id(self, value):
        if AgentProfile.objects.filter(agent_id=value).exists():
            raise serializers.ValidationError('An agent with this ID already exists.')
        return value

    def _unique_slug(self, full_name, agent_id):
        base_slug = slugify(full_name) or slugify(agent_id)
        candidate = base_slug
        suffix = 2
        while AgentProfile.objects.filter(slug=candidate).exists():
            candidate = f'{base_slug}-{suffix}'
            suffix += 1
        return candidate

    @transaction.atomic
    def create(self, validated_data):
        validated_data['slug'] = self._unique_slug(
            validated_data['full_name'],
            validated_data['agent_id'],
        )
        agent = AgentProfile.objects.create(**validated_data)

        card, _ = NFCCard.objects.get_or_create(card_token=agent.card_token)
        card.agent_profile = agent
        card.status = 'ACTIVE'
        card.save(update_fields=['agent_profile', 'status'])

        return agent