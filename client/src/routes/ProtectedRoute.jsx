import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { ROLES } from '../constants/roles.js'

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}

