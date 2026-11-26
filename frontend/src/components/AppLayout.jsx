import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ACCOUNT_ITEMS, NAV_ITEMS, ROLE_LABELS } from '../auth/roles'
import Logo from './Logo'
import Avatar from './Avatar'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
    navigate('/login', { replace: true, state: { loggedOut: true } })
  }

  const items = NAV_ITEMS[user.role] || []

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button
            className="icon-btn nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
          <Logo />
          <div className="topbar-user">
            <div className="topbar-user-text">
              <span className="topbar-name">{user.fullName}</span>
              <span className={`role-badge role-${user.role.toLowerCase()}`}>{ROLE_LABELS[user.role]}</span>
            </div>
            <Avatar name={user.fullName} src={user.pictureUrl} />
          </div>
        </div>
      </header>

      <div className="body">
        <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
          <nav aria-label={`${ROLE_LABELS[user.role]} navigation`}>
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className="nav-link" onClick={() => setMenuOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <nav aria-label="Account" className="nav-section">
            <p className="nav-heading">Account</p>
            {ACCOUNT_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className="nav-link" onClick={() => setMenuOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button className="btn btn-ghost logout-btn" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </aside>
        {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
