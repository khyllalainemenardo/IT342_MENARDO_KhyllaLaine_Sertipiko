// Roles from SRS §2.2 / FR-07. Values must match the backend enum.
export const ROLES = {
  PARTICIPANT: 'PARTICIPANT',
  ORGANIZER: 'ORGANIZER',
  ADMIN: 'ADMIN',
}

export const ROLE_LABELS = {
  PARTICIPANT: 'Participant',
  ORGANIZER: 'Organizer',
  ADMIN: 'Administrator',
}

export const DASHBOARD_PATH = {
  PARTICIPANT: '/participant',
  ORGANIZER: '/organizer',
  ADMIN: '/admin',
}

// Role-based navigation menus.
export const NAV_ITEMS = {
  PARTICIPANT: [
    { to: '/participant', label: 'Dashboard', end: true },
    { to: '/participant/qr', label: 'My QR Code' },
    { to: '/participant/seminars', label: 'Seminars' },
    { to: '/participant/certificates', label: 'My Certificates' },
  ],
  ORGANIZER: [
    { to: '/organizer', label: 'Dashboard', end: true },
    { to: '/organizer/seminars', label: 'My Seminars' },
    { to: '/organizer/scanner', label: 'Scanner' },
    { to: '/organizer/reports', label: 'Reports' },
  ],
  ADMIN: [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/users', label: 'User Accounts' },
    { to: '/admin/approvals', label: 'Seminar Approvals' },
    { to: '/admin/reports', label: 'Reports' },
  ],
}

export const ACCOUNT_ITEMS = [
  { to: '/account/profile', label: 'My Profile' },
  { to: '/account/password', label: 'Change Password' },
]

// Spring may return the role as "ADMIN" or "ROLE_ADMIN"; normalise both.
export function normalizeRole(role) {
  if (!role) return null
  const r = String(role).toUpperCase().replace(/^ROLE_/, '')
  return ROLES[r] ? r : null
}
