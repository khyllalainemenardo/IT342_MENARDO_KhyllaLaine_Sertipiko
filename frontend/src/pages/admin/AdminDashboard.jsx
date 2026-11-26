import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../../api/dashboardApi'
import { errorMessage } from '../../api/client'
import Spinner from '../../components/Spinner'

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboard('ADMIN')
      .then((data) => setSummary(data.summary))
      .catch((e) => setError(errorMessage(e, 'Could not load dashboard.')))
  }, [])

  return (
    <section>
      <h1 className="page-title">Administrator Dashboard</h1>
      <p className="muted page-sub">Manage organizer access and approve seminars.</p>

      {error && <div className="alert alert-error">{error}</div>}
      {!summary && !error && <Spinner label="Loading dashboard…" />}

      {summary && (
        <div className="stat-grid">
          <Stat label="Total accounts" value={summary.totalUsers} />
          <Stat label="Participants" value={summary.participants} />
          <Stat label="Organizers" value={summary.organizers} />
          <Stat label="Disabled" value={summary.disabled} />
        </div>
      )}

      <div className="tool-grid">
        <Link to="/admin/users" className="card tool-card">
          <h2>User Accounts</h2>
          <p className="muted">Grant or revoke organizer access and disable accounts.</p>
        </Link>
        <Link to="/admin/approvals" className="card tool-card">
          <h2>Seminar Approvals</h2>
          <p className="muted">Approve or reject pending seminars.</p>
        </Link>
        <Link to="/admin/reports" className="card tool-card">
          <h2>System Reports</h2>
          <p className="muted">Seminars, participants, and certificates per department.</p>
        </Link>
      </div>
    </section>
  )
}

function Stat({ label, value }) {
  return (
    <div className="card stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}
