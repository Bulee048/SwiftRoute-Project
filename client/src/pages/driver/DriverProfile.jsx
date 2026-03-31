import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import Page from '../../components/common/Page.jsx'
import Button from '../../components/common/Button.jsx'
import { getMyDriverProfile, updateMyDriverProfile } from '../../api/driverAPI'

export default function DriverProfile() {
  const { user } = useAuthStore()
  const [driver, setDriver] = useState(null)
  const [licenseNumber, setLicenseNumber] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      try {
        const res = await getMyDriverProfile()
        if (!mounted) return
        const d = res?.data?.driver || null
        setDriver(d)
        setLicenseNumber(d?.licenseNumber || '')
        setStatus(d?.status || '')
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load driver profile')
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
    if (!driver) return
    setSaving(true)
    try {
      const res = await updateMyDriverProfile({ licenseNumber, status })
      const updated = res?.data?.driver || null
      setDriver(updated)
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
        <div className="font-display text-2xl font-bold text-text-primary">Driver Profile</div>
        <p className="text-text-secondary">Update your license + availability.</p>
      </div>

      <div className="mt-6 border border-dark-border rounded-2xl p-4 bg-dark-elevated/40">
        <div className="text-xs text-text-muted uppercase tracking-wide">Account</div>
        <div className="mt-2 text-sm">
          <div className="font-mono text-text-secondary">{user?.email || '-'}</div>
        </div>
      </div>

      <form onSubmit={onSave} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-mono text-text-muted mb-2">Employee ID</label>
          <input
            value={driver?.employeeId || ''}
            readOnly
            className="w-full rounded-xl border border-dark-border bg-dark-elevated/30 px-3 py-2.5 text-sm text-text-secondary outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-text-muted mb-2">License Number</label>
          <input
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="License number"
            disabled={loading || saving}
            className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-brand-secondary/60 disabled:opacity-70"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-text-muted mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={loading || saving}
            className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-secondary/60 disabled:opacity-70"
          >
            <option value="available">available</option>
            <option value="on_delivery">on_delivery</option>
            <option value="off_duty">off_duty</option>
            <option value="on_leave">on_leave</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-text-muted mb-2">Rating</label>
          <input
            value={driver?.rating != null ? String(driver.rating) : ''}
            readOnly
            className="w-full rounded-xl border border-dark-border bg-dark-elevated/30 px-3 py-2.5 text-sm text-text-secondary outline-none"
          />
        </div>

        {driver?.currentLocation?.coordinates?.length >= 2 ? (
          <div className="text-sm text-text-secondary">
            Current location: lat {Number(driver.currentLocation.coordinates[1]).toFixed(4)}, lng{' '}
            {Number(driver.currentLocation.coordinates[0]).toFixed(4)}
          </div>
        ) : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading || saving || !licenseNumber.trim()} variant="primary">
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Page>
  )
}

