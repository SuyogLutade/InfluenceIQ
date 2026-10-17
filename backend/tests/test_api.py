"""
API Integration Tests for InfluenceIQ FastAPI Backend
Verifies endpoint responses, schema validity, status codes, and query filtering.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["dataset_loaded"] is True
    assert data["total_records"] == 200

def test_metadata_endpoint():
    response = client.get("/api/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "total_records_loaded" in data
    assert data["total_records_loaded"] == 200
    assert "missing_values_audit" in data
    assert "unsupported_analyses" in data

def test_filter_options():
    response = client.get("/api/filters/options")
    assert response.status_code == 200
    data = response.json()
    assert len(data["countries"]) > 0
    assert len(data["categories"]) > 0
    assert data["max_followers"] > 0

def test_influencers_list_and_pagination():
    response = client.get("/api/influencers?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 10
    assert data["total"] == 200
    assert data["total_pages"] == 20

def test_influencer_detail():
    # Fetch Cristiano (id: 1)
    response = client.get("/api/influencers/1")
    assert response.status_code == 200
    data = response.json()
    assert data["profile"]["username"] == "cristiano"
    assert "standings" in data
    assert "benchmarks" in data

def test_overview_analytics():
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["total_dataset_count"] == 200
    assert "kpis" in data
    assert data["kpis"]["total_influencers"] == 200
    assert len(data["charts"]["top_by_followers"]) == 10
    assert len(data["charts"]["category_distribution"]) > 0

def test_compare_endpoint():
    # Compare Cristiano (1) and Kylie Jenner (2)
    response = client.post("/api/analytics/compare", json={"influencer_ids": [1, 2]})
    assert response.status_code == 200
    data = response.json()
    assert len(data["profiles"]) == 2
    assert "highlights" in data
    assert "advisory_summary" in data

def test_campaign_simulator_api():
    payload = {
        "spend": 5000,
        "impressions": 200000,
        "clicks": 10000,
        "conversions": 400,
        "revenue": 15000
    }
    response = client.post("/api/campaign/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["calculated_metrics"]["roi_percent"] == 200.0
    assert data["calculated_metrics"]["ctr_percent"] == 5.0
