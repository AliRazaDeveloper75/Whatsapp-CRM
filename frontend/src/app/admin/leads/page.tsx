"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { StatusPill } from "@/components/ui/StatusPill";
import type { ChatRow, UserRow } from "@/types/admin";

export default function LeadsPage() {
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [agents, setAgents] = useState<UserRow[]>([]);

  const loadData = useCallback(() => {
    api.get<ChatRow[]>("/chats/").then((res) => setChats(res.data));
    api.get<UserRow[]>("/agents/").then((res) => setAgents(res.data));
  }, []);

  useEffect(() => {
    loadData();
    const t = setInterval(loadData, 6000);
    return () => clearInterval(t);
  }, [loadData]);

  async function assign(chatId: number, userId: string) {
    await api.post(`/chats/${chatId}/assign/`, { user_id: userId || null });
    loadData();
  }

  const unassigned = chats.filter((c) => c.status === "unassigned");

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold" style={{ color: "var(--text)" }}>
        Leads
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
        Every WhatsApp conversation that has come in, and who owns it.
      </p>

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
  agents: UserRow[];
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
