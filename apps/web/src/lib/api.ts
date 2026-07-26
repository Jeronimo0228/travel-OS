const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function apiHealth() {
  const res = await fetch(`${API_URL}/api/health`, { cache: 'no-store' });
  if (!res.ok) throw new Error('API health failed');
  return res.json() as Promise<{ status: string; service: string }>;
}
