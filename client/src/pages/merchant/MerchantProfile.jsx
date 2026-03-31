import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import Page from '../../components/common/Page.jsx'
import Button from '../../components/common/Button.jsx'
import { getMyMerchantProfile, updateMyMerchantProfile } from '../../api/merchantProfileAPI'

export default function MerchantProfile() {
  const { user } = useAuthStore()
  const [merchant, setMerchant] = useState(null)
  const [businessName, setBusinessName] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      try {
        const res = await getMyMerchantProfile()
        if (!mounted) return
        const m = res?.data?.merchant || null
        setMerchant(m)
        setBusinessName(m?.businessName || '')
        setWebsite(m?.website || '')
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load merchant profile')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

  async function onSave(e) {
    e.preventDefault()
    if (!merchant) return
    setSaving(true)
    try {
      const res = await updateMyMerchantProfile({ businessName, website })
      const updated = res?.data?.merchant || null
      setMerchant(updated)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Page className="sr-card p-6 sm:p-8">
      <div className="space-y-2">
        <div className="font-display text-2xl font-bold text-text-primary">Merchant Profile</div>
        <p className="text-text-secondary">Update your business details.</p>
      </div>

      <div className="mt-6 border border-dark-border rounded-2xl p-4 bg-dark-elevated/40">
        <div className="text-xs text-text-muted uppercase tracking-wide">Account</div>
        <div className="mt-2 text-sm">
          <div className="font-mono text-text-secondary">{user?.email || '-'}</div>
        </div>
      </div>

      <form onSubmit={onSave} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-mono text-text-muted mb-2">Business Name</label>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Business name"
            disabled={loading || saving}
            className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-brand-secondary/60 disabled:opacity-70"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-text-muted mb-2">Website</label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            disabled={loading || saving}
            className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-brand-secondary/60 disabled:opacity-70"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-text-muted mb-2">Contract Status</label>
          <input
            value={merchant?.contractStatus || ''}
            readOnly
            className="w-full rounded-xl border border-dark-border bg-dark-elevated/30 px-3 py-2.5 text-sm text-text-secondary outline-none"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading || saving || !businessName.trim()} variant="primary">
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Page>
  )
}

