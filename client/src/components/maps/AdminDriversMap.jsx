import { useMemo } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'

const DEFAULT_CENTER = { lat: 6.9271, lng: 79.8612 }

export default function AdminDriversMap({ drivers = [] }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    preventGoogleFontsLoading: true,
  })

  const centers = useMemo(() => {
    return drivers
      .map((d) => {
        const lat = d.lat ?? d?.currentLocation?.coordinates?.[1]
        const lng = d.lng ?? d?.currentLocation?.coordinates?.[0]
        if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng }
        if (Array.isArray(d?.coordinates) && d.coordinates.length >= 2) return { lat: d.coordinates[1], lng: d.coordinates[0] }
        return null
      })
      .filter(Boolean)
  }, [drivers])

  if (!apiKey) {
    return (
      <div className="h-96 rounded-2xl border border-dark-border bg-dark-base/60 grid place-items-center text-text-muted p-4">
        Add `VITE_GOOGLE_MAPS_API_KEY` in `client/.env` to enable the live driver map.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="h-96 rounded-2xl border border-dark-border bg-dark-base/60 grid place-items-center text-text-muted">
        Loading Google Map...
      </div>
    )
  }

  const center = centers[0] || DEFAULT_CENTER

  return (
    <div className="h-96 rounded-2xl overflow-hidden border border-dark-border bg-dark-base/60">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={centers.length > 0 ? 12 : 6}
        options={{ disableDefaultUI: true, zoomControl: true }}
      >
        {centers.map((pos, i) => (
          <Marker key={`${pos.lat}-${pos.lng}-${i}`} position={pos} />
        ))}
      </GoogleMap>
    </div>
  )
}

