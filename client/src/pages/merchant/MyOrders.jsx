import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import Page from '../../components/common/Page.jsx'
import Table from '../../components/common/Table.jsx'
import SearchBar from '../../components/common/SearchBar.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Badge from '../../components/common/Badge.jsx'
import { getMyOrders } from '../../api/orderAPI'
import GoogleTrackingMap from '../../components/maps/GoogleTrackingMap.jsx'
import StatusStepper from '../../components/shipment/StatusStepper.jsx'
import { getShipmentTimeline } from '../../api/shipmentAPI'
import { containerVariants, itemVariants } from '../../utils/motion'

export default function MyOrders() {
  const MotionDiv = motion.div
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      try {
        const data = await getMyOrders({ page, limit: 10 })
        if (!mounted) return
        const orders = data?.data?.orders || []
        setRows(orders)
        setPagination(data?.pagination || { page: 1, totalPages: 1 })
        setSelectedOrder((prev) => (prev && orders.some((o) => o._id === prev._id) ? prev : orders[0] || null))
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load your orders')
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
      if (!selectedOrder?.shipment?._id) {
        setTimeline([])
        return
      }
      try {
        const res = await getShipmentTimeline(selectedOrder.shipment._id)
        if (!mounted) return
        setTimeline(res?.data?.events || [])
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load shipment timeline')
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [selectedOrder])

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((r) =>
      [r.orderId, r.status, r.customer?.name, r.customer?.email].some((v) =>
        String(v || '').toLowerCase().includes(q),
      ),
    )
  }, [rows, search])

  const columns = [
    { key: 'orderId', label: 'Order ID', render: (r) => <span className="font-mono">{r.orderId || '-'}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'priority', label: 'Priority', render: (r) => <span className="font-mono">{r.priority || '-'}</span> },
    { key: 'customer', label: 'Customer', render: (r) => <span>{r.customer?.name || '-'}</span> },
    {
      key: 'tracking',
      label: 'Tracking',
      render: (r) => {
        const trackingId = r.shipment?.trackingId
        return trackingId ? <span className="font-mono">{trackingId}</span> : <span className="text-text-muted">-</span>
      },
    },
    {
      key: 'total',
      label: 'Total',
      render: (r) => <span className="font-mono">{r.amount?.total != null ? `$${r.amount.total}` : '-'}</span>,
    },
  ]

  return (
    <Page className="sr-card p-6 sm:p-8">
      <MotionDiv variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
        <MotionDiv variants={itemVariants}>
          <div className="font-display text-2xl font-bold text-text-primary">My Orders</div>
          <p className="mt-2 text-text-secondary">Paginated orders with tracking when available.</p>
        </MotionDiv>

        <MotionDiv variants={itemVariants}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by order id, status, customer..." />
        </MotionDiv>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <MotionDiv variants={itemVariants}>
            <Table
              columns={columns}
              rows={filteredRows}
              emptyText={loading ? 'Loading orders...' : 'No orders found.'}
              onRowClick={(row) => setSelectedOrder(row)}
            />
            <div className="mt-4">
              <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onChange={setPage} />
            </div>
          </MotionDiv>

          <MotionDiv variants={itemVariants} className="space-y-4">
            <div className="rounded-2xl border border-dark-border bg-dark-elevated/40 p-4">
              <div className="text-text-muted uppercase text-xs tracking-wide">Shipment map</div>
              {!selectedOrder?.shipment ? (
                <div className="mt-3 text-text-secondary">No shipment linked yet for this order.</div>
              ) : (
                <>
                  <div className="mt-2 font-display text-lg font-bold text-text-primary">{selectedOrder.shipment.trackingId}</div>
                  <div className="mt-2">
                    <Badge status={selectedOrder.shipment.status} />
                  </div>
                  <div className="mt-4">
                    <GoogleTrackingMap shipment={selectedOrder.shipment} />
                  </div>
                  <div className="mt-4">
                    <StatusStepper status={selectedOrder.shipment.status} />
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

