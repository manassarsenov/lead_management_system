import pytest
from apps.models import Lead

pytestmark = pytest.mark.django_db


def test_unauthorized_user_cannot_access_leads(api_client):
    response = api_client.get('/api/v1/leads/')
    assert response.status_code == 401


def test_create_lead_auto_assigns_created_by(auth_client, test_user):
    payload = {
        "name": "Eshmat Toshmatov",
        "email": "eshmat@example.com",
        "phone": "+998901234567",
        "status": "new",
        "source": "website",
        "priority": "high",
        "estimated_value": "5000.00"
    }
    response = auth_client.post('/api/v1/leads/', payload, format='json')

    assert response.status_code == 201
    assert response.data['name'] == "Eshmat Toshmatov"

    # Bazadan haqiqiy obyekti topib, created_by to'g'ri ishlaganini tekshiramiz
    lead_in_db = Lead.objects.get(id=response.data['id'])
    assert lead_in_db.created_by == test_user


def test_duplicate_email_lead_creation_fails(auth_client):
    payload = {
        "name": "Mijoz 1",
        "email": "same@example.com",
        "phone": "+998901112233"
    }
    res1 = auth_client.post('/api/v1/leads/', payload, format='json')
    assert res1.status_code == 201

    res2 = auth_client.post('/api/v1/leads/', payload, format='json')
    assert res2.status_code == 400
    assert "email" in res2.data


def test_lead_filtering_by_status(auth_client):
    auth_client.post('/api/v1/leads/', {
        "name": "Mijoz 1", "email": "m1@test.com", "status": "new"
    }, format='json')
    auth_client.post('/api/v1/leads/', {
        "name": "Mijoz 2", "email": "m2@test.com", "status": "won"
    }, format='json')

    response = auth_client.get('/api/v1/leads/?status=new')

    assert response.status_code == 200
    results = response.data['results'] if 'results' in response.data else response.data

    assert len(results) == 1
    assert results[0]['status'] == 'new'
    assert results[0]['name'] == 'Mijoz 1'


def test_lead_search_by_name(auth_client):
    auth_client.post('/api/v1/leads/', {"name": "Ali Valiyev", "email": "ali@test.com"}, format='json')
    auth_client.post('/api/v1/leads/', {"name": "Gani Toshov", "email": "gani@test.com"}, format='json')

    response = auth_client.get('/api/v1/leads/?search=Ali')

    assert response.status_code == 200
    results = response.data['results'] if 'results' in response.data else response.data
    assert len(results) == 1
    assert results[0]['name'] == "Ali Valiyev"


def test_update_lead_status(auth_client, test_user):
    lead = Lead.objects.create(name="Eski Lead", email="old@test.com", status="new", created_by=test_user)

    response = auth_client.patch(f'/api/v1/leads/{lead.id}/', {"status": "contacted"}, format='json')

    assert response.status_code == 200
    assert response.data['status'] == "contacted"
    lead.refresh_from_db()
    assert lead.status == "contacted"


def test_delete_lead(auth_client, test_user):
    lead = Lead.objects.create(name="O'chadigan Lead", email="delete@test.com", created_by=test_user)

    response = auth_client.delete(f'/api/v1/leads/{lead.id}/')

    assert response.status_code == 204
    assert not Lead.objects.filter(id=lead.id).exists()
