import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Page from '../../components/common/Page.jsx'
import Table from '../../components/common/Table.jsx'
import Badge from '../../components/common/Badge.jsx'
import Button from '../../components/common/Button.jsx'
import { getMyOrders } from '../../api/orderAPI'
import { getShipments } from '../../api/shipmentAPI'
import { containerVariants, itemVariants } from '../../utils/motion'

export default function MerchantDashboard() {
  const MotionDiv = motion.div
  const [loading, setLoading] = useState(false)
  const [recentOrders, setRecentOrders] = useState([])
  const [recentShipments, setRecentShipments] = useState([])

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      try {
        const [ordersRes, shipmentsRes] = await Promise.all([getMyOrders({ page: 1, limit: 5 }), getShipments({ page: 1, limit: 5 })])
        if (!mounted) return
        setRecentOrders(ordersRes?.data?.orders || [])
        setRecentShipments(shipmentsRes?.data?.shipments || [])
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load dashboard')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

  const orderColumns = useMemo(
    () => [
      { key: 'orderId', label: 'Order', render: (r) => <span className="font-mono">{r.orderId}</span> },
      { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
      {
        key: 'track',
        label: 'Track',
        render: (r) => (r.shipment?.trackingId ? <Link className="text-brand-primary hover:underline" to={`/track/${r.shipment.trackingId}`}>Open</Link> : <span className="text-text-muted">-</span>),
      },
    ],
    [],
  )

  const shipmentColumns = useMemo(
    () => [
      { key: 'trackingId', label: 'Shipment', render: (r) => <span className="font-mono">{r.trackingId}</span> },
      { key: 'route', label: 'Route', render: (r) => `${r.origin?.city || '-'} -> ${r.destination?.city || '-'}` },
      { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
      {
        key: 'track',
        label: 'Track',
        render: (r) => <Link className="text-brand-primary hover:underline" to={`/track/${r.trackingId}`}>Open</Link>,
      },
    ],
    [],
  )

  return (
    <Page className="sr-card p-6 sm:p-8">
      <MotionDiv variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
        <MotionDiv variants={itemVariants}>
          <div className="font-display text-2xl font-bold text-text-primary">Merchant Dashboard</div>
          <p className="mt-2 text-text-secondary">Your most recent orders and shipments.</p>
        </MotionDiv>

        <MotionDiv variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-dark-border bg-dark-elevated/40 p-4">
            <div className="text-text-muted text-xs uppercase tracking-wide">Recent Orders</div>
            <div className="mt-2 font-display text-2xl font-bold">{recentOrders.length}</div>
          </div>
          <div className="rounded-2xl border border-dark-border bg-dark-elevated/40 p-4">
            <div className="text-text-muted text-xs uppercase tracking-wide">Recent Shipments</div>
            <div className="mt-2 font-display text-2xl font-bold">{recentShipments.length}</div>
          </div>
          <div className="rounded-2xl border border-dark-border bg-dark-elevated/40 p-4">
            <div className="text-text-muted text-xs uppercase tracking-wide">Quick Actions</div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button as={Link} to="/merchant/create-order" variant="primary">
                Create Order
              </Button>
              <Button as={Link} to="/merchant/orders" variant="secondary">
                My Orders
              </Button>
            </div>
          </div>
        </MotionDiv>

        <MotionDiv variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-text-muted uppercase text-xs tracking-wide">Recent Orders</div>
            <Table columns={orderColumns} rows={recentOrders} emptyText={loading ? 'Loading...' : 'No recent orders.'} />
          </div>
          <div className="space-y-2">
            <div className="text-text-muted uppercase text-xs tracking-wide">Recent Shipments</div>
            <Table
              columns={shipmentColumns}
              rows={recentShipments}
              emptyText={loading ? 'Loading...' : 'No recent shipments.'}
            />
          </div>
        </MotionDiv>
      </MotionDiv>
    </Page>
  )
}

