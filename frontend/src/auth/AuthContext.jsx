import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContextObject'
import { setUnauthorizedHandler } from '../api/client'
import { fetchCurrentUser, loginWithPassword, logoutSession } from '../api/authApi'
import { normalizeRole } from './roles'

function toUser(data) {
  const role = normalizeRole(data?.role)
  if (!role) throw new Error('Unknown role')
  return { ...data, role }
}

// The backend session is the single source of truth. Nothing about the user
// or their role is stored in localStorage, so it can't be edited client-side.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authenticated | anonymous
  const [sessionExpired, setSessionExpired] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const u = toUser(await fetchCurrentUser())
      setUser(u)
      setStatus('authenticated')
      return u
    } catch {
      setUser(null)
      setStatus('anonymous')
      return null
    }
  }, [])

  // Throws on failure so the login form can show the server's message.
  const login = useCallback(async (email, password) => {
    const u = toUser(await loginWithPassword(email, password))
    setUser(u)
    setStatus('authenticated')
    setSessionExpired(false)
    return u
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutSession()
    } catch {
      // Even if the call fails, drop local state; the server will reject
      // the old session on the next request anyway.
    }
    setUser(null)
    setStatus('anonymous')
  }, [])

  useEffect(() => {
    // refresh() only sets state after the request resolves.
    void Promise.resolve().then(refresh)
  }, [refresh])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      setStatus('anonymous')
      setSessionExpired(true)
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      refresh,
      login,
      logout,
      sessionExpired,
      clearSessionExpired: () => setSessionExpired(false),
    }),
    [user, status, refresh, login, logout, sessionExpired],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
