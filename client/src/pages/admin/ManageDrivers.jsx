import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import Page from '../../components/common/Page.jsx'
import Table from '../../components/common/Table.jsx'
import SearchBar from '../../components/common/SearchBar.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Badge from '../../components/common/Badge.jsx'
import { getDrivers } from '../../api/driverAPI'
import { containerVariants, itemVariants } from '../../utils/motion'

export default function ManageDrivers() {
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
        const data = await getDrivers({ page, limit: 10 })
        if (!mounted) return
        setRows(data?.data?.drivers || [])
        setPagination(data?.pagination || { page: 1, totalPages: 1 })
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load drivers')
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
    return rows.filter((r) => [r.employeeId, r.user?.name, r.licenseNumber].some((v) => String(v || '').toLowerCase().includes(q)))
  }, [rows, search])

  const columns = useMemo(
    () => [
      { key: 'employeeId', label: 'Employee ID', render: (r) => <span className="font-mono">{r.employeeId}</span> },
      { key: 'name', label: 'Name', render: (r) => r.user?.name || '-' },
      { key: 'license', label: 'License', render: (r) => <span className="font-mono">{r.licenseNumber}</span> },
      { key: 'status', label: 'Status', render: (r) => <Badge status={r.status === 'on_delivery' ? 'in_transit' : r.status} /> },
      { key: 'rating', label: 'Rating', render: (r) => r.rating ?? 0 },
    ],
    [],
  )

  return (
    <Page className="sr-card p-6 sm:p-8">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={itemVariants}>
          <div className="font-display text-2xl font-bold text-text-primary">Manage Drivers</div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by employee id/name/license..." />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Table
            columns={columns}
            rows={filteredRows}
            emptyText={loading ? 'Loading drivers...' : 'No drivers found.'}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onChange={setPage} />
        </motion.div>
      </motion.div>
    </Page>
  )
}

