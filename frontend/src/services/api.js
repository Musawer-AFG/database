// Central HTTP client for the planned Express API.
// NOTE: The existing React screens still read browser-local data.
const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export async function apiRequest(path, {method='GET', body, signal, headers={}}={}) {
  const response = await fetch(`${BASE_URL}${path.startsWith('/') ? path : '/'+path}`, {
    method, signal, credentials:'include',
    headers: {'Content-Type':'application/json', ...headers},
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return response.status === 204 ? null : response.json();
}
