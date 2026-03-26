import api from './axiosInstance'

export async function getVehicles({ page = 1, limit = 10, status = '', type = '' }) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (status) params.set('status', status)
  if (type) params.set('type', type)
  const res = await api.get(`/vehicles?${params.toString()}`)
  return res.data
}

