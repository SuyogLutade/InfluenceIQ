"""
Unit tests for InfluenceIQ analytics and data cleaning logic.
Tests parsing, AND-filtering, zero denominators, comparisons, and scoring.
"""

import pytest
import pandas as pd
import numpy as np

from app.data_cleaning import parse_numeric_suffix, clean_country_name, clean_category_name
from app.analytics import (
    apply_filters,
    compute_overview_kpis,
    compare_influencers,
    calculate_custom_score,
    simulate_campaign_metrics
)

def test_parse_numeric_suffix():
    assert parse_numeric_suffix("475.8m") == 475_800_000.0
    assert parse_numeric_suffix("3.3k") == 3_300.0
    assert parse_numeric_suffix("29.0b") == 29_000_000_000.0
    assert parse_numeric_suffix("1.39%") == 1.39
    assert parse_numeric_suffix("0") == 0.0
    assert parse_numeric_suffix(1500) == 1500.0
    assert parse_numeric_suffix(None) is None
    assert parse_numeric_suffix("invalid_str") is None
    assert parse_numeric_suffix("") is None

def test_clean_country_and_category():
    assert clean_country_name("USA") == "United States"
    assert clean_country_name(None) == "Unspecified"
    assert clean_country_name("  Spain  ") == "Spain"
    assert clean_category_name("sports") == "Sports"
    assert clean_category_name(None) == "Uncategorized"

def test_and_logic_filtering():
    """Verify that Country and Category work together strictly using AND logic."""
    sample_df = pd.DataFrame([
        {"id": 1, "rank": 1, "username": "virat", "influencer_name": "Virat Kohli", "country": "India", "category": "Sports", "followers": 200e6, "engagement_rate": 1.5},
        {"id": 2, "rank": 2, "username": "priyanka", "influencer_name": "Priyanka Chopra", "country": "India", "category": "Film & Entertainment", "followers": 80e6, "engagement_rate": 0.8},
        {"id": 3, "rank": 3, "username": "cristiano", "influencer_name": "Cristiano Ronaldo", "country": "Spain", "category": "Sports", "followers": 400e6, "engagement_rate": 1.2},
        {"id": 4, "rank": 4, "username": "kylie", "influencer_name": "Kylie Jenner", "country": "United States", "category": "Fashion & Beauty", "followers": 350e6, "engagement_rate": 1.8},
    ])

    # Filter: Country = India AND Category = Sports -> Should ONLY match Virat Kohli
    res = apply_filters(sample_df, countries=["India"], categories=["Sports"])
    assert len(res) == 1
    assert res.iloc[0]["username"] == "virat"

    # Filter: Country = India AND Category = Fashion & Beauty -> Should be EMPTY
    res_empty = apply_filters(sample_df, countries=["India"], categories=["Fashion & Beauty"])
    assert len(res_empty) == 0

    # Search filter
    res_search = apply_filters(sample_df, search="kylie")
    assert len(res_search) == 1
    assert res_search.iloc[0]["username"] == "kylie"

def test_zero_denominator_campaign_simulation():
    """Verify campaign simulator handles zero denominators without error."""
    res = simulate_campaign_metrics(
        spend=0.0,
        impressions=0.0,
        clicks=0.0,
        conversions=0.0,
        revenue=0.0
    )
    assert res["calculated_metrics"]["ctr_percent"] == 0.0
    assert res["calculated_metrics"]["cpc"] == 0.0
    assert res["calculated_metrics"]["conversion_rate_percent"] == 0.0
    assert res["calculated_metrics"]["cpa"] == 0.0
    assert res["calculated_metrics"]["roi_percent"] == 0.0

    # Normal simulation
    res_normal = simulate_campaign_metrics(
        spend=1000.0,
        impressions=50000.0,
        clicks=2500.0,
        conversions=100.0,
        revenue=3000.0
    )
    assert res_normal["calculated_metrics"]["ctr_percent"] == 5.0
    assert res_normal["calculated_metrics"]["cpc"] == 0.4
    assert res_normal["calculated_metrics"]["conversion_rate_percent"] == 4.0
    assert res_normal["calculated_metrics"]["cpa"] == 10.0
    assert res_normal["calculated_metrics"]["roi_percent"] == 200.0

def test_compare_influencers():
    sample_df = pd.DataFrame([
        {"id": 1, "rank": 1, "username": "creator_a", "influencer_name": "Creator A", "followers": 100e6, "engagement_rate": 2.5, "average_likes": 2e6, "posts": 500, "influence_score": 90, "total_likes": 10e9, "country": "US", "category": "Music"},
        {"id": 2, "rank": 2, "username": "creator_b", "influencer_name": "Creator B", "followers": 200e6, "engagement_rate": 1.2, "average_likes": 1.5e6, "posts": 800, "influence_score": 92, "total_likes": 15e9, "country": "UK", "category": "Sports"},
    ])

    comp = compare_influencers(sample_df, [1, 2])
    assert len(comp["profiles"]) == 2
    # Creator B has more followers
    assert comp["highlights"]["followers"]["influencer_id"] == 2
    # Creator A has higher engagement rate
    assert comp["highlights"]["engagement_rate"]["influencer_id"] == 1
    # Average comments strictly marked as Not available
    assert comp["profiles"][0]["average_comments"] == "Not available"

def test_custom_scoring_model():
    sample_df = pd.DataFrame([
        {"id": 1, "username": "a", "influencer_name": "A", "followers": 100e6, "engagement_rate": 5.0, "influence_score": 85, "category": "Sports", "country": "Spain"},
        {"id": 2, "username": "b", "influencer_name": "B", "followers": 300e6, "engagement_rate": 1.0, "influence_score": 90, "category": "Music", "country": "US"},
    ])

    ranked = calculate_custom_score(sample_df, weight_followers=0.1, weight_engagement=0.8, weight_influence=0.1)
    # Because engagement weight is 80%, Creator A with 5.0% eng rate should be #1
    assert ranked[0]["username"] == "a"
