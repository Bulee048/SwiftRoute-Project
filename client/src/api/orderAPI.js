import api from './axiosInstance'

export async function getOrders({ page = 1, limit = 10, status = '', merchant = '' }) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (status) params.set('status', status)
  if (merchant) params.set('merchant', merchant)
  const res = await api.get(`/orders?${params.toString()}`)
  return res.data
}

export async function getMyOrders({ page = 1, limit = 10, status = '' }) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (status) params.set('status', status)
  const res = await api.get(`/orders/my?${params.toString()}`)
  return res.data
}

