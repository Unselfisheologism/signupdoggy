const API = 'https://signupdoggy-portal-api.jeffrinjames99.workers.dev'

export interface UserProfile { id: string; email: string; name: string; created: string }
export interface ApiKey { key: string; created: string; usage_today: number }
export interface UsageDay { date: string; requests: number; blocked: number; cost: number }
export interface BillingMonth { month: string; requests: number; cost: number }

async function authFetch(path: string, init?: RequestInit) {
  const { supabase } = await import('./supabase');
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function getMe() {
  return authFetch('/api/me') as Promise<UserProfile>;
}

export async function listKeys() {
  return authFetch('/api/keys') as Promise<{ keys: ApiKey[] }>;
}

export async function createKey() {
  return authFetch('/api/keys', { method: 'POST' }) as Promise<{ key: string; created: string; message: string }>;
}

export async function deleteKey(prefix: string) {
  return authFetch(`/api/keys/${prefix}`, { method: 'DELETE' }) as Promise<{ message: string }>;
}

export async function getUsage() {
  return authFetch('/api/usage') as Promise<{ days: UsageDay[]; totals: { total_requests: number; total_blocked: number; total_cost_usd: number } }>;
}

export async function getBilling() {
  return authFetch('/api/billing') as Promise<{ months: BillingMonth[]; total_all_time: number }>;
}
