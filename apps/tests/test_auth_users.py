import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

pytestmark = pytest.mark.django_db


def test_user_registration(api_client):
    payload = {
        "email": "newuser@example.com",
        "password": "StrongPassword123!",
        "password_confirm": "StrongPassword123!",
        "first_name": "Yangi",
        "last_name": "Xodim"
    }
    response = api_client.post('/api/v1/auth/register/', payload)

    assert response.status_code == 201
    assert response.data['email'] == "newuser@example.com"
    assert User.objects.filter(email="newuser@example.com").exists()


def test_password_mismatch_registration_fails(api_client):
    payload = {
        "email": "baduser@example.com",
        "password": "Password123!",
        "password_confirm": "DifferentPassword456!",
        "first_name": "Xato",
        "last_name": "Parol"
    }
    response = api_client.post('/api/v1/auth/register/', payload)

    assert response.status_code == 400
    assert "password" in response.data
    assert not User.objects.filter(email="baduser@example.com").exists()


def test_login_returns_jwt_and_user_data(api_client, test_user):
    payload = {
        "email": "testuser@example.com",
        "password": "TestPassword123!"
    }
    response = api_client.post('/api/v1/auth/token/', payload)

    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data
    assert "data" in response.data
    assert response.data["data"]["email"] == "testuser@example.com"


def test_get_my_profile(auth_client, test_user):
    response = auth_client.get('/api/v1/users/me/')

    assert response.status_code == 200
    assert response.data['email'] == test_user.email
    assert response.data['first_name'] == test_user.first_name


def test_update_my_profile(auth_client):
    payload = {
        "first_name": "O'zgargan Ism",
        "bio": "Yangi bio ma'lumot"
    }
    response = auth_client.patch('/api/v1/users/me/', payload)

    assert response.status_code == 200
    assert response.data['first_name'] == "O'zgargan Ism"
    assert response.data['bio'] == "Yangi bio ma'lumot"


def test_unauthorized_user_cannot_access_profile(api_client):
    response = api_client.get('/api/v1/users/me/')

    assert response.status_code == 401
