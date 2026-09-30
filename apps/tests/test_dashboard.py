import pytest
from apps.models import Lead

pytestmark = pytest.mark.django_db


@pytest.fixture
def setup_dashboard_data(test_user):
    Lead.objects.create(name="Mijoz 1", status="new", estimated_value=1000, created_by=test_user)
    Lead.objects.create(name="Mijoz 2", status="won", estimated_value=2000, created_by=test_user)
    Lead.objects.create(name="Mijoz 3", status="won", estimated_value=3000, created_by=test_user)
    Lead.objects.create(name="Mijoz 4", status="lost", estimated_value=4000, created_by=test_user)


def test_unauthorized_user_cannot_access_dashboard(api_client):
    response = api_client.get('/api/v1/dashboard/stats/')
    assert response.status_code == 401


def test_dashboard_stats_calculations(auth_client, setup_dashboard_data):
    response = auth_client.get('/api/v1/dashboard/stats/')

    assert response.status_code == 200
    data = response.data

    assert data['total_leads'] == 4

    assert data['total_pipeline_value'] == 10000.0

    assert data['won_leads'] == 2

    assert data['conversion_rate'] == 50.0

    assert data['status_breakdown']['won'] == 2
    assert data['status_breakdown']['new'] == 1
    assert data['status_breakdown']['lost'] == 1


def test_dashboard_stats_empty_database(auth_client):
    response = auth_client.get('/api/v1/dashboard/stats/')

    assert response.status_code == 200
    assert response.data['total_leads'] == 0
    assert response.data['total_pipeline_value'] == 0.0
    assert response.data['conversion_rate'] == 0.0
