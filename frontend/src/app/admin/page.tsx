"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Inbox, MessagesSquare, Users } from "lucide-react";
import { api } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { StatusPill } from "@/components/ui/StatusPill";
import type { ChatRow, UserRow } from "@/types/admin";

export default function DashboardPage() {
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);

  const loadData = useCallback(() => {
    api.get<ChatRow[]>("/chats/").then((res) => setChats(res.data));
    api.get<UserRow[]>("/users/").then((res) => setUsers(res.data));
  }, []);

  useEffect(() => {
    loadData();
    const t = setInterval(loadData, 6000);
    return () => clearInterval(t);
  }, [loadData]);

  const unassigned = chats.filter((c) => c.status === "unassigned");
  const inProgress = chats.filter((c) => c.status === "in_progress");
  const agentCount = users.filter((u) => u.role === "agent").length;

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
    { label: "Agents", value: agentCount, icon: Users, color: "var(--success)", soft: "var(--success-soft)" },
  ];

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold" style={{ color: "var(--text)" }}>
        Dashboard
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
        Overview of your WhatsApp CRM activity.
      </p>

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

      <div
        className="rounded-2xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Needs attention
          </h2>
          <Link
            href="/admin/leads"
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: "var(--indigo)" }}
          >
            View all leads <ArrowRight size={13} />
          </Link>
        </div>

        {unassigned.length === 0 ? (
          <p className="py-6 text-center text-sm" style={{ color: "var(--text-faint)" }}>
            Nothing waiting — inbox is clear.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {unassigned.slice(0, 5).map((chat) => {
              const name = chat.lead.name || chat.lead.phone_number;
              return (
                <div key={chat.id} className="flex items-center gap-3 rounded-xl px-2 py-2">
                  <Avatar name={name} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>
                      {name}
                    </p>
                    <p className="truncate text-xs" style={{ color: "var(--text-faint)" }}>
                      {chat.lead.phone_number}
                    </p>
                  </div>
                  <StatusPill status={chat.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
