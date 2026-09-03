import { AppHeader } from "../components/AppHeader"
import { BottomNav, type MainTab } from "../components/BottomNav"
import type { Item } from "../data/mockData"

interface DroneScreenProps {
  items: Item[]
  onItemClick: (item: Item) => void
  onCreateClick: () => void
  activeTab: MainTab
  onTabChange: (tab: MainTab) => void
  markupFilter: string
  onFilterChange: (f: string) => void
}

const DRONE_PINS = [
  { id: "ISSUE-016", x: "30%", y: "40%", color: "#EF4444", label: "!" },
  { id: "RFI-002", x: "65%", y: "55%", color: "#F59E0B", label: "?" },
  { id: "FN-001", x: "20%", y: "65%", color: "#10B981", label: "N" },
  { id: "TASK-003", x: "75%", y: "30%", color: "#2451FF", label: "T" },
]

export function DroneScreen({
  items,
  onItemClick,
  onCreateClick,
  activeTab,
  onTabChange,
  markupFilter,
  onFilterChange,
}: DroneScreenProps) {
  const filteredItems = items.filter((item) => {
    if (markupFilter === "all") return true
    if (markupFilter === "issue") return item.type === "issue"
    if (markupFilter === "task") return item.type === "task"
    if (markupFilter === "rfi") return item.type === "rfi"
    if (markupFilter === "fieldnote") return item.type === "fieldnote"
    return true
  })

  const visiblePins = DRONE_PINS.filter((pin) =>
    filteredItems.some((item) => item.id === pin.id),
  )

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#1E2939" }}
    >
      <AppHeader markupFilter={markupFilter} onFilterChange={onFilterChange} />
      <div className="flex-1 relative overflow-hidden">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=860&h=700&fit=crop)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
          />

          {visiblePins.map((pin) => {
            const item = items.find((i) => i.id === pin.id)
            if (!item) return null
            return (
              <button
                key={pin.id}
                onClick={() => onItemClick(item)}
                style={{
                  position: "absolute",
                  left: pin.x,
                  top: pin.y,
                  transform: "translate(-50%, -100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50% 50% 50% 0",
                    transform: "rotate(-45deg)",
                    backgroundColor: pin.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  <span
                    style={{
                      transform: "rotate(45deg)",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {pin.label}
                  </span>
                </div>
              </button>
            )
          })}

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
      </div>
      <BottomNav
        active={activeTab}
        onChange={onTabChange}
        onFabClick={onCreateClick}
      />
    </div>
  )
}
