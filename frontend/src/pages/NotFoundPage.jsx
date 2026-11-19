import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="auth-page">
      <div className="auth-card card center">
        <p className="big-code">404</p>
        <h1 className="auth-title">Page not found</h1>
        <p className="muted">The page you're looking for doesn't exist.</p>
        <Link className="btn btn-primary" to="/">Go home</Link>
      </div>
    </div>
  )
}
