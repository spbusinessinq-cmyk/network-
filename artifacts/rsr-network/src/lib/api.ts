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
  roomId: number | null;
}

export interface ApiRoom {
  id: number;
  name: string;
  slug: string;
  type: string;
  createdBy: string | null;
  createdAt: string;
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
export async function apiGetMessages(roomId?: number): Promise<ApiMessage[]> {
  const path = roomId ? `/messages?roomId=${roomId}` : "/messages";
  return apiRequest("GET", path);
}

export async function apiSendMessage(text: string, roomId?: number): Promise<ApiMessage> {
  return apiRequest("POST", "/messages", { text, roomId: roomId || null });
}

export async function apiAddMessageResponse(id: number, response: string): Promise<void> {
  return apiRequest("PATCH", `/messages/${id}/response`, { response });
}

// Rooms
export async function apiGetRooms(): Promise<ApiRoom[]> {
  return apiRequest("GET", "/rooms");
}

export async function apiCreateRoom(name: string, slug: string): Promise<ApiRoom> {
  return apiRequest("POST", "/rooms", { name, slug });
}

export async function apiDeleteRoom(id: number): Promise<void> {
  return apiRequest("DELETE", `/rooms/${id}`);
}

export async function apiRenameRoom(id: number, name: string): Promise<ApiRoom> {
  return apiRequest("PATCH", `/rooms/${id}`, { name });
}

// User management (Command only)
export async function apiUpdateUser(id: string, updates: {
  standing?: string; grade?: string | null; accessClass?: string;
  role?: string; reviewStatus?: string; promotionStatus?: string; bio?: string; statusLine?: string;
}): Promise<ApiUser> {
  return apiRequest("PATCH", `/users/${id}`, updates);
}

export async function apiDeleteUser(id: string): Promise<void> {
  return apiRequest("DELETE", `/users/${id}`);
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
