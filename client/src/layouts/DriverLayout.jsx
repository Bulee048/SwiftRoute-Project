import { Outlet } from 'react-router-dom'

export default function DriverLayout() {
  return (
    <div className="min-h-screen">
      <div className="sr-container py-6">
        <Outlet />
      </div>
    </div>
  )
}

