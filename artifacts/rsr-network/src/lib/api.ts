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
  status: string;
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
export async function apiLogin(username: string, password: string) {
  return apiRequest<{ token: string; user: ApiUser }>("POST", "/auth/login", { username, password });
}

export async function apiRegister(alias: string, bio: string, cardStyle: string) {
  return apiRequest<{ token: string; user: ApiUser }>("POST", "/auth/register", { alias, bio, cardStyle });
}

export async function apiVerifyToken(token: string) {
  return apiRequest<{ user: ApiUser }>("POST", "/auth/verify", { token });
}

// Users
export async function apiGetUsers() {
  return apiRequest<ApiUser[]>("GET", "/users");
}

export async function apiUpdateUser(id: string, updates: Record<string, unknown>) {
  return apiRequest<ApiUser>("PATCH", `/users/${id}`, updates);
}

export async function apiDeleteUser(id: string) {
  return apiRequest<{ ok: boolean }>("DELETE", `/users/${id}`);
}

// Signals
export async function apiGetSignals() {
  return apiRequest<ApiSignal[]>("GET", "/signals");
}

export async function apiCreateSignal(data: Omit<ApiSignal, "id" | "submittedBy" | "timestamp" | "createdAt" | "thread">) {
  return apiRequest<ApiSignal>("POST", "/signals", data);
}

export async function apiUpdateSignal(id: number, updates: Partial<Pick<ApiSignal, "status" | "priority" | "caseId">>) {
  return apiRequest<ApiSignal>("PATCH", `/signals/${id}`, updates);
}

export async function apiAddSignalThread(signalId: number, text: string) {
  return apiRequest<{ id: number; userId: string; text: string; timestamp: string }>("POST", `/signals/${signalId}/thread`, { text });
}

export async function apiDeleteSignal(id: number) {
  return apiRequest<{ success: boolean }>("DELETE", `/signals/${id}`);
}

// Cases
export async function apiGetCases() {
  return apiRequest<ApiCase[]>("GET", "/cases");
}

export async function apiCreateCase(data: Omit<ApiCase, "id" | "linkedSignals" | "createdAt" | "updatedAt">) {
  return apiRequest<ApiCase>("POST", "/cases", data);
}

export async function apiUpdateCase(id: number, updates: Partial<ApiCase>) {
  return apiRequest<ApiCase>("PATCH", `/cases/${id}`, updates);
}

export async function apiDeleteCase(id: number) {
  return apiRequest<{ success: boolean }>("DELETE", `/cases/${id}`);
}

// Network Messages
export async function apiGetMessages(roomId?: number) {
  const q = roomId ? `?roomId=${roomId}` : "";
  return apiRequest<ApiMessage[]>("GET", `/messages${q}`);
}

export async function apiSendMessage(text: string, roomId?: number) {
  return apiRequest<ApiMessage>("POST", "/messages", { text, roomId });
}

export async function apiAddMessageResponse(msgId: number, response: string) {
  return apiRequest<{ success: boolean }>("PATCH", `/messages/${msgId}/response`, { response });
}

export async function apiDeleteMessage(id: number) {
  return apiRequest<{ success: boolean }>("DELETE", `/messages/${id}`);
}

// Rooms
export async function apiGetRooms() {
  return apiRequest<ApiRoom[]>("GET", "/rooms");
}

export async function apiCreateRoom(name: string, slug: string) {
  return apiRequest<ApiRoom>("POST", "/rooms", { name, slug });
}

export async function apiRenameRoom(id: number, name: string) {
  return apiRequest<ApiRoom>("PATCH", `/rooms/${id}`, { name });
}

export async function apiDeleteRoom(id: number) {
  return apiRequest<{ success: boolean }>("DELETE", `/rooms/${id}`);
}

// Session helpers
export function saveSession(token: string) {
  localStorage.setItem("rsr_token", token);
}

export function clearSession() {
  localStorage.removeItem("rsr_token");
}

export function getSavedToken(): string | null {
  return localStorage.getItem("rsr_token");
}
