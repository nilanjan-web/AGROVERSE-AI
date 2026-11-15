"""Crop recommendation endpoint backed by existing NASA climate analyzer."""
from datetime import date, timedelta
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.climate_analyzer import climate_analyzer_service
from app.services.crop_catalog import crop_catalog_service

router = APIRouter(prefix="/crop-recommendation", tags=["Crop Recommendation"])

SEASON_MAP = {"Kharif": "aman", "Rabi": "rabi", "Zaid": "summer"}


class RecommendationRequest(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    season: str
    crops: List[str] = Field(default_factory=list)


@router.post("")
async def recommend_crops(payload: RecommendationRequest):
    season_key = SEASON_MAP.get(payload.season)
    if season_key is None:
        raise HTTPException(status_code=422, detail="Season must be Kharif, Rabi, or Zaid")
    if not payload.crops:
        raise HTTPException(status_code=422, detail="Select at least one crop")

    # Three completed years of historical daily NASA data, ending yesterday.
    end = date.today() - timedelta(days=1)
    start = end - timedelta(days=3 * 365 + 3)
    try:
        report = await climate_analyzer_service.generate_report(
            latitude=payload.latitude,
            longitude=payload.longitude,
            start_date=start,
            end_date=end,
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Climate data is temporarily unavailable") from exc

    catalog = crop_catalog_service.get_all_crops()
    by_name = {crop.crop_name.casefold().strip(): crop.crop_id for crop in catalog}
    by_id = {crop.crop_id.casefold().strip(): crop.crop_id for crop in catalog}
    matching = {}
    unmatched = []
    for label in payload.crops:
        key = label.casefold().strip()
       aliases = {
    "rice": "rice",
    "maize": "maize",
    "wheat": "wheat",
    "lentil": "lentil",
    "mustard": "mustard",
    "chickpea": "chickpea",
    "green gram": "green_gram",
}

crop_id = (
    by_name.get(key)
    or by_id.get(key.replace(" ", "_"))
    or aliases.get(key)
)
        if crop_id:
            matching[crop_id] = label
        else:
            unmatched.append(label)

    rankings = []
    for item in report.crop_suitability:
        if item.season != season_key or item.crop_id not in matching:
            continue
        rankings.append({
            "crop": matching[item.crop_id],
            "catalog_name": item.crop_name,
            "score": item.overall_climate_score,
            "temperature": item.thermal_compatibility.value,
            "water": item.water_compatibility.value,
            "mean_temperature_c": item.observed_mean_temp_c,
            "seasonal_rainfall_mm": item.observed_rainfall_mm,
            "notes": item.agronomic_caveats,
        })
    rankings.sort(key=lambda item: (item["score"] is None, -(item["score"] or 0)))
    return {
        "season": payload.season,
        "recommendations": rankings,
        "unmatched_crops": unmatched,
        "disclaimer": "Historical regional NASA climate suitability only; soil, irrigation and field conditions are not evaluated.",
    }
