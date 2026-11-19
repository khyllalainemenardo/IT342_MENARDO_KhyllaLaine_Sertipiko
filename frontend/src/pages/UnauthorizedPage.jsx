import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { DASHBOARD_PATH, ROLE_LABELS } from '../auth/roles'

export default function UnauthorizedPage() {
  const { user } = useAuth()
  return (
    <div className="auth-page">
      <div className="auth-card card center">
        <p className="big-code">403</p>
        <h1 className="auth-title">Access denied</h1>
        <p className="muted">
          {user
            ? `Your ${ROLE_LABELS[user.role]} account doesn't have permission to open this page.`
            : 'You need to sign in to open this page.'}
        </p>
        <Link className="btn btn-primary" to={user ? DASHBOARD_PATH[user.role] : '/login'}>
          {user ? 'Back to my dashboard' : 'Sign in'}
        </Link>
      </div>
    </div>
  )
}
