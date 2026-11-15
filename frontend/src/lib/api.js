
// Backend API client.
// Stores login tokens across browser sessions.

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api'
).replace(/\/$/, '')

const ACCESS_KEY = 'agroverseAccessToken'
const REFRESH_KEY = 'agroverseRefreshToken'

// Get saved access token
export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

// Get saved refresh token
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

// Save login session
export function saveSession(session) {
  if (session.access_token) {
    localStorage.setItem(ACCESS_KEY, session.access_token)
  }

  if (session.refresh_token) {
    localStorage.setItem(REFRESH_KEY, session.refresh_token)
  }
}

// Remove login session
export function clearSession() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)

  // Clear tokens saved by the previous version
  sessionStorage.removeItem(ACCESS_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
}

// Handle backend response
async function parseResponse(response) {
  const body =
    response.status === 204
      ? null
      : await response.json().catch(() => null)

  if (!response.ok) {
    const detail = body?.detail

    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((e) => e.msg).join('; ')
          : `Request failed (${response.status})`

    const error = new Error(message)
    error.status = response.status

    throw error
  }

  return body
}

// Send request to backend
export async function apiRequest(
  path,
  options = {},
  retry = true
) {
  const headers = new Headers(options.headers || {})

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getAccessToken()

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response

  try {
    response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,
        headers
      }
    )
  } catch {
    throw new Error(
      'Cannot reach backend. Check VITE_API_BASE_URL, backend availability, and CORS_ORIGINS.'
    )
  }

  // Automatically refresh expired access token
  if (
    response.status === 401 &&
    retry &&
    getRefreshToken() &&
    path !== '/auth/refresh' &&
    path !== '/auth/login'
  ) {
    try {
      const next = await apiRequest(
        '/auth/refresh',
        {
          method: 'POST',
          body: JSON.stringify({
            refresh_token: getRefreshToken()
          })
        },
        false
      )

      saveSession(next)

      // Retry original request with new access token
      return apiRequest(path, options, false)
    } catch {
      clearSession()
    }
  }

  return parseResponse(response)
}
