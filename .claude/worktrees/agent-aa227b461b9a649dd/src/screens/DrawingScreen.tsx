import { AppHeader } from "../components/AppHeader"
import { BottomNav, type MainTab } from "../components/BottomNav"
import { MapView } from "../components/MapView"
import type { Item } from "../data/mockData"

interface DrawingScreenProps {
  items: Item[]
  onItemClick: (item: Item) => void
  onCreateClick: () => void
  activeTab: MainTab
  onTabChange: (tab: MainTab) => void
  markupFilter: string
  onFilterChange: (f: string) => void
}

export function DrawingScreen({
  items,
  onItemClick,
  onCreateClick,
  activeTab,
  onTabChange,
  markupFilter,
  onFilterChange,
}: DrawingScreenProps) {
  const filteredItems = items.filter((item) => {
    if (markupFilter === "all") return true
    if (markupFilter === "issue") return item.type === "issue"
    if (markupFilter === "task") return item.type === "task"
    if (markupFilter === "rfi") return item.type === "rfi"
    if (markupFilter === "fieldnote") return item.type === "fieldnote"
    return true
  })

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#F6F8FF" }}
    >
      <AppHeader markupFilter={markupFilter} onFilterChange={onFilterChange} />
      <div className="flex-1 relative overflow-hidden">
        <MapView items={filteredItems} onPinClick={onItemClick} />
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
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
      <BottomNav
        active={activeTab}
        onChange={onTabChange}
        onFabClick={onCreateClick}
      />
    </div>
  )
}
