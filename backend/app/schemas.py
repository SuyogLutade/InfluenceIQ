"""
InfluenceIQ - Pydantic Request & Response Schemas
Validates all incoming payloads and provides structured typing for API consumers.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field

class InfluencerItem(BaseModel):
    id: int
    rank: Optional[int] = None
    username: str
    influencer_name: str
    followers: Optional[float] = None
    engagement_rate: Optional[float] = None
    average_likes: Optional[float] = None
    average_comments: Optional[Union[float, str]] = "Not available"
    influence_score: Optional[float] = None
    posts: Optional[float] = None
    total_likes: Optional[float] = None
    new_post_avg_like: Optional[float] = None
    country: str = "Unspecified"
    category: str = "Uncategorized"

class InfluencerListResponse(BaseModel):
    items: List[InfluencerItem]
    total: int
    page: int
    page_size: int
    total_pages: int

class FilterOptionsResponse(BaseModel):
    countries: List[str]
    categories: List[str]
    min_followers: float
    max_followers: float
    min_engagement: float
    max_engagement: float

class CompareRequest(BaseModel):
    influencer_ids: List[int] = Field(..., min_length=2, max_length=5, description="List of 2 to 5 influencer IDs to compare")

class CustomScoreRequest(BaseModel):
    weight_followers: float = Field(0.35, ge=0.0, le=1.0)
    weight_engagement: float = Field(0.45, ge=0.0, le=1.0)
    weight_influence: float = Field(0.20, ge=0.0, le=1.0)

class CampaignSimulationRequest(BaseModel):
    spend: float = Field(..., ge=0.0, description="Campaign ad spend ($)")
    impressions: float = Field(..., ge=0.0, description="Total impressions")
    clicks: float = Field(..., ge=0.0, description="Total clicks received")
    conversions: float = Field(..., ge=0.0, description="Total conversions / purchases")
    revenue: float = Field(..., ge=0.0, description="Total revenue generated ($)")

class ToggleEnrichmentRequest(BaseModel):
    enabled: bool

class HealthResponse(BaseModel):
    status: str
    version: str
    dataset_loaded: bool
    total_records: int
