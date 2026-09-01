import { useState, useRef, useCallback } from "react";
import { BottomNav, type MainTab } from "../components/BottomNav";
import { MapView } from "../components/MapView";
import type { Item } from "../data/mockData";

interface SplitViewScreenProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  onCreateClick: () => void;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  markupFilter: string;
  onFilterChange: (f: string) => void;
}

type PanelType = "drawing" | "3d" | "map" | "drone" | "walkthrough";

const PANEL_OPTIONS: { id: PanelType; label: string }[] = [
  { id: "drawing", label: "Drawing" },
  { id: "3d", label: "3D" },
  { id: "map", label: "Map" },
  { id: "drone", label: "Drone" },
  { id: "walkthrough", label: "Walkthrough" },
];

const BG_IMAGES: Record<string, string> = {
  "3d": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=860&h=400&fit=crop",
  drone: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=860&h=400&fit=crop",
  walkthrough: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=860&h=400&fit=crop",
};

function PanelContent({ type, items, onItemClick }: { type: PanelType; items: Item[]; onItemClick: (item: Item) => void }) {
  if (type === "drawing") {
    return (
      <div className="w-full h-full">
        <MapView items={items} onPinClick={onItemClick} />
      </div>
    );
  }
  if (type === "map") {
    return (
      <div className="w-full h-full" style={{ backgroundColor: "#F0F2F5", position: "relative" }}>
        <svg viewBox="0 0 430 300" className="w-full h-full">
          <rect width="430" height="300" fill="#F0F2F5" />
          <rect x="0" y="60" width="430" height="30" fill="#E8EBF0" />
          <rect x="0" y="180" width="430" height="30" fill="#E8EBF0" />
          <rect x="80" y="0" width="30" height="300" fill="#E8EBF0" />
          <rect x="280" y="0" width="30" height="300" fill="#E8EBF0" />
          <rect x="5" y="5" width="70" height="48" rx="2" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="120" y="5" width="150" height="48" rx="2" fill="#B2F0E8" stroke="#0D9488" strokeWidth="1" />
          <rect x="320" y="5" width="105" height="48" rx="2" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="5" y="100" width="70" height="72" rx="2" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="120" y="100" width="150" height="72" rx="2" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="320" y="100" width="105" height="72" rx="2" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="5" y="220" width="70" height="74" rx="2" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="120" y="220" width="150" height="74" rx="2" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <rect x="320" y="220" width="105" height="74" rx="2" fill="white" stroke="#C8CDD6" strokeWidth="1" />
          <text x="215" y="79" textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="Inter, sans-serif">Chesapeake Avenue</text>
          <text x="215" y="198" textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="Inter, sans-serif">Whittier Street</text>
          {items.slice(0, 3).map((item, i) => {
            const positions = [{ x: 180, y: 130 }, { x: 300, y: 50 }, { x: 100, y: 240 }];
            const pos = positions[i] || { x: 150, y: 150 };
            const color = item.type === "issue" ? "#EF4444" : item.type === "rfi" ? "#F59E0B" : "#2451FF";
            return (
              <g key={item.id} transform={`translate(${pos.x}, ${pos.y})`} onClick={() => onItemClick(item)} style={{ cursor: "pointer" }}>
                <circle r="10" fill="white" stroke={color} strokeWidth="1.5" />
                <circle r="6" fill={color} />
              </g>
            );
          })}
        </svg>
      </div>
    );
  }
  const bgUrl = BG_IMAGES[type] || BG_IMAGES["3d"];
  return (
    <div
      className="w-full h-full"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.15)" }} />
      {items.slice(0, 2).map((item, i) => {
        const positions = [{ x: "30%", y: "35%" }, { x: "65%", y: "55%" }];
        const pos = positions[i];
        const color = item.type === "issue" ? "#EF4444" : item.type === "rfi" ? "#F59E0B" : "#2451FF";
        return (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50% 50% 50% 0",
                transform: "rotate(-45deg)",
                backgroundColor: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ transform: "rotate(45deg)", color: "white", fontSize: "10px", fontWeight: 700 }}>
                {item.type === "issue" ? "!" : item.type === "rfi" ? "?" : "T"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: 600,
        fontFamily: "Inter, sans-serif",
        backgroundColor: active ? "#2451FF" : "#F0F4FF",
        color: active ? "white" : "#6C7B95",
      }}
    >
      {label}
    </button>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: "42px",
        height: "24px",
        borderRadius: "12px",
        backgroundColor: on ? "#2451FF" : "#D1D5DB",
        position: "relative",
        transition: "background-color 200ms",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "2px",
          left: on ? "18px" : "2px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "white",
          transition: "left 200ms",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

export function SplitViewScreen({
  items,
  onItemClick,
  onCreateClick,
  activeTab,
  onTabChange,
  markupFilter,
  onFilterChange,
}: SplitViewScreenProps) {
  const [splitPos, setSplitPos] = useState(0.5);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [panelA, setPanelA] = useState<PanelType>("drawing");
  const [panelB, setPanelB] = useState<PanelType>("3d");
  const [showIssues, setShowIssues] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [showRfis, setShowRfis] = useState(true);
  const [showFieldNotes, setShowFieldNotes] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const filteredItems = items.filter((item) => {
    if (item.type === "issue" && !showIssues) return false;
    if (item.type === "task" && !showTasks) return false;
    if (item.type === "rfi" && !showRfis) return false;
    if (item.type === "fieldnote" && !showFieldNotes) return false;
    return true;
  });

  const handleDividerMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    draggingRef.current = true;

    const onMove = (ev: MouseEvent | TouchEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientY = "touches" in ev ? ev.touches[0].clientY : (ev as MouseEvent).clientY;
      const relY = clientY - rect.top;
      const fraction = Math.min(Math.max(relY / rect.height, 0.2), 0.8);
      setSplitPos(fraction);
    };

    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
  }, []);

  const mapHeight = `calc(100% - 83px)`;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#F6F8FF" }}>
      {/* Split content area */}
      <div ref={containerRef} style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        {/* Panel A */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: `${splitPos * 100}%`,
            overflow: "hidden",
          }}
        >
          <PanelContent type={panelA} items={filteredItems} onItemClick={onItemClick} />
          {/* Panel label */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              backgroundColor: "rgba(0,0,0,0.5)",
              color: "white",
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
            }}
          >
            {PANEL_OPTIONS.find((p) => p.id === panelA)?.label}
          </div>
        </div>

        {/* Divider */}
        <div
          onMouseDown={handleDividerMouseDown}
          onTouchStart={handleDividerMouseDown}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "20px",
            top: `calc(${splitPos * 100}% - 10px)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "row-resize",
            zIndex: 10,
            backgroundColor: "transparent",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "12px",
              borderRadius: "13px",
              border: "1px solid #C7C7C7",
              backgroundColor: "white",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
          />
        </div>

        {/* Panel B */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${splitPos * 100}%`,
            bottom: 0,
            overflow: "hidden",
          }}
        >
          <PanelContent type={panelB} items={filteredItems} onItemClick={onItemClick} />
          {/* Panel label */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              backgroundColor: "rgba(0,0,0,0.5)",
              color: "white",
              padding: "3px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
            }}
          >
            {PANEL_OPTIONS.find((p) => p.id === panelB)?.label}
          </div>
        </div>

        {/* Right drawer tab */}
        <button
          onClick={() => setDrawerOpen((v) => !v)}
          style={{
            position: "absolute",
            right: 0,
            top: "30%",
            width: "21px",
            height: "59px",
            backgroundColor: "white",
            borderRadius: "8px 0 0 8px",
            boxShadow: "0px 4px 18px 0px rgba(31,39,49,0.41)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6C7B95"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            {drawerOpen ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
          </svg>
        </button>

        {/* Drawer */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "280px",
            backgroundColor: "white",
            boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
            zIndex: 30,
            transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 300ms ease",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: "1px solid #F0F4FF" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#1E2939", fontFamily: "Nunito, sans-serif" }}>View Settings</span>
            <button onClick={() => setDrawerOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6C7B95" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-3">
            {/* Panel A */}
            <div className="mb-4">
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#6C7B95", fontFamily: "Inter, sans-serif", marginBottom: "8px" }}>Panel A</p>
              <div className="flex flex-wrap gap-2">
                {PANEL_OPTIONS.map((opt) => (
                  <Chip key={opt.id} label={opt.label} active={panelA === opt.id} onClick={() => setPanelA(opt.id)} />
                ))}
              </div>
            </div>

            <div style={{ height: "1px", backgroundColor: "#F0F4FF", marginBottom: "16px" }} />

            {/* Panel B */}
            <div className="mb-4">
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#6C7B95", fontFamily: "Inter, sans-serif", marginBottom: "8px" }}>Panel B</p>
              <div className="flex flex-wrap gap-2">
                {PANEL_OPTIONS.map((opt) => (
                  <Chip key={opt.id} label={opt.label} active={panelB === opt.id} onClick={() => setPanelB(opt.id)} />
                ))}
              </div>
            </div>

            <div style={{ height: "1px", backgroundColor: "#F0F4FF", marginBottom: "16px" }} />

            {/* Markups */}
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#6C7B95", fontFamily: "Inter, sans-serif", marginBottom: "12px" }}>Markups</p>
              {[
                { label: "Issues", value: showIssues, toggle: () => setShowIssues((v) => !v), color: "#EF4444" },
                { label: "Tasks", value: showTasks, toggle: () => setShowTasks((v) => !v), color: "#2451FF" },
                { label: "RFIs", value: showRfis, toggle: () => setShowRfis((v) => !v), color: "#F59E0B" },
                { label: "Field Notes", value: showFieldNotes, toggle: () => setShowFieldNotes((v) => !v), color: "#10B981" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 py-2.5" style={{ borderBottom: "1px solid #F0F4FF" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: row.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: "14px", color: "#1E2939", fontFamily: "Inter, sans-serif" }}>{row.label}</span>
                  <Toggle on={row.value} onToggle={row.toggle} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav active={activeTab} onChange={onTabChange} onFabClick={onCreateClick} />
    </div>
  );
}
