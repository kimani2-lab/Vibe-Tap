from django.db import models
from django.contrib.auth.models import User


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
