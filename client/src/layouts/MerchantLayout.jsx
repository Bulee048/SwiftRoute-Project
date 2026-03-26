import { Outlet } from 'react-router-dom'

export default function MerchantLayout() {
  return (
    <div className="min-h-screen">
      <div className="sr-container py-6">
        <Outlet />
      </div>
    </div>
  )
}

