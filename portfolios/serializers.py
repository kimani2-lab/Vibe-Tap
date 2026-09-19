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
    sasapay_checkout_url = serializers.SerializerMethodField()

    def get_sasapay_checkout_url(self, obj):
        """Return the DB value when available, otherwise build a safe fallback URL."""
        db_url = getattr(obj, 'sasapay_checkout_url', None)
        if db_url and str(db_url).strip():
            clean_url = str(db_url).strip()
            if not clean_url.startswith(('http://', 'https://')):
                return f'https://{clean_url}'
            return clean_url

        identifier = obj.agent_id or obj.slug or 'default'
        return f'https://checkout.sasapay.app/pay/{identifier}'

    class Meta:
        model = AgentProfile
        fields = [
            'agent_id', 'full_name', 'slug', 'phone', 'email',
            'headline', 'sasapay_checkout_url'
        ]


class RegisterAgentSerializer(serializers.ModelSerializer):
    agent_id = serializers.CharField(trim_whitespace=True, required=True)

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

    def validate_agent_id(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('This field may not be blank.')
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