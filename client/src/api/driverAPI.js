import api from './axiosInstance'

export async function getDrivers({ page = 1, limit = 10, status = '' }) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (status) params.set('status', status)
  const res = await api.get(`/drivers?${params.toString()}`)
  return res.data
}

export async function getAvailableDrivers({ page = 1, limit = 50, status = '' } = {}) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (status) params.set('status', status)

  const res = await api.get(`/drivers/available?${params.toString()}`)
  return res.data
}

