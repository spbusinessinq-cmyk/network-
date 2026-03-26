import React from "react";
import { useStore } from "@/lib/store";
import { OperatorCard } from "@/components/OperatorCard";
import { Users } from "lucide-react";

export default function OperatorsPage() {
  const { users } = useStore();

  const command = users.filter(u => u.standing === "Command");
  const analysts = users.filter(u => u.standing === "Analyst");
  const field = users.filter(u => u.standing === "Scout" || u.standing === "Operator");
  const observers = users.filter(u => u.standing === "Observer");

  const Section = ({ title, ops }: { title: string, ops: typeof users }) => {
    if (ops.length === 0) return null;
    return (
      <div className="mb-10">
        <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-800 pb-2 mb-4">
          {title} <span className="text-zinc-700 ml-2 font-mono">[{ops.length}]</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ops.map(u => (
            <OperatorCard key={u.id} user={u} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-[0.1em] text-zinc-100 uppercase mb-2 flex items-center gap-3">
          <Users className="w-6 h-6 text-emerald-500" /> Personnel Roster
        </h1>
        <p className="text-sm text-zinc-500">Active intelligence network operators and their current operational standing.</p>
      </div>

      <Section title="Command Authority" ops={command} />
      <Section title="Analysis Division" ops={analysts} />
      <Section title="Field Operations" ops={field} />
      <Section title="Observers & Intake" ops={observers} />
    </div>
  );
}
