import { useState } from 'react'
import useLabels from '../../hooks/useLabels'
import { seasons, seasonMeta, cropOptions, cropsBySeason, cropEmoji } from '../../data/crops'

// Works on landing page and dashboard without authentication.
export default function CropRecommendation() {
  const { t, cropLabel } = useLabels()
  const [season, setSeason] = useState('')
  const [selectedCrops, setSelectedCrops] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
 const [latitude, setLatitude] = useState('')
const [longitude, setLongitude] = useState('')

  async function getRecommendation() {
    setError('')
    setResult(null)
    if (!season) return setError(t('recommendation.noSeason'))
    if (!selectedCrops.length) return setError(t('recommendation.noCrops'))
    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude)) || latitude === '' || longitude === '') {
      return setError('Enter valid farm latitude and longitude.')
    }
    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8001/api/crop-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: Number(latitude), longitude: Number(longitude),
          season, crops: selectedCrops,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : `API error ${response.status}`)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Cannot reach crop recommendation backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="crop-recommendation">
      <h2 id="crop-recommendation">{t('nav.cropRecommendation')}</h2>
      <p>{t('recommendation.subtitle')}</p>
      <div className="profile-card">
        <h3>🌾 {t('recommendation.cardTitle')}</h3>
        <label>{t('recommendation.season')}</label>
        <div className="crop-grid">
          {seasons.map(s => (
            <button key={s} type="button" className={season === s ? 'crop-option selected' : 'crop-option'}
              onClick={() => { setSeason(s); setSelectedCrops([]); setResult(null); setError('') }}>
              {season === s ? '✅ ' : seasonMeta[s].emoji + ' '}{t('seasons.' + s)}
            </button>
          ))}
        </div>
        {season && <>
          <label>{seasonMeta[season].emoji} {t('recommendation.cropsSuitable', { season: t('seasons.' + season) })}</label>
          <div className="crop-grid">
            {cropOptions.filter(c => cropsBySeason[season].includes(c.en)).map(c => (
              <button key={c.en} type="button"
                className={selectedCrops.includes(c.en) ? 'crop-option selected' : 'crop-option'}
                onClick={() => { setResult(null); setSelectedCrops(prev => prev.includes(c.en) ? prev.filter(x => x !== c.en) : [...prev, c.en]) }}>
                {selectedCrops.includes(c.en) ? '✅ ' : (cropEmoji[c.en] || '🌱') + ' '}{cropLabel(c)}
              </button>
            ))}
          </div>
        </>}
        <p>{t('common.selectedCrops')}: <strong>{selectedCrops.length}</strong></p>
        <p>📍 আপনার জমিতে দাঁড়িয়ে নিচের বাটনে চাপুন।</p>

<button
  type="button"
  onClick={() => {
    if (!navigator.geolocation) {
      setError('আপনার ডিভাইসে লোকেশন সুবিধা নেই।')
      return
    }

    setError('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude))
        setLongitude(String(position.coords.longitude))
        setError('')
      },
      () => {
        setError('লোকেশন পাওয়া যায়নি। ব্রাউজারে Location Allow করুন।')
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }}
>
  📍 আমার জমির লোকেশন নিন
</button>

{latitude && longitude && (
  <p>✅ লোকেশন পাওয়া গেছে। এবার ফসলের পরামর্শ নিন।</p>
)}
        <button type="button" onClick={getRecommendation} disabled={loading}>
          {loading ? t('recommendation.loading') : t('recommendation.get')}
        </button>
        {error && <div className="recommendation-result recommendation-warning">⚠️ {error}</div>}
        {result && <div className="recommendation-result">
          <h3>🌱 Climate-based Crop Ranking — {t('seasons.' + result.season)}</h3>
          {result.recommendations.length === 0 && <p>No matching catalog crops found for this season.</p>}
          {result.recommendations.map((r, i) => <div key={`${r.crop}-${i}`}>
            <h4>{i + 1}. {r.crop} — {r.score == null ? 'Insufficient data' : `${r.score}/100`}</h4>
            <p>Temperature: {r.temperature} | Water: {r.water}</p>
            <p>Mean temperature: {r.mean_temperature_c ?? 'N/A'}°C | Seasonal rainfall: {r.seasonal_rainfall_mm ?? 'N/A'} mm</p>
            {r.notes?.map((note, j) => <p key={j}>• {note}</p>)}
          </div>)}
          {!!result.unmatched_crops.length && <p>Not in backend crop catalog: {result.unmatched_crops.join(', ')}</p>}
          <p><small>{result.disclaimer}</small></p>
        </div>}
      </div>
    </section>
  )
}
