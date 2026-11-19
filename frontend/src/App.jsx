import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute, { RoleRedirect } from './auth/ProtectedRoute'
import { ROLES } from './auth/roles'
import AppLayout from './components/AppLayout'
import ComingSoon from './components/ComingSoon'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import NotFoundPage from './pages/NotFoundPage'
import ParticipantDashboard from './pages/participant/ParticipantDashboard'
import MyQrPage from './pages/participant/MyQrPage'
import OrganizerDashboard from './pages/organizer/OrganizerDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagementPage from './pages/admin/UserManagementPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Any signed-in user → their own dashboard */}
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* Participant */}
          <Route element={<ProtectedRoute roles={[ROLES.PARTICIPANT]} />}>
            <Route element={<AppLayout />}>
              <Route path="/participant" element={<ParticipantDashboard />} />
              <Route path="/participant/qr" element={<MyQrPage />} />
              <Route
                path="/participant/seminars"
                element={<ComingSoon title="Seminars" feature="Feature 2 · FR-13 to FR-15" description="Browse approved upcoming seminars and register with your school account." />}
              />
              <Route
                path="/participant/certificates"
                element={<ComingSoon title="My Certificates" feature="Feature 6 · FR-39 to FR-40" description="View, download, and share verification links for your certificates." />}
              />
            </Route>
          </Route>

          {/* Organizer */}
          <Route element={<ProtectedRoute roles={[ROLES.ORGANIZER]} />}>
            <Route element={<AppLayout />}>
              <Route path="/organizer" element={<OrganizerDashboard />} />
              <Route
                path="/organizer/seminars"
                element={<ComingSoon title="My Seminars" feature="Feature 2 · FR-08 to FR-12" description="Create seminars with schedule, venue, and capacity, and track approval status." />}
              />
              <Route
                path="/organizer/scanner"
                element={<ComingSoon title="Attendance Scanner" feature="Feature 3 · FR-18 to FR-23" description="Scan participant QR codes at check-in and check-out using your phone camera." />}
              />
              <Route
                path="/organizer/reports"
                element={<ComingSoon title="Attendance Reports" feature="Feature 8 · FR-46 to FR-48" description="View completion counts and export attendance lists as CSV or Excel." />}
              />
            </Route>
          </Route>

          {/* Administrator */}
          <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route
                path="/admin/approvals"
                element={<ComingSoon title="Seminar Approvals" feature="Feature 2 · FR-10 to FR-11" description="Approve or reject seminars before they open for registration." />}
              />
              <Route
                path="/admin/reports"
                element={<ComingSoon title="System Reports" feature="Feature 8 · FR-49" description="System-wide totals of seminars, participants, and certificates per department." />}
              />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
