import api from './axiosInstance'

export async function getUsers({ page = 1, limit = 10, role = '', search = '' }) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (role) params.set('role', role)
  if (search) params.set('search', search)
  const res = await api.get(`/users?${params.toString()}`)
  return res.data
}

