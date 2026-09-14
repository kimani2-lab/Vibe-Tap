from django.urls import path

from .views import card_lock, card_reassign, portfolio_detail, tap_resolver, vcard

urlpatterns = [
    path('cards/lock/', card_lock, name='card-lock'),
    path('cards/reassign/', card_reassign, name='card-reassign'),
    path('tap/<str:identifier>/', tap_resolver, name='tap-resolver'),
    path('<slug:slug>/', portfolio_detail, name='portfolio-detail'),
    path('<slug:slug>/vcard/', vcard, name='vcard'),
    path('vcard/<slug:slug>/', vcard, name='vcard-direct'),
]