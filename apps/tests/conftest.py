import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


# 1. API ga so'rov yuboruvchi oddiy "brauzer" (klient)
@pytest.fixture
def api_client():
    return APIClient()


# 2. Barcha testlar uchun umumiy bitta User yaratamiz
@pytest.fixture
def test_user(db):
    user = User.objects.create_user(
        email='testuser@example.com',
        password='TestPassword123!',
        first_name='Ali',
        last_name='Valiyev'
    )
    return user


# 3. Tizimga kirgan (Login qilgan va token olgan) tayyor User klienti
@pytest.fixture
def auth_client(api_client, test_user):
    # To'g'ridan-to'g'ri JWT token yaratib klientga o'rnatamiz (juda tez ishlaydi)
    refresh = RefreshToken.for_user(test_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client


# 4. Admin huquqiga ega bo'lgan User (Admin endpointlarni testlash uchun kerak bo'ladi)
@pytest.fixture
def admin_user(db):
    user = User.objects.create_superuser(
        email='admin@example.com',
        password='AdminPassword123!',
        first_name='Admin',
        last_name='User'
    )
    return user


# 5. Admin huquqiga ega bo'lgan klient
@pytest.fixture
def admin_client(api_client, admin_user):
    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client
