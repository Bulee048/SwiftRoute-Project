import api from './axiosInstance'

export async function createOrder(payload) {
  const res = await api.post('/orders', payload)
  return res.data
}

