from django.contrib import admin
from .models import AgentProfile, NFCCard, Profile, Project


class NfcCardInline(admin.TabularInline):
    model = NFCCard
    extra = 1
    fields = ['card_token', 'status', 'profile', 'last_tapped_at']
    readonly_fields = ['card_token', 'last_tapped_at']


@admin.register(AgentProfile)
class AgentProfileAdmin(admin.ModelAdmin):
    list_display = ['agent_id', 'full_name', 'phone', 'referral_code', 'is_verified']
    search_fields = ['agent_id', 'full_name', 'phone', 'referral_code']
    list_filter = ['is_verified']
    prepopulated_fields = {'slug': ('full_name',)}
    inlines = [NfcCardInline]


@admin.register(NFCCard)
class NFCCardAdmin(admin.ModelAdmin):
    list_display = ['card_token', 'status', 'profile', 'agent_profile', 'assigned_at', 'last_tapped_at']
    list_filter = ['status', 'profile', 'agent_profile']
    search_fields = ['card_token', 'profile__slug', 'agent_profile__agent_id', 'agent_profile__full_name']
    actions = ['report_card_lost', 'unlink_card_from_profile']

    def report_card_lost(self, request, queryset):
        queryset.update(status='LOCKED')
    report_card_lost.short_description = 'Report Card as Lost / Lock Card'

    def unlink_card_from_profile(self, request, queryset):
        queryset.update(status='UNLINKED', profile=None, agent_profile=None)
    unlink_card_from_profile.short_description = 'Unlink Card from Profile'


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'slug', 'headline', 'email', 'phone']
    list_filter = ['headline', 'nfc_cards']
    search_fields = ['full_name', 'slug', 'headline', 'bio']
    prepopulated_fields = {'slug': ('full_name',)}
    fields = [
        'slug',
        'full_name',
        'headline',
        'bio',
        'email',
        'phone',
        'avatar_url',
        'social_links',
    ]
    filter_horizontal = []


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'profile', 'project_url']
    list_filter = ['profile']
    search_fields = ['title', 'description']
    fields = [
        'profile',
        'title',
        'description',
        'project_url',
        'cover_image',
    ]
    filter_horizontal = []