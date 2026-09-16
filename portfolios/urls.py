from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AgentProfileViewSet, ProfileViewSet, card_lock, card_reassign, portfolio_detail, tap_resolver, vcard

router = DefaultRouter()
router.register(r'agents', AgentProfileViewSet, basename='agentprofile')
router.register(r'profiles', ProfileViewSet, basename='profile')

urlpatterns = [
    path('api/', include(router.urls)),
    path('cards/lock/', card_lock, name='card-lock'),
    path('cards/reassign/', card_reassign, name='card-reassign'),
    path('tap/<str:identifier>/', tap_resolver, name='tap-resolver'),
    path('<slug:slug>/', portfolio_detail, name='portfolio-detail'),
    path('<slug:slug>/vcard/', vcard, name='vcard'),
    path('vcard/<slug:slug>/', vcard, name='vcard-direct'),
]