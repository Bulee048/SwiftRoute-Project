import api from './axiosInstance'

export async function getPayments({ page = 1, limit = 10, status = '' } = {}) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (status) params.set('status', status)

  const res = await api.get(`/payments?${params.toString()}`)
  return res.data
}

export async function getPaymentOverview() {
  const res = await api.get('/payments/stats/overview')
  return res.data
}

export async function getMyPayments({ page = 1, limit = 10, status = '' } = {}) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (status) params.set('status', status)

  const res = await api.get(`/payments/my?${params.toString()}`)
  return res.data
}

