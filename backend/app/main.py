"""
InfluenceIQ - FastAPI Main Application & Route Registration
Provides clean REST APIs for influencer queries, interactive analytics,
dynamic multi-parameter filtering, fair creator comparisons, and transparent metrics.
"""

from contextlib import asynccontextmanager
from typing import List, Optional
import math
import pandas as pd
from fastapi import FastAPI, APIRouter, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from app.data_loader import dataset_manager, DEFAULT_DATASET_PATH
from app.analytics import (
    apply_filters,
    compute_overview_kpis,
    get_overview_charts,
    compare_influencers,
    calculate_custom_score,
    simulate_campaign_metrics
)
from app.schemas import (
    InfluencerItem,
    InfluencerListResponse,
    FilterOptionsResponse,
    CompareRequest,
    CustomScoreRequest,
    CampaignSimulationRequest,
    ToggleEnrichmentRequest,
    HealthResponse
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load dataset on startup
    dataset_manager.load_dataset(DEFAULT_DATASET_PATH)
    yield

# Initialize application
app = FastAPI(
    title="InfluenceIQ API",
    description="Backend REST API for Instagram Influencer Analytics System",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend dev server & production builds
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint to verify backend status and dataset readiness."""
    df = dataset_manager.get_df()
    return {
        "status": "healthy",
        "version": "1.0.0",
        "dataset_loaded": dataset_manager.is_loaded,
        "total_records": len(df) if df is not None else 0
    }

@router.get("/metadata")
def get_metadata():
    """Returns dataset metadata, column mapping audit, and data quality report."""
    return dataset_manager.get_quality_report()

@router.get("/filters/options", response_model=FilterOptionsResponse)
def get_filter_options():
    """Returns unique options for frontend filter dropdowns and slider boundaries."""
    df = dataset_manager.get_df()
    
    countries = sorted([
        c for c in df["country"].dropna().unique() if c and c != "Unspecified"
    ])
    categories = sorted([
        c for c in df["category"].dropna().unique() if c and c not in ["Uncategorized", "Not Available"]
    ])
    
    followers = df["followers"].dropna()
    eng = df["engagement_rate"].dropna()

    return {
        "countries": countries,
        "categories": categories,
        "min_followers": float(followers.min()) if not followers.empty else 0.0,
        "max_followers": float(followers.max()) if not followers.empty else 1_000_000_000.0,
        "min_engagement": float(eng.min()) if not eng.empty else 0.0,
        "max_engagement": float(eng.max()) if not eng.empty else 100.0
    }

@router.get("/influencers", response_model=InfluencerListResponse)
def get_influencers(
    country: Optional[List[str]] = Query(None),
    category: Optional[List[str]] = Query(None),
    min_followers: Optional[float] = Query(None),
    max_followers: Optional[float] = Query(None),
    min_engagement: Optional[float] = Query(None),
    max_engagement: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("rank"),
    sort_order: str = Query("asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """
    Returns filtered, searched, sorted, and paginated influencer records.
    Filters use strict AND logic across country and category.
    """
    df = dataset_manager.get_df()
    filtered_df = apply_filters(
        df=df,
        countries=country,
        categories=category,
        min_followers=min_followers,
        max_followers=max_followers,
        min_engagement=min_engagement,
        max_engagement=max_engagement,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order
    )

    total = len(filtered_df)
    total_pages = max(1, math.ceil(total / page_size))
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size

    sliced = filtered_df.iloc[start_idx:end_idx]

    items = []
    for _, row in sliced.iterrows():
        items.append(InfluencerItem(
            id=int(row["id"]),
            rank=int(row["rank"]) if pd.notna(row["rank"]) else None,
            username=str(row["username"]),
            influencer_name=str(row["influencer_name"]),
            followers=float(row["followers"]) if pd.notna(row["followers"]) else None,
            engagement_rate=float(row["engagement_rate"]) if pd.notna(row["engagement_rate"]) else None,
            average_likes=float(row["average_likes"]) if pd.notna(row["average_likes"]) else None,
            average_comments="Not available",
            influence_score=float(row["influence_score"]) if pd.notna(row["influence_score"]) else None,
            posts=float(row["posts"]) if pd.notna(row["posts"]) else None,
            total_likes=float(row["total_likes"]) if pd.notna(row["total_likes"]) else None,
            new_post_avg_like=float(row["new_post_avg_like"]) if pd.notna(row["new_post_avg_like"]) else None,
            country=str(row["country"]),
            category=str(row["category"])
        ))

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/influencers/{identifier}")
def get_influencer_detail(identifier: str):
    """
    Returns complete profile and comparative standing for a single creator
    by ID (integer) or username (string).
    """
    df = dataset_manager.get_df()
    
    match = None
    if identifier.isdigit():
        sub = df[df["id"] == int(identifier)]
        if not sub.empty:
            match = sub.iloc[0]
    
    if match is None:
        sub = df[df["username"].str.lower() == identifier.lower()]
        if not sub.empty:
            match = sub.iloc[0]

    if match is None:
        raise HTTPException(status_code=404, detail="Influencer not found")

    # Calculate contextual standing in dataset
    total_creators = len(df)
    fol_rank = int((df["followers"] > match["followers"]).sum()) + 1 if pd.notna(match["followers"]) else None
    eng_rank = int((df["engagement_rate"] > match["engagement_rate"]).sum()) + 1 if pd.notna(match["engagement_rate"]) else None

    # Percentiles
    fol_percentile = round(((total_creators - (fol_rank or total_creators)) / total_creators) * 100, 1) if fol_rank else None
    eng_percentile = round(((total_creators - (eng_rank or total_creators)) / total_creators) * 100, 1) if eng_rank else None

    # Dataset averages for benchmarking
    benchmarks = {
        "avg_followers": round(float(df["followers"].dropna().mean()), 2),
        "avg_engagement_rate": round(float(df["engagement_rate"].dropna().mean()), 2),
        "avg_likes": round(float(df["average_likes"].dropna().mean()), 2),
    }

    return {
        "profile": {
            "id": int(match["id"]),
            "rank": int(match["rank"]) if pd.notna(match["rank"]) else None,
            "username": str(match["username"]),
            "influencer_name": str(match["influencer_name"]),
            "followers": float(match["followers"]) if pd.notna(match["followers"]) else None,
            "engagement_rate": float(match["engagement_rate"]) if pd.notna(match["engagement_rate"]) else None,
            "average_likes": float(match["average_likes"]) if pd.notna(match["average_likes"]) else None,
            "average_comments": "Not available",
            "influence_score": float(match["influence_score"]) if pd.notna(match["influence_score"]) else None,
            "posts": float(match["posts"]) if pd.notna(match["posts"]) else None,
            "total_likes": float(match["total_likes"]) if pd.notna(match["total_likes"]) else None,
            "new_post_avg_like": float(match["new_post_avg_like"]) if pd.notna(match["new_post_avg_like"]) else None,
            "country": str(match["country"]),
            "category": str(match["category"])
        },
        "standings": {
            "followers_rank": fol_rank,
            "followers_percentile": fol_percentile,
            "engagement_rank": eng_rank,
            "engagement_percentile": eng_percentile,
            "total_dataset_size": total_creators
        },
        "benchmarks": benchmarks
    }

@router.get("/analytics/overview")
def get_analytics_overview(
    country: Optional[List[str]] = Query(None),
    category: Optional[List[str]] = Query(None),
    min_followers: Optional[float] = Query(None),
    max_followers: Optional[float] = Query(None),
    min_engagement: Optional[float] = Query(None),
    max_engagement: Optional[float] = Query(None),
    search: Optional[str] = Query(None)
):
    """
    Returns filtered KPIs and comprehensive visualization chart data
    reflecting active global filters.
    """
    df = dataset_manager.get_df()
    filtered_df = apply_filters(
        df=df,
        countries=country,
        categories=category,
        min_followers=min_followers,
        max_followers=max_followers,
        min_engagement=min_engagement,
        max_engagement=max_engagement,
        search=search
    )

    kpis = compute_overview_kpis(filtered_df)
    charts = get_overview_charts(filtered_df)

    return {
        "filtered_record_count": len(filtered_df),
        "total_dataset_count": len(df),
        "kpis": kpis,
        "charts": charts
    }

@router.get("/analytics/categories")
def get_categories_analysis():
    """Detailed category-level breakdowns and comparative benchmarks."""
    df = dataset_manager.get_df()
    charts = get_overview_charts(df)
    return {
        "category_performance": charts["category_performance"],
        "category_distribution": charts["category_distribution"]
    }

@router.get("/analytics/countries")
def get_countries_analysis():
    """Detailed country-level breakdowns and geographic performance."""
    df = dataset_manager.get_df()
    charts = get_overview_charts(df)
    return {
        "country_performance": charts["country_performance"],
        "country_distribution": charts["country_distribution"]
    }

@router.post("/analytics/compare")
def compare_selected_influencers(req: CompareRequest):
    """Side-by-side comparison of 2 to 5 selected influencers."""
    df = dataset_manager.get_df()
    try:
        return compare_influencers(df, req.influencer_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/analytics/custom-score")
def rank_by_custom_score(req: CustomScoreRequest):
    """
    Computes a transparent composite score using user-defined weights.
    Provides clear formula and breakdown.
    """
    df = dataset_manager.get_df()
    ranked = calculate_custom_score(
        df=df,
        weight_followers=req.weight_followers,
        weight_engagement=req.weight_engagement,
        weight_influence=req.weight_influence
    )
    return {
        "weights": {
            "followers": req.weight_followers,
            "engagement": req.weight_engagement,
            "influence": req.weight_influence
        },
        "formula": "Composite Score = (w_fol × Norm_Fol) + (w_eng × Norm_Eng) + (w_inf × Norm_Inf)",
        "disclaimer": "This score is an exploratory decision-support metric and does not represent an objective measurement of creator quality.",
        "ranked_creators": ranked
    }

@router.post("/campaign/simulate")
def run_campaign_simulation(req: CampaignSimulationRequest):
    """Simulates campaign ROI, CPC, CPA, and conversion rates."""
    return simulate_campaign_metrics(
        spend=req.spend,
        impressions=req.impressions,
        clicks=req.clicks,
        conversions=req.conversions,
        revenue=req.revenue
    )

@router.post("/dataset/toggle-enrichment")
def toggle_dataset_enrichment(req: ToggleEnrichmentRequest):
    """Toggles verified category enrichment on or off."""
    dataset_manager.toggle_enrichment(req.enabled)
    return {
        "category_enrichment_active": dataset_manager.enrich_categories,
        "metadata": dataset_manager.get_quality_report()
    }

@router.post("/dataset/upload")
async def upload_custom_dataset(file: UploadFile = File(...)):
    """Accepts custom CSV file, dynamically maps columns, and re-computes analytics."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    contents = await file.read()
    success = dataset_manager.load_dataset(contents, dataset_name=file.filename)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to parse and load CSV file.")

    return {
        "message": f"Successfully loaded {file.filename}",
        "metadata": dataset_manager.get_quality_report()
    }

@router.get("/")
def root_status():
    """Root status endpoint for health checks and service discovery."""
    return {
        "service": "InfluenceIQ Backend API",
        "status": "healthy",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Mount router under both /api and root / to support direct routing, proxies, and Vercel services
app.include_router(router, prefix="/api")
app.include_router(router)

