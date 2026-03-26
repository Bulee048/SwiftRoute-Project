import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import Page from '../../components/common/Page.jsx'
import Table from '../../components/common/Table.jsx'
import SearchBar from '../../components/common/SearchBar.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import { getVehicles } from '../../api/vehicleAPI'
import { containerVariants, itemVariants } from '../../utils/motion'

export default function ManageVehicles() {
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
        const data = await getVehicles({ page, limit: 10 })
        if (!mounted) return
        setRows(data?.data?.vehicles || [])
        setPagination(data?.pagination || { page: 1, totalPages: 1 })
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load vehicles')
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
    return rows.filter((r) => [r.vehicleNumber, r.type, r.status].some((v) => String(v || '').toLowerCase().includes(q)))
  }, [rows, search])

  const columns = useMemo(
    () => [
      { key: 'vehicleNumber', label: 'Vehicle #', render: (r) => <span className="font-mono">{r.vehicleNumber}</span> },
      { key: 'type', label: 'Type', render: (r) => <span className="capitalize">{r.type}</span> },
      { key: 'brand', label: 'Brand', render: (r) => r.brand || '-' },
      { key: 'status', label: 'Status', render: (r) => <span className="capitalize">{r.status}</span> },
      { key: 'fuelType', label: 'Fuel', render: (r) => r.fuelType || '-' },
    ],
    [],
  )

  return (
    <Page className="sr-card p-6 sm:p-8">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={itemVariants}>
          <div className="font-display text-2xl font-bold text-text-primary">Manage Vehicles</div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search vehicles by number/type/status..." />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Table
            columns={columns}
            rows={filteredRows}
            emptyText={loading ? 'Loading vehicles...' : 'No vehicles found.'}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onChange={setPage} />
        </motion.div>
      </motion.div>
    </Page>
  )
}

