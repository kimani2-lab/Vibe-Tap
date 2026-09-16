import uuid

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from .models import AgentProfile, NFCCard, Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'id',
            'full_name',
            'slug',
            'title',
            'bio',
            'avatar_url',
            'email',
            'phone',
            'location',
            'social_links',
            'created_at',
        ]


class AgentPublicProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentProfile
        fields = ['agent_id', 'full_name', 'phone', 'email', 'headline', 'services_offered']


class ResolveCredentialSerializer(serializers.ModelSerializer):
    agent = AgentPublicProfileSerializer(source='agent_profile', read_only=True)

    class Meta:
        model = NFCCard
        fields = ['card_token', 'agent', 'is_active', 'created_at']

    def get_is_active(self, obj):
        return obj.is_active


class NFCCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = NFCCard
        fields = ['card_token', 'is_active', 'created_at']


class AgentProfileSerializer(serializers.ModelSerializer):
    nfc_cards = NFCCardSerializer(many=True, read_only=True)
    app_download_url = serializers.SerializerMethodField()

    class Meta:
        model = AgentProfile
        fields = [
            'agent_id', 'full_name', 'slug', 'referral_code',
            'avatar_url', 'phone', 'email', 'headline',
            'services_offered', 'nfc_cards', 'created_at', 'app_download_url'
        ]

    def get_app_download_url(self, obj):
        return f"https://play.google.com/store/apps/details?id=ke.co.sasapay.sasapay_app&pcampaignid=web_share{obj.agent_id}"


class RegisterAgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentProfile
        fields = [
            'agent_id',
            'full_name',
            'phone',
            'email',
            'headline',
            'services_offered',
        ]
        read_only_fields = ['agent_id']

    def validate_agent_id(self, value):
        if AgentProfile.objects.filter(agent_id=value).exists():
            raise serializers.ValidationError('An agent with this ID already exists.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        agent = AgentProfile.objects.create(**validated_data)

        card, _ = NFCCard.objects.get_or_create(
            card_token=uuid.uuid4().hex[:64],
            defaults={'agent_profile': agent, 'is_active': True}
        )
        if not card.pk:
            card.agent_profile = agent
            card.save(update_fields=['agent_profile'])

        return agent