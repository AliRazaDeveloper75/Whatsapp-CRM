"use client";

import { useCallback, useEffect, useState, type SubmitEvent } from "react";
import { UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { StatusPill } from "@/components/ui/StatusPill";
import type { UserRow } from "@/types/admin";

function RoleBadge({ role }: { role: "admin" | "agent" }) {
  const style =
    role === "admin"
      ? { color: "var(--indigo)", background: "var(--indigo-soft)" }
      : { color: "var(--teal-strong)", background: "var(--teal-soft)" };
  return (
    <span
      style={style}
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize"
    >
      {role}
    </span>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "agent" });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const loadUsers = useCallback(() => {
    api.get<UserRow[]>("/users/").then((res) => setUsers(res.data));
  }, []);

  useEffect(() => {
    loadUsers();
    const t = setInterval(loadUsers, 6000);
    return () => clearInterval(t);
  }, [loadUsers]);

  async function createUser(e: SubmitEvent) {
    e.preventDefault();
    setCreating(true);
    setFormError("");
    try {
      await api.post("/users/", newUser);
      setNewUser({ username: "", email: "", password: "", role: "agent" });
      loadUsers();
    } catch {
      setFormError("Could not create user — check the fields.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold" style={{ color: "var(--text)" }}>
        Total Users
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
        Every account with access to this workspace, admins included.
      </p>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div
          className="overflow-hidden rounded-2xl border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          {users.length === 0 && (
            <p className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-faint)" }}>
              No users yet.
            </p>
          )}
          {users.map((u, i) => (
            <div
              key={u.id}
              className="flex items-center gap-3 px-4 py-3"
              style={i > 0 ? { borderTop: "1px solid var(--border)" } : undefined}
            >
              <Avatar name={u.username} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>
                  {u.username}
                </p>
                <p className="truncate text-xs" style={{ color: "var(--text-faint)" }}>
                  {u.email || "no email"}
                </p>
              </div>
              <RoleBadge role={u.role} />
              <StatusPill status={u.status} />
            </div>
          ))}
        </div>

        <form
          onSubmit={createUser}
          className="h-fit rounded-2xl border p-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="mb-3 flex items-center gap-2">
            <UserPlus size={15} style={{ color: "var(--indigo)" }} />
            <p
              className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]"
              style={{ color: "var(--text-muted)" }}
            >
              Add user
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

          <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            Role
          </label>
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="mb-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--indigo)]"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>

          <input
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            className="mb-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--indigo)]"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="mb-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--indigo)]"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
          />
          <input
            placeholder="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
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
            {creating ? "Creating…" : "Create user"}
          </button>
        </form>
      </div>
    </div>
  );
}
