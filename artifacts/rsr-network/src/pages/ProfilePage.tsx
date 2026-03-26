import React, { useState, useEffect } from "react";
import { useStore, STANDING_DOCTRINE, CREDENTIAL_DOCTRINE } from "@/lib/store";
import { IDCard } from "@/components/IDCard";
import { StandingBadge } from "@/components/StandingBadge";
import { cn } from "@/lib/utils";

type ProfileTheme = "dark-grid" | "tactical-mesh" | "command-steel" | "cold-glass" | "signal-field" | "shadow-panel";

const PROFILE_THEMES: { id: ProfileTheme; label: string; description: string }[] = [
  { id: "dark-grid", label: "Dark Grid", description: "Precision lattice overlay" },
  { id: "tactical-mesh", label: "Tactical Mesh", description: "Diagonal signal weave" },
  { id: "command-steel", label: "Command Steel", description: "Brushed authority surface" },
  { id: "cold-glass", label: "Cold Glass", description: "Ice-blue refraction" },
  { id: "signal-field", label: "Signal Field", description: "Electro-pulse environment" },
  { id: "shadow-panel", label: "Shadow Panel", description: "Deep absorption layer" },
];

function getThemeHeroStyle(theme: ProfileTheme): React.CSSProperties {
  switch (theme) {
    case "dark-grid":
      return {
        background: "linear-gradient(to bottom, #050607, #0a0b0d)",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "32px 32px, 32px 32px",
      };
    case "tactical-mesh":
      return {
        background: "#050607",
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(255,255,255,0.025) 12px, rgba(255,255,255,0.025) 13px), repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(255,255,255,0.02) 12px, rgba(255,255,255,0.02) 13px)",
      };
    case "command-steel":
      return {
        background: "linear-gradient(135deg, #0d0e10 0%, #141618 40%, #0a0b0d 100%)",
        backgroundImage: "repeating-linear-gradient(to right, transparent, transparent 60px, rgba(255,255,255,0.015) 60px, rgba(255,255,255,0.015) 61px)",
      };
    case "cold-glass":
      return {
        background: "linear-gradient(160deg, #050b14 0%, #060810 50%, #050607 100%)",
        backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(14,88,180,0.08) 0%, transparent 60%)",
      };
    case "signal-field":
      return {
        background: "#050607",
        backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(14,88,180,0.03) 3px, rgba(14,88,180,0.03) 4px), radial-gradient(ellipse at 70% 30%, rgba(6,182,212,0.05) 0%, transparent 50%)",
      };
    case "shadow-panel":
      return {
        background: "linear-gradient(180deg, #020203 0%, #050607 60%, #030404 100%)",
        boxShadow: "inset 0 0 120px rgba(0,0,0,0.8)",
      };
  }
}

function getThemeAccent(theme: ProfileTheme): string {
  switch (theme) {
    case "cold-glass": return "border-sky-500/40";
    case "signal-field": return "border-cyan-500/40";
    case "command-steel": return "border-zinc-500/50";
    case "tactical-mesh": return "border-zinc-600/50";
    case "shadow-panel": return "border-zinc-700/40";
    default: return "border-emerald-500/30";
  }
}

const THEME_KEY = "rsr_profile_theme";

export default function ProfilePage() {
  const { currentUserId, users, signals, cases } = useStore();
  const currentUser = users.find(u => u.id === currentUserId);
  const [theme, setTheme] = useState<ProfileTheme>(() => {
    return (localStorage.getItem(THEME_KEY) as ProfileTheme) || "dark-grid";
  });
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  if (!currentUser) return null;

  const userSignals = signals.filter(s => s.submittedBy === currentUser.id);
  const leadCases = cases.filter(c => c.lead === currentUser.id);
  const doctrine = STANDING_DOCTRINE[currentUser.standing];
  const credDoctrine = CREDENTIAL_DOCTRINE[currentUser.cardStyle];
  const isCommand = currentUser.standing === "Command";
  const accentBorder = getThemeAccent(theme);

  return (
    <div className="min-h-full flex flex-col">

      {/* HERO SECTION */}
      <div
        className={cn("relative border-b border-zinc-800 px-8 pt-10 pb-8", isCommand ? "border-t-2 border-t-amber-500/30" : `border-t-2 border-t-sky-500/20`)}
        style={getThemeHeroStyle(theme)}
      >
        <div className="absolute inset-0 pointer-events-none [background:repeating-linear-gradient(to_bottom,transparent_0px,transparent_3px,rgba(255,255,255,0.012)_4px)] opacity-40" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-6 max-w-4xl">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <div className={cn("w-2 h-2 rounded-full shrink-0", isCommand ? "bg-amber-500" : "bg-emerald-500")} />
              <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-mono">Operator Dossier</span>
            </div>
            <h1 className={cn("text-3xl font-semibold tracking-[0.08em] uppercase mb-1", isCommand ? "text-amber-400" : "text-zinc-100")}>
              {currentUser.alias}
            </h1>
            <div className="text-[10px] font-mono text-zinc-500 tracking-widest mb-4">{currentUser.id}</div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <StandingBadge standing={currentUser.standing} grade={currentUser.grade} />
              <span className="text-[9px] uppercase tracking-widest border border-zinc-800 bg-zinc-900/60 text-zinc-400 px-2 py-0.5">{currentUser.cardStyle}</span>
              <span className="text-[9px] uppercase tracking-widest border border-zinc-800 bg-zinc-900/60 text-zinc-400 px-2 py-0.5">{currentUser.accessClass} ACCESS</span>
            </div>
            <p className="text-sm text-zinc-400 max-w-lg leading-relaxed border-l-2 border-zinc-700 pl-3">
              {currentUser.statusLine || currentUser.bio || "No status line set."}
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-3">
            <button
              onClick={() => setShowThemePicker(p => !p)}
              className="text-[9px] uppercase tracking-[0.25em] border border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 px-3 py-1.5 transition-colors"
            >
              {showThemePicker ? "Close" : "Env: " + PROFILE_THEMES.find(t => t.id === theme)?.label}
            </button>
            
            {showThemePicker && (
              <div className="w-56 border border-zinc-700 bg-zinc-950/95 shadow-2xl p-3 flex flex-col gap-1">
                <div className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-2 border-b border-zinc-800 pb-2">
                  Select Environment
                </div>
                {PROFILE_THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id); setShowThemePicker(false); }}
                    className={cn(
                      "flex flex-col items-start px-3 py-2 transition-colors text-left border-l-2",
                      theme === t.id
                        ? "border-l-sky-500 bg-sky-950/20 text-sky-300"
                        : "border-l-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                    )}
                  >
                    <span className="text-[10px] uppercase tracking-widest font-medium">{t.label}</span>
                    <span className="text-[9px] text-zinc-600 mt-0.5">{t.description}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mt-auto">
              <span className={cn("w-1.5 h-1.5 rounded-full", currentUser.presence.toUpperCase().includes("ACTIVE") ? "bg-emerald-500 animate-pulse" : "bg-zinc-500")} />
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">{currentUser.presence}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6">

        {/* Operator Record Grid */}
        <div className={cn("border bg-zinc-950/50 p-6", `border-zinc-800 border-l-2 ${accentBorder}`)}>
          <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-300 font-semibold border-b border-zinc-800/50 pb-2 mb-6">Operational Record</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
            <div>
              <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Alias</div>
              <div className="text-sm text-zinc-200 font-medium">{currentUser.alias}</div>
            </div>
            <div>
              <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">RSR ID</div>
              <div className="text-sm text-zinc-400 font-mono tracking-wider">{currentUser.id}</div>
            </div>
            <div>
              <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Credential Class</div>
              <div className="text-sm text-zinc-300">{credDoctrine.name}</div>
            </div>
            <div>
              <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Standing</div>
              <div className="mt-0.5"><StandingBadge standing={currentUser.standing} grade={currentUser.grade} /></div>
            </div>
            <div>
              <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Access Class</div>
              <div className="text-sm text-zinc-300">{currentUser.accessClass}</div>
            </div>
            <div>
              <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Review Status</div>
              <div className="text-sm text-zinc-300">{currentUser.reviewStatus}</div>
            </div>
            <div>
              <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Promotion</div>
              <div className="text-sm text-zinc-300">{currentUser.promotionStatus}</div>
            </div>
            <div>
              <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Role</div>
              <div className="text-sm text-zinc-300 capitalize">{currentUser.role}</div>
            </div>
            <div className="md:col-span-3">
              <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Assignment / Bio</div>
              <div className="text-sm text-zinc-400 leading-relaxed">{currentUser.bio || "—"}</div>
            </div>
          </div>
        </div>

        {/* ID Card */}
        <div>
          <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 mb-3 border-b border-zinc-800/50 pb-2">Identity Card</div>
          <IDCard user={currentUser} expanded={true} />
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-zinc-800 bg-zinc-950/50 p-5 flex flex-col">
            <div className="flex justify-between items-baseline border-b border-zinc-800 pb-2 mb-4">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-semibold">Signal Submissions</h3>
              <span className="text-[10px] text-zinc-500 font-mono">{userSignals.length} total</span>
            </div>
            <div className="space-y-3 flex-1">
              {userSignals.length > 0 ? (
                userSignals.slice(0, 5).map(sig => (
                  <div key={sig.id} className="pb-3 border-b border-zinc-800/50 last:border-0 last:pb-0">
                    <div className="text-sm text-zinc-200 line-clamp-1">{sig.title}</div>
                    <div className="text-[10px] text-zinc-500 flex justify-between mt-1">
                      <span className="font-mono">{sig.category} · {sig.timestamp}</span>
                      <span className={sig.status === "VERIFIED" ? "text-emerald-500" : "text-sky-400"}>
                        {sig.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-zinc-600 font-mono uppercase tracking-wider text-center py-4">No signals filed.</div>
              )}
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-950/50 p-5 flex flex-col">
            <div className="flex justify-between items-baseline border-b border-zinc-800 pb-2 mb-4">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-semibold">Case Leadership</h3>
              <span className="text-[10px] text-zinc-500 font-mono">{leadCases.length} assigned</span>
            </div>
            <div className="space-y-3 flex-1">
              {leadCases.length > 0 ? (
                leadCases.map(c => (
                  <div key={c.id} className="pb-3 border-b border-zinc-800/50 last:border-0 last:pb-0">
                    <div className="text-sm text-zinc-200 line-clamp-1">{c.name}</div>
                    <div className="text-[10px] text-zinc-500 flex justify-between mt-1">
                      <span className="font-mono">{c.linkedSignals.length} signals linked</span>
                      <span className={c.status === "ACTIVE" ? "text-emerald-500" : c.status === "ESCALATED" ? "text-red-400" : "text-sky-400"}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-zinc-600 font-mono uppercase tracking-wider text-center py-4">No cases led.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
