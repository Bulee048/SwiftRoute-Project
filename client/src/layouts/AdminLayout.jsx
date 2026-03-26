import { Link, NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, LogOut, Shield } from 'lucide-react'
import useAuthStore from '../store/authStore'

const nav = [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard }]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block border-r border-dark-border bg-dark-base/40 backdrop-blur">
        <div className="p-5">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-brand-primary/15 border border-brand-primary/30 grid place-items-center">
              <Shield className="h-5 w-5 text-brand-primary" />
            </div>
            <div className="font-display text-lg tracking-tight text-text-primary">
              Ops<span className="text-brand-primary">Center</span>
            </div>
          </Link>
        </div>
        <nav className="px-3">
          {nav.map(({ to, label, icon: NavIcon }) => {
            const NavIconComp = NavIcon
            return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm border ${
                  isActive
                    ? 'bg-brand-primary/10 border-brand-primary/30 text-text-primary'
                    : 'border-transparent text-text-secondary hover:bg-dark-elevated/30 hover:text-text-primary'
                }`
              }
            >
              <NavIconComp className="h-4 w-4" />
              {label}
            </NavLink>
            )
          })}
        </nav>
        <div className="mt-auto p-5">
          <div className="sr-card p-4">
            <div className="text-sm text-text-primary font-medium">{user?.name || 'Admin'}</div>
            <div className="text-xs text-text-muted font-mono">{user?.email || 'admin@swiftroute.com'}</div>
            <button
              onClick={logout}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-dark-elevated/70"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0">
        <div className="sr-container py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

