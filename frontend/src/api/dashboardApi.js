import api from './client'

const PATHS = {
  PARTICIPANT: '/api/participant/dashboard',
  ORGANIZER: '/api/organizer/dashboard',
  ADMIN: '/api/admin/dashboard',
}

export async function getDashboard(role) {
  const { data } = await api.get(PATHS[role])
  return data
}