import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import Page from '../../components/common/Page.jsx'
import Table from '../../components/common/Table.jsx'
import SearchBar from '../../components/common/SearchBar.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Badge from '../../components/common/Badge.jsx'
import Button from '../../components/common/Button.jsx'
import GoogleTrackingMap from '../../components/maps/GoogleTrackingMap.jsx'
import { getShipments, getShipmentById, getShipmentTimeline, assignDriverToShipment, updateShipmentStatus } from '../../api/shipmentAPI'
import { containerVariants, itemVariants } from '../../utils/motion'
import { getAvailableDrivers } from '../../api/driverAPI'

export default function ManageShipments() {
  const MotionDiv = motion.div
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })

  const [selectedShipmentId, setSelectedShipmentId] = useState(null)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [timeline, setTimeline] = useState([])

  const [drivers, setDrivers] = useState([])
  const [driverId, setDriverId] = useState('')

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
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load shipments')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [page])

  useEffect(() => {
    let mounted = true
    async function run() {
      try {
        const data = await getAvailableDrivers()
        if (!mounted) return
        setDrivers(data?.data?.drivers || [])
      } catch {
        // Optional: assignment UI can still work if drivers don't load.
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

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
        const shipment = shipmentRes?.data?.shipment || null
        setSelectedShipment(shipment)
        setTimeline(timelineRes?.data?.events || [])
        setDriverId(shipment?.driver?._id ? String(shipment.driver._id) : '')
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load shipment details')
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [selectedShipmentId])

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((r) =>
      [r.trackingId, r.status, r.origin?.city, r.destination?.city].some((v) => String(v || '').toLowerCase().includes(q)),
    )
  }, [rows, search])

  const columns = [
    { key: 'trackingId', label: 'Tracking ID', render: (r) => <span className="font-mono">{r.trackingId || '-'}</span> },
    { key: 'merchant', label: 'Merchant', render: (r) => r.merchant?.businessName || '-' },
    { key: 'driver', label: 'Driver', render: (r) => r.driver?.employeeId || '-' },
    { key: 'route', label: 'Route', render: (r) => `${r.origin?.city || '-'} -> ${r.destination?.city || '-'}` },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'eta', label: 'ETA', render: (r) => <span className="font-mono">{r.estimatedDelivery || '-'}</span> },
  ]

  const STATUS_BUTTONS = [
    { value: 'picked_up', label: 'Picked up' },
    { value: 'in_transit', label: 'In transit' },
    { value: 'out_for_delivery', label: 'Out for delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'failed_delivery', label: 'Attempt failed' },
  ]

  async function onAssignDriver() {
    if (!selectedShipmentId) return
    try {
      await assignDriverToShipment({ shipmentId: selectedShipmentId, driverId: driverId || undefined, vehicleId: undefined })
      toast.success('Driver assigned')
      // Refresh local details + timeline.
      const [res, timelineRes] = await Promise.all([getShipmentById(selectedShipmentId), getShipmentTimeline(selectedShipmentId)])
      setSelectedShipment(res?.data?.shipment || null)
      setTimeline(timelineRes?.data?.events || [])
      setRows((prev) => prev.map((s) => (s._id === selectedShipmentId ? { ...s, driver: res?.data?.shipment?.driver, status: res?.data?.shipment?.status } : s)))
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to assign driver')
    }
  }

  async function onUpdateStatus(status) {
    if (!selectedShipmentId) return
    try {
      await updateShipmentStatus({ shipmentId: selectedShipmentId, status })
      toast.success('Status updated')
      setSelectedShipment((prev) => (prev ? { ...prev, status } : prev))
      setRows((prev) => prev.map((s) => (s._id === selectedShipmentId ? { ...s, status } : s)))

      const timelineRes = await getShipmentTimeline(selectedShipmentId)
      setTimeline(timelineRes?.data?.events || [])
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status')
    }
  }

  return (
    <Page className="sr-card p-6 sm:p-8">
      <MotionDiv variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
        <MotionDiv variants={itemVariants}>
          <div className="font-display text-2xl font-bold text-text-primary">Manage Shipments</div>
          <p className="mt-2 text-text-secondary">Live paginated list from `/api/v1/shipments`.</p>
        </MotionDiv>

        <MotionDiv variants={itemVariants}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by tracking ID, status, city..." />
        </MotionDiv>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <MotionDiv variants={itemVariants} className="space-y-4">
            <Table
              columns={columns}
              rows={filteredRows}
              emptyText={loading ? 'Loading shipments...' : 'No shipments found.'}
              onRowClick={(row) => setSelectedShipmentId(row?._id)}
            />
            <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onChange={setPage} />
          </MotionDiv>

          <MotionDiv variants={itemVariants} className="space-y-4">
            <div className="rounded-2xl border border-dark-border bg-dark-elevated/40 p-4">
              <div className="text-text-muted uppercase text-xs tracking-wide">Shipment details</div>

              {!selectedShipmentId ? (
                <div className="mt-3 text-text-secondary">Select a shipment to view timeline and assignment controls.</div>
              ) : (
                <>
                  <div className="mt-2 font-display text-lg font-bold text-text-primary">
                    {selectedShipment?.trackingId || 'Loading...'}
                  </div>
                  <div className="mt-2">
                    <Badge status={selectedShipment?.status || 'created'} />
                  </div>

                  <div className="mt-4">
                    <GoogleTrackingMap shipment={selectedShipment} />
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="text-text-muted uppercase text-xs tracking-wide">Assign driver</div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <select
                        className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-secondary/60"
                        value={driverId}
                        onChange={(e) => setDriverId(e.target.value)}
                      >
                        <option value="">Select driver</option>
                        {drivers.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.user?.name || d.employeeId || d._id}
                          </option>
                        ))}
                      </select>
                      <Button variant="primary" onClick={onAssignDriver} disabled={!driverId || !selectedShipmentId}>
                        Assign
                      </Button>
                    </div>

                    <div className="text-text-muted uppercase text-xs tracking-wide mt-2">Update status</div>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_BUTTONS.map((b) => {
                        const disabled = !selectedShipment || selectedShipment.status === b.value
                        return (
                          <Button key={b.value} variant="secondary" size="sm" disabled={disabled} onClick={() => onUpdateStatus(b.value)}>
                            {b.label}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {selectedShipmentId ? (
              <div className="rounded-2xl border border-dark-border bg-dark-elevated/40 p-4">
                <div className="text-text-muted uppercase text-xs tracking-wide">Timeline</div>
                <div className="mt-3 space-y-3">
                  {timeline.length === 0 ? (
                    <div className="text-text-secondary">No timeline events yet.</div>
                  ) : (
                    timeline
                      .slice()
                      .reverse()
                      .map((e) => (
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
              </div>
            ) : null}
          </MotionDiv>
        </div>
      </MotionDiv>
    </Page>
  )
}

