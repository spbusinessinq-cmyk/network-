import React, { createContext, useContext, useState, ReactNode } from "react";

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
}

interface AppState {
  users: User[];
  signals: Signal[];
  cases: Case[];
  networkMessages: ThreadMessage[];
  currentUserId: string | null;
}

const initialUsers: User[] = [
  {
    alias: "Black Rail",
    id: "RSR-000001",
    role: "Founder",
    standing: "Command",
    cardStyle: "gold",
    bio: "Network founder. Command authority.",
    presence: "COMMAND ACTIVE",
    joinDate: "2025-11-01",
  },
  {
    alias: "Signal Echo",
    id: "RSR-000103",
    role: "Analyst",
    standing: "Analyst",
    cardStyle: "obsidian",
    bio: "Signal verification and pattern analysis.",
    presence: "Reviewing Signals",
    joinDate: "2026-01-08",
  },
  {
    alias: "Operator Vanta",
    id: "RSR-000214",
    role: "Scout",
    standing: "Scout",
    cardStyle: "steel",
    bio: "Field observation and signal intake.",
    presence: "Online",
    joinDate: "2026-03-10",
  },
  {
    alias: "Cipher Nine",
    id: "RSR-000089",
    role: "Operator",
    standing: "Operator",
    cardStyle: "graphite",
    bio: "Infrastructure and logistics surveillance.",
    presence: "In Case Room",
    joinDate: "2026-01-22",
  },
];

const initialSignals: Signal[] = [
  {
    id: 1,
    title: "Procurement anomaly flagged at downtown contract node",
    category: "Political",
    location: "Los Angeles",
    submittedBy: "RSR-000214",
    status: "VERIFIED",
    priority: true,
    caseId: 1,
    timestamp: "08:42",
    description: "Source points to linked vendor activity and timing overlap with public works revisions. High probability of systemic manipulation.",
    thread: [
      { id: 101, userId: "RSR-000103", text: "Cross-referencing vendor lists now.", timestamp: "08:45" }
    ]
  },
  {
    id: 2,
    title: "Permit cluster activity near federal corridor",
    category: "Local",
    location: "Wilshire Corridor",
    submittedBy: "RSR-000103",
    status: "VERIFIED",
    priority: false,
    caseId: 2,
    timestamp: "07:16",
    description: "Permit clustering suggests coordinated street action window later this week. Monitoring organizer channels for confirmation.",
    thread: []
  },
  {
    id: 3,
    title: "Logistics slowdown signal — port disruption pattern",
    category: "Economic",
    location: "Port Node",
    submittedBy: "RSR-000089",
    status: "UNVERIFIED",
    priority: false,
    caseId: null,
    timestamp: "06:29",
    description: "Several shipping inputs indicate soft disruption and delayed fulfillment pathing. May be early indicator of labor action.",
    thread: []
  },
];

const initialCases: Case[] = [
  {
    id: 1,
    name: "LA Infrastructure Watch",
    status: "ACTIVE",
    lead: "RSR-000001",
    summary: "Urban contract irregularities, ownership mapping, and incident clustering.",
    linkedSignals: [1],
    notes: ["Money flow mapping in progress.", "FOIA targets identified."],
  },
  {
    id: 2,
    name: "Federal Corridor Monitoring",
    status: "MONITORING",
    lead: "RSR-000103",
    summary: "Permit activity, coordination indicators, and escalation tracking.",
    linkedSignals: [2],
    notes: ["Monitor permit updates.", "Track organizer pattern shifts."],
  },
];

const initialNetworkMessages: ThreadMessage[] = [
  { id: 1, userId: "RSR-000001", text: "Network operational. Stand by for inbound signals.", timestamp: "06:00", responses: ["ACKNOWLEDGED"] },
  { id: 2, userId: "RSR-000214", text: "Vanta online. Moving to observation point.", timestamp: "06:15", responses: ["LOGGED"] },
  { id: 3, userId: "RSR-000103", text: "Verifying overnight stream. High noise ratio.", timestamp: "07:05", responses: ["TRACKING"] },
];

interface AppContextType extends AppState {
  setCurrentUserId: (id: string | null) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  addSignal: (signal: Omit<Signal, "id" | "timestamp" | "thread">) => void;
  updateSignal: (id: number, updates: Partial<Signal>) => void;
  addSignalThreadMessage: (signalId: number, msg: Omit<ThreadMessage, "id" | "timestamp">) => void;
  addCase: (newCase: Omit<Case, "id">) => void;
  updateCase: (id: number, updates: Partial<Case>) => void;
  addNetworkMessage: (msg: Omit<ThreadMessage, "id" | "timestamp">) => void;
  addMessageResponse: (msgId: number, response: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    users: initialUsers,
    signals: initialSignals,
    cases: initialCases,
    networkMessages: initialNetworkMessages,
    currentUserId: null,
  });

  const setCurrentUserId = (id: string | null) => setState((s) => ({ ...s, currentUserId: id }));

  const addUser = (user: User) => setState((s) => ({ ...s, users: [...s.users, user] }));
  
  const updateUser = (id: string, updates: Partial<User>) =>
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    }));

  const addSignal = (signalInfo: Omit<Signal, "id" | "timestamp" | "thread">) => {
    setState((s) => {
      const newSignal: Signal = {
        ...signalInfo,
        id: Math.max(0, ...s.signals.map((sig) => sig.id)) + 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thread: [],
      };
      return { ...s, signals: [newSignal, ...s.signals] };
    });
  };

  const updateSignal = (id: number, updates: Partial<Signal>) =>
    setState((s) => ({
      ...s,
      signals: s.signals.map((sig) => (sig.id === id ? { ...sig, ...updates } : sig)),
    }));

  const addSignalThreadMessage = (signalId: number, msgInfo: Omit<ThreadMessage, "id" | "timestamp">) => {
    setState((s) => {
      return {
        ...s,
        signals: s.signals.map((sig) => {
          if (sig.id === signalId) {
            const newMsg: ThreadMessage = {
              ...msgInfo,
              id: Date.now(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            return { ...sig, thread: [...sig.thread, newMsg] };
          }
          return sig;
        })
      };
    });
  };

  const addCase = (caseInfo: Omit<Case, "id">) => {
    setState((s) => {
      const newCase: Case = {
        ...caseInfo,
        id: Math.max(0, ...s.cases.map((c) => c.id)) + 1,
      };
      return { ...s, cases: [newCase, ...s.cases] };
    });
  };

  const updateCase = (id: number, updates: Partial<Case>) =>
    setState((s) => ({
      ...s,
      cases: s.cases.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));

  const addNetworkMessage = (msgInfo: Omit<ThreadMessage, "id" | "timestamp">) => {
    setState((s) => {
      const newMsg: ThreadMessage = {
        ...msgInfo,
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responses: []
      };
      return { ...s, networkMessages: [...s.networkMessages, newMsg] };
    });
  };

  const addMessageResponse = (msgId: number, response: string) => {
    setState((s) => ({
      ...s,
      networkMessages: s.networkMessages.map((m) => {
        if (m.id === msgId) {
          const resps = m.responses || [];
          if (!resps.includes(response)) {
            return { ...m, responses: [...resps, response] };
          }
        }
        return m;
      })
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        setCurrentUserId,
        addUser,
        updateUser,
        addSignal,
        updateSignal,
        addSignalThreadMessage,
        addCase,
        updateCase,
        addNetworkMessage,
        addMessageResponse
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useStore must be used within an AppProvider");
  }
  return context;
}
