import React, { useState } from "react";
import { useLocation } from "wouter";
import { useStore, CardStyle, CREDENTIAL_DOCTRINE } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IDCard } from "@/components/IDCard";

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
      <div className="min-h-screen bg-[#050607] flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:28px_28px] z-0" />
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
    <div className="min-h-screen bg-[#050607] flex flex-col md:flex-row relative">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:28px_28px] z-0" />
      
      {/* Left Column (Hero) */}
      <div className="w-full md:w-[55%] p-8 md:p-16 flex flex-col justify-between z-10 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950/30 backdrop-blur-sm relative min-h-[50vh]">
        <div className="absolute inset-0 opacity-20 pointer-events-none [background:repeating-linear-gradient(to_bottom,transparent_0px,transparent_3px,rgba(255,255,255,0.03)_4px)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-500 mb-12">
            <Shield className="w-8 h-8" />
            <span className="text-sm font-mono tracking-widest uppercase">RSR Network</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-[0.1em] uppercase text-zinc-100 mb-8 leading-tight">
            RESTRICTED<br />SIGNAL RELAY<br />NETWORK
          </h1>
          
          <div className="space-y-3 mb-16 text-zinc-400 font-mono text-sm tracking-wide max-w-lg">
            <p>A closed-network intelligence platform for verified operators.</p>
            <p>Collect, route, and analyze signals across a structured case and command hierarchy.</p>
            <p className="text-zinc-300">Access requires authorization. Standing is earned.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs max-w-2xl">
            <div className="border border-zinc-800 bg-black/40 p-4">
              <div className="text-emerald-500 font-bold uppercase tracking-widest mb-2">SIGNALS</div>
              <div className="text-zinc-500">Observed information, categorized and submitted for review.</div>
            </div>
            <div className="border border-zinc-800 bg-black/40 p-4">
              <div className="text-emerald-500 font-bold uppercase tracking-widest mb-2">CASE ROOMS</div>
              <div className="text-zinc-500">Coordinated investigation threads across operators.</div>
            </div>
            <div className="border border-zinc-800 bg-black/40 p-4">
              <div className="text-emerald-500 font-bold uppercase tracking-widest mb-2">STANDING</div>
              <div className="text-zinc-500">Access is tiered. Operators earn standing through contribution.</div>
            </div>
            <div className="border border-amber-900/30 bg-amber-950/10 p-4">
              <div className="text-amber-500 font-bold uppercase tracking-widest mb-2">COMMAND</div>
              <div className="text-amber-500/70">Founder-class authority. Reserved. Not earned.</div>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-zinc-600 uppercase tracking-widest mt-12 relative z-10">
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
                className="space-y-6"
              >
                <button
                  onClick={() => setView("login")}
                  className="w-full text-left border border-zinc-800 bg-zinc-900/50 p-6 hover:bg-zinc-800 hover:border-zinc-700 transition-colors group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-lg font-medium tracking-[0.2em] uppercase text-zinc-100 mb-2">Existing Operator</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest">Authenticate to access network</div>
                </button>

                <button
                  onClick={() => setView("join")}
                  className="w-full text-left border border-zinc-800 bg-zinc-900/50 p-6 hover:bg-zinc-800 hover:border-zinc-700 transition-colors group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-lg font-medium tracking-[0.2em] uppercase text-zinc-100 mb-2">Request Access</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest">Submit clearance profile</div>
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
                className="border border-zinc-800 bg-zinc-950/80 p-8 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-medium tracking-[0.2em] uppercase text-zinc-100">Authenticate</h2>
                  <button onClick={() => setView("entry")} className="text-[10px] text-zinc-500 uppercase tracking-widest hover:text-zinc-300">Cancel</button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Identifier</label>
                    <Input 
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="bg-black/50 border-zinc-800 text-zinc-200 rounded-none h-12 font-mono"
                      placeholder="Enter operator alias or ID"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Passcode</label>
                    <Input 
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-black/50 border-zinc-800 text-zinc-200 rounded-none h-12 font-mono"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>

                  {loginError && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 p-3"
                    >
                      ACCESS DENIED. Credentials not recognized.
                    </motion.div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={loginLoading}
                    className="w-full h-12 rounded-none border-zinc-700 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40 hover:text-emerald-300 border border-emerald-900/50 tracking-widest uppercase font-bold mt-4 transition-colors disabled:opacity-50"
                  >
                    {loginLoading ? "AUTHENTICATING..." : "AUTHENTICATE"}
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
                className="border border-zinc-800 bg-zinc-950/80 p-8 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-medium tracking-[0.2em] uppercase text-zinc-100">Operator Onboarding</h2>
                    <p className="text-[10px] text-zinc-500 tracking-widest mt-1 uppercase">Initialize network profile</p>
                  </div>
                  <button onClick={() => setView("entry")} className="text-[10px] text-zinc-500 uppercase tracking-widest hover:text-zinc-300">Cancel</button>
                </div>

                <form onSubmit={handleJoin} className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Operator Alias</label>
                    <Input 
                      required
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      className="bg-black/50 border-zinc-800 text-zinc-200 rounded-none h-12"
                      placeholder="e.g. Cipher Nine"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Operator Statement (Optional)</label>
                    <Textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="bg-black/50 border-zinc-800 text-zinc-200 rounded-none resize-none"
                      placeholder="Current assignment or focus..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Credential Class</label>
                    <div className="grid grid-cols-1 gap-2">
                      {cardOptions.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setCardStyle(opt.value)}
                          className={`flex flex-col p-3 border transition-colors text-left ${
                            cardStyle === opt.value 
                              ? "border-emerald-500/50 bg-emerald-950/20" 
                              : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                          }`}
                        >
                          <span className={`text-xs tracking-wider uppercase ${cardStyle === opt.value ? "text-emerald-400" : "text-zinc-300"}`}>
                            {opt.label}
                          </span>
                          <span className={`text-[10px] mt-1 ${cardStyle === opt.value ? "text-emerald-500/70" : "text-zinc-600"}`}>
                            {opt.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {joinError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 p-3"
                    >
                      {joinError}
                    </motion.div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={joinLoading}
                    className="w-full h-12 rounded-none border border-zinc-700 bg-zinc-100 text-black hover:bg-white tracking-widest uppercase font-bold mt-4 transition-colors disabled:opacity-50"
                  >
                    {joinLoading ? "PROCESSING..." : "Submit Request"}
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
