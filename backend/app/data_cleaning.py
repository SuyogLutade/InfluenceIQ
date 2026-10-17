"""
InfluenceIQ - Data Cleaning & Validation Module
Handles robust string-to-number parsing (k, m, b, %), duplicate detection,
missing-value tracking, and column standardization.
"""

from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from app.category_mapping import (
    get_creator_display_name,
    get_creator_category,
    get_creator_country
)

def parse_numeric_suffix(val: Any) -> Optional[float]:
    """
    Parses numeric strings with common social media abbreviations:
    '475.8m' -> 475,800,000.0
    '3.3k'   -> 3,300.0
    '29.0b'  -> 29,000,000,000.0
    '1.39%'  -> 1.39
    '0'      -> 0.0
    Returns None if missing, NaN, or unparseable.
    """
    if val is None or pd.isna(val):
        return None
    
    # If already a number
    if isinstance(val, (int, float, np.integer, np.floating)):
        if np.isnan(val):
            return None
        return float(val)

    s = str(val).strip().replace(',', '')
    if not s or s.lower() in ['nan', 'none', 'null', '-', 'n/a', 'na', '']:
        return None

    # Handle percentage
    if s.endswith('%'):
        try:
            return float(s[:-1].strip())
        except ValueError:
            return None

    last_char = s[-1].lower()
    if last_char == 'k':
        multiplier = 1_000.0
        num_str = s[:-1].strip()
    elif last_char == 'm':
        multiplier = 1_000_000.0
        num_str = s[:-1].strip()
    elif last_char == 'b':
        multiplier = 1_000_000_000.0
        num_str = s[:-1].strip()
    else:
        multiplier = 1.0
        num_str = s

    try:
        return float(num_str) * multiplier
    except (ValueError, TypeError):
        return None

def clean_country_name(country: Any, fallback: str = "Unspecified") -> str:
    """Standardizes country name and handles missing values."""
    if country is None or pd.isna(country):
        return fallback
    c = str(country).strip()
    if not c or c.lower() in ['nan', 'none', 'null', '-', 'n/a', 'na', '']:
        return fallback
    
    # Common standardizations
    mapping = {
        "usa": "United States",
        "us": "United States",
        "uk": "United Kingdom",
        "uae": "United Arab Emirates",
    }
    return mapping.get(c.lower(), c)

def clean_category_name(cat: Any, fallback: str = "Uncategorized") -> str:
    """Standardizes category strings."""
    if cat is None or pd.isna(cat):
        return fallback
    c = str(cat).strip()
    if not c or c.lower() in ['nan', 'none', 'null', '-', 'n/a', 'na', '']:
        return fallback
    return c.title()

def compute_data_quality_report(
    raw_df: pd.DataFrame,
    cleaned_df: pd.DataFrame,
    column_mapping: Dict[str, str],
    enrichment_enabled: bool
) -> Dict[str, Any]:
    """
    Generates a full transparency data quality audit for the Data Quality page.
    Tracks total records, duplicates, missing fields, and conversions.
    """
    total_raw_rows = len(raw_df)
    total_cleaned_rows = len(cleaned_df)
    
    # Check for duplicate usernames in raw data
    username_col = column_mapping.get("username", "channel_info")
    if username_col in raw_df.columns:
        duplicate_count = int(raw_df[username_col].duplicated().sum())
    else:
        duplicate_count = int(raw_df.duplicated().sum())
        
    missing_report = {}
    for standard_col in [
        "rank", "username", "influencer_name", "followers", "average_likes",
        "engagement_rate", "influence_score", "posts", "total_likes",
        "new_post_avg_like", "country", "category", "average_comments"
    ]:
        if standard_col in cleaned_df.columns:
            series = cleaned_df[standard_col]
            if standard_col in ["country", "category"]:
                # Check for "Unspecified" or "Not Available"
                null_count = int(series.isna().sum() + (series.isin(["Unspecified", "Not Available", "Uncategorized"])).sum())
            else:
                null_count = int(series.isna().sum())
            missing_report[standard_col] = {
                "missing_count": null_count,
                "missing_percentage": round((null_count / total_cleaned_rows) * 100, 2) if total_cleaned_rows > 0 else 0,
                "available": null_count < total_cleaned_rows,
                "natively_in_csv": standard_col in column_mapping.values()
            }
        else:
            missing_report[standard_col] = {
                "missing_count": total_cleaned_rows,
                "missing_percentage": 100.0,
                "available": False,
                "natively_in_csv": False
            }

    return {
        "total_records_loaded": total_raw_rows,
        "valid_records_processed": total_cleaned_rows,
        "duplicate_records_detected": duplicate_count,
        "category_enrichment_active": enrichment_enabled,
        "missing_values_audit": missing_report,
        "unsupported_analyses": [
            {
                "feature": "Historical Follower Growth (%)",
                "status": "Disabled",
                "reason": "The dataset contains only a single point-in-time snapshot. Historical dated follower logs are not present in this dataset."
            },
            {
                "feature": "Campaign Conversion Rate & ROI",
                "status": "Disabled / Simulator Mode",
                "reason": "Private marketing campaign ad spend, conversion, and revenue logs are unavailable in public influencer datasets."
            },
            {
                "feature": "Average Comments",
                "status": "Not Available",
                "reason": "The dataset records average likes and 60-day engagement rates, but omits a separate average comments column."
            }
        ]
    }
