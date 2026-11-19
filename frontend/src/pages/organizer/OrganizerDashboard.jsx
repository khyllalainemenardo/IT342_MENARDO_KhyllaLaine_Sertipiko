import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import ProfileCard from '../../components/ProfileCard'

const TOOLS = [
  { to: '/organizer/seminars', title: 'My Seminars', text: 'Create seminars, track approval status, and upload certificate templates.' },
  { to: '/organizer/scanner', title: 'Attendance Scanner', text: 'Scan participant QR codes at check-in and check-out from your phone.' },
  { to: '/organizer/reports', title: 'Attendance Reports', text: 'View completion counts and export attendance lists.' },
]

export default function OrganizerDashboard() {
  const { user } = useAuth()
  return (
    <section>
      <h1 className="page-title">Organizer Dashboard</h1>
      <p className="muted page-sub">Manage your seminars, attendance, and certificate release.</p>

      <div className="tool-grid">
        {TOOLS.map((t) => (
          <Link key={t.to} to={t.to} className="card tool-card">
            <h2>{t.title}</h2>
            <p className="muted">{t.text}</p>
          </Link>
        ))}
      </div>

      <ProfileCard user={user} />
    </section>
  )
}
