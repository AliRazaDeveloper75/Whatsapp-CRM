"use client";

import { useCallback, useEffect, useState, type SubmitEvent } from "react";
import { Send, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { StatusPill } from "@/components/ui/StatusPill";
import { DeliveryIcon } from "@/components/ui/DeliveryIcon";
import { formatTime } from "@/lib/format";
import type { ChatRow, ChatDetail, UserRow } from "@/types/admin";

export default function TLChatsPage() {
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [agents, setAgents] = useState<UserRow[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeChat, setActiveChat] = useState<ChatDetail | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone_number: "" });
  const [starting, setStarting] = useState(false);

  const loadChats = useCallback(() => {
    api.get<ChatRow[]>("/chats/").then((res) => {
      setChats(res.data);
      setActiveId((current) => current ?? res.data[0]?.id ?? null);
    });
  }, []);

  useEffect(() => {
    api.get<UserRow[]>("/agents/").then((res) => setAgents(res.data));
  }, []);

  const loadActive = useCallback((id: number) => {
    api.get<ChatDetail>(`/chats/${id}/`).then((res) => setActiveChat(res.data));
  }, []);

  async function reassign(userId: number | null) {
    if (!activeId) return;
    const res = await api.post<ChatRow>(`/chats/${activeId}/assign/`, { user_id: userId });
    setChats((prev) => prev.map((c) => (c.id === res.data.id ? res.data : c)));
    loadActive(activeId);
  }

  useEffect(() => {
    loadChats();
    const t = setInterval(loadChats, 6000);
    return () => clearInterval(t);
  }, [loadChats]);

  useEffect(() => {
    if (activeId === null) return;
    loadActive(activeId);
    const t = setInterval(() => loadActive(activeId), 4000);
    setChats((prev) => prev.map((c) => (c.id === activeId ? { ...c, has_unread: false } : c)));
    api.post(`/chats/${activeId}/mark_read/`).catch(() => {});
    return () => clearInterval(t);
  }, [activeId, loadActive]);

  async function startChat(e: SubmitEvent) {
    e.preventDefault();
    if (!newContact.phone_number.trim()) return;
    setStarting(true);
    try {
      const res = await api.post<ChatRow>("/chats/start/", newContact);
      setChats((prev) => [res.data, ...prev.filter((c) => c.id !== res.data.id)]);
      setActiveId(res.data.id);
      setNewContact({ name: "", phone_number: "" });
      setShowNewChat(false);
    } finally {
      setStarting(false);
    }
  }

  async function sendReply(e: SubmitEvent) {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;
    setSending(true);
    try {
      await api.post("/messages/", { chat: activeId, body: draft });
      setDraft("");
      loadActive(activeId);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold" style={{ color: "var(--text)" }}>
        Team chats
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
        Every conversation owned by you or your agents.
      </p>

      <div
        className="flex overflow-hidden rounded-2xl border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-sm)",
          height: "calc(100vh - 260px)",
          minHeight: 420,
        }}
      >
        <div className="flex w-72 shrink-0 flex-col overflow-y-auto border-r" style={{ borderColor: "var(--border)" }}>
          <div className="p-3">
            <button
              onClick={() => setShowNewChat((v) => !v)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-xs font-medium transition-colors hover:opacity-80"
              style={{ borderColor: "var(--border)", color: "var(--teal-strong)" }}
            >
              <UserPlus size={13} />
              New chat
            </button>
            {showNewChat && (
              <form onSubmit={startChat} className="mt-2 flex flex-col gap-1.5">
                <input
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Name (optional)"
                  className="w-full rounded-lg border px-3 py-1.5 text-xs outline-none focus:border-[var(--teal)]"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
                <input
                  value={newContact.phone_number}
                  onChange={(e) => setNewContact({ ...newContact, phone_number: e.target.value })}
                  placeholder="Phone number"
                  className="w-full rounded-lg border px-3 py-1.5 text-xs outline-none focus:border-[var(--teal)]"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                  required
                />
                <button
                  type="submit"
                  disabled={starting || !newContact.phone_number.trim()}
                  className="w-full rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, var(--teal), var(--indigo))" }}
                >
                  {starting ? "Starting…" : "Start chat"}
                </button>
              </form>
            )}
          </div>

          {chats.length === 0 && (
            <p className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-faint)" }}>
              No chats yet.
            </p>
          )}
          {chats.map((chat) => {
            const name = chat.lead.name || chat.lead.phone_number;
            const isActive = activeId === chat.id;
            return (
              <button
                key={chat.id}
                onClick={() => setActiveId(chat.id)}
                className="flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                style={{ background: isActive ? "var(--teal-soft)" : "transparent" }}
              >
                <Avatar name={name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium" style={{ color: "var(--text)" }}>
                    {chat.has_unread && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: "var(--teal-strong)" }}
                        title="New message"
                      />
                    )}
                    <span className="truncate">{name}</span>
                  </p>
                  <p className="truncate text-xs" style={{ color: "var(--text-faint)" }}>
                    {chat.assigned_user_username ?? "Unassigned"}
                  </p>
                </div>
                <StatusPill status={chat.status} />
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 flex-col">
          {!activeChat ? (
            <div className="flex flex-1 items-center justify-center text-sm" style={{ color: "var(--text-faint)" }}>
              Select a chat to view the conversation.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b px-5 py-3" style={{ borderColor: "var(--border)" }}>
                <Avatar name={activeChat.lead.name || activeChat.lead.phone_number} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>
                    {activeChat.lead.name || activeChat.lead.phone_number}
                  </p>
                  <p className="truncate text-xs" style={{ color: "var(--text-faint)" }}>
                    {activeChat.lead.phone_number}
                    {activeChat.assigned_user_username ? ` · assigned to ${activeChat.assigned_user_username}` : ""}
                  </p>
                </div>
                <select
                  value={activeChat.assigned_user ?? ""}
                  onChange={(e) => reassign(e.target.value ? Number(e.target.value) : null)}
                  className="rounded-lg border px-2 py-1.5 text-xs outline-none focus:border-[var(--teal)]"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                >
                  <option value="">Unassigned</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.username}
                    </option>
                  ))}
                </select>
                <StatusPill status={activeChat.status} />
              </div>

              <div
                className="flex-1 space-y-2.5 overflow-y-auto px-5 py-4"
                style={{
                  background:
                    "radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0) 0 0/18px 18px, var(--bg)",
                }}
              >
                {activeChat.messages.length === 0 && (
                  <p className="text-center text-sm" style={{ color: "var(--text-faint)" }}>
                    No messages yet.
                  </p>
                )}
                {activeChat.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.direction === "out" ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-sm rounded-2xl px-3.5 py-2.5 text-sm"
                      style={
                        m.direction === "out"
                          ? { background: "linear-gradient(135deg, var(--teal), var(--teal-strong))", color: "white" }
                          : { background: "var(--surface)", color: "var(--text)", boxShadow: "var(--shadow-sm)" }
                      }
                    >
                      <p className="leading-relaxed">{m.body}</p>
                      <div
                        className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-80"
                        style={m.direction === "in" ? { color: "var(--text-faint)" } : undefined}
                      >
                        {formatTime(m.sent_at)}
                        {m.direction === "out" && <DeliveryIcon status={m.delivery_status} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendReply} className="flex gap-2 border-t px-4 py-3" style={{ borderColor: "var(--border)" }}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Reply as team lead…"
                  className="flex-1 rounded-full border px-4 py-2.5 text-sm outline-none focus:border-[var(--teal)]"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, var(--teal), var(--indigo))" }}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
