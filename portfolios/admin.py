from django.contrib import admin
from .models import AgentProfile, NFCCard, Profile, Project


class NFCCardInline(admin.TabularInline):
    model = NFCCard
    extra = 0
    readonly_fields = ('card_token', 'created_at')


@admin.register(AgentProfile)
class AgentProfileAdmin(admin.ModelAdmin):
    list_display = ('agent_id', 'full_name', 'referral_code', 'email', 'phone', 'created_at')
    search_fields = ('agent_id', 'full_name', 'referral_code', 'email', 'phone')
    readonly_fields = ('referral_code',)
    prepopulated_fields = {'slug': ('full_name',)}
    inlines = [NFCCardInline]
    ordering = ('-created_at',)


@admin.register(NFCCard)
class NFCCardAdmin(admin.ModelAdmin):
    list_display = ['card_token', 'agent_profile', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['card_token', 'agent_profile__agent_id']
    actions = ['lock_cards', 'unlink_cards']

    @admin.action(description='Lock selected cards')
    def lock_cards(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} card(s) locked.')

    @admin.action(description='Unlink and lock selected cards')
    def unlink_cards(self, request, queryset):
        updated = queryset.update(agent_profile=None, is_active=False)
        self.message_user(request, f'{updated} card(s) unlinked and locked.')


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'slug', 'title', 'email', 'avatar_url', 'created_at')
    search_fields = ('full_name', 'slug', 'email', 'title')
    prepopulated_fields = {'slug': ('full_name',)}
    ordering = ('-created_at',)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'profile', 'technologies', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'technologies', 'profile__full_name')
    ordering = ('-created_at',)