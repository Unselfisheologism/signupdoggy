const API = 'https://registerguardian-portal-api.jeffrinjames99.workers.dev'

export interface User { id: string; email: string; name: string; created: string }
export interface ApiKey { key: string; created: string; usage_today: number }
export interface UsageDay { date: string; requests: number; blocked: number; cost: number }
export interface BillingMonth { month: string; requests: number; cost: number }

export async function signup(email: string, password: string, name: string) {
  const res = await fetch(`${API}/api/auth/signup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Signup failed')
  return data as { user: User; api_key: { key: string; created: string }; token: string }
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')
  return data as { user: User; token: string }
}

export async function getMe(token: string) {
  const res = await fetch(`${API}/api/me`, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Auth failed')
  return data as User
}

export async function listKeys(token: string) {
  const res = await fetch(`${API}/api/keys`, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to list keys')
  return data as { keys: ApiKey[] }
}

export async function createKey(token: string) {
  const res = await fetch(`${API}/api/keys`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to create key')
  return data as { key: string; created: string; message: string }
}

export async function deleteKey(token: string, prefix: string) {
  const res = await fetch(`${API}/api/keys/${prefix}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to delete key')
  return data as { message: string }
}

export async function getUsage(token: string) {
  const res = await fetch(`${API}/api/usage`, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to get usage')
  return data as { days: UsageDay[]; totals: { total_requests: number; total_blocked: number; total_cost_usd: number } }
}

export async function getBilling(token: string) {
  const res = await fetch(`${API}/api/billing`, { headers: { Authorization: `Bearer ${token}` } })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to get billing')
  return data as { months: BillingMonth[]; total_all_time: number }
}
