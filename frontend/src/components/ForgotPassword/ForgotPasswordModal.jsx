import { useState } from 'react'
import Modal from '../Modal/Modal'
import useLabels from '../../hooks/useLabels'
import { requestPasswordReset } from '../../services/authService'
import '../Auth/AuthExtras.css'
export default function ForgotPasswordModal({ initialEmail = '', onClose }) {
  const { t } = useLabels()
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  async function submit(e) {
    e.preventDefault();setError('');setLoading(true)
    const result = await requestPasswordReset(email)
    setLoading(false)
    if (result.ok) setDone(true); else setError(result.error)
  }
  return <Modal title={t('auth.forgotTitle')} onClose={onClose}>
    {done ? <p>If this email is registered, a password-reset request has been recorded. The backend's email delivery is not configured yet; contact the administrator to complete reset.</p> :
      <form onSubmit={submit}><p>Enter your account email to request a password reset. Passwords cannot be changed without a valid reset token.</p>
      {error && <div className="auth-error-box">{error}</div>}
      <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
      <button className="auth-btn" disabled={loading}>{loading?'Sending...':'Request reset'}</button></form>}
    <button type="button" className="auth-btn secondary" onClick={onClose}>{t('common.close')}</button>
  </Modal>
}
