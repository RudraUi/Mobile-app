import { useState, useCallback } from "react"
import { LoginScreen } from "./screens/LoginScreen"
import { OtpScreen } from "./screens/OtpScreen"
import { SuccessScreen } from "./screens/SuccessScreen"
import { HomeScreen } from "./screens/HomeScreen"
import { MapScreen } from "./screens/MapScreen"
import { DrawingScreen } from "./screens/DrawingScreen"
import { BimScreen } from "./screens/BimScreen"
import { DroneScreen } from "./screens/DroneScreen"
import { SplitViewScreen } from "./screens/SplitViewScreen"
import { ListScreen } from "./screens/ListScreen"
import { ItemDetailScreen } from "./screens/ItemDetailScreen"
import { CreateItemScreen } from "./screens/CreateItemScreen"
import { NavigateScreen } from "./screens/NavigateScreen"
import type { Item, ItemType, Severity } from "./data/mockData"
import { mockItems } from "./data/mockData"
import type { MainTab } from "./components/BottomNav"

type Screen = "login" | "otp" | "success" | MainTab | "list" | "detail" | "create" | "navigate"

export default function App() {
  const [screen, setScreen] = useState<Screen>("login")
  const [email, setEmail] = useState("field.worker@bimbox.ai")
  const [activeTab, setActiveTab] = useState<MainTab>("home")
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [navigateItem, setNavigateItem] = useState<Item | null>(null)
  const [items, setItems] = useState<Item[]>(mockItems)
  const [markupFilter, setMarkupFilter] = useState("all")

  const handleLogin = useCallback((e: string) => {
    setEmail(e)
    setScreen("otp")
  }, [])

  const handleVerify = useCallback(() => setScreen("success"), [])
  const handleSuccessDone = useCallback(() => setScreen("home"), [])

  const handleTabChange = useCallback((tab: MainTab) => {
    setActiveTab(tab)
    setScreen(tab)
  }, [])

  const handleItemClick = useCallback((item: Item) => {
    setSelectedItem(item)
    setScreen("detail")
  }, [])

  const handleCreateClick = useCallback(() => setScreen("create"), [])

  const handleNavigate = useCallback((item: Item) => {
    setNavigateItem(item)
    setScreen("navigate")
  }, [])

  const handleUpdate = useCallback((id: string, changes: Partial<Item>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...changes } : i)),
    )
    setSelectedItem((prev) =>
      prev?.id === id ? { ...prev, ...changes } as Item : prev,
    )
  }, [])

  const handleCreateSubmit = useCallback(
    (
      type: ItemType,
      title: string,
      description: string,
      severity: Severity,
    ) => {
      const prefix: Record<ItemType, string> = {
        issue: "ISSUE",
        task: "TASK",
        rfi: "RFI",
        fieldnote: "FN",
      }
      const newItem: Item = {
        id: `${prefix[type]}-${Math.floor(Math.random() * 900) + 100}`,
        type,
        title,
        description,
        status: "TO DO",
        severity,
        assignees: [],
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        location: {
          x: 150 + Math.random() * 180,
          y: 200 + Math.random() * 450,
          label: "Location not set",
        },
        photos: [],
        activity: [
          {
            id: "init",
            text: "Item created",
            date: new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          },
        ],
        tags: [],
      }
      setItems((prev) => [newItem, ...prev])
      setActiveTab("home")
      setScreen("home")
    },
    [],
  )

  const currentSelectedItem = selectedItem
    ? (items.find((i) => i.id === selectedItem.id) ?? selectedItem)
    : null

  const isAuthScreen =
    screen === "login" || screen === "otp" || screen === "success"

  const mainTabProps = {
    items,
    onItemClick: handleItemClick,
    onCreateClick: handleCreateClick,
    activeTab,
    onTabChange: handleTabChange,
    markupFilter,
    onFilterChange: setMarkupFilter,
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #0a0a1a 0%, #0d1b4b 50%, #0a0a1a 100%)",
      }}
    >
      <div
        className="relative overflow-hidden flex flex-col"
        style={{
          width: "min(100%, 430px)",
          height: "min(100%, 932px)",
          backgroundColor: isAuthScreen ? "#ffffff" : "#f0f4ff",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div key={screen} className="flex flex-col h-full animate-fade-in">
          {screen === "login" && (
            <LoginScreen onLogin={handleLogin} onOtp={() => setScreen("otp")} />
          )}

          {screen === "otp" && (
            <OtpScreen
              email={email}
              onVerify={handleVerify}
              onBack={() => setScreen("login")}
            />
          )}

          {screen === "success" && <SuccessScreen onDone={handleSuccessDone} />}

          {screen === "home" && <HomeScreen {...mainTabProps} />}
          {screen === "map" && <MapScreen {...mainTabProps} />}
          {screen === "drawing" && <DrawingScreen {...mainTabProps} />}
          {screen === "bim" && <BimScreen {...mainTabProps} />}
          {screen === "drone" && <DroneScreen {...mainTabProps} />}
          {screen === "splitview" && <SplitViewScreen {...mainTabProps} />}

          {screen === "list" && (
            <ListScreen
              items={items}
              activeTab={"home" as any}
              onTabChange={handleTabChange as any}
              onItemClick={handleItemClick}
              onCreateClick={handleCreateClick}
            />
          )}

          {screen === "detail" && currentSelectedItem && (
            <ItemDetailScreen
              item={currentSelectedItem}
              onBack={() => setScreen(activeTab)}
              onNavigate={handleNavigate}
              onUpdate={handleUpdate}
            />
          )}

          {screen === "create" && (
            <CreateItemScreen
              onBack={() => setScreen(activeTab)}
              onSubmit={handleCreateSubmit}
            />
          )}

          {screen === "navigate" && navigateItem && (
            <NavigateScreen
              item={navigateItem}
              onBack={() => setScreen("detail")}
              onArrived={() => setScreen(activeTab)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
