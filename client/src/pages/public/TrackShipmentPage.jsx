import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../../components/common/Navbar.jsx'
import Button from '../../components/common/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import Page from '../../components/common/Page.jsx'
import { trackShipment } from '../../api/shipmentAPI'
import useSocket from '../../hooks/useSocket'
import GoogleTrackingMap from '../../components/maps/GoogleTrackingMap.jsx'
import StatusStepper from '../../components/shipment/StatusStepper.jsx'

export default function TrackShipmentPage() {
  const { trackingId: trackingIdParam } = useParams()
  const [trackingId, setTrackingId] = useState(trackingIdParam || '')
  const navigate = useNavigate()
  const [apiData, setApiData] = useState(null)
  const socket = useSocket()

  const demo = useMemo(() => {
    if (!trackingIdParam) return null
    return {
      trackingId: trackingIdParam,
      status: 'in_transit',
      origin: 'Colombo Hub',
      destination: 'Kandy City',
      eta: 'Tomorrow 10:30',
      events: [
        { status: 'created', desc: 'Shipment created', at: '2026-03-26 10:12' },
        { status: 'picked_up', desc: 'Picked up from merchant', at: '2026-03-26 12:40' },
        { status: 'in_transit', desc: 'Moving to destination hub', at: '2026-03-26 16:15' },
      ],
    }
  }, [trackingIdParam])

  useEffect(() => {
    let mounted = true
    async function run() {
      if (!trackingIdParam) return
      try {
        const data = await trackShipment(trackingIdParam)
        if (mounted) setApiData(data?.data || null)
      } catch (err) {
        if (mounted) setApiData(null)
        toast.error(err?.response?.data?.message || 'Tracking failed')
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [trackingIdParam])

  useEffect(() => {
    if (!socket || !trackingIdParam) return
    const onShipment = (payload) => {
      if (!payload?.shipmentId) return
      setApiData((prev) => {
        if (!prev?.shipment?._id || String(prev.shipment._id) !== String(payload.shipmentId)) return prev
        return { ...prev, shipment: { ...prev.shipment, status: payload.status || prev.shipment.status } }
      })
    }
    socket.on('shipment_update', onShipment)
    return () => socket.off('shipment_update', onShipment)
  }, [socket, trackingIdParam])

  return (
    <Page>
      <Navbar />
      <div className="sr-container py-10">
        <div className="sr-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-between">
            <div>
              <div className="font-display text-2xl font-bold text-text-primary">Public Tracking</div>
              <div className="mt-1 text-sm text-text-secondary font-mono">/track/:trackingId</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="SWR-A3K9PLMX2Q"
                className="w-full sm:w-80 rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted font-mono outline-none focus:ring-2 focus:ring-brand-secondary/60"
              />
              <Button
                onClick={() => navigate(`/track/${encodeURIComponent(trackingId.trim())}`)}
                disabled={!trackingId.trim()}
              >
                Track
              </Button>
            </div>
          </div>

          {!demo ? (
            <div className="mt-8 text-text-secondary">
              Enter a tracking ID to see the live tracking view.
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 sr-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-mono text-sm text-text-secondary">Tracking ID</div>
                  <div className="font-mono text-sm text-text-primary">{demo.trackingId}</div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="font-mono text-sm text-text-secondary">Status</div>
                  <Badge status={apiData?.shipment?.status || demo.status} />
                </div>

              <div className="mt-4">
                <StatusStepper status={apiData?.shipment?.status || demo.status} />
              </div>
                <div className="mt-6">
                  <GoogleTrackingMap shipment={apiData?.shipment} />
                </div>
              </div>

              <div className="sr-card p-5">
                <div className="font-display text-lg font-semibold text-text-primary">Timeline</div>
                <div className="mt-4 space-y-3">
                  {(apiData?.events?.length ? apiData.events : demo.events).map((e) => (
                    <div key={e.at} className="flex gap-3">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-secondary" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge status={e.status} />
                          <span className="text-xs text-text-muted font-mono">{e.at || e.timestamp}</span>
                        </div>
                        <div className="mt-1 text-sm text-text-secondary">{e.desc || e.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-dark-border pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Origin</span>
                    <span className="text-text-secondary font-mono">
                      {apiData?.shipment?.origin?.city || apiData?.shipment?.origin?.address || demo.origin}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Destination</span>
                    <span className="text-text-secondary font-mono">
                      {apiData?.shipment?.destination?.city || apiData?.shipment?.destination?.address || demo.destination}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">ETA</span>
                    <span className="text-text-secondary font-mono">
                      {apiData?.shipment?.estimatedDelivery || demo.eta}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Page>
  )
}

