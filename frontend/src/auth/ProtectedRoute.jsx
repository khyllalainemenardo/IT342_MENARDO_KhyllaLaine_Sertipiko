import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { DASHBOARD_PATH } from './roles'
import Spinner from '../components/Spinner'

// Frontend half of FR-07. The backend must enforce the same rules on every
// endpoint; this only keeps users off pages they can't use.
export default function ProtectedRoute({ roles }) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <Spinner full label="Checking your session…" />

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

// Sends a signed-in user to the dashboard for their role.
export function RoleRedirect() {
  const { status, user } = useAuth()
  if (status === 'loading') return <Spinner full label="Loading…" />
  if (status !== 'authenticated') return <Navigate to="/login" replace />
  return <Navigate to={DASHBOARD_PATH[user.role]} replace />
}
