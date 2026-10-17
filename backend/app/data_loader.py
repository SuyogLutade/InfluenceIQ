"""
InfluenceIQ - Flexible Data Loader Module
Automatically detects and maps varied CSV column names to standardized internal fields,
tracks available vs missing columns, and manages the active dataset.
"""

import io
import os
import re
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

from app.category_mapping import (
    get_creator_display_name,
    get_creator_category,
    get_creator_country,
    CREATOR_CATEGORIES
)
from app.data_cleaning import (
    parse_numeric_suffix,
    clean_country_name,
    clean_category_name,
    compute_data_quality_report
)

DEFAULT_DATASET_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "top_insta_influencers_data.csv"
)

# Canonical internal schema fields
CANONICAL_FIELDS = [
    "id",
    "rank",
    "username",
    "influencer_name",
    "followers",
    "engagement_rate",
    "average_likes",
    "average_comments",
    "influence_score",
    "posts",
    "total_likes",
    "new_post_avg_like",
    "country",
    "category"
]

class DatasetManager:
    """Manages active dataset loading, column mapping, and data quality metrics."""
    
    def __init__(self):
        self.raw_df: Optional[pd.DataFrame] = None
        self.cleaned_df: Optional[pd.DataFrame] = None
        self.column_mapping: Dict[str, str] = {}
        self.dataset_name: str = "Top Instagram Influencers (Cleaned)"
        self.dataset_source: str = "https://www.kaggle.com/datasets/surajjha101/top-instagram-influencers-data-cleaned"
        self.enrich_categories: bool = True
        self.data_quality_report: Dict[str, Any] = {}
        self.is_loaded: bool = False

    def detect_column_mapping(self, columns: List[str]) -> Dict[str, str]:
        """Maps varied CSV column headers to canonical internal fields."""
        norm_cols = {re.sub(r'[^a-z0-9]', '', str(c).lower()): c for c in columns}
        mapping = {}

        patterns = {
            "rank": ["rank", "ranking", "globalrank"],
            "username": ["channelinfo", "username", "handle", "instagramname", "channel", "account", "profile"],
            "influence_score": ["influencescore", "score", "influence"],
            "posts": ["posts", "postcount", "totalposts", "media"],
            "followers": ["followers", "followercount", "subscribers", "fans"],
            "average_likes": ["avglikes", "averagelikes", "likesavg", "engagementavg"],
            "engagement_rate": ["60dayengrate", "engrate", "engagementrate", "engagement", "authenticengagement"],
            "new_post_avg_like": ["newpostavglike", "newpostlikes", "recentlikesavg", "recentlikes"],
            "total_likes": ["totallikes", "likes", "cumulativelikes"],
            "country": ["country", "countryorregion", "audiencecountrymostly", "audiencecountry", "region"],
            "category": ["category", "category1", "topic", "niche", "genre"],
            "average_comments": ["avgcomments", "averagecomments", "commentsavg", "comments"]
        }

        for canonical_name, aliases in patterns.items():
            for alias in aliases:
                clean_alias = re.sub(r'[^a-z0-9]', '', alias)
                if clean_alias in norm_cols:
                    mapping[canonical_name] = norm_cols[clean_alias]
                    break

        return mapping

    def load_dataset(self, file_path_or_buffer: Any, dataset_name: Optional[str] = None) -> bool:
        """Loads CSV file, detects columns, cleans data, and generates quality audit."""
        try:
            if isinstance(file_path_or_buffer, bytes):
                raw_df = pd.read_csv(io.BytesIO(file_path_or_buffer), encoding="utf-8-sig")
            else:
                raw_df = pd.read_csv(file_path_or_buffer, encoding="utf-8-sig")
            
            # Clean column names (strip whitespace and BOM)
            raw_df.columns = [str(c).strip().replace('\ufeff', '') for c in raw_df.columns]
            self.raw_df = raw_df
            if dataset_name:
                self.dataset_name = dataset_name

            self.column_mapping = self.detect_column_mapping(list(raw_df.columns))
            self._process_cleaned_df()
            self.is_loaded = True
            return True
        except Exception as e:
            print(f"Error loading dataset: {e}")
            return False

    def toggle_enrichment(self, enabled: bool):
        """Toggles verified category enrichment on or off."""
        self.enrich_categories = enabled
        if self.raw_df is not None:
            self._process_cleaned_df()

    def _process_cleaned_df(self):
        """Processes raw dataframe into standard schema using detected mapping."""
        if self.raw_df is None:
            return

        cleaned_records = []
        raw_cols = self.column_mapping

        for idx, row in self.raw_df.iterrows():
            record = {}
            
            # ID
            record["id"] = idx + 1

            # Rank
            if "rank" in raw_cols:
                r_val = parse_numeric_suffix(row.get(raw_cols["rank"]))
                record["rank"] = int(r_val) if r_val is not None else (idx + 1)
            else:
                record["rank"] = idx + 1

            # Username
            if "username" in raw_cols:
                u_val = str(row.get(raw_cols["username"], "")).strip()
                record["username"] = u_val
            else:
                record["username"] = f"creator_{idx + 1}"

            # Influencer Name
            record["influencer_name"] = get_creator_display_name(record["username"])

            # Followers (numeric float)
            if "followers" in raw_cols:
                record["followers"] = parse_numeric_suffix(row.get(raw_cols["followers"]))
            else:
                record["followers"] = None

            # Engagement Rate (percentage float e.g. 1.39)
            if "engagement_rate" in raw_cols:
                record["engagement_rate"] = parse_numeric_suffix(row.get(raw_cols["engagement_rate"]))
            else:
                record["engagement_rate"] = None

            # Average Likes
            if "average_likes" in raw_cols:
                record["average_likes"] = parse_numeric_suffix(row.get(raw_cols["average_likes"]))
            else:
                record["average_likes"] = None

            # Average Comments (Usually missing in surajjha101)
            if "average_comments" in raw_cols:
                record["average_comments"] = parse_numeric_suffix(row.get(raw_cols["average_comments"]))
            else:
                record["average_comments"] = None

            # Influence Score
            if "influence_score" in raw_cols:
                record["influence_score"] = parse_numeric_suffix(row.get(raw_cols["influence_score"]))
            else:
                record["influence_score"] = None

            # Posts
            if "posts" in raw_cols:
                record["posts"] = parse_numeric_suffix(row.get(raw_cols["posts"]))
            else:
                record["posts"] = None

            # Total Likes
            if "total_likes" in raw_cols:
                record["total_likes"] = parse_numeric_suffix(row.get(raw_cols["total_likes"]))
            else:
                record["total_likes"] = None

            # New Post Avg Like
            if "new_post_avg_like" in raw_cols:
                record["new_post_avg_like"] = parse_numeric_suffix(row.get(raw_cols["new_post_avg_like"]))
            else:
                record["new_post_avg_like"] = None

            # Country
            raw_country = row.get(raw_cols["country"]) if "country" in raw_cols else None
            cleaned_c = clean_country_name(raw_country, fallback="Unspecified")
            record["country"] = cleaned_c

            # Category
            if "category" in raw_cols:
                record["category"] = clean_category_name(row.get(raw_cols["category"]))
            elif self.enrich_categories:
                record["category"] = get_creator_category(record["username"], default="Other / Lifestyle")
            else:
                record["category"] = "Not Available"

            cleaned_records.append(record)

        self.cleaned_df = pd.DataFrame(cleaned_records)
        self.data_quality_report = compute_data_quality_report(
            raw_df=self.raw_df,
            cleaned_df=self.cleaned_df,
            column_mapping=self.column_mapping,
            enrichment_enabled=self.enrich_categories
        )

    def get_df(self) -> pd.DataFrame:
        """Returns the active cleaned DataFrame."""
        if self.cleaned_df is None:
            self.load_dataset(DEFAULT_DATASET_PATH)
        return self.cleaned_df

    def get_quality_report(self) -> Dict[str, Any]:
        """Returns current data quality metadata."""
        if not self.data_quality_report:
            self.load_dataset(DEFAULT_DATASET_PATH)
        return {
            "dataset_name": self.dataset_name,
            "dataset_source": self.dataset_source,
            "column_mapping": self.column_mapping,
            "canonical_fields_available": [
                k for k, v in self.data_quality_report.get("missing_values_audit", {}).items() if v.get("available")
            ],
            **self.data_quality_report
        }

# Global singleton instance
dataset_manager = DatasetManager()
