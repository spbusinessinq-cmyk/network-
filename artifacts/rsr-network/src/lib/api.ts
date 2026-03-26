const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("rsr_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

async function apiRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export interface ApiUser {
  id: string;
  alias: string;
  bio: string;
  statusLine: string;
  rsrId: string;
  role: string;
  standing: string;
  grade: string | null;
  cardStyle: string;
  accessClass: string;
  credentialMeaning: string;
  presence: string;
  joinDate: string;
  contributionCount: number;
  promotionStatus: string;
  reviewStatus: string;
  isFounder: boolean;
  username: string;
}

export interface ApiSignal {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  priority: boolean;
  submittedBy: string;
  caseId: number | null;
  timestamp: string;
  createdAt: string;
  thread: { id: number; userId: string; text: string; timestamp: string }[];
}

export interface ApiCase {
  id: number;
  name: string;
  summary: string;
  status: string;
  lead: string;
  notes: string[];
  linkedSignals: number[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiMessage {
  id: number;
  userId: string;
  text: string;
  timestamp: string;
  responses: string[];
}

// Auth
export async function apiLogin(username: string, password: string): Promise<{ token: string; user: ApiUser }> {
  return apiRequest("POST", "/auth/login", { username, password });
}

export async function apiRegister(alias: string, bio: string, cardStyle: string): Promise<{ token: string; user: ApiUser }> {
  return apiRequest("POST", "/auth/register", { alias, bio, cardStyle });
}

export async function apiVerifyToken(token: string): Promise<{ user: ApiUser }> {
  const res = await fetch(`${BASE}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error("Invalid token");
  return res.json();
}

// Users
export async function apiGetUsers(): Promise<ApiUser[]> {
  return apiRequest("GET", "/users");
}

// Signals
export async function apiGetSignals(): Promise<ApiSignal[]> {
  return apiRequest("GET", "/signals");
}

export async function apiCreateSignal(data: {
  title: string; description: string; category: string; location: string;
  status: string; priority: boolean; caseId?: number | null;
}): Promise<ApiSignal> {
  return apiRequest("POST", "/signals", data);
}

export async function apiUpdateSignal(id: number, updates: { status?: string; priority?: boolean; caseId?: number | null }): Promise<void> {
  return apiRequest("PATCH", `/signals/${id}`, updates);
}

export async function apiAddSignalThread(signalId: number, message: string): Promise<{ id: number; userId: string; text: string; timestamp: string }> {
  return apiRequest("POST", `/signals/${signalId}/thread`, { message });
}

// Cases
export async function apiGetCases(): Promise<ApiCase[]> {
  return apiRequest("GET", "/cases");
}

export async function apiCreateCase(data: { name: string; summary: string; status: string; lead: string; notes: string[] }): Promise<ApiCase> {
  return apiRequest("POST", "/cases", data);
}

export async function apiUpdateCase(id: number, updates: { status?: string; notes?: string[]; summary?: string }): Promise<void> {
  return apiRequest("PATCH", `/cases/${id}`, updates);
}

// Messages
export async function apiGetMessages(): Promise<ApiMessage[]> {
  return apiRequest("GET", "/messages");
}

export async function apiSendMessage(text: string): Promise<ApiMessage> {
  return apiRequest("POST", "/messages", { text });
}

export async function apiAddMessageResponse(id: number, response: string): Promise<void> {
  return apiRequest("PATCH", `/messages/${id}/response`, { response });
}

// Delete operations
export async function apiDeleteCase(id: number): Promise<void> {
  return apiRequest("DELETE", `/cases/${id}`);
}

export async function apiDeleteSignal(id: number): Promise<void> {
  return apiRequest("DELETE", `/signals/${id}`);
}

export async function apiDeleteMessage(id: number): Promise<void> {
  return apiRequest("DELETE", `/messages/${id}`);
}

// Session management
export function saveSession(token: string): void {
  localStorage.setItem("rsr_token", token);
}

export function clearSession(): void {
  localStorage.removeItem("rsr_token");
}

export function getSavedToken(): string | null {
  return localStorage.getItem("rsr_token");
}
