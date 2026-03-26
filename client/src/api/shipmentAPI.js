import api from './axiosInstance'

export async function trackShipment(trackingId) {
  const res = await api.get(`/shipments/track/${encodeURIComponent(trackingId)}`)
  return res.data
}

export async function getShipments({ page = 1, limit = 10, status = '', driver = '', merchant = '' }) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (status) params.set('status', status)
  if (driver) params.set('driver', driver)
  if (merchant) params.set('merchant', merchant)
  const res = await api.get(`/shipments?${params.toString()}`)
  return res.data
}

export async function getShipmentById(id) {
  const res = await api.get(`/shipments/${encodeURIComponent(id)}`)
  return res.data
}

export async function getShipmentTimeline(id) {
  const res = await api.get(`/shipments/${encodeURIComponent(id)}/timeline`)
  return res.data
}

export async function assignDriverToShipment({ shipmentId, driverId, vehicleId }) {
  const res = await api.patch(
    `/shipments/${encodeURIComponent(shipmentId)}/assign-driver`,
    { driverId, vehicleId },
  )
  return res.data
}

export async function updateShipmentStatus({ shipmentId, status }) {
  const res = await api.patch(`/shipments/${encodeURIComponent(shipmentId)}/status`, { status })
  return res.data
}

