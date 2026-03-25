'use client';

/**
 * Sahayak API Client
 * All fetch calls to the Fastify backend must go through this module.
 * The `useApiClient()` hook returns typed methods that automatically
 * attach the Clerk session JWT to every request.
 *
 * Usage in a component:
 *   const api = useApiClient();
 *   const data = await api.get<DashboardData>('/api/dashboard/overview');
 *
 * Usage inside a TanStack Query queryFn (where getToken is passed in):
 *   queryFn: () => apiRequest<DashboardData>('/api/dashboard/overview', getToken)
 */

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// ── Types ─────────────────────────────────────────────────────────────────────

type GetToken = () => Promise<string | null>;

type FetchOptions = Omit<RequestInit, 'body'> & {
  /** Plain object → serialised to JSON. FormData → sent as-is. */
  body?: Record<string, unknown> | unknown[] | FormData;
};

// ── Core ──────────────────────────────────────────────────────────────────────

async function coreFetch(
  path: string,
  options: FetchOptions,
  getToken: GetToken,
): Promise<Response> {
  const token = await getToken();
  const headers = new Headers(options.headers as HeadersInit | undefined);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    // Let the browser set the multipart Content-Type boundary automatically
    body = options.body;
  } else if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body,
  });
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const payload = (await res.json()) as { message?: string };
      if (payload.message) message = payload.message;
    } catch {
      // ignore parse failures
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// ── Standalone helper (for use inside queryFn / serverActions) ────────────────

/**
 * One-off authenticated request. Pass `getToken` from `useAuth()` in the
 * calling component and close over it in the queryFn.
 *
 * @example
 * const { getToken } = useAuth();
 * const query = useQuery({
 *   queryFn: () => apiRequest<MyType>('/api/foo', getToken),
 * });
 */
export async function apiRequest<T>(
  path: string,
  getToken: GetToken,
  options: FetchOptions = {},
): Promise<T> {
  const res = await coreFetch(path, options, getToken);
  return parseResponse<T>(res);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Returns a stable set of authenticated API methods.
 * Use this hook when you need to call the API imperatively (mutations,
 * event handlers, etc.).
 */
export function useApiClient() {
  const { getToken } = useAuth();

  /** GET — returns parsed JSON */
  const get = useCallback(
    <T>(path: string, options?: Omit<FetchOptions, 'body' | 'method'>): Promise<T> =>
      apiRequest<T>(path, getToken, { ...options, method: 'GET' }),
    [getToken],
  );

  /** POST with a JSON body */
  const post = useCallback(
    <T>(
      path: string,
      body?: Record<string, unknown> | unknown[],
      options?: Omit<FetchOptions, 'body' | 'method'>,
    ): Promise<T> =>
      apiRequest<T>(path, getToken, { ...options, method: 'POST', body }),
    [getToken],
  );

  /** PUT with a JSON body */
  const put = useCallback(
    <T>(
      path: string,
      body?: Record<string, unknown> | unknown[],
      options?: Omit<FetchOptions, 'body' | 'method'>,
    ): Promise<T> =>
      apiRequest<T>(path, getToken, { ...options, method: 'PUT', body }),
    [getToken],
  );

  /** PATCH with a JSON body */
  const patch = useCallback(
    <T>(
      path: string,
      body?: Record<string, unknown> | unknown[],
      options?: Omit<FetchOptions, 'body' | 'method'>,
    ): Promise<T> =>
      apiRequest<T>(path, getToken, { ...options, method: 'PATCH', body }),
    [getToken],
  );

  /** DELETE — no request body */
  const del = useCallback(
    <T>(path: string): Promise<T> =>
      apiRequest<T>(path, getToken, { method: 'DELETE' }),
    [getToken],
  );

  /**
   * POST with a FormData body (e.g. file uploads).
   * Do NOT set Content-Type manually — the browser does it automatically.
   */
  const upload = useCallback(
    <T>(path: string, formData: FormData): Promise<T> =>
      apiRequest<T>(path, getToken, { method: 'POST', body: formData }),
    [getToken],
  );

  return { get, post, put, patch, del, upload } as const;
}
