const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_SESSION_KEY = 'auth_session'

export function getStoredToken(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getStoredSession<T>(): T | null {
  const raw = sessionStorage.getItem(AUTH_SESSION_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function setStoredSession<T>(session: T): void {
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

export function clearStoredSession(): void {
  sessionStorage.removeItem(AUTH_SESSION_KEY)
}
