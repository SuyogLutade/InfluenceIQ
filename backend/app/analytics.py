"""
InfluenceIQ - Core Analytics & Aggregation Engine
Performs multi-dimensional filtering, KPI calculations, distributions,
fair side-by-side comparisons, transparent multi-metric scoring, and campaign modeling.
"""

from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

def apply_filters(
    df: pd.DataFrame,
    countries: Optional[List[str]] = None,
    categories: Optional[List[str]] = None,
    min_followers: Optional[float] = None,
    max_followers: Optional[float] = None,
    min_engagement: Optional[float] = None,
    max_engagement: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = "rank",
    sort_order: str = "asc"
) -> pd.DataFrame:
    """
    Applies filters to the DataFrame using strict AND logic.
    For example: Country in ('India') AND Category in ('Fashion & Beauty').
    """
    filtered = df.copy()

    # Country filter (AND logic)
    if countries:
        # Case-insensitive matching
        clean_countries = [c.strip().lower() for c in countries if c and c.strip()]
        if clean_countries:
            filtered = filtered[filtered["country"].str.lower().isin(clean_countries)]

    # Category filter (AND logic)
    if categories:
        clean_cats = [c.strip().lower() for c in categories if c and c.strip()]
        if clean_cats:
            filtered = filtered[filtered["category"].str.lower().isin(clean_cats)]

    # Follower range filter
    if min_followers is not None and not np.isnan(min_followers):
        filtered = filtered[filtered["followers"].fillna(0) >= min_followers]
    if max_followers is not None and not np.isnan(max_followers):
        filtered = filtered[filtered["followers"].fillna(0) <= max_followers]

    # Engagement rate range filter
    if min_engagement is not None and not np.isnan(min_engagement):
        filtered = filtered[filtered["engagement_rate"].fillna(0) >= min_engagement]
    if max_engagement is not None and not np.isnan(max_engagement):
        filtered = filtered[filtered["engagement_rate"].fillna(0) <= max_engagement]

    # Text Search (username or influencer name)
    if search and search.strip():
        q = search.strip().lower()
        filtered = filtered[
            filtered["username"].str.lower().str.contains(q, na=False) |
            filtered["influencer_name"].str.lower().str.contains(q, na=False)
        ]

    # Sorting
    ascending = (sort_order.lower() == "asc")
    valid_sort_cols = [
        "rank", "followers", "engagement_rate", "average_likes",
        "influence_score", "posts", "total_likes", "new_post_avg_like"
    ]
    if sort_by in valid_sort_cols and sort_by in filtered.columns:
        filtered = filtered.sort_values(by=sort_by, ascending=ascending, na_position="last")
    elif "rank" in filtered.columns:
        filtered = filtered.sort_values(by="rank", ascending=ascending, na_position="last")

    return filtered

def compute_overview_kpis(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculates KPI summary cards for the overview dashboard."""
    total_influencers = len(df)
    
    if total_influencers == 0:
        return {
            "total_influencers": 0,
            "total_followers": 0,
            "average_followers": 0,
            "average_engagement_rate": 0,
            "median_engagement_rate": 0,
            "total_countries": 0,
            "total_categories": 0,
            "average_likes": 0
        }

    followers_series = df["followers"].dropna()
    eng_series = df["engagement_rate"].dropna()
    likes_series = df["average_likes"].dropna()

    total_followers = float(followers_series.sum()) if not followers_series.empty else 0.0
    avg_followers = float(followers_series.mean()) if not followers_series.empty else 0.0
    avg_eng_rate = float(eng_series.mean()) if not eng_series.empty else 0.0
    median_eng_rate = float(eng_series.median()) if not eng_series.empty else 0.0
    avg_likes = float(likes_series.mean()) if not likes_series.empty else 0.0

    valid_countries = [c for c in df["country"].dropna().unique() if c != "Unspecified"]
    valid_categories = [c for c in df["category"].dropna().unique() if c not in ["Uncategorized", "Not Available"]]

    return {
        "total_influencers": total_influencers,
        "total_followers": total_followers,
        "average_followers": round(avg_followers, 2),
        "average_engagement_rate": round(avg_eng_rate, 2),
        "median_engagement_rate": round(median_eng_rate, 2),
        "total_countries": len(valid_countries),
        "total_categories": len(valid_categories),
        "average_likes": round(avg_likes, 2)
    }

def get_overview_charts(df: pd.DataFrame) -> Dict[str, Any]:
    """Generates chart data payloads based on filtered data."""
    if df.empty:
        return {
            "top_by_followers": [],
            "top_by_engagement": [],
            "category_distribution": [],
            "country_distribution": [],
            "scatter_followers_vs_engagement": [],
            "category_performance": [],
            "country_performance": []
        }

    # 1. Top 10 by Followers
    top_fol = df.sort_values(by="followers", ascending=False, na_position="last").head(10)
    top_by_followers = [
        {
            "id": int(row["id"]),
            "rank": int(row["rank"]) if pd.notna(row["rank"]) else None,
            "username": str(row["username"]),
            "influencer_name": str(row["influencer_name"]),
            "followers": float(row["followers"]) if pd.notna(row["followers"]) else 0,
            "engagement_rate": float(row["engagement_rate"]) if pd.notna(row["engagement_rate"]) else None,
            "category": str(row["category"]),
            "country": str(row["country"])
        }
        for _, row in top_fol.iterrows()
    ]

    # 2. Top 10 by Engagement Rate (only for non-null engagement)
    valid_eng = df.dropna(subset=["engagement_rate"])
    top_eng = valid_eng.sort_values(by="engagement_rate", ascending=False).head(10)
    top_by_engagement = [
        {
            "id": int(row["id"]),
            "rank": int(row["rank"]) if pd.notna(row["rank"]) else None,
            "username": str(row["username"]),
            "influencer_name": str(row["influencer_name"]),
            "followers": float(row["followers"]) if pd.notna(row["followers"]) else 0,
            "engagement_rate": float(row["engagement_rate"]),
            "average_likes": float(row["average_likes"]) if pd.notna(row["average_likes"]) else 0,
            "category": str(row["category"]),
            "country": str(row["country"])
        }
        for _, row in top_eng.iterrows()
    ]

    # 3. Category Distribution
    cat_counts = df["category"].value_counts()
    category_distribution = [
        {"name": cat, "count": int(count), "percentage": round((count / len(df)) * 100, 1)}
        for cat, count in cat_counts.items()
    ]

    # 4. Country Distribution (Top 10)
    country_counts = df[df["country"] != "Unspecified"]["country"].value_counts().head(10)
    country_distribution = [
        {"name": c, "count": int(count), "percentage": round((count / len(df)) * 100, 1)}
        for c, count in country_counts.items()
    ]

    # 5. Scatter Plot: Followers vs Engagement Rate
    scatter_df = df.dropna(subset=["followers", "engagement_rate"])
    scatter_followers_vs_engagement = [
        {
            "id": int(row["id"]),
            "username": str(row["username"]),
            "influencer_name": str(row["influencer_name"]),
            "followers": float(row["followers"]),
            "engagement_rate": float(row["engagement_rate"]),
            "average_likes": float(row["average_likes"]) if pd.notna(row["average_likes"]) else 0,
            "category": str(row["category"]),
            "country": str(row["country"])
        }
        for _, row in scatter_df.iterrows()
    ]

    # 6. Category Performance (Averages with sample counts beside them!)
    cat_perf = []
    for cat, group in df.groupby("category"):
        count = len(group)
        avg_fol = float(group["followers"].dropna().mean()) if not group["followers"].dropna().empty else 0
        avg_eng = float(group["engagement_rate"].dropna().mean()) if not group["engagement_rate"].dropna().empty else 0
        avg_likes = float(group["average_likes"].dropna().mean()) if not group["average_likes"].dropna().empty else 0
        cat_perf.append({
            "category": cat,
            "sample_count": count,
            "avg_followers": round(avg_fol, 2),
            "avg_engagement_rate": round(avg_eng, 2),
            "avg_likes": round(avg_likes, 2)
        })
    cat_perf.sort(key=lambda x: x["avg_followers"], reverse=True)

    # 7. Country Performance (Averages with sample counts beside them!)
    country_perf = []
    for country, group in df[df["country"] != "Unspecified"].groupby("country"):
        count = len(group)
        avg_fol = float(group["followers"].dropna().mean()) if not group["followers"].dropna().empty else 0
        avg_eng = float(group["engagement_rate"].dropna().mean()) if not group["engagement_rate"].dropna().empty else 0
        avg_likes = float(group["average_likes"].dropna().mean()) if not group["average_likes"].dropna().empty else 0
        country_perf.append({
            "country": country,
            "sample_count": count,
            "avg_followers": round(avg_fol, 2),
            "avg_engagement_rate": round(avg_eng, 2),
            "avg_likes": round(avg_likes, 2)
        })
    country_perf.sort(key=lambda x: x["sample_count"], reverse=True)

    return {
        "top_by_followers": top_by_followers,
        "top_by_engagement": top_by_engagement,
        "category_distribution": category_distribution,
        "country_distribution": country_distribution,
        "scatter_followers_vs_engagement": scatter_followers_vs_engagement,
        "category_performance": cat_perf,
        "country_performance": country_perf[:12]
    }

def compare_influencers(df: pd.DataFrame, influencer_ids: List[int]) -> Dict[str, Any]:
    """
    Compares 2 to 5 influencers side by side without declaring a single winner.
    Highlights strongest performance per metric with marketing trade-off explanations.
    """
    if len(influencer_ids) < 2 or len(influencer_ids) > 5:
        raise ValueError("Comparison requires between 2 and 5 influencers.")

    subset = df[df["id"].isin(influencer_ids)].copy()
    if len(subset) == 0:
        raise ValueError("Selected influencers not found.")

    profiles = []
    for _, row in subset.iterrows():
        profiles.append({
            "id": int(row["id"]),
            "rank": int(row["rank"]) if pd.notna(row["rank"]) else None,
            "username": str(row["username"]),
            "influencer_name": str(row["influencer_name"]),
            "followers": float(row["followers"]) if pd.notna(row["followers"]) else None,
            "engagement_rate": float(row["engagement_rate"]) if pd.notna(row["engagement_rate"]) else None,
            "average_likes": float(row["average_likes"]) if pd.notna(row["average_likes"]) else None,
            "average_comments": "Not available", # Strictly labeled as not available
            "influence_score": float(row["influence_score"]) if pd.notna(row["influence_score"]) else None,
            "posts": float(row["posts"]) if pd.notna(row["posts"]) else None,
            "total_likes": float(row["total_likes"]) if pd.notna(row["total_likes"]) else None,
            "country": str(row["country"]),
            "category": str(row["category"])
        })

    # Find highest for key available metrics
    metrics_to_evaluate = ["followers", "engagement_rate", "average_likes", "influence_score", "total_likes"]
    highlights = {}
    for m in metrics_to_evaluate:
        vals = [(p["id"], p["influencer_name"], p[m]) for p in profiles if p[m] is not None]
        if vals:
            best_id, best_name, max_val = max(vals, key=lambda x: x[2])
            highlights[m] = {
                "influencer_id": best_id,
                "influencer_name": best_name,
                "value": max_val
            }
        else:
            highlights[m] = None

    # Normalized radar/bar comparison (0-100 scale within the compared set)
    normalized_comparison = []
    for p in profiles:
        item = {
            "name": p["influencer_name"],
            "username": p["username"]
        }
        for m in ["followers", "engagement_rate", "average_likes", "influence_score"]:
            vals = [x[m] for x in profiles if x[m] is not None]
            if vals and max(vals) > 0 and p[m] is not None:
                item[m] = round((p[m] / max(vals)) * 100, 1)
            else:
                item[m] = 0
        normalized_comparison.append(item)

    return {
        "profiles": profiles,
        "highlights": highlights,
        "normalized_comparison": normalized_comparison,
        "advisory_summary": (
            "Analysis trade-off: Large follower counts maximize reach for brand awareness, "
            "whereas high engagement rates typically indicate higher audience resonance. "
            "The ideal selection depends strictly on campaign goals."
        )
    }

def calculate_custom_score(
    df: pd.DataFrame,
    weight_followers: float = 0.35,
    weight_engagement: float = 0.45,
    weight_influence: float = 0.20
) -> List[Dict[str, Any]]:
    """
    Computes a transparent, configurable composite score for ranking influencers.
    Min-Max normalizes each metric to [0, 100], applies user weights,
    and returns transparent component breakdowns.
    """
    # Normalize weights so sum is 1.0
    total_w = weight_followers + weight_engagement + weight_influence
    if total_w <= 0:
        total_w = 1.0
    w_fol = weight_followers / total_w
    w_eng = weight_engagement / total_w
    w_inf = weight_influence / total_w

    res = df.copy()

    # Normalization helper
    def min_max(series):
        s_clean = series.fillna(series.min() if pd.notna(series.min()) else 0)
        s_min = s_clean.min()
        s_max = s_clean.max()
        if s_max == s_min:
            return pd.Series(50.0, index=series.index)
        return ((s_clean - s_min) / (s_max - s_min)) * 100.0

    res["norm_fol"] = min_max(res["followers"])
    res["norm_eng"] = min_max(res["engagement_rate"])
    res["norm_inf"] = min_max(res["influence_score"])

    res["composite_score"] = (
        (res["norm_fol"] * w_fol) +
        (res["norm_eng"] * w_eng) +
        (res["norm_inf"] * w_inf)
    ).round(2)

    res = res.sort_values(by="composite_score", ascending=False)

    ranked_list = []
    for rank_idx, (_, row) in enumerate(res.iterrows(), start=1):
        ranked_list.append({
            "custom_rank": rank_idx,
            "id": int(row["id"]),
            "username": str(row["username"]),
            "influencer_name": str(row["influencer_name"]),
            "composite_score": float(row["composite_score"]),
            "followers": float(row["followers"]) if pd.notna(row["followers"]) else None,
            "engagement_rate": float(row["engagement_rate"]) if pd.notna(row["engagement_rate"]) else None,
            "influence_score": float(row["influence_score"]) if pd.notna(row["influence_score"]) else None,
            "norm_followers": round(float(row["norm_fol"]), 1),
            "norm_engagement": round(float(row["norm_eng"]), 1),
            "norm_influence": round(float(row["norm_inf"]), 1),
            "category": str(row["category"]),
            "country": str(row["country"])
        })

    return ranked_list

def simulate_campaign_metrics(
    spend: float,
    impressions: float,
    clicks: float,
    conversions: float,
    revenue: float
) -> Dict[str, Any]:
    """
    Educational campaign performance calculator implementing standard digital marketing formulas.
    Safely guards against zero-division and negative values.
    """
    spend = max(0.0, float(spend))
    impressions = max(0.0, float(impressions))
    clicks = max(0.0, float(clicks))
    conversions = max(0.0, float(conversions))
    revenue = max(0.0, float(revenue))

    ctr = ((clicks / impressions) * 100) if impressions > 0 else 0.0
    cpc = (spend / clicks) if clicks > 0 else 0.0
    cvr = ((conversions / clicks) * 100) if clicks > 0 else 0.0
    cpa = (spend / conversions) if conversions > 0 else 0.0
    net_profit = revenue - spend
    roi = ((net_profit / spend) * 100) if spend > 0 else 0.0
    roas = (revenue / spend) if spend > 0 else 0.0

    return {
        "inputs": {
            "spend": spend,
            "impressions": impressions,
            "clicks": clicks,
            "conversions": conversions,
            "revenue": revenue
        },
        "calculated_metrics": {
            "ctr_percent": round(ctr, 2),
            "cpc": round(cpc, 2),
            "conversion_rate_percent": round(cvr, 2),
            "cpa": round(cpa, 2),
            "net_profit": round(net_profit, 2),
            "roi_percent": round(roi, 2),
            "roas": round(roas, 2)
        },
        "formulas_used": {
            "ctr": "CTR (%) = (Clicks / Impressions) × 100",
            "cpc": "CPC = Spend / Clicks",
            "conversion_rate": "Conversion Rate (%) = (Conversions / Clicks) × 100",
            "cpa": "CPA = Spend / Conversions",
            "roi": "ROI (%) = ((Revenue - Spend) / Spend) × 100",
            "roas": "ROAS = Revenue / Spend"
        }
    }
