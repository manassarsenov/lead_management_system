import pytest
from apps.models import Lead, LeadActivity

pytestmark = pytest.mark.django_db


@pytest.fixture
def sample_lead(test_user):
    return Lead.objects.create(
        name="Test Mijoz",
        email="testmijoz@example.com",
        status="new",
        created_by=test_user
    )


def test_unauthorized_user_cannot_access_activities(api_client):
    response = api_client.get('/api/v1/activities/')
    assert response.status_code == 401


def test_create_activity_linked_to_user_and_lead(auth_client, test_user, sample_lead):
    payload = {
        "lead": sample_lead.id,
        "activity_type": "call",
        "title": "Mijozga birinchi qo'ng'iroq",
        "description": "Mijoz shartlarga qiziqib qoldi, ertaga yana telefon qilamiz."
    }

    response = auth_client.post('/api/v1/activities/', payload, format='json')

    assert response.status_code == 201

    activity_in_db = LeadActivity.objects.get(id=response.data['id'])
    assert activity_in_db.user == test_user
    assert activity_in_db.lead == sample_lead


def test_filter_activities_by_lead(auth_client, test_user, sample_lead):

    second_lead = Lead.objects.create(
        name="Boshqa Mijoz", email="boshqa@example.com", status="new", created_by=test_user
    )

    LeadActivity.objects.create(lead=sample_lead, user=test_user, activity_type="call", title="1-mijozga call")
    LeadActivity.objects.create(lead=second_lead, user=test_user, activity_type="email", title="2-mijozga email")

    response = auth_client.get(f'/api/v1/activities/?lead={sample_lead.id}')

    assert response.status_code == 200

    results = response.data['results'] if 'results' in response.data else response.data
    assert len(results) == 1
    assert results[0]['title'] == "1-mijozga call"


def test_filter_activities_by_type(auth_client, test_user, sample_lead):
    LeadActivity.objects.create(lead=sample_lead, user=test_user, activity_type="call", title="Telefon qilindi")
    LeadActivity.objects.create(lead=sample_lead, user=test_user, activity_type="note", title="Eslatma yozildi")

    response = auth_client.get(f'/api/v1/activities/?lead={sample_lead.id}&activity_type=call')

    assert response.status_code == 200
    results = response.data['results'] if 'results' in response.data else response.data
    assert len(results) == 1
    assert results[0]['activity_type'] == "call"
    assert results[0]['title'] == "Telefon qilindi"


def test_create_activity_with_invalid_lead_fails(auth_client):
    payload = {
        "lead": 99999,  # Bunday ID dagi lead yo'q
        "activity_type": "call",
        "title": "Xato qo'ng'iroq"
    }
    response = auth_client.post('/api/v1/activities/', payload, format='json')
    assert response.status_code == 400
    assert "lead" in response.data
