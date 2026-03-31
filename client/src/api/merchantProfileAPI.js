import api from './axiosInstance'

export async function getMyMerchantProfile() {
  const res = await api.get('/merchants/me')
  return res.data
}

export async function updateMyMerchantProfile(payload) {
  const res = await api.patch('/merchants/me', payload)
  return res.data
}

