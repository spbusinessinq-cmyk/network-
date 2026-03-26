import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  apiLogin, apiRegister, apiVerifyToken, apiGetUsers, apiGetSignals, apiGetCases,
  apiGetMessages, apiCreateSignal, apiUpdateSignal, apiAddSignalThread, apiCreateCase,
  apiUpdateCase, apiSendMessage, apiAddMessageResponse, apiDeleteCase, apiDeleteSignal,
  apiDeleteMessage, apiGetRooms, apiCreateRoom, apiDeleteRoom, apiRenameRoom,
  saveSession, clearSession, getSavedToken,
  type ApiUser, type ApiSignal, type ApiCase, type ApiMessage, type ApiRoom,
} from "./api";

export type Standing = "Observer" | "Scout" | "Operator" | "Analyst" | "Command";
export type CardStyle = "obsidian" | "steel" | "ice" | "graphite" | "gold";

export interface User {
  id: string;
  alias: string;
  role: string;
  standing: Standing;
  cardStyle: CardStyle;
  bio: string;
  presence: string;
  joinDate: string;
  grade: "I" | "II" | "III" | null;
  username: string;
  accessClass: string;
  credentialMeaning: string;
  statusLine: string;
  contributionCount: number;
  promotionStatus: "Eligible" | "Under Review" | "Not Eligible" | "Command Reserved";
  reviewStatus: "Approved" | "Pending" | "Active" | "Command Assigned";
  isFounder?: boolean;
}

export interface Signal {
  id: number;
  title: string;
  category: string;
  location: string;
  submittedBy: string;
  status: "VERIFIED" | "UNVERIFIED" | "ARCHIVED";
  priority: boolean;
  caseId: number | null;
  timestamp: string;
  description: string;
  thread: ThreadMessage[];
}

export interface Case {
  id: number;
  name: string;
  status: "OPEN" | "ACTIVE" | "MONITORING" | "ESCALATED" | "ARCHIVED";
  lead: string;
  summary: string;
  linkedSignals: number[];
  notes: string[];
}

export interface ThreadMessage {
  id: number;
  userId: string;
  text: string;
  timestamp: string;
  responses?: string[];
  roomId?: number | null;
}

export interface Room {
  id: number;
  name: string;
  slug: string;
  type: string;
  createdBy: string | null;
  createdAt: string;
}

function mapApiUser(u: ApiUser): User {
  return {
    id: u.id,
    alias: u.alias,
    role: u.role,
    standing: u.standing as Standing,
    cardStyle: u.cardStyle as CardStyle,
    bio: u.bio,
    presence: u.presence,
    joinDate: u.joinDate,
    grade: u.grade as "I" | "II" | "III" | null,
    username: u.username,
    accessClass: u.accessClass,
    credentialMeaning: u.credentialMeaning,
    statusLine: u.statusLine,
    contributionCount: u.contributionCount,
    promotionStatus: u.promotionStatus as User["promotionStatus"],
    reviewStatus: u.reviewStatus as User["reviewStatus"],
    isFounder: u.isFounder,
  };
}

function mapApiSignal(s: ApiSignal): Signal {
  return {
    id: s.id,
    title: s.title,
    category: s.category,
    location: s.location,
    submittedBy: s.submittedBy,
    status: s.status as Signal["status"],
    priority: s.priority,
    caseId: s.caseId,
    timestamp: s.timestamp,
    description: s.description,
    thread: s.thread.map(t => ({ id: t.id, userId: t.userId, text: t.text, timestamp: t.timestamp })),
  };
}

function mapApiCase(c: ApiCase): Case {
  return {
    id: c.id,
    name: c.name,
    status: c.status as Case["status"],
    lead: c.lead,
    summary: c.summary,
    linkedSignals: c.linkedSignals,
    notes: c.notes,
  };
}

function mapApiMessage(m: ApiMessage): ThreadMessage {
  return { id: m.id, userId: m.userId, text: m.text, timestamp: m.timestamp, responses: m.responses, roomId: m.roomId };
}

function mapApiRoom(r: ApiRoom): Room {
  return { id: r.id, name: r.name, slug: r.slug, type: r.type, createdBy: r.createdBy, createdAt: r.createdAt };
}

interface AppState {
  users: User[];
  signals: Signal[];
  cases: Case[];
  networkMessages: ThreadMessage[];
  rooms: Room[];
  currentRoomId: number | null;
  currentUserId: string | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AppContextType extends AppState {
  loginUser: (username: string, password: string) => Promise<boolean>;
  registerUser: (alias: string, bio: string, cardStyle: CardStyle) => Promise<User | null>;
  logoutUser: () => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  addSignal: (signal: Omit<Signal, "id" | "timestamp" | "thread">) => Promise<void>;
  updateSignal: (id: number, updates: Partial<Signal>) => Promise<void>;
  deleteSignal: (id: number) => Promise<void>;
  addSignalThreadMessage: (signalId: number, msg: Omit<ThreadMessage, "id" | "timestamp">) => Promise<void>;
  addCase: (newCase: Omit<Case, "id">) => Promise<void>;
  updateCase: (id: number, updates: Partial<Case>) => Promise<void>;
  deleteCase: (id: number) => Promise<void>;
  addNetworkMessage: (msg: Omit<ThreadMessage, "id" | "timestamp">, roomId?: number) => Promise<void>;
  addMessageResponse: (msgId: number, response: string) => Promise<void>;
  deleteNetworkMessage: (id: number) => Promise<void>;
  refreshSignals: () => Promise<void>;
  refreshMessages: (roomId?: number) => Promise<void>;
  setCurrentRoom: (roomId: number | null) => void;
  createRoom: (name: string, slug: string) => Promise<Room>;
  deleteRoom: (id: number) => Promise<void>;
  renameRoom: (id: number, name: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    users: [],
    signals: [],
    cases: [],
    networkMessages: [],
    rooms: [],
    currentRoomId: null,
    currentUserId: null,
    isLoading: true,
    isInitialized: false,
  });

  useEffect(() => {
    async function init() {
      const token = getSavedToken();
      if (token) {
        try {
          const { user } = await apiVerifyToken(token);
          const [users, signals, cases, messages, rooms] = await Promise.all([
            apiGetUsers(), apiGetSignals(), apiGetCases(), apiGetMessages(), apiGetRooms(),
          ]);
          const mappedRooms = rooms.map(mapApiRoom);
          const defaultRoom = mappedRooms.find(r => r.slug === "general");
          setState({
            users: users.map(mapApiUser),
            signals: signals.map(mapApiSignal),
            cases: cases.map(mapApiCase),
            networkMessages: messages.map(mapApiMessage),
            rooms: mappedRooms,
            currentRoomId: defaultRoom?.id || mappedRooms[0]?.id || null,
            currentUserId: user.id,
            isLoading: false,
            isInitialized: true,
          });
          return;
        } catch {
          clearSession();
        }
      }
      setState(s => ({ ...s, isLoading: false, isInitialized: true }));
    }
    init();
  }, []);

  const loginUser = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const { token, user } = await apiLogin(username, password);
      saveSession(token);
      const [users, signals, cases, messages, rooms] = await Promise.all([
        apiGetUsers(), apiGetSignals(), apiGetCases(), apiGetMessages(), apiGetRooms(),
      ]);
      const mappedRooms = rooms.map(mapApiRoom);
      const defaultRoom = mappedRooms.find(r => r.slug === "general");
      setState(s => ({
        ...s,
        users: users.map(mapApiUser),
        signals: signals.map(mapApiSignal),
        cases: cases.map(mapApiCase),
        networkMessages: messages.map(mapApiMessage),
        rooms: mappedRooms,
        currentRoomId: defaultRoom?.id || mappedRooms[0]?.id || null,
        currentUserId: user.id,
      }));
      return true;
    } catch {
      return false;
    }
  }, []);

  const registerUser = useCallback(async (alias: string, bio: string, cardStyle: CardStyle): Promise<User | null> => {
    try {
      const { token, user } = await apiRegister(alias, bio, cardStyle);
      saveSession(token);
      const [users, signals, cases, messages, rooms] = await Promise.all([
        apiGetUsers(), apiGetSignals(), apiGetCases(), apiGetMessages(), apiGetRooms(),
      ]);
      const mappedRooms = rooms.map(mapApiRoom);
      const defaultRoom = mappedRooms.find(r => r.slug === "general");
      const mapped = mapApiUser(user);
      setState(s => ({
        ...s,
        users: users.map(mapApiUser),
        signals: signals.map(mapApiSignal),
        cases: cases.map(mapApiCase),
        networkMessages: messages.map(mapApiMessage),
        rooms: mappedRooms,
        currentRoomId: defaultRoom?.id || mappedRooms[0]?.id || null,
        currentUserId: user.id,
      }));
      return mapped;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      throw new Error(msg);
    }
  }, []);

  const logoutUser = useCallback(() => {
    clearSession();
    setState(s => ({ ...s, currentUserId: null, users: [], signals: [], cases: [], networkMessages: [], rooms: [], currentRoomId: null }));
  }, []);

  const addUser = useCallback((user: User) => {
    setState(s => ({ ...s, users: [...s.users, user] }));
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setState(s => ({ ...s, users: s.users.map(u => u.id === id ? { ...u, ...updates } : u) }));
  }, []);

  const refreshSignals = useCallback(async () => {
    try {
      const signals = await apiGetSignals();
      setState(s => ({ ...s, signals: signals.map(mapApiSignal) }));
    } catch {}
  }, []);

  const refreshMessages = useCallback(async (roomId?: number) => {
    try {
      const messages = await apiGetMessages(roomId);
      setState(s => ({ ...s, networkMessages: messages.map(mapApiMessage) }));
    } catch {}
  }, []);

  const setCurrentRoom = useCallback((roomId: number | null) => {
    setState(s => ({ ...s, currentRoomId: roomId }));
  }, []);

  const createRoom = useCallback(async (name: string, slug: string): Promise<Room> => {
    const room = await apiCreateRoom(name, slug);
    const mapped = mapApiRoom(room);
    setState(s => ({ ...s, rooms: [...s.rooms, mapped] }));
    return mapped;
  }, []);

  const renameRoom = useCallback(async (id: number, name: string) => {
    const updated = await apiRenameRoom(id, name);
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => r.id === id ? { ...r, name: updated.name } : r),
    }));
  }, []);

  const deleteRoom = useCallback(async (id: number) => {
    await apiDeleteRoom(id);
    setState(s => ({
      ...s,
      rooms: s.rooms.filter(r => r.id !== id),
      currentRoomId: s.currentRoomId === id ? (s.rooms.find(r => r.slug === "general")?.id || null) : s.currentRoomId,
    }));
  }, []);

  const addSignal = useCallback(async (signalData: Omit<Signal, "id" | "timestamp" | "thread">) => {
    const newSig = await apiCreateSignal({
      title: signalData.title,
      description: signalData.description || "",
      category: signalData.category,
      location: signalData.location,
      status: signalData.status,
      priority: signalData.priority,
      caseId: signalData.caseId,
    });
    setState(s => ({ ...s, signals: [mapApiSignal(newSig), ...s.signals] }));
  }, []);

  const updateSignal = useCallback(async (id: number, updates: Partial<Signal>) => {
    await apiUpdateSignal(id, {
      status: updates.status,
      priority: updates.priority,
      caseId: updates.caseId,
    });
    setState(s => ({ ...s, signals: s.signals.map(sig => sig.id === id ? { ...sig, ...updates } : sig) }));
  }, []);

  const addSignalThreadMessage = useCallback(async (signalId: number, msgInfo: Omit<ThreadMessage, "id" | "timestamp">) => {
    const newMsg = await apiAddSignalThread(signalId, msgInfo.text);
    setState(s => ({
      ...s,
      signals: s.signals.map(sig => {
        if (sig.id === signalId) {
          return { ...sig, thread: [...sig.thread, { id: newMsg.id, userId: newMsg.userId, text: newMsg.text, timestamp: newMsg.timestamp }] };
        }
        return sig;
      }),
    }));
  }, []);

  const addCase = useCallback(async (caseData: Omit<Case, "id">) => {
    const newCase = await apiCreateCase({
      name: caseData.name,
      summary: caseData.summary,
      status: caseData.status,
      lead: caseData.lead,
      notes: caseData.notes,
    });
    setState(s => ({ ...s, cases: [mapApiCase(newCase), ...s.cases] }));
  }, []);

  const updateCase = useCallback(async (id: number, updates: Partial<Case>) => {
    await apiUpdateCase(id, {
      status: updates.status,
      notes: updates.notes,
      summary: updates.summary,
    });
    setState(s => ({ ...s, cases: s.cases.map(c => c.id === id ? { ...c, ...updates } : c) }));
  }, []);

  const addNetworkMessage = useCallback(async (msgInfo: Omit<ThreadMessage, "id" | "timestamp">, roomId?: number) => {
    const newMsg = await apiSendMessage(msgInfo.text, roomId);
    setState(s => ({ ...s, networkMessages: [...s.networkMessages, mapApiMessage(newMsg)] }));
  }, []);

  const addMessageResponse = useCallback(async (msgId: number, response: string) => {
    await apiAddMessageResponse(msgId, response);
    setState(s => ({
      ...s,
      networkMessages: s.networkMessages.map(m => {
        if (m.id === msgId) {
          const resps = m.responses || [];
          if (!resps.includes(response)) return { ...m, responses: [...resps, response] };
        }
        return m;
      }),
    }));
  }, []);

  const deleteCase = useCallback(async (id: number) => {
    await apiDeleteCase(id);
    setState(s => ({ ...s, cases: s.cases.filter(c => c.id !== id) }));
  }, []);

  const deleteSignal = useCallback(async (id: number) => {
    await apiDeleteSignal(id);
    setState(s => ({ ...s, signals: s.signals.filter(sig => sig.id !== id) }));
  }, []);

  const deleteNetworkMessage = useCallback(async (id: number) => {
    await apiDeleteMessage(id);
    setState(s => ({ ...s, networkMessages: s.networkMessages.filter(m => m.id !== id) }));
  }, []);

  return (
    <AppContext.Provider value={{
      ...state,
      loginUser,
      registerUser,
      logoutUser,
      addUser,
      updateUser,
      addSignal,
      updateSignal,
      addSignalThreadMessage,
      addCase,
      updateCase,
      deleteCase,
      addNetworkMessage,
      addMessageResponse,
      deleteNetworkMessage,
      deleteSignal,
      refreshSignals,
      refreshMessages,
      setCurrentRoom,
      createRoom,
      deleteRoom,
      renameRoom,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useStore() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error("useStore must be used within an AppProvider");
  return context;
}

// ---- Doctrine constants ----

export const STANDING_DOCTRINE = {
  Observer: {
    label: "Observer", tier: 1, badgeColor: "zinc",
    description: "Entry-level network standing. Intake and observation with limited participation. Early credential state.",
    access: "Read access to Signal Feed and Network Room. No case participation.",
    trust: "Unverified. Standing under evaluation.",
    responsibilities: "Observation, basic signal intake, Network Room presence.",
    advancement: "Complete profile, submit valid signals, demonstrate appropriate Network Room conduct."
  },
  Scout: {
    label: "Scout", tier: 2, badgeColor: "slate",
    description: "Early trusted contributor. Active room participation, signal engagement, and growing trust.",
    access: "Signal submission, Network Room participation, limited case viewing.",
    trust: "Initial trust established through contribution.",
    responsibilities: "Signal submission, field observation, early case support.",
    advancement: "Contribute multiple useful signals, engage in case discussion, maintain stable standing."
  },
  Operator: {
    label: "Operator", tier: 3, badgeColor: "red",
    description: "Proven field-level contributor. Broader room access, case participation, and stronger operational standing.",
    access: "Full signal submission, case room participation, cross-room access.",
    trust: "Operational trust. Contribution record verified.",
    responsibilities: "Active signal and case work, field-level analysis, operational support.",
    advancement: "Support verified threads, contribute meaningful case notes, assist in review synthesis."
  },
  Analyst: {
    label: "Analyst", tier: 4, badgeColor: "white",
    description: "High-trust review and synthesis role. Verification, case support, refinement, and signal interpretation.",
    access: "Verification authority, case lead candidacy, signal routing.",
    trust: "Elevated trust. Review authority active.",
    responsibilities: "Signal verification, case synthesis, analytical oversight, thread moderation.",
    advancement: "Command review and assignment required. Not standard progression."
  },
  Command: {
    label: "Command", tier: 5, badgeColor: "gold",
    description: "Reserved executive authority. Oversight, access control, network direction, and founder-level standing.",
    access: "Full network authority. Command section unrestricted. User and case control.",
    trust: "Absolute. Founder-assigned.",
    responsibilities: "Network direction, access control, standing assignment, operator oversight.",
    advancement: "Not applicable. Command is founder-assigned."
  }
} as const;

export const CREDENTIAL_DOCTRINE = {
  obsidian: { name: "Obsidian", description: "Low-signature operational credential. Used by field operators requiring minimal visibility." },
  steel: { name: "Steel", description: "Structured support and field-aligned credential. Standard operational issue for active contributors." },
  ice: { name: "Ice", description: "Verification and intelligence review credential. Issued to operators in analysis and technical roles." },
  graphite: { name: "Graphite", description: "Neutral general network credential. Broad utility, minimal specialization." },
  gold: { name: "Gold", description: "Restricted command credential. Founder-class authority. Not user-selectable." }
} as const;
