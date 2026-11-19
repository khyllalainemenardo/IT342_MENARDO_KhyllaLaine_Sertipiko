import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../../auth/useAuth'

// FR-05 / FR-17: personal random QR token, shown only to the signed-in owner.
export default function MyQrPage() {
  const { user } = useAuth()

  return (
    <section className="qr-page">
      <h1 className="page-title">My QR Code</h1>
      <div className="card qr-card">
        {user.qrToken ? (
          <>
            <div className="qr-box">
              <QRCodeSVG value={user.qrToken} size={240} level="M" marginSize={2} />
            </div>
            <p className="qr-name">{user.fullName}</p>
            <p className="muted small">Show this to the organizer at check-in and again at check-out.</p>
            <p className="muted small">Don't share screenshots of this code — it identifies you.</p>
          </>
        ) : (
          <p className="muted">Your QR code isn't available yet. Please contact the administrator.</p>
        )}
      </div>
    </section>
  )
}
