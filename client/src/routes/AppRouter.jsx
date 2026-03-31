import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.jsx'
import { ROLES } from '../constants/roles.js'

import AdminLayout from '../layouts/AdminLayout.jsx'
import MerchantLayout from '../layouts/MerchantLayout.jsx'
import DriverLayout from '../layouts/DriverLayout.jsx'
import AuthLayout from '../layouts/AuthLayout.jsx'

import LandingPage from '../pages/public/LandingPage.jsx'
import TrackShipmentPage from '../pages/public/TrackShipmentPage.jsx'
import PricingPage from '../pages/public/PricingPage.jsx'
import ContactPage from '../pages/public/ContactPage.jsx'

import LoginPage from '../pages/auth/LoginPage.jsx'
import RegisterPage from '../pages/auth/RegisterPage.jsx'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx'
import UnauthorizedPage from '../pages/public/UnauthorizedPage.jsx'

import AdminDashboard from '../pages/admin/AdminDashboard.jsx'
import ManageUsers from '../pages/admin/ManageUsers.jsx'
import ManageMerchants from '../pages/admin/ManageMerchants.jsx'
import ManageDrivers from '../pages/admin/ManageDrivers.jsx'
import ManageVehicles from '../pages/admin/ManageVehicles.jsx'
import ManageShipments from '../pages/admin/ManageShipments.jsx'
import ManageOrders from '../pages/admin/ManageOrders.jsx'
import PaymentsOverview from '../pages/admin/PaymentsOverview.jsx'
import Reports from '../pages/admin/Reports.jsx'
import Settings from '../pages/admin/Settings.jsx'

import MerchantDashboard from '../pages/merchant/MerchantDashboard.jsx'
import CreateOrder from '../pages/merchant/CreateOrder.jsx'
import MyOrders from '../pages/merchant/MyOrders.jsx'
import MyShipments from '../pages/merchant/MyShipments.jsx'
import InvoicesPage from '../pages/merchant/InvoicesPage.jsx'
import MerchantProfile from '../pages/merchant/MerchantProfile.jsx'

import DriverDashboard from '../pages/driver/DriverDashboard.jsx'
import AssignedDeliveries from '../pages/driver/AssignedDeliveries.jsx'
import DeliveryDetail from '../pages/driver/DeliveryDetail.jsx'
import DriverProfile from '../pages/driver/DriverProfile.jsx'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/track/:trackingId?" element={<TrackShipmentPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/merchants" element={<ManageMerchants />} />
            <Route path="/admin/drivers" element={<ManageDrivers />} />
            <Route path="/admin/vehicles" element={<ManageVehicles />} />
            <Route path="/admin/shipments" element={<ManageShipments />} />
            <Route path="/admin/orders" element={<ManageOrders />} />
            <Route path="/admin/payments" element={<PaymentsOverview />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Merchant */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.MERCHANT]} />}>
          <Route element={<MerchantLayout />}>
            <Route path="/merchant" element={<MerchantDashboard />} />
            <Route path="/merchant/create-order" element={<CreateOrder />} />
            <Route path="/merchant/orders" element={<MyOrders />} />
            <Route path="/merchant/shipments" element={<MyShipments />} />
            <Route path="/merchant/invoices" element={<InvoicesPage />} />
            <Route path="/merchant/profile" element={<MerchantProfile />} />
          </Route>
        </Route>

        {/* Driver */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.DRIVER]} />}>
          <Route element={<DriverLayout />}>
            <Route path="/driver" element={<DriverDashboard />} />
            <Route path="/driver/deliveries" element={<AssignedDeliveries />} />
            <Route path="/driver/delivery/:id" element={<DeliveryDetail />} />
            <Route path="/driver/profile" element={<DriverProfile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

