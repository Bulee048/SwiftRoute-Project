import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import StatusStepper from '../../components/shipment/StatusStepper.jsx'
import GoogleTrackingMap from '../../components/maps/GoogleTrackingMap.jsx'
import Page from '../../components/common/Page.jsx'
import Table from '../../components/common/Table.jsx'
import SearchBar from '../../components/common/SearchBar.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Badge from '../../components/common/Badge.jsx'
import { getShipments, getShipmentById, getShipmentTimeline } from '../../api/shipmentAPI'
import { containerVariants, itemVariants } from '../../utils/motion'

export default function MyShipments() {
  const MotionDiv = motion.div
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })

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
        setSelectedShipmentId((prev) => (prev && shipments.some((s) => s._id === prev) ? prev : shipments[0]?._id || null))
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load your shipments')
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

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((r) =>
      [r.trackingId, r.status, r.origin?.city, r.destination?.city].some((v) => String(v || '').toLowerCase().includes(q)),
    )
  }, [rows, search])

  const columns = [
    { key: 'trackingId', label: 'Tracking ID', render: (r) => <span className="font-mono">{r.trackingId || '-'}</span> },
    { key: 'route', label: 'Route', render: (r) => `${r.origin?.city || '-'} -> ${r.destination?.city || '-'}` },
    { key: 'driver', label: 'Driver', render: (r) => r.driver?.employeeId || '-' },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      key: 'track',
      label: 'Track',
      render: (r) =>
        r.trackingId ? (
          <Link className="text-brand-primary hover:underline" to={`/track/${r.trackingId}`}>
            Open
          </Link>
        ) : (
          <span className="text-text-muted">-</span>
        ),
    },
  ]

  const stepperStatus = selectedShipment?.status || 'created'

  return (
    <Page className="sr-card p-6 sm:p-8">
      <MotionDiv variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
        <MotionDiv variants={itemVariants}>
          <div className="font-display text-2xl font-bold text-text-primary">My Shipments</div>
          <p className="mt-2 text-text-secondary">Paginated shipments for your account.</p>
        </MotionDiv>

        <MotionDiv variants={itemVariants}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by tracking ID, status, city..." />
        </MotionDiv>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <MotionDiv variants={itemVariants}>
            <Table
              columns={columns}
              rows={filteredRows}
              emptyText={loading ? 'Loading shipments...' : 'No shipments found.'}
              onRowClick={(row) => setSelectedShipmentId(row?._id)}
            />
            <div className="mt-4">
              <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onChange={setPage} />
            </div>
          </MotionDiv>

          <MotionDiv variants={itemVariants} className="space-y-4">
            <div className="rounded-2xl border border-dark-border bg-dark-elevated/40 p-4">
              <div className="text-text-muted uppercase text-xs tracking-wide">Shipment map</div>
              {!selectedShipmentId ? (
                <div className="mt-3 text-text-secondary">Select a shipment to see map + timeline.</div>
              ) : (
                <>
                  <div className="mt-2 font-display text-lg font-bold text-text-primary">{selectedShipment?.trackingId || 'Loading...'}</div>
                  <div className="mt-2">
                    <Badge status={selectedShipment?.status || 'created'} />
                  </div>
                  <div className="mt-4">
                    <GoogleTrackingMap shipment={selectedShipment} />
                  </div>
                  <div className="mt-4">
                    <StatusStepper status={stepperStatus} />
                  </div>
                </>
              )}
            </div>

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
          </MotionDiv>
        </div>
      </MotionDiv>
    </Page>
  )
}

