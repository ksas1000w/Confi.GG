import { Link, useLocation } from "react-router";

function RadarLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="14" stroke="#1a2540" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="9" stroke="#1a2540" strokeWidth="1" />
      <circle cx="16" cy="16" r="4" stroke="#1a2540" strokeWidth="1" />
      <g className="radar-sweep" style={{ transformOrigin: "16px 16px" }}>
        <path d="M16 16 L16 2 A14 14 0 0 1 25 7 Z" fill="rgba(34,211,238,0.35)" />
        <line x1="16" y1="16" x2="16" y2="2" stroke="#22d3ee" strokeWidth="1.5" />
      </g>
      <circle cx="16" cy="16" r="2" fill="#22d3ee" />
      <circle cx="21" cy="11" r="1.3" fill="#34d399" />
      <circle cx="10" cy="20" r="1.3" fill="#fbbf24" />
    </svg>
  );
}

export default function AppHeader() {
  const { pathname } = useLocation();
  const link = (to: string, label: string) => (
    <Link
      key={to}
      to={to}
      className={`font-mono text-[11px] font-semibold uppercase tracking-[0.14em] px-3 py-1.5 transition-colors ${
        pathname === to
          ? "text-[#22d3ee] border-b-2 border-[#22d3ee]"
          : "text-[#7c8aa8] hover:text-[#dce4f5] border-b-2 border-transparent"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <header className="scanlines flex h-12 flex-none items-center gap-3 border-b border-[#1a2540] bg-[#0c1220] px-4">
      <RadarLogo />
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[15px] font-bold tracking-[0.08em] text-[#dce4f5]">
          PCCONFI.GG
        </span>
        <span className="micro-label hidden sm:inline">конфигуратор ПК</span>
      </div>
      <nav className="ml-6 flex items-center gap-1">
        {link("/", "Конфигуратор")}
        {link("/admin", "База данных")}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <span className="led led-accent" />
        <span className="micro-label">db online</span>
      </div>
    </header>
  );
}
