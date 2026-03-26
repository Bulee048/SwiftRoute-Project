import api from './axiosInstance'

export async function register(payload) {
  const res = await api.post('/auth/register', payload)
  return res.data
}

export async function login(payload) {
  const res = await api.post('/auth/login', payload)
  return res.data
}

export async function logout() {
  const res = await api.post('/auth/logout')
  return res.data
}

export async function me() {
  const res = await api.get('/auth/me')
  return res.data
}

export async function forgotPassword(payload) {
  const res = await api.post('/auth/forgot-password', payload)
  return res.data
}

