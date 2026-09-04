from django.urls import path
from .views import portfolio_detail, vcard

urlpatterns = [
    path('<slug:slug>/', portfolio_detail, name='portfolio-detail'),
    path('<slug:slug>/vcard/', vcard, name='vcard'),
]