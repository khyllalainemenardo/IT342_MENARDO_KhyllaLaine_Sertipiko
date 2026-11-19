import api from './client'

export async function listUsers({ search = '', role = '' } = {}) {
  const params = {}
  if (search) params.search = search
  if (role) params.role = role
  const { data } = await api.get('/api/admin/users', { params })
  return Array.isArray(data) ? data : data.content || []
}

export async function updateUserRole(id, role) {
  const { data } = await api.patch(`/api/admin/users/${id}/role`, { role })
  return data
}

export async function updateUserStatus(id, enabled) {
  const { data } = await api.patch(`/api/admin/users/${id}/status`, { enabled })
  return data
}
