import type { MouseEvent } from "react";
import type { Item } from "../data/mockData";
import { typeColors, typeIcons } from "../data/mockData";

interface MapViewProps {
  items: Item[];
  onPinClick?: (item: Item) => void;
  targetItem?: Item | null;
  showNavPath?: boolean;
  navProgress?: number;
  currentPos?: { x: number; y: number };
  interactive?: boolean;
  onMapTap?: (x: number, y: number) => void;
}

const CURRENT_POS = { x: 225, y: 450 };

export function MapView({
  items,
  onPinClick,
  targetItem,
  showNavPath = false,
  navProgress = 0,
  currentPos,
  interactive = true,
  onMapTap,
}: MapViewProps) {
  const pos = currentPos ?? CURRENT_POS;

  const handleSvgClick = (e: MouseEvent<SVGSVGElement>) => {
    if (!onMapTap) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = 390 / rect.width;
    const scaleY = 860 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    onMapTap(Math.round(x), Math.round(y));
  };

  return (
    <svg
      viewBox="0 0 390 860"
      className="w-full h-full"
      style={{ background: "#f6f7f9" }}
      onClick={handleSvgClick}
    >
      {/* Subtle dot grid */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="0.8" fill="#d8dce6" />
        </pattern>
        <filter id="pin-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.15" />
        </filter>
      </defs>
      <rect width="390" height="860" fill="url(#grid)" />

      {/* ── Floor plan ── */}
      {/* Outer building shell */}
      <rect x="28" y="80" width="334" height="752" rx="3"
        fill="white" stroke="#c4c9d8" strokeWidth="2.5" />

      {/* Vertical spine wall */}
      <line x1="174" y1="80" x2="174" y2="832" stroke="#c4c9d8" strokeWidth="1.8" />

      {/* Horizontal floor dividers */}
      <line x1="28" y1="260" x2="362" y2="260" stroke="#c4c9d8" strokeWidth="1.8" />
      <line x1="28" y1="460" x2="362" y2="460" stroke="#c4c9d8" strokeWidth="1.8" />
      <line x1="28" y1="640" x2="362" y2="640" stroke="#c4c9d8" strokeWidth="1.8" />

      {/* Door breaks in walls */}
      <rect x="174" y="328" width="32" height="3" fill="white" />
      <path d="M174 328 Q190 312 206 328" fill="none" stroke="#b0b8cc" strokeWidth="1" />
      <rect x="174" y="520" width="32" height="3" fill="white" />
      <path d="M174 520 Q190 504 206 520" fill="none" stroke="#b0b8cc" strokeWidth="1" />
      <rect x="174" y="706" width="32" height="3" fill="white" />
      <path d="M174 706 Q190 690 206 706" fill="none" stroke="#b0b8cc" strokeWidth="1" />

      {/* Door in outer wall (bottom) */}
      <rect x="175" y="829" width="44" height="3" fill="white" />
      <path d="M175 832 Q197 808 219 832" fill="none" stroke="#b0b8cc" strokeWidth="1" />

      {/* ── Room A (top-left): Kitchen / Utility ── */}
      {/* Counter L-shape */}
      <rect x="34" y="86" width="80" height="18" rx="1" fill="#eef0f5" stroke="#c4c9d8" strokeWidth="1" />
      <rect x="34" y="86" width="18" height="60" rx="1" fill="#eef0f5" stroke="#c4c9d8" strokeWidth="1" />
      {/* Sink */}
      <rect x="52" y="89" width="22" height="12" rx="2" fill="none" stroke="#b0b8cc" strokeWidth="1" />
      <circle cx="63" cy="95" r="2" fill="#b0b8cc" />
      {/* Hatch on counter */}
      {[0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72].map((x) => (
        <line key={x} x1={34 + x} y1="86" x2={34 + x} y2="104" stroke="#d4d8e4" strokeWidth="0.5" />
      ))}

      {/* ── Room B (top-right): Bathroom ── */}
      <rect x="190" y="86" width="90" height="90" rx="1" fill="#f3f4f8" stroke="#c4c9d8" strokeWidth="1" />
      {/* Toilet */}
      <ellipse cx="230" cy="100" rx="14" ry="10" fill="none" stroke="#b0b8cc" strokeWidth="1" />
      <rect x="218" y="88" width="24" height="10" rx="2" fill="none" stroke="#b0b8cc" strokeWidth="1" />
      {/* Bathtub */}
      <rect x="196" y="122" width="78" height="50" rx="8" fill="none" stroke="#b0b8cc" strokeWidth="1" />
      <ellipse cx="235" cy="147" rx="26" ry="16" fill="none" stroke="#c4c9d8" strokeWidth="0.8" strokeDasharray="2 2" />

      {/* Stair block (top-right corner) */}
      <rect x="288" y="86" width="68" height="100" fill="#eef0f5" stroke="#c4c9d8" strokeWidth="1" />
      {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((y) => (
        <line key={y} x1="288" y1={86 + y} x2="356" y2={86 + y} stroke="#c4c9d8" strokeWidth="0.7" />
      ))}
      <text x="322" y="142" textAnchor="middle" fontSize="8" fill="#9ca3b0" fontFamily="Nunito Sans, sans-serif" letterSpacing="1">STAIR</text>

      {/* ── Room C (mid-left): Living ── */}
      {/* Sofa */}
      <rect x="36" y="282" width="110" height="50" rx="6" fill="#eef0f5" stroke="#c4c9d8" strokeWidth="1" />
      <rect x="42" y="288" width="98" height="34" rx="4" fill="#e4e7f0" stroke="#c4c9d8" strokeWidth="0.8" />
      {/* Coffee table */}
      <rect x="60" y="348" width="60" height="35" rx="3" fill="none" stroke="#c4c9d8" strokeWidth="1" />

      {/* ── Room D (mid-right): Office / Desk ── */}
      <rect x="192" y="280" width="90" height="50" rx="2" fill="none" stroke="#c4c9d8" strokeWidth="1" />
      <rect x="196" y="284" width="82" height="40" rx="1" fill="#eef0f5" />
      {/* Monitor stand */}
      <line x1="237" y1="284" x2="237" y2="324" stroke="#c4c9d8" strokeWidth="0.8" />
      {/* Chair */}
      <circle cx="237" cy="430" r="22" fill="none" stroke="#c4c9d8" strokeWidth="1" />
      <circle cx="237" cy="430" r="15" fill="#f3f4f8" stroke="#c4c9d8" strokeWidth="0.8" />

      {/* ── Room E (lower-left) ── */}
      <rect x="36" y="480" width="125" height="145" rx="2" fill="#fafafa" stroke="#d8dce6" strokeWidth="0.8" strokeDasharray="4 3" />
      <text x="98" y="560" textAnchor="middle" fontSize="9" fill="#b0b8cc" fontFamily="Nunito Sans, sans-serif" letterSpacing="1.5">ZONE E</text>

      {/* ── Room F (lower-right) ── */}
      <rect x="184" y="480" width="170" height="145" rx="2" fill="#fafafa" stroke="#d8dce6" strokeWidth="0.8" strokeDasharray="4 3" />
      {/* Bed */}
      <rect x="198" y="494" width="70" height="110" rx="4" fill="none" stroke="#c4c9d8" strokeWidth="1" />
      <rect x="198" y="494" width="70" height="28" rx="4" fill="#eef0f5" stroke="#c4c9d8" strokeWidth="1" />
      <ellipse cx="233" cy="552" rx="20" ry="26" fill="#f3f4f8" stroke="#c4c9d8" strokeWidth="0.8" />

      {/* ── Bottom rooms ── */}
      <rect x="36" y="660" width="125" height="162" rx="2" fill="#fafafa" stroke="#d8dce6" strokeWidth="0.8" strokeDasharray="4 3" />
      <text x="98" y="745" textAnchor="middle" fontSize="9" fill="#b0b8cc" fontFamily="Nunito Sans, sans-serif" letterSpacing="1.5">ZONE G</text>

      <rect x="184" y="660" width="170" height="162" rx="2" fill="#fafafa" stroke="#d8dce6" strokeWidth="0.8" strokeDasharray="4 3" />
      <text x="269" y="745" textAnchor="middle" fontSize="9" fill="#b0b8cc" fontFamily="Nunito Sans, sans-serif" letterSpacing="1.5">ZONE H</text>

      {/* ── Dimension annotations ── */}
      <line x1="40" y1="72" x2="355" y2="72" stroke="#b0b8cc" strokeWidth="0.7" />
      <line x1="40" y1="68" x2="40" y2="76" stroke="#b0b8cc" strokeWidth="0.7" />
      <line x1="355" y1="68" x2="355" y2="76" stroke="#b0b8cc" strokeWidth="0.7" />
      <text x="197" y="69" textAnchor="middle" fontSize="7.5" fill="#b0b8cc" fontFamily="Nunito Sans, sans-serif" letterSpacing="0.8">10 000</text>

      <line x1="14" y1="90" x2="14" y2="825" stroke="#b0b8cc" strokeWidth="0.7" />
      <line x1="10" y1="90" x2="18" y2="90" stroke="#b0b8cc" strokeWidth="0.7" />
      <line x1="10" y1="825" x2="18" y2="825" stroke="#b0b8cc" strokeWidth="0.7" />
      <text x="10" y="460" textAnchor="middle" fontSize="7.5" fill="#b0b8cc" fontFamily="Nunito Sans, sans-serif" letterSpacing="0.8"
        transform="rotate(-90 10 460)">28 800</text>

      {/* Room labels */}
      <text x="100" y="215" textAnchor="middle" fontSize="8.5" fill="#c4c9d8" fontFamily="Nunito Sans, sans-serif" fontWeight="600" letterSpacing="1.5">KITCHEN</text>
      <text x="268" y="215" textAnchor="middle" fontSize="8.5" fill="#c4c9d8" fontFamily="Nunito Sans, sans-serif" fontWeight="600" letterSpacing="1.5">BATHROOM</text>
      <text x="100" y="410" textAnchor="middle" fontSize="8.5" fill="#c4c9d8" fontFamily="Nunito Sans, sans-serif" fontWeight="600" letterSpacing="1.5">LIVING ROOM</text>
      <text x="268" y="410" textAnchor="middle" fontSize="8.5" fill="#c4c9d8" fontFamily="Nunito Sans, sans-serif" fontWeight="600" letterSpacing="1.5">OFFICE</text>

      {/* Navigation path */}
      {showNavPath && targetItem && (
        <>
          <line
            x1={pos.x} y1={pos.y}
            x2={targetItem.location.x} y2={targetItem.location.y}
            stroke="#1a1f36" strokeWidth="1.8"
            strokeDasharray="7 5" opacity="0.35"
          />
          {navProgress > 0 && (
            <line
              x1={pos.x} y1={pos.y}
              x2={pos.x + (targetItem.location.x - pos.x) * navProgress}
              y2={pos.y + (targetItem.location.y - pos.y) * navProgress}
              stroke="#0052ff" strokeWidth="2.5" strokeLinecap="round"
            />
          )}
        </>
      )}

      {/* Issue/task pins */}
      {items.map((item) => (
        <g
          key={item.id}
          transform={`translate(${item.location.x}, ${item.location.y})`}
          onClick={(e) => {
            if (!interactive) return;
            e.stopPropagation();
            onPinClick?.(item);
          }}
          style={{ cursor: interactive ? "pointer" : "default" }}
          filter="url(#pin-shadow)"
        >
          <circle r="13" fill="white" />
          <circle r="11" fill={typeColors[item.type]} opacity="0.14" />
          <circle r="7" fill={typeColors[item.type]} />
          <text y="3" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold" fontFamily="Nunito Sans, sans-serif">
            {typeIcons[item.type]}
          </text>
        </g>
      ))}

      {/* Current position */}
      <g transform={`translate(${pos.x}, ${pos.y})`}>
        <circle r="20" fill="#0052ff" opacity="0.08">
          <animate attributeName="r" values="16;24;16" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.1;0.03;0.1" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle r="8" fill="#0052ff" stroke="white" strokeWidth="2.5" filter="url(#pin-shadow)" />
        <circle r="2.5" fill="white" />
      </g>
    </svg>
  );
}
