"use client";

import { useCallback, useEffect, useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { Inbox, LogOut, MessagesSquare, UserPlus, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { StatusPill } from "@/components/ui/StatusPill";
import { Logo } from "@/components/ui/Logo";

type Agent = { id: number; username: string; email: string; role: string; status: string };

type ChatRow = {
  id: number;
  lead: { id: number; name: string; phone_number: string };
  assigned_user: number | null;
  assigned_user_username: string | null;
  status: string;
};

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [newAgent, setNewAgent] = useState({ username: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
    else if (user.role !== "admin") router.push("/agent");
  }, [loading, user, router]);

  const loadData = useCallback(() => {
    api.get<ChatRow[]>("/chats/").then((res) => setChats(res.data));
    api.get<Agent[]>("/agents/").then((res) => setAgents(res.data));
  }, []);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    loadData();
    const t = setInterval(loadData, 6000);
    return () => clearInterval(t);
  }, [user, loadData]);

  async function assign(chatId: number, userId: string) {
    await api.post(`/chats/${chatId}/assign/`, { user_id: userId || null });
    loadData();
  }

  async function createAgent(e: SubmitEvent) {
    e.preventDefault();
    setCreating(true);
    setFormError("");
    try {
      await api.post("/agents/", newAgent);
      setNewAgent({ username: "", email: "", password: "" });
      loadData();
    } catch {
      setFormError("Could not create agent — check the fields.");
    } finally {
      setCreating(false);
    }
  }

  if (loading || !user || user.role !== "admin") return null;

  const unassigned = chats.filter((c) => c.status === "unassigned");
  const inProgress = chats.filter((c) => c.status === "in_progress");

  const stats = [
    { label: "Total leads", value: chats.length, icon: Inbox, color: "var(--indigo)", soft: "var(--indigo-soft)" },
    {
      label: "Unassigned",
      value: unassigned.length,
      icon: MessagesSquare,
      color: "var(--warning)",
      soft: "var(--warning-soft)",
    },
    {
      label: "Active chats",
      value: inProgress.length,
      icon: MessagesSquare,
      color: "var(--teal-strong)",
      soft: "var(--teal-soft)",
    },
    { label: "Agents", value: agents.length, icon: Users, color: "var(--success)", soft: "var(--success-soft)" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header
        className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur-sm"
        style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <div>
            <h1 className="text-base font-semibold leading-tight" style={{ color: "var(--text)" }}>
              WhatsApp CRM
            </h1>
            <p
              className="font-mono text-[10px] font-medium uppercase leading-tight tracking-[0.15em]"
              style={{ color: "var(--indigo)" }}
            >
              admin console
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:opacity-80"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border p-4"
              style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            >
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: s.soft, color: s.color }}
              >
                <s.icon size={18} />
              </div>
              <p className="text-2xl font-semibold tabular-nums" style={{ color: "var(--text)" }}>
                {s.value}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                Unassigned
              </h2>
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                {unassigned.length} waiting
              </span>
            </div>
            <div className="mb-8 flex flex-col gap-2">
              {unassigned.length === 0 && <EmptyRow text="Nothing waiting — inbox is clear." />}
              {unassigned.map((chat) => (
                <ChatRowItem key={chat.id} chat={chat} agents={agents} onAssign={assign} />
              ))}
            </div>

            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                All chats
              </h2>
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                {chats.length} total
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {chats.length === 0 && <EmptyRow text="No chats yet." />}
              {chats.map((chat) => (
                <ChatRowItem key={chat.id} chat={chat} agents={agents} onAssign={assign} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--text)" }}>
              Agents
            </h2>
            <div className="mb-4 flex flex-col gap-2">
              {agents.length === 0 && <EmptyRow text="No agents yet — add one below." />}
              {agents.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl border p-3"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
                >
                  <Avatar name={a.username} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>
                      {a.username}
                    </p>
                    <p className="truncate text-xs" style={{ color: "var(--text-faint)" }}>
                      {a.email || "no email"}
                    </p>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              ))}
            </div>

            <form
              onSubmit={createAgent}
              className="rounded-2xl border p-4"
              style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="mb-3 flex items-center gap-2">
                <UserPlus size={15} style={{ color: "var(--indigo)" }} />
                <p
                  className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  Add agent
                </p>
              </div>
              {formError && (
                <p
                  className="mb-3 rounded-lg px-2.5 py-1.5 text-xs"
                  style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
                >
                  {formError}
                </p>
              )}
              <input
                placeholder="Username"
                value={newAgent.username}
                onChange={(e) => setNewAgent({ ...newAgent, username: e.target.value })}
                className="mb-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--indigo)]"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                required
              />
              <input
                placeholder="Email"
                type="email"
                value={newAgent.email}
                onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                className="mb-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--indigo)]"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
              />
              <input
                placeholder="Password"
                type="password"
                value={newAgent.password}
                onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                className="mb-3 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--indigo)]"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                required
              />
              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-lg px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--indigo), var(--teal))", boxShadow: "var(--shadow-sm)" }}
              >
                {creating ? "Creating…" : "Create agent"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div
      className="rounded-xl border border-dashed px-4 py-6 text-center text-sm"
      style={{ borderColor: "var(--border)", color: "var(--text-faint)" }}
    >
      {text}
    </div>
  );
}

function ChatRowItem({
  chat,
  agents,
  onAssign,
}: {
  chat: ChatRow;
  agents: Agent[];
  onAssign: (chatId: number, userId: string) => void;
}) {
  const displayName = chat.lead.name || chat.lead.phone_number;
  return (
    <div
      className="flex items-center gap-3 rounded-xl border p-3"
      style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <Avatar name={displayName} size={38} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>
          {displayName}
        </p>
        <p className="truncate text-xs" style={{ color: "var(--text-faint)" }}>
          {chat.lead.phone_number}
          {chat.assigned_user_username ? ` · ${chat.assigned_user_username}` : ""}
        </p>
      </div>
      <StatusPill status={chat.status} />
      <select
        defaultValue={chat.assigned_user ?? ""}
        onChange={(e) => onAssign(chat.id, e.target.value)}
        className="rounded-lg border px-2 py-1.5 text-xs outline-none"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
      >
        <option value="">Unassigned</option>
        {agents.map((a) => (
          <option key={a.id} value={a.id}>
            {a.username}
          </option>
        ))}
      </select>
    </div>
  );
}
