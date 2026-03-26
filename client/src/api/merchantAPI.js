import api from './axiosInstance'

export async function getMerchants({ page = 1, limit = 10, search = '', contractStatus = '' }) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (search) params.set('search', search)
  if (contractStatus) params.set('contractStatus', contractStatus)
  const res = await api.get(`/merchants?${params.toString()}`)
  return res.data
}

