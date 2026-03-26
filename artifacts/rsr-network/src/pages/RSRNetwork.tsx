import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Radio,
  UserCircle2,
  FileStack,
  CheckCircle2,
  XCircle,
  Flag,
  Search,
  Plus,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RSRNetworkPrototype() {
  return (
    <div className="min-h-screen bg-[#050607] text-zinc-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none [background:repeating-linear-gradient(to_bottom,transparent_0px,transparent_3px,rgba(255,255,255,0.03)_4px)]" />
      <Prototype />
    </div>
  );
}

function Prototype() {
  const [alias, setAlias] = useState("Operator Vanta");
  const [joined, setJoined] = useState(true);
  const [cardExpanded, setCardExpanded] = useState(false);
  const [signals, setSignals] = useState([
    {
      id: 1,
      title: "Unusual procurement movement tied to downtown contract node",
      description:
        "Source points to linked vendor activity and timing overlap with public works revisions.",
      category: "Political",
      location: "Los Angeles",
      createdAt: "08:42",
      status: "UNVERIFIED",
      priority: false,
      caseRoom: "LA Investigation",
    },
    {
      id: 2,
      title: "Local demonstration permit activity increased near federal corridor",
      description:
        "Permit clustering suggests coordinated street action window later this week.",
      category: "Local",
      location: "Wilshire Corridor",
      createdAt: "07:16",
      status: "VERIFIED",
      priority: true,
      caseRoom: null,
    },
    {
      id: 3,
      title: "Regional economic pressure signal from logistics slowdown",
      description:
        "Several shipping inputs indicate soft disruption and delayed fulfillment pathing.",
      category: "Economic",
      location: "Port Node",
      createdAt: "06:29",
      status: "UNVERIFIED",
      priority: false,
      caseRoom: null,
    },
  ]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Political",
    location: "",
    link: "",
  });

  const [users, setUsers] = useState([
    {
      id: "RSR-000214",
      alias: "Operator Vanta",
      role: "Viewer",
      joinDate: "2026-03-26",
    },
    {
      id: "RSR-000103",
      alias: "Signal Echo",
      role: "Analyst",
      joinDate: "2026-03-08",
    },
    {
      id: "RSR-000021",
      alias: "Black Rail",
      role: "Admin",
      joinDate: "2026-02-14",
    },
  ]);

  const [cases, setCases] = useState([
    {
      name: "LA Investigation",
      summary:
        "Urban corruption, ownership mapping, incident clustering, and public records alignment.",
      linkedSignals: [1],
      notes: [
        "Money flow mapping in progress.",
        "FOIA targets identified.",
        "Incident packet queued for print.",
      ],
    },
    {
      name: "Federal Corridor Watch",
      summary:
        "Activity around permits, protest coordination, and escalation indicators.",
      linkedSignals: [2],
      notes: [
        "Monitor permit updates.",
        "Track organizer pattern shifts.",
      ],
    },
  ]);

  const [activeCase, setActiveCase] = useState("LA Investigation");

  const currentUser = useMemo(() => {
    const found = users.find((u) => u.alias === alias);
    if (found) return found;
    const nextId = `RSR-${String(users.length + 215).padStart(6, "0")}`;
    return { id: nextId, alias, role: "Viewer", joinDate: "2026-03-26" };
  }, [alias, users]);

  const caseSignals = useMemo(() => {
    const room = cases.find((c) => c.name === activeCase);
    if (!room) return [];
    return signals.filter((s) => room.linkedSignals.includes(s.id));
  }, [cases, signals, activeCase]);

  const submitSignal = () => {
    if (!form.title || !form.description) return;
    setSignals((prev) => [
      {
        id: prev.length + 1,
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location || "—",
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "UNVERIFIED",
        priority: false,
        caseRoom: null,
      },
      ...prev,
    ]);
    setForm({
      title: "",
      description: "",
      category: "Political",
      location: "",
      link: "",
    });
  };

  const updateSignal = (id: number, patch: Record<string, unknown>) => {
    setSignals((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const assignToCase = (id: number, caseName: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.name === caseName && !c.linkedSignals.includes(id)
          ? { ...c, linkedSignals: [...c.linkedSignals, id] }
          : c
      )
    );
    updateSignal(id, { caseRoom: caseName });
  };

  const promoteUser = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              role:
                u.role === "Viewer"
                  ? "Analyst"
                  : u.role === "Analyst"
                  ? "Admin"
                  : "Admin",
            }
          : u
      )
    );
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:px-8 md:py-10">
      <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-emerald-200/70">
            <Shield className="h-4 w-4" />
            RSR NETWORK // Controlled Intelligence Platform
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-[0.08em] text-zinc-100">
            RSR NETWORK
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
            Identity, signal submission, investigation collaboration, and
            command control in a hardened operational environment.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatusPill label="Network" value="SECURE" />
          <StatusPill label="Signals" value={String(signals.length).padStart(2, "0")} />
          <StatusPill label="Cases" value={String(cases.length).padStart(2, "0")} />
          <StatusPill label="Mode" value="LOCAL" />
        </div>
      </header>

      <Tabs defaultValue="identity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-zinc-950/70 border border-zinc-800 rounded-none p-1 h-auto">
          <TabsTrigger
            value="identity"
            className="rounded-none data-[state=active]:bg-zinc-900 data-[state=active]:text-emerald-200"
          >
            Identity
          </TabsTrigger>
          <TabsTrigger
            value="signals"
            className="rounded-none data-[state=active]:bg-zinc-900 data-[state=active]:text-emerald-200"
          >
            Signals
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="rounded-none data-[state=active]:bg-zinc-900 data-[state=active]:text-emerald-200"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="cases"
            className="rounded-none data-[state=active]:bg-zinc-900 data-[state=active]:text-emerald-200"
          >
            Cases
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="rounded-none data-[state=active]:bg-zinc-900 data-[state=active]:text-emerald-200"
          >
            God Room
          </TabsTrigger>
        </TabsList>

        {/* IDENTITY TAB */}
        <TabsContent
          value="identity"
          className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <Card className="rounded-none border-zinc-800 bg-zinc-950/70 backdrop-blur-sm shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            <CardHeader>
              <CardTitle className="text-zinc-100 tracking-[0.08em]">
                RSR Digital Credential
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Animated access card experience with controlled identity
                styling.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-[320px_1fr] items-start">
                <IDCard
                  user={currentUser}
                  expanded={cardExpanded}
                  onExpand={() => setCardExpanded((v) => !v)}
                />
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                        Alias
                      </label>
                      <Input
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                        placeholder="Enter alias"
                        className="rounded-none border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                        Access State
                      </label>
                      <div className="flex gap-2">
                        <Button
                          variant={joined ? "default" : "outline"}
                          onClick={() => setJoined(true)}
                          className="rounded-none border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-100"
                        >
                          Logged In
                        </Button>
                        <Button
                          variant={!joined ? "default" : "outline"}
                          onClick={() => setJoined(false)}
                          className="rounded-none border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300"
                        >
                          Locked
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Metric label="RSR ID" value={currentUser.id} />
                    <Metric label="Role" value={currentUser.role} />
                    <Metric label="Join Date" value={currentUser.joinDate} />
                  </div>

                  <div className="rounded-none border border-zinc-800 bg-black/40 p-4">
                    <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      Interaction
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-zinc-400">
                      <p>• Card enters with a controlled fade and 3D rise.</p>
                      <p>
                        • Cursor movement drives slight tilt for a secure
                        credential feel.
                      </p>
                      <p>• Click expands the card for a premium inspection state.</p>
                    </div>
                  </div>
                </div>
              </div>

              {!joined && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-none border border-red-950 bg-red-950/20 p-4 text-sm text-red-200"
                >
                  Access terminal locked. Credential render suspended until
                  session state is restored.
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-none border-zinc-800 bg-zinc-950/70">
            <CardHeader>
              <CardTitle className="text-zinc-100 tracking-[0.08em]">
                Identity Registry
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Minimal role-based credential roster.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between border border-zinc-800 bg-black/30 px-4 py-3"
                >
                  <div>
                    <div className="text-sm text-zinc-100">{u.alias}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {u.id} // {u.role}
                    </div>
                  </div>
                  <Badge className="rounded-none border border-emerald-900/50 bg-emerald-950/30 text-emerald-200">
                    ACTIVE
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SIGNALS TAB */}
        <TabsContent
          value="signals"
          className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <Card className="rounded-none border-zinc-800 bg-zinc-950/70">
            <CardHeader>
              <CardTitle className="text-zinc-100 tracking-[0.08em]">
                Submit Signal
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Structured intake only. No social metrics. No feed gamification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Title
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="rounded-none border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Description
                </label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="min-h-[140px] rounded-none border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Category
                  </label>
                  <Select
                    value={form.category}
                    onValueChange={(value) =>
                      setForm({ ...form, category: value })
                    }
                  >
                    <SelectTrigger className="rounded-none border-zinc-800 bg-zinc-950 text-zinc-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-zinc-800 bg-zinc-950 text-zinc-100">
                      {["Political", "Economic", "Conflict", "Local", "Other"].map(
                        (item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Location
                  </label>
                  <Input
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="rounded-none border-zinc-800 bg-zinc-950 text-zinc-100"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Link / File
                </label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="Optional reference"
                  className="rounded-none border-zinc-800 bg-zinc-950 text-zinc-100"
                />
              </div>
              <Button
                onClick={submitSignal}
                className="w-full rounded-none border border-emerald-900/50 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/30"
              >
                <Radio className="mr-2 h-4 w-4" />
                SUBMIT SIGNAL
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-none border-zinc-800 bg-zinc-950/70">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-zinc-100 tracking-[0.08em]">
                    Signal Feed
                  </CardTitle>
                  <CardDescription className="text-zinc-500">
                    Chronological controlled intake view.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 border border-zinc-800 bg-black/40 px-3 py-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                  <Search className="h-3.5 w-3.5" />
                  Intake Stream
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {signals.map((signal) => (
                <div
                  key={signal.id}
                  className="border border-zinc-800 bg-black/30 p-4 shadow-[0_0_18px_rgba(148,163,184,0.04)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-zinc-100">
                        {signal.title}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Tag>{signal.category}</Tag>
                        <Tag>{signal.createdAt}</Tag>
                        {signal.location && <Tag>{signal.location}</Tag>}
                        <Tag>{signal.status}</Tag>
                        {signal.priority && <Tag>PRIORITY</Tag>}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {signal.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROFILE TAB */}
        <TabsContent
          value="profile"
          className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <Card className="rounded-none border-zinc-800 bg-zinc-950/70">
            <CardHeader>
              <CardTitle className="text-zinc-100 tracking-[0.08em]">
                Operator Profile
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Minimal identity and activity surface.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <IDCard user={currentUser} expanded={true} onExpand={() => {}} />
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Alias" value={currentUser.alias} />
                <Metric label="RSR ID" value={currentUser.id} />
                <Metric label="Role" value={currentUser.role} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-zinc-800 bg-zinc-950/70">
            <CardHeader>
              <CardTitle className="text-zinc-100 tracking-[0.08em]">
                Submitted Signals
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Direct operator contribution log.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {signals.slice(0, 5).map((signal) => (
                <div
                  key={signal.id}
                  className="border border-zinc-800 bg-black/30 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-zinc-100">{signal.title}</div>
                    <Badge className="rounded-none border border-zinc-700 bg-zinc-900 text-zinc-300">
                      {signal.category}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                    {signal.createdAt} // {signal.status}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CASES TAB */}
        <TabsContent
          value="cases"
          className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]"
        >
          <Card className="rounded-none border-zinc-800 bg-zinc-950/70">
            <CardHeader>
              <CardTitle className="text-zinc-100 tracking-[0.08em]">
                Investigation Rooms
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Basic case structure for linked signals and controlled
                discussion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {cases.map((room) => (
                <button
                  key={room.name}
                  onClick={() => setActiveCase(room.name)}
                  className={`w-full border px-4 py-4 text-left transition ${
                    activeCase === room.name
                      ? "border-emerald-900/60 bg-emerald-950/20 shadow-[0_0_18px_rgba(16,185,129,0.06)]"
                      : "border-zinc-800 bg-black/30 hover:bg-zinc-950"
                  }`}
                >
                  <div className="text-sm text-zinc-100">{room.name}</div>
                  <div className="mt-2 text-sm leading-relaxed text-zinc-500">
                    {room.summary}
                  </div>
                </button>
              ))}
              <Button className="w-full rounded-none border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900">
                <Plus className="mr-2 h-4 w-4" />
                Create Case Room
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-none border-zinc-800 bg-zinc-950/70">
            <CardHeader>
              <CardTitle className="text-zinc-100 tracking-[0.08em]">
                {activeCase}
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Signals and structured discussion for the active investigation
                room.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Linked Signals
                </div>
                {caseSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className="border border-zinc-800 bg-black/30 p-4"
                  >
                    <div className="text-sm text-zinc-100">{signal.title}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Tag>{signal.category}</Tag>
                      <Tag>{signal.status}</Tag>
                    </div>
                    <p className="mt-3 text-sm text-zinc-400">
                      {signal.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Structured Discussion
                </div>
                {(
                  cases.find((c) => c.name === activeCase)?.notes || []
                ).map((note, idx) => (
                  <div
                    key={idx}
                    className="border border-zinc-800 bg-black/30 px-4 py-3 text-sm text-zinc-300"
                  >
                    {note}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ADMIN / GOD ROOM TAB */}
        <TabsContent value="admin" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="rounded-none border-zinc-800 bg-zinc-950/70">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-zinc-100 tracking-[0.08em]">
                      God Room // Signal Control
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                      Approve, reject, tag, prioritize, and assign case routing.
                    </CardDescription>
                  </div>
                  <Badge className="rounded-none border border-emerald-900/60 bg-emerald-950/30 text-emerald-200">
                    ADMIN ONLY
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {signals.map((signal) => (
                  <div
                    key={signal.id}
                    className="border border-zinc-800 bg-black/30 p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="text-sm text-zinc-100">
                          {signal.title}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Tag>{signal.category}</Tag>
                          <Tag>{signal.status}</Tag>
                          {signal.priority && <Tag>PRIORITY</Tag>}
                          {signal.caseRoom && <Tag>{signal.caseRoom}</Tag>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() =>
                            updateSignal(signal.id, { status: "VERIFIED" })
                          }
                          className="rounded-none border border-emerald-900/50 bg-emerald-950/30 text-emerald-200 hover:bg-emerald-900/30"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Verify
                        </Button>
                        <Button
                          onClick={() =>
                            updateSignal(signal.id, { status: "UNVERIFIED" })
                          }
                          className="rounded-none border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Unverify
                        </Button>
                        <Button
                          onClick={() =>
                            updateSignal(signal.id, {
                              priority: !signal.priority,
                            })
                          }
                          className="rounded-none border border-sky-900/40 bg-sky-950/20 text-sky-200 hover:bg-sky-900/30"
                        >
                          <Flag className="mr-2 h-4 w-4" />
                          Priority
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {cases.map((c) => (
                        <Button
                          key={c.name}
                          onClick={() => assignToCase(signal.id, c.name)}
                          className="rounded-none border border-zinc-800 bg-black/40 text-zinc-300 hover:bg-zinc-900"
                        >
                          <FileStack className="mr-2 h-4 w-4" />
                          {c.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-none border-zinc-800 bg-zinc-950/70">
                <CardHeader>
                  <CardTitle className="text-zinc-100 tracking-[0.08em]">
                    User Control
                  </CardTitle>
                  <CardDescription className="text-zinc-500">
                    Promote roles and maintain controlled access.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between border border-zinc-800 bg-black/30 px-4 py-3"
                    >
                      <div>
                        <div className="text-sm text-zinc-100">{u.alias}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                          {u.id} // {u.role}
                        </div>
                      </div>
                      <Button
                        onClick={() => promoteUser(u.id)}
                        className="rounded-none border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
                      >
                        <UserCircle2 className="mr-2 h-4 w-4" />
                        Promote
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-none border-zinc-800 bg-zinc-950/70">
                <CardHeader>
                  <CardTitle className="text-zinc-100 tracking-[0.08em]">
                    Priority Board
                  </CardTitle>
                  <CardDescription className="text-zinc-500">
                    Signals marked for elevated handling and public push
                    decisioning.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {signals.filter((s) => s.priority).length === 0 ? (
                    <div className="border border-zinc-800 bg-black/30 p-4 text-sm text-zinc-500">
                      No priority signals flagged.
                    </div>
                  ) : (
                    signals
                      .filter((s) => s.priority)
                      .map((s) => (
                        <div
                          key={s.id}
                          className="border border-emerald-900/40 bg-emerald-950/15 p-4"
                        >
                          <div className="text-sm text-zinc-100">{s.title}</div>
                          <div className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-200/80">
                            {s.category} // {s.status}
                          </div>
                        </div>
                      ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface User {
  id: string;
  alias: string;
  role: string;
  joinDate: string;
}

function IDCard({
  user,
  expanded,
  onExpand,
}: {
  user: User;
  expanded: boolean;
  onExpand: () => void;
}) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, rotateX: -8 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateY = (x / rect.width - 0.5) * 8;
        const rotateX = -((y / rect.height) - 0.5) * 8;
        setRotate({ x: rotateX, y: rotateY });
      }}
      onMouseLeave={() => setRotate({ x: 0, y: 0 })}
      whileTap={{ scale: 0.99 }}
      onClick={onExpand}
      className={`relative cursor-pointer ${
        expanded ? "w-full max-w-[420px]" : "w-full max-w-[320px]"
      }`}
      style={{ perspective: 1200 }}
    >
      <motion.div
        animate={{ rotateX: rotate.x, rotateY: rotate.y }}
        transition={{
          type: "spring",
          stiffness: 140,
          damping: 14,
          mass: 0.7,
        }}
        className={`relative overflow-hidden border border-zinc-700 bg-[linear-gradient(180deg,rgba(20,20,22,0.98),rgba(6,7,9,0.98))] p-5 shadow-[0_0_30px_rgba(125,211,252,0.08)] ${
          expanded ? "min-h-[250px]" : "min-h-[210px]"
        }`}
      >
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:18px_18px]" />
        <div className="absolute inset-[1px] border border-cyan-200/10 pointer-events-none" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.35em] text-cyan-100/70">
                RSR Network Credential
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-[0.18em] text-zinc-100">
                RSR
              </div>
            </div>
            <Shield className="h-6 w-6 text-cyan-100/70" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                Alias
              </div>
              <div className="mt-1 text-lg text-zinc-100">{user.alias}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  RSR ID
                </div>
                <div className="mt-1 text-zinc-200">{user.id}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  Role
                </div>
                <div className="mt-1 text-zinc-200">{user.role}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  Join Date
                </div>
                <div className="mt-1 text-zinc-200">{user.joinDate}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  Clearance
                </div>
                <div className="mt-1 text-cyan-100/80">Controlled</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            <span>Secure access credential</span>
            <span>{expanded ? "Expanded view" : "Tap to inspect"}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-800 bg-black/30 p-4">
      <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-sm text-zinc-100 break-all">{value}</div>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/80 px-4 py-3 min-w-[120px] shadow-[0_0_20px_rgba(16,185,129,0.04)]">
      <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-sm tracking-[0.18em] text-zinc-100">{value}</div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
      {children}
    </span>
  );
}
