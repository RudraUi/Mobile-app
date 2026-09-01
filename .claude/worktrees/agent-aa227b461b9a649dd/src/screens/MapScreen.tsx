import { AppHeader } from "../components/AppHeader";
import { BottomNav, type MainTab } from "../components/BottomNav";
import type { Item } from "../data/mockData";

interface MapScreenProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  onCreateClick: () => void;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  markupFilter: string;
  onFilterChange: (f: string) => void;
}

const PIN_POSITIONS: Record<string, { x: number; y: number }> = {
  "ISSUE-018": { x: 80, y: 180 },
  "ISSUE-017": { x: 220, y: 240 },
  "ISSUE-016": { x: 310, y: 320 },
  "ISSUE-015": { x: 100, y: 470 },
  "ISSUE-014": { x: 330, y: 460 },
  "RFI-001": { x: 200, y: 300 },
  "RFI-002": { x: 280, y: 480 },
  "RFI-003": { x: 150, y: 540 },
  "TASK-001": { x: 130, y: 160 },
  "TASK-002": { x: 210, y: 360 },
  "FN-001": { x: 60, y: 130 },
  "FN-002": { x: 230, y: 570 },
};

export function MapScreen({
  items,
  onItemClick,
  onCreateClick,
  activeTab,
  onTabChange,
  markupFilter,
  onFilterChange,
}: MapScreenProps) {
  const filteredItems = items.filter((item) => {
    if (markupFilter === "all") return true;
    if (markupFilter === "issue") return item.type === "issue";
    if (markupFilter === "task") return item.type === "task";
    if (markupFilter === "rfi") return item.type === "rfi";
    if (markupFilter === "fieldnote") return item.type === "fieldnote";
    return true;
  });

  const pinColor = (type: string) => {
    if (type === "issue") return "#EF4444";
    if (type === "rfi") return "#F59E0B";
    if (type === "task") return "#2451FF";
    return "#10B981";
  };

  const pinLabel = (type: string) => {
    if (type === "issue") return "!";
    if (type === "rfi") return "?";
    if (type === "task") return "T";
    return "N";
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#F6F8FF" }}>
      <AppHeader markupFilter={markupFilter} onFilterChange={onFilterChange} />
      <div className="flex-1 relative overflow-hidden">
        <svg viewBox="0 0 430 700" className="w-full h-full" style={{ background: "#F0F2F5" }}>
          {/* Background */}
          <rect width="430" height="700" fill="#F0F2F5" />

          {/* Streets */}
          <rect x="0" y="100" width="430" height="44" fill="#E8EBF0" />
          <rect x="0" y="340" width="430" height="44" fill="#E8EBF0" />
          <rect x="0" y="560" width="430" height="44" fill="#E8EBF0" />
          <rect x="80" y="0" width="44" height="700" fill="#E8EBF0" />
          <rect x="300" y="0" width="44" height="700" fill="#E8EBF0" />

          {/* Buildings */}
          <rect x="10" y="10" width="62" height="82" rx="3" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="132" y="10" width="160" height="82" rx="3" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="352" y="10" width="68" height="82" rx="3" fill="white" stroke="#C8CDD6" strokeWidth="1" />

          <rect x="10" y="152" width="62" height="180" rx="3" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="132" y="152" width="80" height="180" rx="3" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="222" y="152" width="70" height="180" rx="3" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="352" y="152" width="68" height="180" rx="3" fill="white" stroke="#C8CDD6" strokeWidth="1" />

          {/* Construction site - teal */}
          <rect x="10" y="152" width="62" height="180" rx="3" fill="none" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="132" y="152" width="160" height="80" rx="3" fill="#B2F0E8" stroke="#0D9488" strokeWidth="1.5" />
          <text x="212" y="198" textAnchor="middle" fontSize="9" fill="#0D9488" fontWeight="600" fontFamily="Inter, sans-serif">CONSTRUCTION</text>
          <text x="212" y="210" textAnchor="middle" fontSize="8" fill="#0D9488" fontFamily="Inter, sans-serif">SITE</text>

          <rect x="10" y="392" width="62" height="160" rx="3" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="132" y="392" width="160" height="160" rx="3" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="352" y="392" width="68" height="160" rx="3" fill="white" stroke="#C8CDD6" strokeWidth="1" />

          <rect x="10" y="612" width="62" height="80" rx="3" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="132" y="612" width="160" height="80" rx="3" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="352" y="612" width="68" height="80" rx="3" fill="white" stroke="#C8CDD6" strokeWidth="1" />

          {/* Street labels */}
          <text x="215" y="126" textAnchor="middle" fontSize="11" fill="#9CA3AF" fontFamily="Inter, sans-serif">Chesapeake Avenue</text>
          <text x="215" y="364" textAnchor="middle" fontSize="11" fill="#9CA3AF" fontFamily="Inter, sans-serif">Whittier Street</text>
          <text x="215" y="584" textAnchor="middle" fontSize="11" fill="#9CA3AF" fontFamily="Inter, sans-serif">Dresden Street</text>

          {/* Markup pins */}
          {filteredItems.map((item) => {
            const pos = PIN_POSITIONS[item.id] || { x: 150 + (item.location.x % 100), y: 200 + (item.location.y % 300) };
            const color = pinColor(item.type);
            return (
              <g
                key={item.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => onItemClick(item)}
                style={{ cursor: "pointer" }}
              >
                <ellipse cx="0" cy="3" rx="8" ry="4" fill="rgba(0,0,0,0.15)" />
                <path d="M0,-18 C-8,-18 -12,-10 -12,-5 C-12,3 0,12 0,12 C0,12 12,3 12,-5 C12,-10 8,-18 0,-18 Z" fill={color} />
                <text y="-3" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold" fontFamily="Inter, sans-serif">{pinLabel(item.type)}</text>
              </g>
            );
          })}

          {/* Current position */}
          <g transform="translate(212, 280)">
            <circle r="20" fill="#2451FF" opacity="0.1">
              <animate attributeName="r" values="16;24;16" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.12;0.04;0.12" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle r="8" fill="#2451FF" stroke="white" strokeWidth="2.5" />
            <circle r="2.5" fill="white" />
          </g>
        </svg>

        {/* FAB */}
        <button
          onClick={onCreateClick}
          style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#2451FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(36,81,255,0.4)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
      <BottomNav active={activeTab} onChange={onTabChange} onFabClick={onCreateClick} />
    </div>
  );
}
