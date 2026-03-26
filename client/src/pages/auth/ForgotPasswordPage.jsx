import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button.jsx'
import { forgotPassword } from '../../api/authAPI'
import Page from '../../components/common/Page.jsx'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('admin@swiftroute.com')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await forgotPassword({ email })
      toast.success('Reset token generated (dev)')
      if (data?.data?.resetToken) {
        await navigator.clipboard.writeText(data.data.resetToken)
        toast.success('Reset token copied to clipboard')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page>
      <div className="font-display text-2xl font-bold text-text-primary">Forgot password</div>
      <p className="mt-2 text-sm text-text-secondary">
        Calls backend `/auth/forgot-password`. In dev, the API returns a reset token.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-mono text-text-muted mb-2">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-brand-secondary/60"
          />
        </div>
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Generate reset token'}
        </Button>
      </form>

      <div className="mt-6">
        <Link to="/login">
          <Button className="w-full" variant="secondary">
            Back to login
          </Button>
        </Link>
      </div>
    </Page>
  )
}

