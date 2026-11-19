import { useCallback, useEffect, useState } from 'react'
import { listUsers, updateUserRole, updateUserStatus } from '../../api/adminApi'
import { errorMessage } from '../../api/client'
import { useAuth } from '../../auth/useAuth'
import { ROLE_LABELS, ROLES } from '../../auth/roles'
import Avatar from '../../components/Avatar'
import Spinner from '../../components/Spinner'

// FR-06: grant, revoke, and disable organizer accounts.
export default function UserManagementPage() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setError('')
    try {
      setUsers(await listUsers({ search: search.trim(), role: roleFilter }))
    } catch (e) {
      setError(errorMessage(e, 'Could not load accounts.'))
      setUsers([])
    }
  }, [search, roleFilter])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  async function run(u, action, successText) {
    setBusyId(u.id)
    setError('')
    setNotice('')
    try {
      const updated = await action()
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, ...updated } : x)))
      setNotice(successText)
    } catch (e) {
      setError(errorMessage(e, 'The change could not be saved.'))
    } finally {
      setBusyId(null)
    }
  }

  const changeRole = (u, role) =>
    run(u, () => updateUserRole(u.id, role), `${u.fullName} is now ${ROLE_LABELS[role]}.`)

  const toggleStatus = (u) =>
    run(
      u,
      () => updateUserStatus(u.id, !u.enabled),
      `${u.fullName} has been ${u.enabled ? 'disabled' : 'enabled'}.`,
    )

  return (
    <section>
      <h1 className="page-title">User Accounts</h1>
      <p className="muted page-sub">
        New registrations are Participant accounts. Grant the
        Organizer role to department staff and organization officers.
      </p>

      <div className="toolbar">
        <input
          className="input"
          type="search"
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search accounts"
        />
        <select className="input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role">
          <option value="">All roles</option>
          {Object.values(ROLES).map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      {!users ? (
        <Spinner label="Loading accounts…" />
      ) : users.length === 0 ? (
        <div className="card empty-state"><p className="muted">No accounts match your search.</p></div>
      ) : (
        <div className="card table-card">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const self = u.id === me.id
                const busy = busyId === u.id
                return (
                  <tr key={u.id}>
                    <td data-label="User">
                      <div className="user-cell">
                        <Avatar name={u.fullName} src={u.pictureUrl} size={32} />
                        <div>
                          <div className="strong">{u.fullName}{self && <span className="muted"> (you)</span>}</div>
                          <div className="muted small">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Role">
                      <span className={`role-badge role-${u.role.toLowerCase()}`}>{ROLE_LABELS[u.role]}</span>
                    </td>
                    <td data-label="Status">
                      <span className={u.enabled === false ? 'status status-off' : 'status status-on'}>
                        {u.enabled === false ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td data-label="Actions" className="right">
                      {self || u.role === ROLES.ADMIN ? (
                        <span className="muted small">—</span>
                      ) : (
                        <div className="actions">
                          {u.role === ROLES.PARTICIPANT ? (
                            <button className="btn btn-sm btn-primary" disabled={busy} onClick={() => changeRole(u, ROLES.ORGANIZER)}>
                              Grant organizer
                            </button>
                          ) : (
                            <button className="btn btn-sm btn-ghost" disabled={busy} onClick={() => changeRole(u, ROLES.PARTICIPANT)}>
                              Revoke organizer
                            </button>
                          )}
                          <button
                            className={u.enabled === false ? 'btn btn-sm btn-ghost' : 'btn btn-sm btn-danger'}
                            disabled={busy}
                            onClick={() => toggleStatus(u)}
                          >
                            {u.enabled === false ? 'Enable' : 'Disable'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
