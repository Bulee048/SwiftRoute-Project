import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button.jsx'
import useAuthStore from '../../store/authStore'
import { login as loginRequest } from '../../api/authAPI'
import { ROLES } from '../../constants/roles.js'
import Page from '../../components/common/Page.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser, setAccessToken } = useAuthStore()
  const [email, setEmail] = useState('admin@swiftroute.com')
  const [password, setPassword] = useState('Admin@123')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await loginRequest({ email, password })
      setUser(data.data.user)
      setAccessToken(data.data.accessToken)
      toast.success('Logged in')
      const role = data.data.user?.role
      navigate(
        role === ROLES.ADMIN ? '/admin' : role === ROLES.MERCHANT ? '/merchant' : role === ROLES.DRIVER ? '/driver' : '/',
      )
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page>
      <div className="font-display text-2xl font-bold text-text-primary">Login</div>
      <p className="mt-2 text-sm text-text-secondary">
        Login using your backend `/auth/login` endpoint.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-mono text-text-muted mb-2">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-brand-secondary/60"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-text-muted mb-2">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-brand-secondary/60"
            placeholder="••••••••"
          />
        </div>

        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Enter ops'}
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="text-text-secondary hover:text-text-primary">
          Forgot password?
        </Link>
        <Link to="/register" className="text-brand-secondary hover:text-brand-secondary/90">
          Create account
        </Link>
      </div>
    </Page>
  )
}

