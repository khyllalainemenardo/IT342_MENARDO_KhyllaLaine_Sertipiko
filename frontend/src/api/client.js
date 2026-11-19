import axios from 'axios'

export const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: { Accept: 'application/json' },
})

let onUnauthorized = () => {}
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const url = err.config?.url || ''
    const isAuthCall = /\/api\/auth\/(me|login|register)$/.test(url)
    if (status === 401 && !isAuthCall) onUnauthorized()
    return Promise.reject(err)
  },
)

export function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (!err.response) return 'Cannot reach the server. Check your connection.'
  const data = err.response.data
  const hasMessage = data && typeof data === 'object' && (data.message || data.error)
  if (err.response.status >= 500 && !hasMessage) {
    return 'The server is unavailable right now. Please try again later.'
  }
  if (typeof data === 'string' && data.trim()) return data
  if (data?.errors && typeof data.errors === 'object') {
    const first = Object.values(data.errors)[0]
    if (first) return String(first)
  }
  return data?.message || data?.error || fallback
}

export default api