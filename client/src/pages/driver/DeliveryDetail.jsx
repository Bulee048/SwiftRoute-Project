import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import GoogleTrackingMap from '../../components/maps/GoogleTrackingMap.jsx'
import StatusStepper from '../../components/shipment/StatusStepper.jsx'
import Page from '../../components/common/Page.jsx'
import Badge from '../../components/common/Badge.jsx'
import Button from '../../components/common/Button.jsx'
import { getShipmentById, getShipmentTimeline, updateShipmentStatus } from '../../api/shipmentAPI'
import useSocket from '../../hooks/useSocket.js'
import { containerVariants, itemVariants } from '../../utils/motion'

const STATUS_ACTIONS = [
  { value: 'picked_up', label: 'Picked up' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed_delivery', label: 'Attempt failed' },
]

export default function DeliveryDetail() {
  const MotionDiv = motion.div
  const socket = useSocket()
  const { id } = useParams()

  const [loading, setLoading] = useState(false)
  const [shipment, setShipment] = useState(null)
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      try {
        const [shipmentRes, timelineRes] = await Promise.all([getShipmentById(id), getShipmentTimeline(id)])
        if (!mounted) return
        setShipment(shipmentRes?.data?.shipment || null)
        setTimeline(timelineRes?.data?.events || [])
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load delivery details')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (id) run()
    return () => {
      mounted = false
    }
  }, [id])

  useEffect(() => {
    if (!socket || !id) return

    const handler = async (payload) => {
      const shipmentId = payload?.shipmentId
      if (!shipmentId || shipmentId !== id) return
      if (payload?.status) setShipment((prev) => (prev ? { ...prev, status: payload.status } : prev))
      if (payload?.location) setShipment((prev) => (prev ? { ...prev, currentLocation: payload.location } : prev))

      try {
        const timelineRes = await getShipmentTimeline(id)
        setTimeline(timelineRes?.data?.events || [])
      } catch {
        // Non-fatal
      }
    }

    socket.on('shipment_update', handler)
    return () => {
      socket.off('shipment_update', handler)
    }
  }, [socket, id])

  const selectedStatus = shipment?.status || 'created'

  async function onUpdateStatus(status) {
    const prevStatus = shipment?.status
    setShipment((prev) => (prev ? { ...prev, status } : prev))
    try {
      await updateShipmentStatus({ shipmentId: id, status })
      toast.success('Shipment updated')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status')
      setShipment((prev) => (prev ? { ...prev, status: prevStatus } : prev))
    }
  }

  const stepperStatus = selectedStatus

  const timelineItems = useMemo(() => timeline.slice().reverse(), [timeline])

  return (
    <Page className="sr-card p-6 sm:p-8">
      <MotionDiv variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
        <MotionDiv variants={itemVariants}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-display text-2xl font-bold text-text-primary">Delivery Detail</div>
              <div className="mt-2 text-text-secondary font-mono">{shipment?.trackingId || id}</div>
            </div>
            <div>
              <Badge status={selectedStatus} />
            </div>
          </div>
        </MotionDiv>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MotionDiv variants={itemVariants}>
            <GoogleTrackingMap shipment={shipment} />
            <div className="mt-4">
              <StatusStepper status={stepperStatus} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {STATUS_ACTIONS.map((a) => {
                const isDelivered = selectedStatus === 'delivered'
                const isDisabled = isDelivered || selectedStatus === a.value
                return (
                  <Button
                    key={a.value}
                    variant="secondary"
                    disabled={isDisabled}
                    onClick={() => onUpdateStatus(a.value)}
                    size="sm"
                  >
                    {a.label}
                  </Button>
                )
              })}
            </div>

            {selectedStatus === 'failed_delivery' && (
              <div className="mt-3 text-text-secondary text-sm">
                POD upload placeholder: connect backend upload when ready.
              </div>
            )}
          </MotionDiv>

          <MotionDiv variants={itemVariants} className="rounded-2xl border border-dark-border bg-dark-elevated/40 p-4">
            <div className="text-text-muted uppercase text-xs tracking-wide">Timeline</div>
            <div className="mt-3 space-y-3">
              {loading ? (
                <div className="text-text-muted">Loading events...</div>
              ) : timelineItems.length === 0 ? (
                <div className="text-text-muted">No timeline events yet.</div>
              ) : (
                timelineItems.map((e) => (
                  <div key={e._id} className="border border-dark-border/70 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-mono text-sm">{e.status || '-'}</div>
                      <div className="text-xs text-text-muted">{new Date(e.timestamp).toLocaleString()}</div>
                    </div>
                    {e.description ? <div className="mt-1 text-text-secondary text-sm">{e.description}</div> : null}
                  </div>
                ))
              )}
            </div>
          </MotionDiv>
        </div>
      </MotionDiv>
    </Page>
  )
}

