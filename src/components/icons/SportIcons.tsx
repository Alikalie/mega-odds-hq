import { ShieldCheck, Ticket, Goal, TrendingUp, Target, Flame, Circle, Activity, Gift, Layers, History, Swords, Trophy, Crown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type P = { className?: string };

// Realistic, full-colour sport icons (brand-like artwork, colours are intrinsic to the illustration)
const Football = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <circle cx="32" cy="32" r="30" fill="#fafafa" stroke="#1f1f1f" strokeWidth="2" />
    <polygon points="32,20 43,28 39,41 25,41 21,28" fill="#1f1f1f" />
    <path d="M32 20V6M43 28l13-5M39 41l8 12M25 41l-8 12M21 28L8 23" stroke="#1f1f1f" strokeWidth="2" />
    <path d="M26 4l6 2 6-2M56 17l0 6 5 5M53 51l-6 2-2 6M19 59l-2-6-6-2M3 28l5-5 0-6" fill="none" stroke="#1f1f1f" strokeWidth="2" />
  </svg>
);

const Basketball = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <defs>
      <radialGradient id="bb" cx="35%" cy="30%" r="75%">
        <stop offset="0" stopColor="#ffa24c" />
        <stop offset="1" stopColor="#d9570f" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="url(#bb)" stroke="#3a1a05" strokeWidth="2" />
    <path d="M2 32h60M32 2v60" stroke="#3a1a05" strokeWidth="2" />
    <path d="M11 11c8 7 8 35 0 42M53 11c-8 7-8 35 0 42" fill="none" stroke="#3a1a05" strokeWidth="2" />
  </svg>
);

const Trophy3D = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <path d="M18 8h28v14a14 14 0 0 1-28 0z" fill="#f5c542" stroke="#9a6b00" strokeWidth="2" />
    <path d="M18 12H9c0 10 5 14 11 15M46 12h9c0 10-5 14-11 15" fill="none" stroke="#9a6b00" strokeWidth="3" />
    <rect x="28" y="36" width="8" height="10" fill="#e0a800" />
    <rect x="20" y="46" width="24" height="8" rx="2" fill="#7a4a12" />
    <rect x="16" y="54" width="32" height="4" rx="1" fill="#5a350c" />
  </svg>
);

const Whistle = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <circle cx="24" cy="38" r="16" fill="#c0c7cf" stroke="#4b5563" strokeWidth="2" />
    <path d="M30 24h28v12H38" fill="#aab3bd" stroke="#4b5563" strokeWidth="2" />
    <circle cx="24" cy="38" r="5" fill="#4b5563" />
  </svg>
);

const GoalNet = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <rect x="6" y="14" width="52" height="34" fill="none" stroke="#f5f5f5" strokeWidth="4" />
    <path d="M6 22h52M6 30h52M6 38h52M14 14v34M22 14v34M30 14v34M38 14v34M46 14v34M54 14v34" stroke="#9ca3af" strokeWidth="1" />
    <rect x="2" y="48" width="60" height="4" fill="#16a34a" />
  </svg>
);

const Hoop = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <rect x="12" y="4" width="40" height="26" rx="2" fill="#f5f5f5" stroke="#374151" strokeWidth="2" />
    <rect x="24" y="12" width="16" height="12" fill="none" stroke="#dc2626" strokeWidth="2" />
    <ellipse cx="32" cy="32" rx="13" ry="3" fill="none" stroke="#ea580c" strokeWidth="3" />
    <path d="M20 33l4 20M44 33l-4 20M26 34l2 19M38 34l-2 19M32 35v18M22 42h20M24 50h16" stroke="#e5e7eb" strokeWidth="1.2" />
  </svg>
);

const Jersey = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <path d="M22 6l-16 8 6 14 6-3v33h28V25l6 3 6-14-16-8c-2 5-6 7-10 7s-8-2-10-7z" fill="#16a34a" stroke="#064e1f" strokeWidth="2" />
    <text x="32" y="46" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#fff">10</text>
  </svg>
);

const Stadium = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <ellipse cx="32" cy="38" rx="28" ry="16" fill="#6b7280" />
    <ellipse cx="32" cy="38" rx="20" ry="10" fill="#22c55e" />
    <path d="M32 28v20M12 38h40" stroke="#f0fdf4" strokeWidth="1" />
    <path d="M8 12v18M56 12v18" stroke="#374151" strokeWidth="2" />
    <rect x="4" y="8" width="8" height="5" fill="#fde047" /><rect x="52" y="8" width="8" height="5" fill="#fde047" />
  </svg>
);

const Cards = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <rect x="12" y="10" width="22" height="32" rx="3" fill="#facc15" transform="rotate(-12 23 26)" />
    <rect x="30" y="18" width="22" height="32" rx="3" fill="#dc2626" transform="rotate(10 41 34)" />
  </svg>
);

const Medal = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <path d="M20 4h10l6 22H26zM44 4H34l-6 22h10z" fill="#2563eb" />
    <circle cx="32" cy="42" r="16" fill="#f5c542" stroke="#9a6b00" strokeWidth="2" />
    <path d="M32 33l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z" fill="#b8860b" />
  </svg>
);

export type IconOption = { key: string; label: string; group: "Football" | "Basketball" | "General"; Comp: (p: P) => JSX.Element; realistic: boolean };

const lucide = (I: LucideIcon) => ({ className }: P) => <I className={className} />;

export const ICON_OPTIONS: IconOption[] = [
  { key: "sport:football", label: "Football", group: "Football", Comp: Football, realistic: true },
  { key: "sport:goal-net", label: "Goal net", group: "Football", Comp: GoalNet, realistic: true },
  { key: "sport:jersey", label: "Jersey", group: "Football", Comp: Jersey, realistic: true },
  { key: "sport:stadium", label: "Stadium", group: "Football", Comp: Stadium, realistic: true },
  { key: "sport:cards", label: "Cards", group: "Football", Comp: Cards, realistic: true },
  { key: "sport:whistle", label: "Whistle", group: "Football", Comp: Whistle, realistic: true },
  { key: "sport:basketball", label: "Basketball", group: "Basketball", Comp: Basketball, realistic: true },
  { key: "sport:hoop", label: "Hoop", group: "Basketball", Comp: Hoop, realistic: true },
  { key: "sport:trophy", label: "Trophy", group: "General", Comp: Trophy3D, realistic: true },
  { key: "sport:medal", label: "Medal", group: "General", Comp: Medal, realistic: true },
  ...([
    ["ShieldCheck", ShieldCheck], ["Ticket", Ticket], ["Goal", Goal], ["TrendingUp", TrendingUp], ["Target", Target],
    ["Flame", Flame], ["Circle", Circle], ["Activity", Activity], ["Gift", Gift], ["Layers", Layers],
    ["History", History], ["Swords", Swords], ["Trophy", Trophy], ["Crown", Crown],
  ] as [string, LucideIcon][]).map(([key, I]) => ({ key, label: key, group: "General" as const, Comp: lucide(I), realistic: false })),
];

// Old simple icons now render as realistic artwork
const LEGACY: Record<string, string> = { Goal: "sport:football", Circle: "sport:football", Trophy: "sport:trophy", Activity: "sport:basketball" };

export const CategoryIcon = ({ icon, className, tintClass }: { icon: string; className?: string; tintClass?: string }) => {
  const opt = ICON_OPTIONS.find((o) => o.key === (LEGACY[icon] || icon)) || ICON_OPTIONS[0];
  return <opt.Comp className={cn(className, !opt.realistic && tintClass)} />;
};

export const IconPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
    {(["Football", "Basketball", "General"] as const).map((g) => (
      <div key={g}>
        <p className="text-xs font-semibold text-muted-foreground mb-1.5">{g}</p>
        <div className="grid grid-cols-5 gap-2">
          {ICON_OPTIONS.filter((o) => o.group === g).map((o) => (
            <button
              type="button"
              key={o.key}
              title={o.label}
              onClick={() => onChange(o.key)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors",
                value === o.key ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"
              )}
            >
              <o.Comp className={cn("w-8 h-8", !o.realistic && "text-primary")} />
              <span className="text-[9px] leading-tight text-center truncate w-full">{o.label}</span>
            </button>
          ))}
        </div>
      </div>
    ))}
  </div>
);
