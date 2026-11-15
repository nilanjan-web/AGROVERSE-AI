// Backend API client. The browser stores only session tokens, never account passwords.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '')
const ACCESS_KEY = 'agroverseAccessToken'
const REFRESH_KEY = 'agroverseRefreshToken'
export function getAccessToken() { return sessionStorage.getItem(ACCESS_KEY) }
export function saveSession(session) {
  sessionStorage.setItem(ACCESS_KEY, session.access_token)
  sessionStorage.setItem(REFRESH_KEY, session.refresh_token)
}
export function clearSession() {
  sessionStorage.removeItem(ACCESS_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
}
export function getRefreshToken() { return sessionStorage.getItem(REFRESH_KEY) }
async function parseResponse(response) {
  const body = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const detail = body?.detail
    const message = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(e => e.msg).join('; ') : `Request failed (${response.status})`
    const error = new Error(message)
    error.status = response.status
    throw error
  }
  return body
}
export async function apiRequest(path, options = {}, retry = true) {
  const headers = new Headers(options.headers || {})
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = getAccessToken()
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)
  let response
  try { response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers }) }
  catch { throw new Error('Cannot reach backend. Start FastAPI on port 8000 and check CORS_ORIGINS.') }
  if (response.status === 401 && retry && getRefreshToken() && path !== '/auth/refresh' && path !== '/auth/login') {
    try {
      const next = await apiRequest('/auth/refresh', { method:'POST', body: JSON.stringify({refresh_token: getRefreshToken()}) }, false)
      saveSession(next)
      return apiRequest(path, options, false)
    } catch { clearSession() }
  }
  return parseResponse(response)
}
