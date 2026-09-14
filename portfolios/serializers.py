from django.db import transaction
from django.utils.text import slugify
from rest_framework import serializers
from .models import AgentProfile, NFCCard, Profile, Project


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
            'services_offered',
            'app_download_url',
        ]

    def get_app_download_url(self, obj):
        return f"https://play.google.com/store/apps/details?id=ke.co.sasapay.sasapay_app&pcampaignid=web_share{obj.referral_code}"


class RegisterAgentSerializer(serializers.ModelSerializer):
    card_token = serializers.UUIDField(write_only=True, required=False)

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
            'services_offered',
            'card_token',
        ]

    def validate_agent_id(self, value):
        if AgentProfile.objects.filter(agent_id=value).exists():
            raise serializers.ValidationError('An agent with this ID already exists.')
        return value

    def validate_referral_code(self, value):
        if AgentProfile.objects.filter(referral_code=value).exists():
            raise serializers.ValidationError('An agent with this referral code already exists.')
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
        card_token = validated_data.pop('card_token', None)
        validated_data['slug'] = self._unique_slug(
            validated_data['full_name'],
            validated_data['agent_id'],
        )
        agent = AgentProfile.objects.create(**validated_data)

        if card_token is not None:
            card, _ = NFCCard.objects.get_or_create(card_token=card_token)
            card.agent_profile = agent
            card.status = 'ACTIVE'
            card.save(update_fields=['agent_profile', 'status'])

        return agent