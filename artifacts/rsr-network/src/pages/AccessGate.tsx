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
  
  const [view, setView] = useState<"login" | "join">("login");
  
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

  const cardOptions: { value: CardStyle; label: string }[] = [
    { value: "obsidian", label: "Obsidian" },
    { value: "steel", label: "Steel" },
    { value: "ice", label: "Ice" },
    { value: "graphite", label: "Graphite" },
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
    <div className="min-h-screen bg-[#050607] flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:28px_28px] z-0" />
      
      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 text-emerald-500 mb-6">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-mono tracking-widest uppercase">RSR Network</span>
          </div>
          <h1 className="text-2xl font-medium tracking-[0.2em] uppercase text-zinc-100 mb-2">Network Access</h1>
          <p className="text-xs text-zinc-500 tracking-wider">Authorized personnel only.</p>
        </div>

        <div className="border border-zinc-800 bg-zinc-950/80 p-8 backdrop-blur-sm overflow-hidden relative min-h-[360px]">
          <AnimatePresence mode="wait">
            {view === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Identifier</label>
                    <Input 
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="bg-black/50 border-zinc-800 text-zinc-200 rounded-none h-12"
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

                  <div className="text-center mt-6">
                    <button 
                      type="button"
                      onClick={() => setView("join")}
                      className="text-[10px] text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors"
                    >
                      New to the network? Request Access
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
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
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Status / Bio (Optional)</label>
                    <Textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="bg-black/50 border-zinc-800 text-zinc-200 rounded-none resize-none"
                      placeholder="Current assignment or focus..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Credential Style</label>
                    <div className="grid grid-cols-2 gap-3">
                      {cardOptions.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setCardStyle(opt.value)}
                          className={`py-3 px-4 text-xs tracking-wider uppercase border transition-colors ${
                            cardStyle === opt.value 
                              ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-400" 
                              : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                          }`}
                        >
                          {opt.label}
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

                  <div className="text-center mt-6">
                    <button 
                      type="button"
                      onClick={() => setView("login")}
                      className="text-[10px] text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors"
                    >
                      Return to Authentication
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
