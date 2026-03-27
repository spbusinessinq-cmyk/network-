import React, { useState, useEffect } from "react";
import { useStore, STANDING_DOCTRINE, CREDENTIAL_DOCTRINE } from "@/lib/store";
import { IDCard } from "@/components/IDCard";
import { StandingBadge } from "@/components/StandingBadge";
import { cn } from "@/lib/utils";

type ProfileTheme =
  | "shadow-panel"
  | "command-steel"
  | "dark-grid"
  | "tactical-mesh"
  | "cold-glass"
  | "signal-field"
  | "dark-mesh"
  | "republic-steel"
  | "black-flag";

const PROFILE_THEMES: { id: ProfileTheme; label: string; description: string; founderOnly?: boolean }[] = [
  { id: "shadow-panel",    label: "Shadow Panel",    description: "Deep absorption. Default command surface." },
  { id: "command-steel",  label: "Command Steel",   description: "Brushed authority. Hardened command surface." },
  { id: "dark-grid",      label: "Dark Grid",       description: "Precision lattice. Structural control room." },
  { id: "tactical-mesh",  label: "Tactical Mesh",   description: "Diagonal weave. Field signal environment." },
  { id: "cold-glass",     label: "Cold Glass",      description: "Ice-blue refraction. Cold analytical layer." },
  { id: "signal-field",   label: "Signal Field",    description: "Electro-pulse environment. Broadcast ready." },
  { id: "dark-mesh",      label: "Dark Mesh",       description: "Fine carbon weave. Operator-class surface." },
  { id: "republic-steel", label: "Republic Steel",  description: "Heavy industrial. Reinforced network plate." },
  { id: "black-flag",     label: "Black Flag",      description: "Monochrome standard. Founder authority mark.", founderOnly: true },
];

function getThemeHeroStyle(theme: ProfileTheme): React.CSSProperties {
  switch (theme) {
    case "shadow-panel":
      return {
        background: "linear-gradient(180deg, #020203 0%, #04050a 60%, #020203 100%)",
        boxShadow: "inset 0 0 100px rgba(0,0,0,0.7)",
      };
    case "command-steel":
      return {
        background: "linear-gradient(135deg, #0b0c0e 0%, #111316 40%, #090a0c 100%)",
        backgroundImage: "repeating-linear-gradient(to right, transparent, transparent 70px, rgba(255,255,255,0.012) 70px, rgba(255,255,255,0.012) 71px)",
      };
    case "dark-grid":
      return {
        background: "#040506",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.032) 1px, transparent 1px)",
        backgroundSize: "36px 36px, 36px 36px",
      };
    case "tactical-mesh":
      return {
        background: "#040506",
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 14px, rgba(255,255,255,0.018) 14px, rgba(255,255,255,0.018) 15px), repeating-linear-gradient(-45deg, transparent, transparent 14px, rgba(255,255,255,0.014) 14px, rgba(255,255,255,0.014) 15px)",
      };
    case "cold-glass":
      return {
        background: "linear-gradient(160deg, #040b16 0%, #050810 50%, #040507 100%)",
        backgroundImage: "radial-gradient(ellipse at 25% 50%, rgba(12,70,160,0.07) 0%, transparent 60%)",
      };
    case "signal-field":
      return {
        background: "#040506",
        backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(14,80,160,0.025) 3px, rgba(14,80,160,0.025) 4px), radial-gradient(ellipse at 70% 30%, rgba(6,160,212,0.04) 0%, transparent 50%)",
      };
    case "dark-mesh":
      return {
        background: "#030405",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(255,255,255,0.012) 6px, rgba(255,255,255,0.012) 7px), repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.008) 6px, rgba(255,255,255,0.008) 7px)",
      };
    case "republic-steel":
      return {
        background: "linear-gradient(180deg, #060708 0%, #0a0b0c 40%, #060708 100%)",
        backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 28px, rgba(255,255,255,0.015) 28px, rgba(255,255,255,0.015) 29px)",
      };
    case "black-flag":
      return {
        background: "#020203",
        backgroundImage: [
          "repeating-linear-gradient(to bottom, transparent 0px, transparent 38px, rgba(80,80,80,0.09) 38px, rgba(80,80,80,0.09) 39px, transparent 39px, transparent 77px, rgba(60,60,60,0.06) 77px, rgba(60,60,60,0.06) 78px)",
          "linear-gradient(to right, rgba(255,255,255,0.02) 0%, transparent 40%)",
        ].join(", "),
      };
    default:
      return { background: "#040506" };
  }
}

function getThemeAccentBorder(theme: ProfileTheme): string {
  switch (theme) {
    case "cold-glass":    return "border-l-sky-600/30";
    case "signal-field":  return "border-l-cyan-600/30";
    case "command-steel": return "border-l-zinc-500/30";
    case "dark-mesh":     return "border-l-zinc-600/30";
    case "republic-steel":return "border-l-zinc-700/40";
    case "black-flag":    return "border-l-zinc-500/50";
    case "tactical-mesh": return "border-l-zinc-700/30";
    default:              return "border-l-zinc-800/50";
  }
}

const THEME_KEY = "rsr_profile_theme";

export default function ProfilePage() {
  const { currentUserId, users, signals, cases } = useStore();
  const currentUser = users.find(u => u.id === currentUserId);
  const [theme, setTheme] = useState<ProfileTheme>(() => {
    return (localStorage.getItem(THEME_KEY) as ProfileTheme) || "shadow-panel";
  });
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  if (!currentUser) return null;

  const userSignals = signals.filter(s => s.submittedBy === currentUser.id);
  const leadCases = cases.filter(c => c.lead === currentUser.id);
  const credDoctrine = CREDENTIAL_DOCTRINE[currentUser.cardStyle];
  const isCommand = currentUser.standing === "Command";
  const accentBorder = getThemeAccentBorder(theme);
  const availableThemes = PROFILE_THEMES.filter(t => !t.founderOnly || isCommand);

  return (
    <div className="min-h-full flex flex-col">

      {/* HERO */}
      <div
        className={cn(
          "relative px-8 pt-10 pb-8 border-b",
          isCommand
            ? "border-b-amber-900/20 border-t-2 border-t-amber-700/30"
            : "border-b-white/[0.05] border-t border-t-white/[0.04]"
        )}
        style={getThemeHeroStyle(theme)}
      >
        {isCommand && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(180,120,10,0.04) 0%, transparent 60%)" }}
          />
        )}

        <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2">
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isCommand ? "bg-amber-500" : "bg-zinc-600")} />
              <span className="text-[9px] uppercase tracking-[0.35em] text-zinc-600 font-mono">
                {isCommand ? "Command Dossier · Backroom" : "Operator Dossier"}
              </span>
            </div>
            <h1 className={cn("text-3xl font-bold tracking-[0.06em] uppercase mb-1", isCommand ? "text-amber-400" : "text-zinc-100")}>
              {currentUser.alias}
            </h1>
            <div className="text-[10px] font-mono text-zinc-700 tracking-widest mb-4">{currentUser.id}</div>
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <StandingBadge standing={currentUser.standing} grade={currentUser.grade} />
              <span className="text-[9px] uppercase tracking-widest border border-white/[0.06] bg-black/30 text-zinc-500 px-2 py-0.5">{currentUser.cardStyle}</span>
              <span className="text-[9px] uppercase tracking-widest border border-white/[0.06] bg-black/30 text-zinc-500 px-2 py-0.5">{currentUser.accessClass} Access</span>
            </div>
            {(currentUser.statusLine || currentUser.bio) && (
              <p className={cn("text-sm max-w-lg leading-relaxed border-l-2 pl-3", isCommand ? "text-amber-200/60 border-amber-700/40" : "text-zinc-400 border-zinc-700/50")}>
                {currentUser.statusLine || currentUser.bio}
              </p>
            )}
          </div>

          <div className="shrink-0 flex flex-col items-end gap-3">
            {/* Environment picker trigger */}
            <div className="relative">
              <button
                onClick={() => setShowThemePicker(p => !p)}
                className={cn(
                  "text-[9px] uppercase tracking-[0.25em] border px-3 py-1.5 transition-colors",
                  isCommand
                    ? "border-amber-900/40 bg-amber-950/20 text-amber-600 hover:text-amber-400 hover:border-amber-800/60"
                    : "border-white/[0.07] bg-black/40 text-zinc-600 hover:text-zinc-300 hover:border-white/[0.14]"
                )}
              >
                {showThemePicker ? "Close" : `Env: ${availableThemes.find(t => t.id === theme)?.label || "—"}`}
              </button>

              {showThemePicker && (
                <div className="absolute right-0 top-full mt-1 w-60 border border-white/[0.08] bg-black/90 backdrop-blur-md shadow-2xl z-30 py-1">
                  <div className="text-[8px] uppercase tracking-[0.4em] text-zinc-700 px-3 pt-2 pb-2 border-b border-white/[0.05]">
                    Select Environment
                  </div>
                  {availableThemes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setShowThemePicker(false); }}
                      className={cn(
                        "w-full flex flex-col items-start px-3 py-2 transition-colors text-left border-l-2",
                        theme === t.id
                          ? isCommand
                            ? "border-l-amber-600 bg-amber-950/20 text-amber-400"
                            : "border-l-zinc-400 bg-white/[0.03] text-zinc-300"
                          : "border-l-transparent text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.02]"
                      )}
                    >
                      <span className="text-[10px] uppercase tracking-widest font-medium">{t.label}</span>
                      <span className="text-[9px] text-zinc-700 mt-0.5">{t.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", currentUser.presence.toUpperCase().includes("ACTIVE") ? "bg-emerald-500 animate-pulse" : "bg-zinc-600")} />
              <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">{currentUser.presence}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">

        {/* Record */}
        <div className={cn("border border-white/[0.05] bg-black/20 p-6 border-l-2", accentBorder)}>
          <h3 className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-semibold border-b border-white/[0.05] pb-2 mb-5">
            Operational Record
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-6">
            {[
              { label: "Alias",           value: currentUser.alias, className: "text-zinc-200 font-medium" },
              { label: "RSR ID",          value: currentUser.id,    className: "text-zinc-500 font-mono tracking-wider text-sm" },
              { label: "Credential",      value: credDoctrine.name, className: "text-zinc-300" },
              { label: "Standing",        value: null },
              { label: "Access Class",    value: currentUser.accessClass, className: "text-zinc-300" },
              { label: "Review Status",   value: currentUser.reviewStatus, className: "text-zinc-300" },
              { label: "Promotion",       value: currentUser.promotionStatus, className: "text-zinc-400" },
              { label: "Role",            value: currentUser.role,  className: "text-zinc-300 capitalize" },
            ].map((row) => (
              <div key={row.label}>
                <div className="text-[8px] text-zinc-700 uppercase tracking-widest mb-1">{row.label}</div>
                {row.label === "Standing"
                  ? <div className="mt-0.5"><StandingBadge standing={currentUser.standing} grade={currentUser.grade} /></div>
                  : <div className={cn("text-sm", row.className)}>{row.value || "—"}</div>
                }
              </div>
            ))}
            <div className="md:col-span-3">
              <div className="text-[8px] text-zinc-700 uppercase tracking-widest mb-1">Assignment / Bio</div>
              <div className="text-sm text-zinc-500 leading-relaxed">{currentUser.bio || "—"}</div>
            </div>
          </div>
        </div>

        {/* ID Card */}
        <div>
          <div className="text-[8px] uppercase tracking-[0.3em] text-zinc-600 mb-3 pb-2 border-b border-white/[0.05]">Identity Credential</div>
          <IDCard user={currentUser} expanded={true} />
        </div>

        {/* Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="border border-white/[0.05] bg-black/20 p-5 flex flex-col">
            <div className="flex justify-between items-baseline border-b border-white/[0.05] pb-2 mb-4">
              <h3 className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-semibold">Signal Submissions</h3>
              <span className="text-[9px] text-zinc-700 font-mono">{userSignals.length} total</span>
            </div>
            <div className="space-y-3 flex-1">
              {userSignals.length > 0 ? (
                userSignals.slice(0, 5).map(sig => (
                  <div key={sig.id} className="pb-3 border-b border-white/[0.04] last:border-0 last:pb-0">
                    <div className="text-sm text-zinc-300 line-clamp-1">{sig.title}</div>
                    <div className="text-[9px] text-zinc-600 flex justify-between mt-1">
                      <span className="font-mono">{sig.category} · {sig.timestamp}</span>
                      <span className={sig.status === "VERIFIED" ? "text-emerald-600" : "text-zinc-500"}>{sig.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-zinc-700 font-mono uppercase tracking-wider text-center py-4">No signals filed.</div>
              )}
            </div>
          </div>

          <div className="border border-white/[0.05] bg-black/20 p-5 flex flex-col">
            <div className="flex justify-between items-baseline border-b border-white/[0.05] pb-2 mb-4">
              <h3 className="text-[9px] uppercase tracking-[0.25em] text-zinc-400 font-semibold">Case Leadership</h3>
              <span className="text-[9px] text-zinc-700 font-mono">{leadCases.length} assigned</span>
            </div>
            <div className="space-y-3 flex-1">
              {leadCases.length > 0 ? (
                leadCases.map(c => (
                  <div key={c.id} className="pb-3 border-b border-white/[0.04] last:border-0 last:pb-0">
                    <div className="text-sm text-zinc-300 line-clamp-1">{c.name}</div>
                    <div className="text-[9px] text-zinc-600 flex justify-between mt-1">
                      <span className="font-mono">{c.linkedSignals.length} signals linked</span>
                      <span className={c.status === "ACTIVE" ? "text-emerald-600" : c.status === "ESCALATED" ? "text-red-600" : "text-zinc-500"}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-zinc-700 font-mono uppercase tracking-wider text-center py-4">No cases led.</div>
              )}
            </div>
          </div>
        </div>

        {isCommand && (
          <div className="border border-amber-900/20 bg-amber-950/5 p-5">
            <div className="text-[8px] uppercase tracking-[0.3em] text-amber-700 mb-3 pb-2 border-b border-amber-900/20">Command Authority</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-amber-400">{users.length}</div>
                <div className="text-[8px] text-amber-800 uppercase tracking-widest mt-1">Operators</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-400">{signals.length}</div>
                <div className="text-[8px] text-amber-800 uppercase tracking-widest mt-1">Signals</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-400">{cases.length}</div>
                <div className="text-[8px] text-amber-800 uppercase tracking-widest mt-1">Cases</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-400">{users.filter(u => u.standing === "Observer").length}</div>
                <div className="text-[8px] text-amber-800 uppercase tracking-widest mt-1">Intake</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
