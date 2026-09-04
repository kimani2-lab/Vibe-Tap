from django.contrib import admin
from .models import Profile, Project


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'slug', 'headline', 'email', 'phone']
    list_filter = ['headline']
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
    # social_links is JSONField, not ManyToManyField


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