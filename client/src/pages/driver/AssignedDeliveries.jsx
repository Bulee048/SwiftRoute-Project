import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import GoogleTrackingMap from '../../components/maps/GoogleTrackingMap.jsx'
import Page from '../../components/common/Page.jsx'
import Table from '../../components/common/Table.jsx'
import Badge from '../../components/common/Badge.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Button from '../../components/common/Button.jsx'
import { getShipments, getShipmentById, getShipmentTimeline, updateShipmentStatus } from '../../api/shipmentAPI'
import useSocket from '../../hooks/useSocket.js'
import { containerVariants, itemVariants } from '../../utils/motion'

const STATUS_ACTIONS = [
  { value: 'picked_up', label: 'Picked up' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed_delivery', label: 'Attempt failed' },
]

export default function AssignedDeliveries() {
  const MotionDiv = motion.div
  const socket = useSocket()

  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [rows, setRows] = useState([])

  const [selectedShipmentId, setSelectedShipmentId] = useState(null)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      try {
        const data = await getShipments({ page, limit: 10 })
        if (!mounted) return
        const shipments = data?.data?.shipments || []
        setRows(shipments)
        setPagination(data?.pagination || { page: 1, totalPages: 1 })

        // Auto-select first active shipment on initial load.
        if (!selectedShipmentId && shipments[0]?._id) {
          setSelectedShipmentId(shipments[0]._id)
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load deliveries')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    let mounted = true
    async function run() {
      if (!selectedShipmentId) return
      setSelectedShipment(null)
      setTimeline([])
      try {
        const [shipmentRes, timelineRes] = await Promise.all([
          getShipmentById(selectedShipmentId),
          getShipmentTimeline(selectedShipmentId),
        ])
        if (!mounted) return
        setSelectedShipment(shipmentRes?.data?.shipment || null)
        setTimeline(timelineRes?.data?.events || [])
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load shipment details')
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [selectedShipmentId])

  useEffect(() => {
    if (!socket) return

    const handler = async (payload) => {
      const shipmentId = payload?.shipmentId
      if (!shipmentId) return

      if (payload?.status) {
        setRows((prev) => prev.map((s) => (s._id === shipmentId ? { ...s, status: payload.status } : s)))
        if (selectedShipmentId === shipmentId) {
          setSelectedShipment((prev) => (prev ? { ...prev, status: payload.status } : prev))
        }
      }

      if (payload?.location && selectedShipmentId === shipmentId) {
        setSelectedShipment((prev) => (prev ? { ...prev, currentLocation: payload.location } : prev))
      }

      // Keep timeline in sync for the currently selected shipment.
      if (selectedShipmentId === shipmentId) {
        try {
          const timelineRes = await getShipmentTimeline(shipmentId)
          setTimeline(timelineRes?.data?.events || [])
        } catch {
          // Non-fatal: status/map will still update.
        }
      }
    }

    socket.on('shipment_update', handler)
    return () => {
      socket.off('shipment_update', handler)
    }
  }, [socket, selectedShipmentId])

  const columns = useMemo(
    () => [
      { key: 'trackingId', label: 'Tracking', render: (r) => <span className="font-mono">{r.trackingId || '-'}</span> },
      { key: 'route', label: 'Route', render: (r) => `${r.origin?.city || '-'} -> ${r.destination?.city || '-'}` },
      { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
      { key: 'eta', label: 'ETA', render: (r) => <span className="font-mono">{r.estimatedDelivery ? String(r.estimatedDelivery).slice(0, 10) : '-'}</span> },
    ],
    [],
  )

  const selectedStatus = selectedShipment?.status || 'created'

  async function onUpdateStatus(status) {
    if (!selectedShipmentId) return
    const prevStatus = selectedShipment?.status
    try {
      setSelectedShipment((prev) => (prev ? { ...prev, status } : prev))
      setRows((prev) => prev.map((s) => (s._id === selectedShipmentId ? { ...s, status } : s)))
      await updateShipmentStatus({ shipmentId: selectedShipmentId, status })
      toast.success('Shipment updated')
      // Timeline updates come from backend checkpoint/event creation.
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status')
      setSelectedShipment((prev) => (prev ? { ...prev, status: prevStatus } : prev))
      setRows((prev) => prev.map((s) => (s._id === selectedShipmentId ? { ...s, status: prevStatus } : s)))
    }
  }

  return (
    <Page className="sr-card p-6 sm:p-8">
      <MotionDiv variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
        <MotionDiv variants={itemVariants}>
          <div className="font-display text-2xl font-bold text-text-primary">Assigned Deliveries</div>
          <p className="mt-2 text-text-secondary">Live status updates + Google Maps for your active shipment.</p>
        </MotionDiv>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <MotionDiv variants={itemVariants}>
              <Table
                columns={columns}
                rows={rows}
                emptyText={loading ? 'Loading deliveries...' : 'No deliveries assigned.'}
                onRowClick={(row) => setSelectedShipmentId(row?._id)}
              />
            </MotionDiv>

            <MotionDiv variants={itemVariants}>
              <Pagination page={pagination.page || page} totalPages={pagination.totalPages || 1} onChange={setPage} />
            </MotionDiv>
          </div>

          <div className="space-y-4">
            <MotionDiv variants={itemVariants} className="rounded-2xl border border-dark-border bg-dark-elevated/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-text-muted uppercase text-xs tracking-wide">Active shipment</div>
                  <div className="font-display text-lg font-bold text-text-primary mt-1">
                    {selectedShipment?.trackingId || 'Select a delivery'}
                  </div>
                  <div className="mt-2">
                    <Badge status={selectedStatus} />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <GoogleTrackingMap shipment={selectedShipment} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {STATUS_ACTIONS.map((a) => {
                  const isDisabled = selectedStatus === 'delivered' || selectedStatus === 'failed_delivery'
                  return (
                    <Button
                      key={a.value}
                      variant="secondary"
                      disabled={isDisabled || selectedStatus === a.value}
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
                {timeline.length === 0 ? (
                  <div className="text-text-muted">No timeline events yet.</div>
                ) : (
                  timeline
                    .slice()
                    .reverse()
                    .map((e) => (
                      <div key={e._id} className="border border-dark-border/70 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-mono text-sm">{e.status}</div>
                          <div className="text-xs text-text-muted">{new Date(e.timestamp).toLocaleString()}</div>
                        </div>
                        {e.description ? <div className="mt-1 text-text-secondary text-sm">{e.description}</div> : null}
                      </div>
                    ))
                )}
              </div>
            </MotionDiv>
          </div>
        </div>
      </MotionDiv>
    </Page>
  )
}

