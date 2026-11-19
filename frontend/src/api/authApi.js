import api from './client'

export async function registerAccount(payload) {
  const { data } = await api.post('/api/auth/register', payload)
  return data
}

export async function loginWithPassword(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password })
  return data
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/api/auth/me')
  return data
}

export async function logoutSession() {
  await api.post('/api/auth/logout')
}
