"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import: from my_app import views
    2. Add a URL to urlpatterns: path('', views.home, name='home')
Class-based views
    1. Add an import: from other_app.views import Home
    2. Add a URL to urlpatterns: path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns: path('api/v1/portfolios/', include('portfolios.urls'))
"""
from django.contrib import admin
from django.urls import include, path

from portfolios.views import agent_create, agent_resolver, register_agent_api, resolve_card_token, vcard

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/agent/create/', agent_create, name='agent-create'),
    path('api/v1/agent/register/', register_agent_api, name='api-register-agent'),
    path('api/v1/credentials/<str:card_token>/', resolve_card_token, name='resolve-card-token'),
    path('api/v1/agent/<str:identifier>/', agent_resolver, name='agent-resolver-direct'),
    path('api/v1/portfolios/', include('portfolios.urls')),
    path('api/vcard/<slug:slug>/', vcard, name='api-vcard-direct'),
]
