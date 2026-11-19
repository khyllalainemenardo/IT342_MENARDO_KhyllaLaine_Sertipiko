import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import ProfileCard from '../../components/ProfileCard'

export default function ParticipantDashboard() {
  const { user } = useAuth()
  const firstName = user.fullName.split(' ')[0]

  return (
    <section>
      <h1 className="page-title">Hi, {firstName}</h1>
      <p className="muted page-sub">Register for seminars, show your QR code at the door, and get your certificates here.</p>

      {/* NFR Usability: QR code reachable within two taps after sign-in. */}
      <Link to="/participant/qr" className="card cta-card">
        <div>
          <p className="eyebrow">At the venue?</p>
          <h2>Show my QR code</h2>
          <p className="muted">Organizers scan it when you check in and check out.</p>
        </div>
        <span className="cta-arrow" aria-hidden="true">→</span>
      </Link>

      <div className="grid-2">
        <ProfileCard user={user} />
        <div className="card">
          <h2 className="card-title">What you can do</h2>
          <ul className="link-list">
            <li><Link to="/participant/seminars">Browse and register for seminars</Link></li>
            <li><Link to="/participant/certificates">View and download your certificates</Link></li>
            <li><Link to="/participant/qr">Open your personal QR code</Link></li>
          </ul>
        </div>
      </div>
    </section>
  )
}
