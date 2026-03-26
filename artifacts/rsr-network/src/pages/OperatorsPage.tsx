import React from "react";
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { StandingBadge } from "@/components/StandingBadge";
import { PresenceDot } from "@/components/PresenceDot";
import { cn } from "@/lib/utils";

export default function OperatorsPage() {
  const { users } = useStore();
  const [, navigate] = useLocation();

  const command = users.filter(u => u.standing === "Command");
  const analysts = users.filter(u => u.standing === "Analyst");
  const field = users.filter(u => u.standing === "Scout" || u.standing === "Operator");
  const observers = users.filter(u => u.standing === "Observer");

  const OperatorRow = ({ user }: { user: typeof users[0] }) => {
    const isCommand = user.standing === "Command";
    const isOnline = user.presence.includes("ACTIVE") || user.presence === "Online";
    return (
      <div
        onClick={() => navigate(`/operators/${user.id}`)}
        className={cn(
          "flex items-center gap-4 px-4 py-3 border border-white/[0.04] cursor-pointer transition-all group",
          isCommand
            ? "bg-amber-950/5 hover:bg-amber-950/10 hover:border-amber-900/20"
            : "bg-black/10 hover:bg-white/[0.025] hover:border-white/[0.07]"
        )}
      >
        <PresenceDot status={isOnline ? "online" : "away"} />
        <div className="flex-1 min-w-0">
          <span className={cn("text-sm tracking-wide", isCommand ? "text-amber-400" : "text-zinc-300 group-hover:text-zinc-100 transition-colors")}>
            {user.alias}
          </span>
        </div>
        <div className="text-[9px] text-zinc-700 uppercase tracking-widest hidden sm:block">{user.role}</div>
        <div className="text-[9px] text-zinc-800 font-mono hidden md:block">{user.id}</div>
        <StandingBadge standing={user.standing} grade={user.grade} />
      </div>
    );
  };

  const Section = ({ title, ops }: { title: string; ops: typeof users }) => {
    if (ops.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-[9px] uppercase tracking-[0.25em] text-zinc-700 pb-2 mb-3 flex items-center gap-2">
          <span>{title}</span>
          <span className="text-zinc-800 font-mono">[{ops.length}]</span>
        </h3>
        <div className="space-y-px">
          {ops.map(u => <OperatorRow key={u.id} user={u} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto rsr-scroll">
      <div className="mb-8">
        <h1 className="text-lg font-medium tracking-[0.15em] text-zinc-300 uppercase mb-1">Personnel Roster</h1>
        <p className="text-xs text-zinc-700">Active intelligence network operators and their current standing.</p>
      </div>

      <Section title="Command Authority" ops={command} />
      <Section title="Analysis Division" ops={analysts} />
      <Section title="Field Operations" ops={field} />
      <Section title="Observers & Intake" ops={observers} />
    </div>
  );
}
