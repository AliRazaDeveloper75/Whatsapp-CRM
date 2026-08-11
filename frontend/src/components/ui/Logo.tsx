export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="WhatsApp CRM">
      <rect width="32" height="32" rx="9" fill="url(#logoGrad)" />
      <rect x="7" y="8" width="18" height="13" rx="4" fill="white" />
      <polygon points="11,21 11,26 16,21" fill="white" />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d9488" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
