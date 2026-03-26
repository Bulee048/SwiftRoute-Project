import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen">
      <div className="sr-container py-10">
        <div className="mx-auto max-w-md sr-card p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="font-display text-xl tracking-tight">
              <span className="text-text-primary">Swift</span>
              <span className="text-brand-primary">Route</span>
            </div>
            <span className="sr-chip border-dark-border bg-dark-elevated/40 text-text-secondary font-mono">
              auth
            </span>
          </div>
          <div className="mt-6">
            <Outlet />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-text-muted">
          Move Smarter. Deliver Faster.
        </p>
      </div>
    </div>
  )
}

