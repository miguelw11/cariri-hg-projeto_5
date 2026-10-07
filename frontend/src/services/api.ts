export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
// Integration foundation. No assumed endpoint is called by the demo screens.
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
  if (!base) throw new ApiError('API não configurada.', 0);
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${base}/${path.replace(/^\//, '')}`, { ...init, headers, signal: init.signal ?? AbortSignal.timeout(15000) });
  if (!response.ok) throw new ApiError(`Falha na API (${response.status}).`, response.status);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
