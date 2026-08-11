const PALETTE = [
  ["var(--teal-strong)", "var(--teal-soft)"],
  ["var(--indigo-strong)", "var(--indigo-soft)"],
  ["var(--warning)", "var(--warning-soft)"],
  ["var(--success)", "var(--success-soft)"],
  ["var(--danger)", "var(--danger-soft)"],
];

function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?";
  const [fg, bg] = PALETTE[hashName(name || "?") % PALETTE.length];

  return (
    <div
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.38 }}
      className="flex shrink-0 items-center justify-center rounded-full font-semibold"
    >
      {initials}
    </div>
  );
}
