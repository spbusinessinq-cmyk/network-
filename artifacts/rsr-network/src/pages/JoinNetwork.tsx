import React, { useState } from "react";
import { useLocation } from "wouter";
import { useStore, CardStyle } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { IDCard } from "@/components/IDCard";

export default function JoinNetwork() {
  const [, setLocation] = useLocation();
  const { users, addUser, setCurrentUserId } = useStore();
  
  const [alias, setAlias] = useState("");
  const [bio, setBio] = useState("");
  const [cardStyle, setCardStyle] = useState<CardStyle>("steel");
  const [issuing, setIssuing] = useState(false);
  const [generatedUser, setGeneratedUser] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim()) return;

    const newId = `RSR-${String(Math.floor(Math.random() * 900000) + 100000)}`;
    const user = {
      id: newId,
      alias,
      role: "Viewer",
      standing: "Observer" as const,
      cardStyle,
      bio: bio || "Awaiting classification.",
      presence: "Online",
      joinDate: new Date().toISOString().split("T")[0],
    };

    setGeneratedUser(user);
    setIssuing(true);

    setTimeout(() => {
      addUser(user);
      setCurrentUserId(user.id);
      setLocation("/identity");
    }, 2500);
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
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-zinc-800 bg-zinc-950/80 p-8 z-10 backdrop-blur-sm"
      >
        <div className="flex justify-center mb-8">
          <Shield className="w-10 h-10 text-zinc-700" />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-xl font-medium tracking-[0.2em] uppercase text-zinc-100 mb-2">Network Access</h1>
          <p className="text-xs text-zinc-500 tracking-wider">Generate operator credential to proceed.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Operator Alias</label>
            <Input 
              required
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="bg-black/50 border-zinc-800 text-zinc-200 rounded-none h-12"
              placeholder="e.g. Cipher Nine"
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

          <Button type="submit" className="w-full h-12 rounded-none border-zinc-700 bg-zinc-100 text-black hover:bg-white tracking-widest uppercase font-bold mt-4">
            Initialize Access
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
