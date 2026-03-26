import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import Page from '../../components/common/Page.jsx'
import Table from '../../components/common/Table.jsx'
import SearchBar from '../../components/common/SearchBar.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Badge from '../../components/common/Badge.jsx'
import { getOrders } from '../../api/orderAPI'
import { containerVariants, itemVariants } from '../../utils/motion'

export default function ManageOrders() {
  const MotionDiv = motion.div
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      try {
        const data = await getOrders({ page, limit: 10 })
        if (!mounted) return
        const orders = data?.data?.orders || []
        setRows(orders)
        setPagination(data?.pagination || { page: 1, totalPages: 1 })
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load orders')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [page])

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((r) =>
      [r.orderId, r.status, r.customer?.name, r.customer?.phone].some((v) => String(v || '').toLowerCase().includes(q)),
    )
  }, [rows, search])

  const columns = [
    { key: 'orderId', label: 'Order ID', render: (r) => <span className="font-mono">{r.orderId || '-'}</span> },
    { key: 'customer', label: 'Customer', render: (r) => r.customer?.name || '-' },
    { key: 'phone', label: 'Phone', render: (r) => <span className="font-mono">{r.customer?.phone || '-'}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    { key: 'priority', label: 'Priority', render: (r) => <span className="capitalize">{r.priority || '-'}</span> },
    { key: 'total', label: 'Total', render: (r) => <span className="font-mono">{r.amount?.total ?? '-'}</span> },
  ]

  return (
    <Page className="sr-card p-6 sm:p-8">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={itemVariants}>
          <div className="font-display text-2xl font-bold text-text-primary">Manage Orders</div>
          <p className="mt-2 text-text-secondary">Live paginated list from `/api/v1/orders`.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by order ID, customer, phone..." />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Table columns={columns} rows={filteredRows} emptyText={loading ? 'Loading orders...' : 'No orders found.'} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onChange={setPage} />
        </motion.div>
      </motion.div>
    </Page>
  )
}

