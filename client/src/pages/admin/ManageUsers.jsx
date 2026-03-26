import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import Page from '../../components/common/Page.jsx'
import Table from '../../components/common/Table.jsx'
import SearchBar from '../../components/common/SearchBar.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import { getUsers } from '../../api/userAPI'
import { containerVariants, itemVariants } from '../../utils/motion'

export default function ManageUsers() {
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
        const data = await getUsers({ page, limit: 10, search })
        if (!mounted) return
        setRows(data?.data?.users || [])
        setPagination(data?.pagination || { page: 1, totalPages: 1 })
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load users')
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
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email', render: (r) => <span className="font-mono">{r.email}</span> },
      { key: 'role', label: 'Role', render: (r) => <span className="capitalize">{r.role}</span> },
      { key: 'active', label: 'Active', render: (r) => (r.isActive ? 'Yes' : 'No') },
      { key: 'verified', label: 'Verified', render: (r) => (r.isVerified ? 'Yes' : 'No') },
    ],
    [],
  )

  return (
    <Page className="sr-card p-6 sm:p-8">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={itemVariants}>
          <div className="font-display text-2xl font-bold text-text-primary">Manage Users</div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search users by name/email..." />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Table columns={columns} rows={rows} emptyText={loading ? 'Loading users...' : 'No users found.'} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onChange={setPage} />
        </motion.div>
      </motion.div>
    </Page>
  )
}

