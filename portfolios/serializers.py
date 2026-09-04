from rest_framework import serializers
from .models import Profile, Project


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