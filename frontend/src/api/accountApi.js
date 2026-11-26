import api from './client'

export async function getProfile() {
  const { data } = await api.get('/api/profile')
  return data
}

export async function updateProfile(payload) {
  const { data } = await api.put('/api/profile', payload)
  return data
}

export async function changePassword(payload) {
  const { data } = await api.post('/api/auth/password/change', payload)
  return data
}

export async function requestPasswordReset(email) {
  const { data } = await api.post('/api/auth/password/forgot', { email })
  return data
}

export async function validateResetToken(token) {
  await api.get('/api/auth/password/reset/validate', { params: { token } })
}

export async function resetPassword(payload) {
  const { data } = await api.post('/api/auth/password/reset', payload)
  return data
}
