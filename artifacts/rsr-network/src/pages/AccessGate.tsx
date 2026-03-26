import React, { useState } from "react";
import { useLocation } from "wouter";
import { useStore, CardStyle, CREDENTIAL_DOCTRINE } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IDCard } from "@/components/IDCard";
import { StarfieldCanvas } from "@/components/StarfieldCanvas";

export default function AccessGate() {
  const [, setLocation] = useLocation();
  const { loginUser, registerUser } = useStore();
  
  const [view, setView] = useState<"entry" | "login" | "join">("entry");
  
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [alias, setAlias] = useState("");
  const [bio, setBio] = useState("");
  const [cardStyle, setCardStyle] = useState<CardStyle>("steel");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [generatedUser, setGeneratedUser] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(false);
    setLoginLoading(true);
    try {
      const success = await loginUser(loginUsername, loginPassword);
      if (success) {
        setLocation("/");
      } else {
        setLoginError(true);
      }
    } catch {
      setLoginError(true);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim()) return;
    setJoinError("");
    setJoinLoading(true);
    try {
      const user = await registerUser(alias, bio, cardStyle);
      if (user) {
        setGeneratedUser(user);
        setIssuing(true);
        setTimeout(() => {
          setLocation("/");
        }, 2500);
      }
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setJoinLoading(false);
    }
  };

  const cardOptions: { value: CardStyle; label: string; desc: string }[] = [
    { value: "obsidian", label: "Obsidian", desc: "Low-signature field credential" },
    { value: "steel", label: "Steel", desc: "Standard operational credential" },
    { value: "ice", label: "Ice", desc: "Analysis and verification credential" },
    { value: "graphite", label: "Graphite", desc: "General network credential" },
  ];

  if (issuing && generatedUser) {
    return (
      <div className="min-h-screen bg-[#020203] flex items-center justify-center p-6 relative">
        <StarfieldCanvas />
        <div className="text-center space-y-8 z-10 w-full max-w-md">
          <div className="text-emerald-500 font-mono text-sm tracking-widest animate-pulse">
            ISSUING CREDENTIAL...
          </div>
          <div className="mx-auto w-full">
            <IDCard user={generatedUser} expanded={false} size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020203] flex flex-col md:flex-row relative">
      <StarfieldCanvas />

      {/* Left Column (Hero) */}
      <div className="w-full md:w-[55%] p-8 md:p-16 flex flex-col justify-between z-10 border-b md:border-b-0 md:border-r border-white/[0.04] backdrop-blur-sm relative min-h-[50vh]">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-zinc-600 mb-12">
            <Shield className="w-5 h-5" />
            <span className="text-[11px] font-mono tracking-widest uppercase">RSR Network</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-[0.08em] uppercase text-zinc-200 mb-8 leading-tight">
            RESTRICTED<br />SIGNAL RELAY<br />NETWORK
          </h1>

          <div className="space-y-2 mb-16 text-zinc-600 font-mono text-[12px] tracking-wide max-w-lg">
            <p>A closed-network intelligence platform for verified operators.</p>
            <p>Collect, route, and analyze signals across a structured case and command hierarchy.</p>
            <p className="text-zinc-500">Access requires authorization. Standing is earned.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs max-w-2xl">
            {[
              { label: "Signals", desc: "Observed information, categorized and submitted for review." },
              { label: "Case Rooms", desc: "Coordinated investigation threads across operators." },
              { label: "Standing", desc: "Access is tiered. Operators earn standing through contribution." },
            ].map(item => (
              <div key={item.label} className="border border-white/[0.04] bg-black/20 p-4">
                <div className="text-zinc-500 uppercase tracking-widest text-[9px] mb-1.5">{item.label}</div>
                <div className="text-zinc-700 text-[11px] leading-relaxed">{item.desc}</div>
              </div>
            ))}
            <div className="border border-amber-900/20 bg-amber-950/5 p-4">
              <div className="text-amber-700 uppercase tracking-widest text-[9px] mb-1.5">Command</div>
              <div className="text-amber-900/80 text-[11px] leading-relaxed">Founder-class authority. Reserved. Not earned.</div>
            </div>
          </div>
        </div>

        <div className="text-[9px] text-zinc-800 uppercase tracking-widest mt-12 relative z-10">
          All access is logged. All operators are accountable.
        </div>
      </div>

      {/* Right Column (Auth) */}
      <div className="w-full md:w-[45%] p-8 md:p-16 flex items-center justify-center z-10">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {view === "entry" && (
              <motion.div
                key="entry"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <button
                  onClick={() => setView("login")}
                  className="w-full text-left border border-white/[0.06] bg-black/30 backdrop-blur-sm p-6 hover:bg-white/[0.04] hover:border-white/[0.1] transition-colors group"
                >
                  <div className="text-sm font-medium tracking-[0.2em] uppercase text-zinc-300 mb-1.5">Existing Operator</div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Authenticate to access network</div>
                </button>

                <button
                  onClick={() => setView("join")}
                  className="w-full text-left border border-white/[0.06] bg-black/30 backdrop-blur-sm p-6 hover:bg-white/[0.04] hover:border-white/[0.1] transition-colors group"
                >
                  <div className="text-sm font-medium tracking-[0.2em] uppercase text-zinc-300 mb-1.5">Request Access</div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Submit clearance profile</div>
                </button>
              </motion.div>
            )}

            {view === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="border border-white/[0.06] bg-black/50 backdrop-blur-md p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-sm font-medium tracking-[0.2em] uppercase text-zinc-300">Authenticate</h2>
                  <button onClick={() => setView("entry")} className="text-[9px] text-zinc-700 uppercase tracking-widest hover:text-zinc-400 transition-colors">Cancel</button>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-2">Identifier</label>
                    <Input
                      required value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="bg-black/50 border-white/[0.07] text-zinc-300 rounded-none h-11 font-mono focus-visible:ring-0"
                      placeholder="Operator alias or ID"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-2">Passcode</label>
                    <Input
                      type="password" required value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-black/50 border-white/[0.07] text-zinc-300 rounded-none h-11 font-mono focus-visible:ring-0"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>

                  {loginError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-[10px] text-red-700 bg-red-950/20 border border-red-900/30 p-3 uppercase tracking-widest">
                      Access denied. Credentials not recognized.
                    </motion.div>
                  )}

                  <Button type="submit" disabled={loginLoading} variant="ghost"
                    className="w-full h-11 rounded-none border border-white/[0.08] text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200 tracking-widest uppercase text-[10px] mt-2 disabled:opacity-40 transition-colors">
                    {loginLoading ? "Authenticating…" : "Authenticate"}
                  </Button>
                </form>
              </motion.div>
            )}

            {view === "join" && (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="border border-white/[0.06] bg-black/50 backdrop-blur-md p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-sm font-medium tracking-[0.2em] uppercase text-zinc-300">Operator Onboarding</h2>
                    <p className="text-[9px] text-zinc-700 tracking-widest mt-1 uppercase">Initialize network profile</p>
                  </div>
                  <button onClick={() => setView("entry")} className="text-[9px] text-zinc-700 uppercase tracking-widest hover:text-zinc-400 transition-colors">Cancel</button>
                </div>

                <form onSubmit={handleJoin} className="space-y-5">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-2">Operator Alias</label>
                    <Input required value={alias} onChange={(e) => setAlias(e.target.value)}
                      className="bg-black/50 border-white/[0.07] text-zinc-300 rounded-none h-11 focus-visible:ring-0"
                      placeholder="e.g. Cipher Nine" autoComplete="off" />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-2">Statement (Optional)</label>
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)}
                      className="bg-black/50 border-white/[0.07] text-zinc-300 rounded-none resize-none focus-visible:ring-0"
                      placeholder="Current assignment or focus..." rows={3} />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-zinc-600 mb-3">Credential Class</label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {cardOptions.map(opt => (
                        <button key={opt.value} type="button" onClick={() => setCardStyle(opt.value)}
                          className={`flex flex-col p-3 border transition-colors text-left ${
                            cardStyle === opt.value
                              ? "border-white/[0.12] bg-white/[0.04]"
                              : "border-white/[0.04] bg-transparent hover:border-white/[0.07] hover:bg-white/[0.02]"
                          }`}>
                          <span className={`text-[11px] tracking-wider uppercase ${cardStyle === opt.value ? "text-zinc-200" : "text-zinc-600"}`}>
                            {opt.label}
                          </span>
                          <span className={`text-[9px] mt-0.5 ${cardStyle === opt.value ? "text-zinc-500" : "text-zinc-800"}`}>
                            {opt.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {joinError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-[10px] text-red-700 bg-red-950/20 border border-red-900/30 p-3 uppercase tracking-widest">
                      {joinError}
                    </motion.div>
                  )}

                  <Button type="submit" disabled={joinLoading} variant="ghost"
                    className="w-full h-11 rounded-none border border-white/[0.08] text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200 tracking-widest uppercase text-[10px] mt-2 disabled:opacity-40 transition-colors">
                    {joinLoading ? "Processing…" : "Submit Request"}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
