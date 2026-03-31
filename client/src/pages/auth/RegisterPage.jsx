import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button.jsx'
import { register as registerRequest } from '../../api/authAPI'
import { ROLES } from '../../constants/roles.js'
import useAuthStore from '../../store/authStore'
import Page from '../../components/common/Page.jsx'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setUser, setAccessToken } = useAuthStore()
  const [name, setName] = useState('Super Admin')
  const [email, setEmail] = useState('admin@swiftroute.com')
  const [password, setPassword] = useState('Admin@123')
  const [role, setRole] = useState(ROLES.ADMIN)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await registerRequest({ name, email, password, role, phone: '' })
      setUser(data.data.user)
      setAccessToken(data.data.accessToken)
      toast.success('Account created')
      navigate(role === ROLES.ADMIN ? '/admin' : role === ROLES.MERCHANT ? '/merchant' : '/driver')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Register failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page>
      <div className="font-display text-2xl font-bold text-text-primary">Register</div>
      <p className="mt-2 text-sm text-text-secondary">
        Create an account via backend `/auth/register`.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-mono text-text-muted mb-2">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-brand-secondary/60"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-text-muted mb-2">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-brand-secondary/60"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-text-muted mb-2">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-brand-secondary/60"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-text-muted mb-2">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-secondary/60"
          >
            <option value={ROLES.ADMIN}>admin</option>
            <option value={ROLES.MERCHANT}>merchant</option>
            <option value={ROLES.DRIVER}>driver</option>
            <option value={ROLES.CUSTOMER}>customer</option>
          </select>
        </div>

        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link to="/login" className="text-text-secondary hover:text-text-primary">
          Back to login
        </Link>
      </div>
    </Page>
  )
}

