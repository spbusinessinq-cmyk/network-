import React, { useMemo, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Radio,
  Radar,
  FolderOpen,
  Users,
  UserCircle,
  Shield,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { StandingBadge } from "@/components/StandingBadge";

function getPersonalizedGreeting(standing: string) {
  switch (standing) {
    case "Command": return "COMMAND ACTIVE — AUTHORITY LEVEL UNRESTRICTED";
    case "Analyst": return "ANALYST STATION — VERIFICATION ACTIVE";
    case "Operator": return "OPERATOR STATION — FIELD ACCESS ENABLED";
    case "Scout": return "SCOUT STATION — OBSERVATION ACTIVE";
    case "Observer": return "OBSERVER STATION — INTAKE MONITORING";
    default: return "OPERATOR ACTIVE";
  }
}

function formatDate(date: Date) {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const d = date.getDate().toString().padStart(2, '0');
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${d} ${m} ${y} / ${h}:${min}`;
}

export default function CommandDeckPage() {
  const { currentUserId, users, signals, cases, networkMessages } = useStore();
  const currentUser = users.find((u) => u.id === currentUserId);
  const [timeStr, setTimeStr] = useState(formatDate(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(formatDate(new Date()));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) return null;

  const isCommand = currentUser.standing === "Command";

  // Filter signals
  const prioritySignals = useMemo(() => {
    return signals
      .filter((s) => s.priority || s.status === "VERIFIED")
      .sort((a, b) => {
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        return 0;
      })
      .slice(0, 5);
  }, [signals]);

  // System Stats
  const activeSignalsCount = signals.filter(s => s.status !== "ARCHIVED").length;
  const prioritySignalsCount = signals.filter(s => s.priority).length;
  const openCasesCount = cases.filter(c => c.status === "OPEN").length;
  const activeCasesCount = cases.filter(c => c.status === "ACTIVE").length;
  const operatorsCount = users.length;

  const getSignalStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED": return "bg-emerald-500";
      case "UNVERIFIED": return "bg-amber-500";
      case "ARCHIVED": return "bg-zinc-600";
      default: return "bg-zinc-500";
    }
  };

  const getCaseStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
      case "ACTIVE": return "text-blue-400 border-blue-500/30 bg-blue-500/10";
      case "MONITORING": return "text-amber-400 border-amber-500/30 bg-amber-500/10";
      case "ESCALATED": return "text-red-400 border-red-500/30 bg-red-500/10";
      case "ARCHIVED": return "text-zinc-400 border-zinc-500/30 bg-zinc-500/10";
      default: return "text-zinc-400 border-zinc-500/30 bg-zinc-500/10";
    }
  };

  const getPresenceColor = (presence: string) => {
    const p = presence.toLowerCase();
    if (p.includes("active") || p.includes("online")) return "bg-emerald-500";
    if (p.includes("reviewing") || p.includes("room") || p.includes("progress") || p.includes("ongoing")) return "bg-amber-500";
    return "bg-zinc-500";
  };

  const getUserAlias = (id: string) => users.find(u => u.id === id)?.alias || "UNKNOWN";
  const getUserStanding = (id: string) => users.find(u => u.id === id)?.standing || "Observer";

  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-hidden max-h-[calc(100vh-3.5rem)]">
      
      {/* TOP COMMAND SUMMARY STRIP */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 border border-zinc-800 bg-zinc-950 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-sm"
      >
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.01)_50%,transparent_75%)] bg-[length:250%_250%] animate-pulse" />
        
        <div className="flex items-center gap-6 z-10 w-full md:w-auto">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-1">
              <Shield className={`w-5 h-5 ${isCommand ? 'text-amber-500' : 'text-emerald-500'}`} />
              <h1 className="text-xl font-medium tracking-[0.15em] uppercase text-zinc-100">
                Network Command Console
              </h1>
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isCommand ? 'text-amber-500' : 'text-emerald-400'}`}>
                {currentUser.alias}
              </h2>
              <span className="text-zinc-500 font-mono text-xs">ID: {currentUser.id}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <StandingBadge standing={currentUser.standing} grade={currentUser.grade} />
              <span className="text-[9px] uppercase tracking-widest text-zinc-400 border border-zinc-800 px-1.5 py-0.5 bg-black/50">
                {currentUser.cardStyle} CREDENTIAL
              </span>
              <span className="text-[9px] uppercase tracking-widest text-zinc-400 border border-zinc-800 px-1.5 py-0.5 bg-black/50">
                {currentUser.accessClass} ACCESS
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 z-10 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-zinc-300 font-mono uppercase tracking-wider">
                {currentUser.presence}
              </span>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
              {currentUser.statusLine}
            </div>
          </div>
          <div className="flex flex-col items-end justify-center ml-4 gap-1">
            <span className="text-xs font-mono tracking-widest text-zinc-400">{timeStr}</span>
            <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isCommand ? 'text-amber-500' : 'text-emerald-500/70'}`}>
              {getPersonalizedGreeting(currentUser.standing)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* MAIN GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: SIGNALS & CASES */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
          
          {/* PRIORITY SIGNALS */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 flex flex-col border border-zinc-800 bg-zinc-950/40 overflow-hidden"
          >
            <div className="shrink-0 border-b border-zinc-800 bg-black/40 p-2 px-4 flex items-center justify-between group">
              <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">Priority Signals</h2>
              <Link href="/signals" className="text-[10px] text-emerald-500 hover:text-emerald-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                → Inspect
              </Link>
            </div>
            <div className="flex-1 overflow-auto divide-y divide-zinc-800/50">
              {prioritySignals.map((signal) => (
                <div key={signal.id} className="p-3 hover:bg-zinc-900/30 transition-colors flex items-center justify-between group">
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${getSignalStatusColor(signal.status)}`} />
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-200 truncate max-w-[300px]" title={signal.title}>
                          {signal.title.length > 45 ? signal.title.slice(0, 45) + '...' : signal.title}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded-sm">
                          {signal.category}
                        </span>
                        {signal.priority && (
                          <span className="text-[9px] uppercase tracking-wider text-amber-500 border border-amber-900/50 bg-amber-950/30 px-1.5 py-0.5 rounded-sm">
                            PRIORITY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono uppercase">
                        <span>Loc: {signal.location}</span>
                        <span>•</span>
                        <span className="truncate">
                          By: {getUserAlias(signal.submittedBy)} <span className="text-zinc-600">({getUserStanding(signal.submittedBy)})</span>
                        </span>
                        {signal.caseId && (
                          <>
                            <span>•</span>
                            <span className="text-zinc-400">Case: {cases.find(c => c.id === signal.caseId)?.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                    <span className="text-[10px] text-zinc-600 font-mono">{signal.timestamp}</span>
                    <Link href="/signals" className="text-[10px] text-emerald-500 hover:text-emerald-400 uppercase tracking-widest font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Inspect <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
              {prioritySignals.length === 0 && (
                <div className="p-4 text-xs text-zinc-500 uppercase tracking-wider text-center">No priority signals detected.</div>
              )}
            </div>
          </motion.div>

          {/* ACTIVE CASES */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 flex flex-col border border-zinc-800 bg-zinc-950/40 overflow-hidden"
          >
            <div className="shrink-0 border-b border-zinc-800 bg-black/40 p-2 px-4 flex items-center justify-between group">
              <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">Active Cases</h2>
              <Link href="/cases" className="text-[10px] text-emerald-500 hover:text-emerald-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                → Enter
              </Link>
            </div>
            <div className="flex-1 overflow-auto divide-y divide-zinc-800/50">
              {cases.map((c) => (
                <div key={c.id} className="p-3 hover:bg-zinc-900/30 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border w-24 text-center shrink-0 ${getCaseStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-zinc-200">{c.name}</span>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono uppercase">
                        <span>Lead: {getUserAlias(c.lead)}</span>
                        <span>•</span>
                        <span>Sigs: <span className="text-zinc-400">{c.linkedSignals.length}</span></span>
                        <span>•</span>
                        <span>Notes: <span className="text-zinc-400">{c.notes.length}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Link href="/cases" className="text-[10px] text-emerald-500 hover:text-emerald-400 uppercase tracking-widest font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Enter <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4 overflow-hidden">
          
          {/* QUICK ACCESS */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="shrink-0 border border-zinc-800 bg-zinc-950/40 flex flex-col"
          >
            <div className="border-b border-zinc-800 bg-black/40 p-2 px-4">
              <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">Quick Access</h2>
            </div>
            <div className="p-3 flex flex-col gap-2">
              {[
                { label: "Network Room", path: "/network", icon: Radio, sub: "Live operator feed" },
                { label: "Submit Signal", path: "/signals", icon: Radar, sub: "File new intelligence" },
                { label: "Case Rooms", path: "/cases", icon: FolderOpen, sub: "Active investigations" },
                { label: "Operators", path: "/operators", icon: Users, sub: "Network personnel" },
                { label: "Dossier", path: "/profile", icon: UserCircle, sub: "Operational record" },
                ...(isCommand ? [{ label: "Command Authority", path: "/command", icon: Shield, sub: "Restricted access", isCommand: true }] : [])
              ].map((item, i) => (
                <Link key={i} href={item.path} className={`flex items-center justify-between p-2.5 border transition-all duration-200 group ${
                  item.isCommand 
                    ? "border-amber-900/30 bg-amber-950/10 hover:bg-amber-900/30 hover:border-amber-500/50 text-amber-500/80 hover:text-amber-400" 
                    : "border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/80 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200"
                }`}>
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity ${item.isCommand ? 'text-amber-500' : 'text-emerald-500'}`} />
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-widest font-medium">{item.label}</span>
                      <span className="text-[9px] uppercase text-zinc-500">{item.sub}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* PERSONNEL PRESENCE */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="flex-1 border border-zinc-800 bg-zinc-950/40 flex flex-col overflow-hidden min-h-[200px]"
          >
            <div className="shrink-0 border-b border-zinc-800 bg-black/40 p-2 px-4 flex items-center justify-between">
              <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">Personnel</h2>
              <span className="text-[10px] text-zinc-500 font-mono">[{users.length}]</span>
            </div>
            <div className="flex-1 overflow-auto p-2 flex flex-col gap-1">
              {users.map((u) => {
                const isCmd = u.standing === "Command";
                return (
                  <Link key={u.id} href={`/operators?id=${u.id}`} className={`flex items-center gap-3 p-2 bg-black/20 hover:bg-zinc-900/60 transition-colors border border-transparent cursor-pointer ${isCmd ? 'border-l-2 border-l-amber-500/40' : ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getPresenceColor(u.presence)}`} />
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium truncate ${isCmd ? 'text-amber-400/90' : 'text-zinc-300'}`}>
                          {u.alias}
                        </span>
                        <StandingBadge standing={u.standing} className="scale-75 origin-left" />
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 uppercase truncate mt-0.5">
                        <span className="text-zinc-600">{u.id}</span>
                        <span>•</span>
                        <span className="truncate">{u.presence}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* NETWORK STATUS */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="shrink-0 border border-zinc-800 bg-zinc-950/40 flex flex-col"
          >
            <div className="border-b border-zinc-800 bg-black/40 p-2 px-4 flex items-center justify-between">
              <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">Network Status</h2>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]" title="Live Refresh Active" />
            </div>
            <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500">Active Sigs</span>
                <span className="text-sm font-mono text-zinc-200">{activeSignalsCount}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500">Priority Sigs</span>
                <span className="text-sm font-mono text-emerald-400">{prioritySignalsCount}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500">Open Cases</span>
                <span className="text-sm font-mono text-zinc-200">{openCasesCount}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500">Active Cases</span>
                <span className="text-sm font-mono text-blue-400">{activeCasesCount}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500">Operators</span>
                <span className="text-sm font-mono text-zinc-200">{operatorsCount}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500">Cmd Review</span>
                <span className={`text-[10px] font-mono mt-1 ${isCommand ? 'text-amber-500' : 'text-zinc-400'}`}>
                  {isCommand ? 'ACTIVE' : 'MONITORED'}
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* BOTTOM STRIP: MISSION LOG */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="shrink-0 border border-zinc-800 bg-zinc-950/60 overflow-hidden flex"
      >
        <div className="bg-black/60 p-2 px-4 border-r border-zinc-800 flex items-center shrink-0">
          <Terminal className="w-3 h-3 text-emerald-500 mr-2" />
          <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 whitespace-nowrap">Mission Log</h2>
        </div>
        <div className="flex-1 overflow-x-auto flex items-center px-4 no-scrollbar">
          <div className="flex items-center gap-6 py-1 w-max">
            {networkMessages.slice(-5).map((msg) => (
              <div key={msg.id} className="flex items-center gap-2 text-xs font-mono shrink-0">
                <span className="text-zinc-600">{msg.timestamp}</span>
                <span className="text-zinc-400 uppercase">{getUserAlias(msg.userId)}</span>
                <span className="text-zinc-700">/</span>
                <span className="text-zinc-300">{msg.text}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </div>
  );
}
