import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Page from '../../components/common/Page.jsx'
import Table from '../../components/common/Table.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Badge from '../../components/common/Badge.jsx'
import { getMyPayments } from '../../api/paymentAPI'
import { containerVariants } from '../../utils/motion'

const MotionDiv = motion.div

export default function InvoicesPage() {
  const MotionDivLocal = MotionDiv
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      try {
        const res = await getMyPayments({ page, limit: 10 })
        if (!mounted) return
        setRows(res?.data?.payments || [])
        setPagination(res?.pagination || { page: 1, totalPages: 1 })
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load invoices')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [page])

  const columns = useMemo(
    () => [
      {
        key: 'paymentId',
        label: 'Invoice',
        render: (r) => <span className="font-mono">{r.paymentId || r._id}</span>,
      },
      {
        key: 'orderId',
        label: 'Order',
        render: (r) => <span className="font-mono">{r.order?.orderId || '-'}</span>,
      },
      {
        key: 'tracking',
        label: 'Tracking',
        render: (r) =>
          r.order?.shipment?.trackingId ? (
            <Link className="text-brand-primary hover:underline" to={`/track/${r.order.shipment.trackingId}`}>
              Open
            </Link>
          ) : (
            <span className="text-text-muted">-</span>
          ),
      },
      {
        key: 'status',
        label: 'Status',
        render: (r) => <Badge status={r.status} />,
      },
      {
        key: 'amount',
        label: 'Amount',
        render: (r) => <span className="font-mono">{r.amount != null ? `LKR ${Number(r.amount).toLocaleString()}` : '-'}</span>,
      },
      {
        key: 'createdAt',
        label: 'Date',
        render: (r) => <span className="font-mono">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</span>,
      },
    ],
    [],
  )

  return (
    <Page className="sr-card p-6 sm:p-8">
      <MotionDivLocal variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
        <div className="font-display text-2xl font-bold text-text-primary">Invoices</div>
        <p className="text-text-secondary">Your completed payments (merchant invoices).</p>

        <Table columns={columns} rows={rows} emptyText={loading ? 'Loading invoices...' : 'No invoices found.'} />

        <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onChange={setPage} />
      </MotionDivLocal>
    </Page>
  )
}

