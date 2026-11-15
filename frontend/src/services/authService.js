
import {
  apiRequest,
  saveSession,
  clearSession,
  getAccessToken,
  getRefreshToken
} from '../lib/api'

const PROFILE_KEY = 'agroverseProfileCache'

const SOILS = {
  'Clay Soil': 'clay',
  'Sandy Soil': 'sandy',
  'Loamy Soil': 'loam',
  'Silty Soil': 'silt_loam',
  'Clay': 'clay',
  'Sandy Loam': 'sandy_loam',
  'Silt Loam': 'silt_loam',
  'Clay Loam': 'clay_loam',
  'Sandy': 'sandy',
  'Loam': 'loam',
  'Peaty': 'peaty',
  'Saline': 'saline'
}

const reverseSoils = {
  clay: 'Clay Soil',
  sandy: 'Sandy Soil',
  loam: 'Loamy Soil',
  silt_loam: 'Silty Soil',
  sandy_loam: 'Sandy Soil',
  clay_loam: 'Clay Soil',
  peaty: 'Loamy Soil',
  saline: 'Sandy Soil'
}

const normalizedSoil = (s) =>
  SOILS[s] ||
  (Object.values(SOILS).includes(s)
    ? s
    : (() => {
        throw new Error('Unsupported soil type')
      })())

const cache = (user) => {
localStorage.setItem(PROFILE_KEY, JSON.stringify(user))
  return user
}

export function getCurrentUser() {
  if (!getAccessToken()) return null

  try {
   return JSON.parse(localStorage.getItem(PROFILE_KEY))
  } catch {
    return null
  }
}

// Find a readable place name from map coordinates.
async function getLocationName(latitude, longitude) {
  try {
    if (
      latitude == null ||
      longitude == null ||
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(longitude))
    ) {
      return ''
    }

    const url = new URL(
      'https://nominatim.openstreetmap.org/reverse'
    )

    url.searchParams.set('lat', String(latitude))
    url.searchParams.set('lon', String(longitude))
    url.searchParams.set('format', 'json')
    url.searchParams.set('zoom', '10')
    url.searchParams.set('addressdetails', '1')

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error('Location lookup failed')
    }

    const data = await response.json()
    const address = data.address || {}

    return [
      address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        address.state_district,
      address.state,
      address.country
    ]
      .filter(Boolean)
      .join(', ') || data.display_name || ''
  } catch (error) {
    console.warn('Could not find location name:', error)
    return ''
  }
}

function publicUser(account, farm, name) {
  return {
    id: account.id,
    email: account.email,
    role: account.role || 'user',
    name:
      name ||
      farm?.farmer_name ||
      account.email.split('@')[0],

    farmId: farm?.id || null,
    farmName: farm?.name || '',

    farmLocation:
      farm &&
      farm.latitude != null &&
      farm.longitude != null
        ? `${Number(farm.latitude).toFixed(5)}, ${Number(farm.longitude).toFixed(5)}`
        : '',

    latitude: farm?.latitude ?? null,
    longitude: farm?.longitude ?? null,

    landArea: farm
      ? String(farm.total_area_hectares)
      : '',

    farmSoil: farm
      ? reverseSoils[farm.soil_type] || farm.soil_type
      : '',

    currentCrop: farm?.current_crop || ''
  }
}

// Convert backend farm information into dashboard user data.
async function publicUserWithLocation(account, farm, name) {
  const user = publicUser(account, farm, name)

  if (
    farm &&
    farm.latitude != null &&
    farm.longitude != null
  ) {
    const locationName = await getLocationName(
      farm.latitude,
      farm.longitude
    )

    if (locationName) {
      user.farmLocation = locationName
    }
  }

  return user
}

const farmPayload = (values) => ({
  name: String(values.farmName).trim(),
  farmer_name: String(values.name).trim(),

  latitude: Number(values.latitude),
  longitude: Number(values.longitude),

  region: null,
  country: null,

  total_area_hectares: Number(values.landArea),
  soil_type: normalizedSoil(values.farmSoil),
  current_crop: values.currentCrop
})

async function loadUser(account, name) {
  const result = await apiRequest('/farms?limit=100')
  const farm = result.items?.[0] || null

  const user = await publicUserWithLocation(
    account,
    farm,
    name
  )

  return cache(user)
}

function classify(error) {
  if (error.status === 409) return 'emailExists'
  if (error.status === 401) return 'invalidCredentials'

  return error.message || 'generic'
}

// SIGN UP
export async function signUp(values) {
  try {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: values.email.trim(),
        password: values.password
      })
    })

    const session = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: values.email.trim(),
        password: values.password
      })
    })

    saveSession(session)

    try {
      const farm = await apiRequest('/farms', {
        method: 'POST',
        body: JSON.stringify(farmPayload(values))
      })

      const user = await publicUserWithLocation(
        session.user,
        farm,
        values.name
      )

      return {
        ok: true,
        user: cache(user)
      }
    } catch (error) {
      clearSession()

      return {
        ok: false,
        error:
          `Account created, but farm setup failed: ${error.message}. Sign in to retry.`
      }
    }
  } catch (error) {
    return {
      ok: false,
      error: classify(error)
    }
  }
}

// LOGIN
export async function signIn(email, password) {
  let session

  try {
    session = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim(),
        password
      })
    })
  } catch (error) {
    clearSession()

    return {
      ok: false,
      error: classify(error)
    }
  }

  saveSession(session)

  try {
    const user = await loadUser(session.user)

    return {
      ok: true,
      user
    }
  } catch (error) {
    console.error('Farm profile loading failed:', error)

    return {
      ok: false,
      error: 'Login successful, but farm profile could not load. Please try again.'
    }
  }
}

// LOGOUT
export async function signOut() {
  const refresh = getRefreshToken()

  if (refresh) {
    try {
      await apiRequest(
        '/auth/logout',
        {
          method: 'POST',
          body: JSON.stringify({
            refresh_token: refresh
          })
        },
        false
      )
    } catch {
      // Local logout always proceeds.
    }
  }

  clearSession()
  localStorage.removeItem(PROFILE_KEY)

  return { ok: true }
}

// UPDATE PROFILE
export async function updateProfile(patch) {
  try {
    const current = getCurrentUser()

    if (!current?.farmId) {
      return {
        ok: false,
        error:
          'No farm found. Please create a farm in the backend.'
      }
    }

    const farm = await apiRequest(
      `/farms/${encodeURIComponent(current.farmId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          name: patch.farmName,
          farmer_name: patch.name,

          total_area_hectares: Number(patch.landArea),

          soil_type: normalizedSoil(patch.farmSoil),
          current_crop: patch.currentCrop,

          latitude: Number(patch.latitude),
          longitude: Number(patch.longitude)
        })
      }
    )

    const updatedUser = await publicUserWithLocation(
      {
        id: current.id,
        email: current.email
      },
      farm,
      patch.name
    )

    return {
      ok: true,
      user: cache({
        ...current,
        ...updatedUser
      })
    }
  } catch (error) {
    return {
      ok: false,
      error: error.message
    }
  }
}

// PASSWORD RESET
export async function requestPasswordReset(email) {
  try {
    await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim()
      })
    })

    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error.message
    }
  }
}
