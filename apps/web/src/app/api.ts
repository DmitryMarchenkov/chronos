import { AssessmentDomain, AssessmentType, DomainScore } from '@chronos/shared-types';
import { getToken } from './auth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

type ApiError = { code: string; message: string; details?: unknown };

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let error: ApiError | undefined;
  try {
    const body = (await response.json()) as { error?: ApiError };
    error = body.error;
  } catch {
    error = undefined;
  }

  const message = error?.message ?? `Request failed (${response.status})`;
  throw new Error(message);
};

const request = async <T>(path: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  return handleResponse<T>(response);
};

export const api = {
  login: async (email: string, password: string) =>
    request<{ token: string }>(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: async (email: string, password: string) =>
    request<{ token: string }>(`/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  listClients: async () =>
    request<{ data: { id: string; name: string; createdAt: string }[] }>(`/clients`),
  createClient: async (name: string) =>
    request<{ id: string; name: string }>(`/clients`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  listAssessments: async (clientId: string) =>
    request<{ data: { id: string; type: AssessmentType }[] }>(
      `/clients/${clientId}/assessments`
    ),
  createAssessment: async (clientId: string, type: AssessmentType) =>
    request<{ id: string }>(`/clients/${clientId}/assessments`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),
  getScores: async (assessmentId: string) =>
    request<{
      data: { id: string; domain: AssessmentDomain; score: number; notes?: string | null }[];
    }>(`/assessments/${assessmentId}/scores`),
  updateScores: async (assessmentId: string, scores: DomainScore[]) =>
    request<{ data: { id: string; domain: AssessmentDomain; score: number; notes?: string | null }[] }>(
      `/assessments/${assessmentId}/scores`,
      {
        method: 'PUT',
        body: JSON.stringify({ scores }),
      }
    ),
};
