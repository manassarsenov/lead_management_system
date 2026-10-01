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


def test_user_cannot_change_own_role(auth_client, test_user):
    auth_client.patch('/api/v1/users/me/', {"role": "admin"})
    test_user.refresh_from_db()
    assert test_user.role == 'sales'


def test_duplicate_email_registration_fails(api_client, test_user):
    payload = {
        "email": test_user.email,
        "password": "StrongPassword123!",
        "password_confirm": "StrongPassword123!",
        "first_name": "Takror",
        "last_name": "Email"
    }
    response = api_client.post('/api/v1/auth/register/', payload)
    assert response.status_code == 400


def test_login_with_wrong_password_fails(api_client, test_user):
    response = api_client.post('/api/v1/auth/token/', {
        "email": "testuser@example.com",
        "password": "NotTheRightPassword"
    })
    assert response.status_code == 401


def test_weak_password_registration_fails(api_client):
    payload = {
        "email": "weak@example.com",
        "password": "1",
        "password_confirm": "1",
        "first_name": "Zaif",
        "last_name": "Parol"
    }
    response = api_client.post('/api/v1/auth/register/', payload)
    assert response.status_code == 400


def test_change_password_success(auth_client, test_user):
    payload = {
        "current_password": "TestPassword123!",
        "new_password": "NewStrongPassword123!",
        "new_password_confirm": "NewStrongPassword123!"
    }
    response = auth_client.post('/api/v1/auth/change-password/', payload)
    assert response.status_code == 200
    test_user.refresh_from_db()
    assert test_user.check_password("NewStrongPassword123!")


def test_change_password_wrong_current_password_fails(auth_client, test_user):
    payload = {
        "current_password": "WrongOldPassword!",
        "new_password": "NewStrongPassword123!",
        "new_password_confirm": "NewStrongPassword123!"
    }
    response = auth_client.post('/api/v1/auth/change-password/', payload)
    assert response.status_code == 400
