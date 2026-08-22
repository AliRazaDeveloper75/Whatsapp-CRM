"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { formatTime } from "@/lib/format";
import type { Violation } from "@/types/admin";

const ACTION_LABELS: Record<string, string> = { copy: "Tried to copy", right_click: "Tried to right-click" };

export default function ViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([]);

  const load = useCallback(() => {
    api.get<Violation[]>("/violations/").then((res) => setViolations(res.data));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold" style={{ color: "var(--text)" }}>
        Violations
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
        Blocked copy and right-click attempts by agents and team leads.
      </p>

      <div
        className="overflow-hidden rounded-2xl border"
        style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        {violations.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-faint)" }}>
            No violations recorded — clean record so far.
          </p>
        ) : (
          violations.map((v, i) => (
            <div
              key={v.id}
              className="flex items-center gap-3 px-4 py-3"
              style={i > 0 ? { borderTop: "1px solid var(--border)" } : undefined}
            >
              <Avatar name={v.username} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>
                  {v.username}
                </p>
                <p className="truncate text-xs" style={{ color: "var(--text-faint)" }}>
                  {ACTION_LABELS[v.action] ?? v.action} on {v.path || "the app"}
                </p>
              </div>
              <p className="shrink-0 text-xs" style={{ color: "var(--text-faint)" }}>
                {formatTime(v.created_at)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
