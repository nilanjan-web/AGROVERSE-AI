import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './LocationPicker.css'

const pin = L.divIcon({ className: 'farm-location-pin', html: '📍', iconSize: [32, 36], iconAnchor: [16, 34] })
function ClickToChoose({ onChange }) {
  useMapEvents({ click(e) { onChange({ latitude: Number(e.latlng.lat.toFixed(6)), longitude: Number(e.latlng.lng.toFixed(6)) }) } })
  return null
}
function Recenter({ latitude, longitude }) {
  const map = useMap()
  useEffect(() => { if (Number.isFinite(latitude) && Number.isFinite(longitude)) map.setView([latitude, longitude], Math.max(map.getZoom(), 10)) }, [latitude, longitude, map])
  return null
}
export default function LocationPicker({ latitude, longitude, onChange }) {
  const selected = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude)) && latitude !== '' && longitude !== '' && latitude != null && longitude != null
  const lat = selected ? Number(latitude) : 22.5
  const lng = selected ? Number(longitude) : 79
  return <div className="farm-location-picker">
    <p>📍 Click anywhere on the map to choose your farm location. Zoom in for accuracy.</p>
    <MapContainer center={[lat, lng]} zoom={selected ? 11 : 5} scrollWheelZoom style={{height: 280, width:'100%', borderRadius: 10}}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickToChoose onChange={onChange}/>
      {selected && <><Recenter latitude={lat} longitude={lng}/><Marker position={[lat,lng]} icon={pin}/></>}
    </MapContainer>
    <small>{selected ? `Selected coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}` : 'No location selected yet.'}</small>
  </div>
}
