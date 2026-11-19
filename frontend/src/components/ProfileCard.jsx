import { ROLE_LABELS } from '../auth/roles'
import Avatar from './Avatar'

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ProfileCard({ user }) {
  return (
    <div className="card profile-card">
      <div className="profile-head">
        <Avatar name={user.fullName} src={user.pictureUrl} size={56} />
        <div>
          <h2 className="profile-name">{user.fullName}</h2>
          <p className="muted">{user.email}</p>
        </div>
      </div>
      <dl className="profile-meta">
        <div>
          <dt>Role</dt>
          <dd>{ROLE_LABELS[user.role]}</dd>
        </div>
        <div>
          <dt>Department / Organization</dt>
          <dd>{user.department || '—'}</dd>
        </div>
        <div>
          <dt>Member since</dt>
          <dd>{formatDate(user.createdAt)}</dd>
        </div>
      </dl>
      {/* FR-04: the registered name is locked so certificates always match it. */}
      <p className="muted small">
        Your name is printed exactly like this on your certificates. If it is misspelled, ask the
        administrator to correct it.
      </p>
    </div>
  )
}
