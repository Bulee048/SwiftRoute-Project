import { useMemo } from 'react'
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api'

const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 } // Sri Lanka center-ish

function toLatLng(coords) {
  // Expect GeoJSON-like [lng, lat]
  if (!Array.isArray(coords) || coords.length < 2) return null
  const [lng, lat] = coords
  return { lat: Number(lat), lng: Number(lng) }
}

export default function GoogleTrackingMap({ shipment }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    preventGoogleFontsLoading: true,
  })

  const routePath = useMemo(() => {
    if (!shipment?.route?.length) return []
    return shipment.route
      .map((p) => {
        // model uses {lat,lng,timestamp}
        if (typeof p?.lat === 'number' && typeof p?.lng === 'number') return { lat: p.lat, lng: p.lng }
        return null
      })
      .filter(Boolean)
  }, [shipment])

  const origin = shipment?.origin ? toLatLng(shipment.origin.coordinates) : null
  const destination = shipment?.destination ? toLatLng(shipment.destination.coordinates) : null
  const currentPos = shipment?.currentLocation?.coordinates ? toLatLng(shipment.currentLocation.coordinates) : null

  if (!apiKey) {
    return (
      <div className="h-80 rounded-2xl border border-dark-border bg-dark-base/60 grid place-items-center text-text-muted">
        Google Maps not configured. Add `VITE_GOOGLE_MAPS_API_KEY` in `client/.env`.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="h-80 rounded-2xl border border-dark-border bg-dark-base/60 grid place-items-center text-text-muted">
        Loading Google Map...
      </div>
    )
  }

  const bounds = (() => {
    const points = [origin, destination, currentPos].filter(Boolean)
    if (!points.length) return null
    const lats = points.map((p) => p.lat)
    const lngs = points.map((p) => p.lng)
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    }
  })()

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '320px', borderRadius: 16 }}
      center={currentPos || origin || destination || DEFAULT_CENTER}
      zoom={currentPos ? 12 : 6}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#0b1020' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1020' }] },
          { elementType: 'geometry.stroke', stylers: [{ color: '#374151' }] },
        ],
      }}
      onLoad={(map) => {
        if (!bounds) return
        // Fit bounds using native API
        const sw = { lat: bounds.south, lng: bounds.west }
        const ne = { lat: bounds.north, lng: bounds.east }
        const b = new window.google.maps.LatLngBounds(sw, ne)
        map.fitBounds(b)
      }}
    >
      {origin && (
        <Marker position={origin} label="P" />
      )}
      {destination && (
        <Marker position={destination} label="D" />
      )}
      {currentPos && <Marker position={currentPos} />}
      {routePath.length > 1 && (
        <Polyline
          path={routePath}
          options={{ strokeColor: '#F97316', strokeOpacity: 1, strokeWeight: 3 }}
        />
      )}
    </GoogleMap>
  )
}

