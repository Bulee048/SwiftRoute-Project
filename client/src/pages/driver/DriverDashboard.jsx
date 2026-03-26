import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Page from '../../components/common/Page.jsx'
import Table from '../../components/common/Table.jsx'
import Badge from '../../components/common/Badge.jsx'
import GoogleTrackingMap from '../../components/maps/GoogleTrackingMap.jsx'
import Button from '../../components/common/Button.jsx'
import { getShipments } from '../../api/shipmentAPI'
import { containerVariants, itemVariants } from '../../utils/motion'

export default function DriverDashboard() {
  const MotionDiv = motion.div
  const [loading, setLoading] = useState(false)
  const [shipments, setShipments] = useState([])

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      try {
        const res = await getShipments({ page: 1, limit: 5 })
        if (!mounted) return
        setShipments(res?.data?.shipments || [])
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load driver dashboard')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

  const active = useMemo(() => shipments.find((s) => s.status !== 'delivered' && s.status !== 'failed_delivery') || shipments[0] || null, [shipments])

  const columns = useMemo(
    () => [
      { key: 'trackingId', label: 'Tracking', render: (r) => <span className="font-mono">{r.trackingId}</span> },
      { key: 'route', label: 'Route', render: (r) => `${r.origin?.city || '-'} -> ${r.destination?.city || '-'}` },
      { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    ],
    [],
  )

  return (
    <Page className="sr-card p-6 sm:p-8">
      <MotionDiv variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
        <MotionDiv variants={itemVariants}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-display text-2xl font-bold text-text-primary">Driver Dashboard</div>
              <p className="mt-2 text-text-secondary">Your active delivery and upcoming stops.</p>
            </div>
            <Button as={Link} to="/driver/deliveries" variant="secondary">
              Open Deliveries
            </Button>
          </div>
        </MotionDiv>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MotionDiv variants={itemVariants} className="rounded-2xl border border-dark-border bg-dark-elevated/40 p-4">
            <div className="text-text-muted uppercase text-xs tracking-wide">Active shipment</div>
            <div className="mt-2 flex items-center gap-3">
              {active ? (
                <>
                  <div className="font-mono text-lg">{active.trackingId}</div>
                  <Badge status={active.status} />
                </>
              ) : (
                <div className="text-text-muted">No deliveries right now.</div>
              )}
            </div>
            <div className="mt-4">
              <GoogleTrackingMap shipment={active} />
            </div>
          </MotionDiv>

          <MotionDiv variants={itemVariants} className="rounded-2xl border border-dark-border bg-dark-elevated/40 p-4">
            <div className="text-text-muted uppercase text-xs tracking-wide">Assigned deliveries</div>
            <div className="mt-3">
              <Table columns={columns} rows={shipments} emptyText={loading ? 'Loading...' : 'No assigned deliveries.'} />
            </div>
          </MotionDiv>
        </div>
      </MotionDiv>
    </Page>
  )
}

