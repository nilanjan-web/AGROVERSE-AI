
import { useState } from 'react'
import useLabels from '../../hooks/useLabels'
import {
  seasons,
  seasonMeta,
  cropOptions,
  cropsBySeason,
  cropEmoji
} from '../../data/crops'

// Smart Crop Rotation API
async function fetchSmartRotation(latitude, longitude, previousCrops = []) {
  const response = await fetch('http://127.0.0.1:8000/api/rotations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      latitude,
      longitude,
      max_cycle_years: 3,
      previous_crops: previousCrops
    })
  })

  if (!response.ok) {
    let message = `Rotation API failed: ${response.status}`

    try {
      const errorData = await response.json()
      if (typeof errorData.detail === 'string') {
        message = errorData.detail
      }
    } catch {
      // Keep the HTTP error message
    }

    throw new Error(message)
  }

  return response.json()
}

// Crop Rotation planner
// Used on landing page and inside dashboard
export default function CropRotation() {
  const { t, tCrop, cropLabel } = useLabels()

  const [selectedCrops, setSelectedCrops] = useState([])
  const [selectedRotationSeasons, setSelectedRotationSeasons] = useState([])
  const [rotationResult, setRotationResult] = useState(null)

  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

const handleAutoLocation = () => {
  if (!navigator.geolocation) {
    alert('Your browser does not support location.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setLatitude(String(position.coords.latitude))
      setLongitude(String(position.coords.longitude))
    },
    () => {
      alert('Please allow location access and try again.')
    },
    {
      enableHighAccuracy: true,
      timeout: 15000
    }
  )
}


  const [isLoading, setIsLoading] = useState(false)
  const [rotationError, setRotationError] = useState('')

  const handleGenerateRotation = async () => {
    if (selectedRotationSeasons.length === 0) {
      alert(t('rotation.alertSeason'))
      return
    }

    if (selectedCrops.length < 3) {
      alert(t('rotation.alertCrops'))
      return
    }

    const seasonsWithoutCrops = selectedRotationSeasons.filter(
      (season) =>
        !selectedCrops.some((crop) =>
          cropsBySeason[season].includes(crop)
        )
    )

    if (seasonsWithoutCrops.length > 0) {
      alert(
        t('rotation.alertSeasonNoCrop', {
          seasons: seasonsWithoutCrops
            .map((s) => t('seasons.' + s))
            .join(', ')
        })
      )
      return
    }

    const firstSeason = selectedRotationSeasons[0]

    const firstSeasonCrops = selectedCrops.filter((crop) =>
      cropsBySeason[firstSeason].includes(crop)
    )

    if (firstSeasonCrops.length < 3) {
      alert(
        t('rotation.alertFirstSeason', {
          season: t('seasons.' + firstSeason)
        })
      )
      return
    }

    if (
      latitude.trim() === '' ||
      longitude.trim() === ''
    ) {
      alert('Please enter your farm latitude and longitude.')
      return
    }

    const lat = Number(latitude)
    const lon = Number(longitude)

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      alert('Please enter valid coordinates.')
      return
    }

    setIsLoading(true)
    setRotationError('')
    setRotationResult(null)

    try {
      // Selected crops are treated as previous crop history.
      // Only send IDs recognized by the backend catalog.
      const cropIds = new Set([
        'rice',
        'wheat',
        'lentil',
        'mustard',
        'chickpea',
        'green_gram',
        'maize'
      ])

      const previousCrops = selectedCrops
        .map((crop) =>
          crop.toLowerCase().replace(/[\s-]+/g, '_')
        )
        .filter((crop) => cropIds.has(crop))

      const data = await fetchSmartRotation(
        lat,
        lon,
        previousCrops
      )

      setRotationResult(data)
    } catch (error) {
      console.error('Smart Rotation Error:', error)

      setRotationError(
        error.message || 'Unable to generate crop rotation.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="crop-rotation">
      <h2 id="crop-rotation">
        🌱 {t('rotation.title')}
      </h2>

      <p>{t('rotation.subtitle')}</p>

      <div className="profile-card">
        <h3>🌦️ {t('rotation.selectSeasons')}</h3>

        <div className="crop-grid">
          {seasons.map((season) => (
            <button
              key={season}
              type="button"
              className={
                selectedRotationSeasons.includes(season)
                  ? 'crop-option selected'
                  : 'crop-option'
              }
              onClick={() =>
                setSelectedRotationSeasons((prev) =>
                  prev.includes(season)
                    ? prev.filter((s) => s !== season)
                    : [...prev, season]
                )
              }
            >
              {selectedRotationSeasons.includes(season)
                ? '✅ '
                : seasonMeta[season].emoji + ' '}

              {t('seasons.' + season)}
            </button>
          ))}
        </div>

        <h3>🌾 {t('rotation.selectCrops')}</h3>

        {selectedRotationSeasons.length === 0 && (
          <p>{t('rotation.pickSeasonHint')}</p>
        )}

        {selectedRotationSeasons.map((season) => (
          <div key={season} className="crop-category">
            <h4>
              {seasonMeta[season].emoji}{' '}
              {t('rotation.seasonCrops', {
                season: t('seasons.' + season)
              })}
            </h4>

            <div className="crop-grid">
              {cropOptions
                .filter((crop) =>
                  cropsBySeason[season].includes(crop.en)
                )
                .map((crop) => (
                  <button
                    key={`${season}-${crop.en}`}
                    type="button"
                    className={
                      selectedCrops.includes(crop.en)
                        ? 'crop-option selected'
                        : 'crop-option'
                    }
                    onClick={() =>
                      setSelectedCrops((prev) =>
                        prev.includes(crop.en)
                          ? prev.filter((c) => c !== crop.en)
                          : [...prev, crop.en]
                      )
                    }
                  >
                    {selectedCrops.includes(crop.en)
                      ? '✅ '
                      : cropEmoji[crop.en] + ' '}

                    {cropLabel(crop)}
                  </button>
                ))}
            </div>
          </div>
        ))}

        <p>
          {t('common.selectedSeasons')}:{' '}
          <strong>{selectedRotationSeasons.length}</strong>
        </p>

        <p>
          {t('common.selectedCrops')}:{' '}
          <strong>{selectedCrops.length}</strong>
        </p>

        {/* Farm Location */}

<button
  type="button"
  className="rotation-primary-button"
  onClick={handleAutoLocation}
>
  📍 Use My Location
</button>

        <div className="crop-category">
          <h3>📍 Farm Location</h3>

          <p>
            Enter your farm coordinates for NASA
            climate-based recommendations.
          </p>

          <label htmlFor="rotation-latitude">
            Latitude
          </label>

          <input
            id="rotation-latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="Example: 22.06"
          />

          <label htmlFor="rotation-longitude">
            Longitude
          </label>

          <input
            id="rotation-longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="Example: 88.10"
          />

          <p>
            <small>
              Example coordinates are for testing only.
              Enter your actual farm location for
              location-specific results.
            </small>
          </p>
        </div>

        <button
          type="button"
          className="rotation-primary-button"
          onClick={handleGenerateRotation}
          disabled={isLoading}
        >
          {isLoading
            ? '🌍 Analyzing NASA Climate Data...'
            : t('rotation.generate')}
        </button>

        {rotationError && (
          <div className="rotation-result" role="alert">
            <p>❌ {rotationError}</p>
          </div>
        )}

        {rotationResult && (
          <div className="rotation-result">
            <h3>🌿 Smart Crop Rotation Recommendation</h3>

            <p>
              📍 Latitude: {rotationResult.latitude}
              {' | '}
              Longitude: {rotationResult.longitude}
            </p>

            {rotationResult.climate_summary && (
              <div className="crop-category">
                <h4>🌦️ NASA Climate Analysis</h4>

                <p>
                  🌡️ Average Temperature:{' '}
                  {rotationResult.climate_summary.mean_temperature_c ?? 'N/A'}
                  {' °C'}
                </p>

                <p>
                  🌧️ Total Rainfall:{' '}
                  {rotationResult.climate_summary.total_rainfall_mm ?? 'N/A'}
                  {' mm'}
                </p>

                <p>
                  ☀️ Heat Risk:{' '}
                  {rotationResult.climate_summary.heat_risk_level ?? 'N/A'}
                </p>

                <p>
                  ❄️ Cold Risk:{' '}
                  {rotationResult.climate_summary.cold_risk_level ?? 'N/A'}
                </p>

                <p>
                  📊 Data Completeness:{' '}
                  {rotationResult.climate_summary.data_completeness ?? 'N/A'}
                </p>
              </div>
            )}

            {rotationResult.primary_strategy && (
              <div className="crop-category">
                <h4>🏆 Best Rotation Strategy</h4>

                <p>
                  <strong>
                    {rotationResult.primary_strategy.name}
                  </strong>
                </p>

                <p>
                  {rotationResult.primary_strategy.description}
                </p>

                <p>
                  ⭐ Composite Score:{' '}
                  {rotationResult.primary_strategy.composite_score}
                </p>

                <p>
                  📚 Evidence Level:{' '}
                  {rotationResult.primary_strategy.evidence_level}
                </p>

                <h4>🌾 Recommended Crop Sequence</h4>

                {rotationResult.primary_strategy.sequence?.map(
                  (step, index) => (
                    <div
                      key={index}
                      className="crop-category"
                    >
                      <p>
                        
<strong>
  📅 Year {step.slot?.match(/^y(\d+)_/)?.[1] || '?'}
  {' — '}
  {step.normalized_season
    ? step.normalized_season.toUpperCase()
    : step.slot?.split('_').slice(1).join(' ').toUpperCase() || 'REST'}
</strong>

                      </p>

                      
<div className="crop-category">
  {step.step_type === 'planted' ? (
    <>
      <h4>🌾 {step.crop_name}</h4>

      <p>
        📅 Season: {step.normalized_season}
      </p>

      <p>
        ⏳ Duration: {step.duration_typical_days} days
      </p>

      <p>
        💧 Water Need: {step.water_demand_class}
      </p>

      <p>
        🌡️ Climate Suitability: {step.thermal_compatibility}
      </p>

      <p>
        ⭐ Climate Score: {step.overall_climate_score}
      </p>

      {step.agronomic_caveats?.length > 0 && (
        <p>
          ⚠️ {step.agronomic_caveats.join('; ')}
        </p>
      )}
    </>
  ) : (
    <>
      <h4>🌿 Rest / Fallow Period</h4>
      <p>
        No suitable crop scheduled for this slot.
      </p>
    </>
  )}
</div>

                    </div>
                  )
                )}
              </div>
            )}

            {rotationResult.strategies?.length > 0 && (
              <div className="crop-category">
                <h4>📊 Available Strategies</h4>

                {rotationResult.strategies.map(
                  (strategy, index) => (
                    <div
                      key={index}
                      className="crop-category"
                    >
                      <p>
                        <strong>{strategy.name}</strong>
                      </p>

                      <p>{strategy.description}</p>

                      <p>
                        Score: {strategy.composite_score}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            <p>
              <small>
                Recommendations use climate data and
                agronomic rules. Verify suitability
                with a local agricultural expert
                before planting.
              </small>
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
