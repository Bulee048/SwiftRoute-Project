import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import Page from '../../components/common/Page.jsx'
import Table from '../../components/common/Table.jsx'
import SearchBar from '../../components/common/SearchBar.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import { getMerchants } from '../../api/merchantAPI'
import { containerVariants, itemVariants } from '../../utils/motion'

export default function ManageMerchants() {
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
        const data = await getMerchants({ page, limit: 10, search })
        if (!mounted) return
        setRows(data?.data?.merchants || [])
        setPagination(data?.pagination || { page: 1, totalPages: 1 })
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load merchants')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [page, search])

  const columns = useMemo(
    () => [
      { key: 'businessName', label: 'Business' },
      { key: 'type', label: 'Type', render: (r) => r.businessType || '-' },
      { key: 'email', label: 'Owner Email', render: (r) => <span className="font-mono">{r.user?.email || '-'}</span> },
      { key: 'orders', label: 'Orders', render: (r) => r.totalOrders ?? 0 },
      { key: 'status', label: 'Contract', render: (r) => <span className="capitalize">{r.contractStatus}</span> },
    ],
    [],
  )

  return (
    <Page className="sr-card p-6 sm:p-8">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={itemVariants}>
          <div className="font-display text-2xl font-bold text-text-primary">Manage Merchants</div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search merchants..." />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Table columns={columns} rows={rows} emptyText={loading ? 'Loading merchants...' : 'No merchants found.'} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onChange={setPage} />
        </motion.div>
      </motion.div>
    </Page>
  )
}

