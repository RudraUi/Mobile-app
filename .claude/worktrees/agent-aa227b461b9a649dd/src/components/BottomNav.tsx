export type MainTab = "home" | "map" | "drawing" | "bim" | "drone" | "splitview"

interface BottomNavProps {
  active: MainTab
  onChange: (tab: MainTab) => void
  onFabClick?: () => void
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#1558e8" : "#676f88"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function MapIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#1558e8" : "#676f88"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function DrawingIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#1558e8" : "#676f88"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  )
}

function BimIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#1558e8" : "#676f88"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}

function DroneIcon({ active }: { active: boolean }) {
  const c = active ? "#1558e8" : "#676f88"
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="6" r="2.5" stroke={c} strokeWidth="1.8" />
      <circle cx="18" cy="6" r="2.5" stroke={c} strokeWidth="1.8" />
      <circle cx="6" cy="18" r="2.5" stroke={c} strokeWidth="1.8" />
      <circle cx="18" cy="18" r="2.5" stroke={c} strokeWidth="1.8" />
      <line
        x1="8"
        y1="8"
        x2="10"
        y2="10"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="8"
        x2="14"
        y2="10"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="8"
        y1="16"
        x2="10"
        y2="14"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="16"
        x2="14"
        y2="14"
        stroke={c}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2" fill={c} />
    </svg>
  )
}

function SplitIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#1558e8" : "#676f88"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  )
}

const tabItems: { id: MainTab label: string }[] = [
  { id: "home", label: "Home" },
  { id: "map", label: "Map" },
  { id: "drawing", label: "Drawing" },
  { id: "bim", label: "3D BIM" },
  { id: "drone", label: "Drone" },
  { id: "splitview", label: "Split view" },
]

function TabIcon({ id, active }: { id: MainTab active: boolean }) {
  if (id === "home") return <HomeIcon active={active} />
  if (id === "map") return <MapIcon active={active} />
  if (id === "drawing") return <DrawingIcon active={active} />
  if (id === "bim") return <BimIcon active={active} />
  if (id === "drone") return <DroneIcon active={active} />
  return <SplitIcon active={active} />
}

export function BottomNav({ active, onChange, onFabClick }: BottomNavProps) {
  const leftTabs = tabItems.slice(0, 3)
  const rightTabs = tabItems.slice(3)

  return (
    <div
      className="relative flex items-end shrink-0"
      style={{
        height: "83px",
        backgroundColor: "white",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.04), 0 -1px 0 rgba(0,0,0,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Left tabs */}
      <div className="flex flex-1">
        {leftTabs.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex-1 flex flex-col items-center relative"
              style={{ paddingTop: "4px", paddingBottom: "8px", gap: "3px" }}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "28px",
                    height: "4px",
                    borderRadius: "0 0 4px 4px",
                    backgroundColor: "#1558e8",
                  }}
                />
              )}
              <TabIcon id={tab.id} active={isActive} />
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "Inter, sans-serif",
                  color: isActive ? "#1558e8" : "#676f88",
                  fontWeight: 400,
                }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* FAB spacer */}
      <div style={{ width: "56px", flexShrink: 0 }} />

      {/* Right tabs */}
      <div className="flex flex-1">
        {rightTabs.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex-1 flex flex-col items-center relative"
              style={{ paddingTop: "4px", paddingBottom: "8px", gap: "3px" }}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "28px",
                    height: "4px",
                    borderRadius: "0 0 4px 4px",
                    backgroundColor: "#1558e8",
                  }}
                />
              )}
              <TabIcon id={tab.id} active={isActive} />
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "Inter, sans-serif",
                  color: isActive ? "#1558e8" : "#676f88",
                  fontWeight: 400,
                }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* FAB - centered absolute */}
      <button
        onClick={onFabClick}
        style={{
          position: "absolute",
          bottom: "26px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#3856f7",
          border: "6px solid white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(56,86,247,0.4)",
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
  )
}
