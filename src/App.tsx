import { useState, useCallback, useEffect } from "react"
import { LoginScreen } from "./screens/LoginScreen"
import { OtpScreen } from "./screens/OtpScreen"
import { SuccessScreen } from "./screens/SuccessScreen"
import { LoggedOutScreen } from "./screens/LoggedOutScreen"
import { SplashScreen } from "./screens/SplashScreen"
import { HomeScreen } from "./screens/HomeScreen"
import { MapScreen } from "./screens/MapScreen"
import { DrawingScreen } from "./screens/DrawingScreen"
import { BimScreen } from "./screens/BimScreen"
import { DroneScreen } from "./screens/DroneScreen"
import { WalkthroughScreen } from "./screens/WalkthroughScreen"
import { SplitViewScreen } from "./screens/SplitViewScreen"
import { ListScreen, type ListFilterInitialParams } from "./screens/ListScreen"

import { TaskDetailScreen } from "./screens/TaskDetailScreen"
import {
  CreateItemScreen,
  type CreateItemDraft,
} from "./screens/CreateItemScreen"
import { SiteCaptureScreen } from "./screens/SiteCaptureScreen"
import { CapturesScreen } from "./screens/CapturesScreen"
import { DataLibraryScreen } from "./screens/DataLibraryScreen"
import type { DataCategoryId } from "./data/dataLibrary"
import { NavigateScreen } from "./screens/NavigateScreen"
import {
  ProfileScreen,
  type UserProfileData,
  type AppFontFamily,
  type AppThemeMode,
} from "./screens/ProfileScreen"
import { NotificationsScreen } from "./screens/NotificationsScreen"
import {
  initialNotifications,
  type AppNotification,
} from "./data/notificationsData"
import { SideDrawer } from "./components/SideDrawer"
import { InviteModal } from "./components/InviteModal"
import { QuickCreateSheet } from "./components/QuickCreateSheet"
import { projectsList, type Project } from "./data/projectsData"
import type { Item, ItemType, Status } from "./data/mockData"
import { mockItems } from "./data/mockData"
import type { MainTab } from "./components/BottomNav"

type Screen = "login" | "otp" | "success" | "logged_out" | MainTab | "list" | "detail" | "create" | "sitecapture" | "captures" | "navigate" | "profile" | "walkthrough" | "data" | "notifications"

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [screen, setScreen] = useState<Screen>("home")
  const [email, setEmail] = useState("alphainvent@gmail.com")
  const [activeTab, setActiveTab] = useState<MainTab>("home")
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [navigateItem, setNavigateItem] = useState<Item | null>(null)
  const [items, setItems] = useState<Item[]>(mockItems)
  const [markupFilter, setMarkupFilter] = useState("all")
  const [notifications, setNotifications] =
    useState<AppNotification[]>(initialNotifications)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [createType, setCreateType] = useState<ItemType>("task")
  const [capturesOrigin, setCapturesOrigin] = useState<Screen>("profile")
  const [dataCategory, setDataCategory] = useState<DataCategoryId | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project>(
    projectsList[0],
  )
  const [listParams, setListParams] = useState<ListFilterInitialParams>({
    viewMode: "list",
  })
  const [prevScreen, setPrevScreen] = useState<Screen>("home")

  const [profile, setProfile] = useState<UserProfileData>(() => {
    const savedFont =
      (typeof localStorage !== "undefined"
        ? localStorage.getItem("app_font") as AppFontFamily
        : null) || "proxima"
    const savedTheme =
      (typeof localStorage !== "undefined"
        ? localStorage.getItem("app_theme") as AppThemeMode
        : null) || "dark"
    return {
      name: "Anil Kumar Patra",
      email: "alphainvent@gmail.com",
      role: "Senior BIM Coordinator",
      organization: "Stalwart Infrastructure",
      phone: "+1 (555) 438-9210",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
      trade: "Structural & MEP Coordination",
      location: "Tower B, Level 03",
      notifications: true,
      offlineSync: true,
      fontFamily: savedFont,
      themeMode: savedTheme,
    }
  })

  useEffect(() => {
    const font = profile.fontFamily || "proxima"
    document.documentElement.setAttribute("data-font", font)
    document.body.setAttribute("data-font", font)
    const rootEl = document.getElementById("root")
    if (rootEl) rootEl.setAttribute("data-font", font)
    localStorage.setItem("app_font", font)
  }, [profile.fontFamily])

  useEffect(() => {
    const theme = profile.themeMode || "dark"
    document.documentElement.setAttribute("data-theme", theme)
    document.body.setAttribute("data-theme", theme)
    const rootEl = document.getElementById("root")
    if (rootEl) rootEl.setAttribute("data-theme", theme)
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
      document.body.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
      document.body.classList.remove("dark")
    }
    localStorage.setItem("app_theme", theme)
  }, [profile.themeMode])

  const handleUpdateProfile = useCallback(
    (updated: Partial<UserProfileData>) => {
      setProfile((prev) => {
        const next = { ...prev, ...updated }
        if (updated.fontFamily) {
          document.documentElement.setAttribute("data-font", updated.fontFamily)
          document.body.setAttribute("data-font", updated.fontFamily)
          const rootEl = document.getElementById("root")
          if (rootEl) rootEl.setAttribute("data-font", updated.fontFamily)
          localStorage.setItem("app_font", updated.fontFamily)
        }
        if (updated.themeMode) {
          document.documentElement.setAttribute("data-theme", updated.themeMode)
          document.body.setAttribute("data-theme", updated.themeMode)
          const rootEl = document.getElementById("root")
          if (rootEl) rootEl.setAttribute("data-theme", updated.themeMode)
          if (updated.themeMode === "dark") {
            document.documentElement.classList.add("dark")
            document.body.classList.add("dark")
          } else {
            document.documentElement.classList.remove("dark")
            document.body.classList.remove("dark")
          }
          localStorage.setItem("app_theme", updated.themeMode)
        }
        return next
      })
    },
    [],
  )

  const handleLogin = useCallback((e: string) => {
    setEmail(e)
    setScreen("success")
  }, [])

  const handleVerify = useCallback(() => setScreen("success"), [])
  const handleSuccessDone = useCallback(() => setScreen("home"), [])

  const handleTabChange = useCallback((tab: MainTab) => {
    setActiveTab(tab)
    setScreen(tab)
  }, [])

  const handleItemClick = useCallback(
    (item: Item) => {
      setPrevScreen(screen)
      setSelectedItem(item)
      setScreen("detail")
    },
    [screen],
  )

  const handleViewAll = useCallback((params?: ListFilterInitialParams) => {
    setListParams(params || { viewMode: "list" })
    setScreen("list")
  }, [])

  const handleUpdateStatus = useCallback((id: string, newStatus: Status) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i)),
    )
    setSelectedItem((prev) =>
      prev?.id === id ? { ...prev, status: newStatus } as Item : prev,
    )
  }, [])

  const handleCreateClick = useCallback(() => setIsQuickCreateOpen(true), [])

  const handleSelectCreateType = useCallback((type: ItemType) => {
    setIsQuickCreateOpen(false)
    setCreateType(type)
    setScreen("create")
  }, [])

  const openCaptures = useCallback((from: Screen) => {
    setCapturesOrigin(from)
    setScreen("captures")
  }, [])

  const openDataCategory = useCallback((id: DataCategoryId) => {
    setDataCategory(id)
    setScreen("data")
  }, [])

  const handleSiteCapture = useCallback(() => {
    setIsQuickCreateOpen(false)
    setScreen("sitecapture")
  }, [])

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
    (draft: CreateItemDraft) => {
      const {
        type,
        title,
        description,
        severity,
        dueDate,
        assignees,
        status,
        tags,
        photos,
      } = draft
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
        status,
        severity,
        assignees,
        dueDate:
          dueDate ||
          new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        location: {
          x: 150 + Math.random() * 180,
          y: 200 + Math.random() * 450,
          label: `${selectedProject.name} location`,
        },
        photos,
        activity: [
          {
            id: "init",
            text: `Item created in ${selectedProject.name}`,
            date: new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          },
        ],
        tags: Array.from(new Set([...tags, selectedProject.code])),
        phase: "Construction Execution",
        category: "Structural",
      }
      setItems((prev) => [newItem, ...prev])
      setActiveTab("home")
      setScreen("home")
    },
    [selectedProject],
  )

  const currentSelectedItem = selectedItem
    ? (items.find((i) => i.id === selectedItem.id) ?? selectedItem)
    : null

  const mainTabProps = {
    items,
    onItemClick: handleItemClick,
    onCreateClick: handleCreateClick,
    activeTab,
    onTabChange: handleTabChange,
    markupFilter,
    onFilterChange: setMarkupFilter,
    onInviteClick: () => setIsInviteModalOpen(true),
    onProfileClick: () => setIsDrawerOpen(true),
    onNotificationClick: () => setScreen("notifications"),
    unreadNotificationCount: notifications.filter((n) => !n.read).length,
    userAvatar: profile.avatar,
    selectedProject,
    onSelectProject: setSelectedProject,
    onViewAll: handleViewAll,
  }

  const isDark = profile.themeMode === "dark"

  return (
    <div
      className={`flex h-full w-full items-center justify-center transition-colors duration-300 ${
        isDark ? "bg-[#06070b]" : "bg-[#18191c]"
      }`}
    >
      <div
        data-theme={profile.themeMode || "dark"}
        className={`relative flex h-full w-full flex-col overflow-hidden transition-colors duration-300 app-phone-shell ${
          isDark ? "dark" : ""
        }`}
        style={{
          width: "100%",
          maxWidth: "430px",
          height: "100%",
          backgroundColor: isDark ? "#0a0c14" : "#ffffff",
          boxShadow: isDark
            ? "0 0 70px rgba(0, 85, 255, 0.16), 0 0 35px rgba(0, 0, 0, 0.95)"
            : "0 0 50px rgba(0, 0, 0, 0.45)",
        }}
      >
        {/* Modern Animated Splash Screen */}
        {showSplash && (
          <SplashScreen
            onFinish={() => {
              setShowSplash(false)
              setScreen("home")
              setActiveTab("home")
            }}
          />
        )}

        <div key={screen} className="flex flex-col h-full animate-screen-in">
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
          {screen === "logged_out" && (
            <LoggedOutScreen onDone={() => setScreen("login")} />
          )}

          {(screen === "home" ||
            (screen === "create" && activeTab === "home")) && (
            <HomeScreen {...mainTabProps} />
          )}
          {(screen === "map" ||
            (screen === "create" && activeTab === "map")) && (
            <MapScreen {...mainTabProps} />
          )}
          {(screen === "drawing" ||
            (screen === "create" && activeTab === "drawing")) && (
            <DrawingScreen {...mainTabProps} />
          )}
          {(screen === "bim" ||
            (screen === "create" && activeTab === "bim")) && (
            <BimScreen {...mainTabProps} />
          )}
          {(screen === "drone" ||
            (screen === "create" && activeTab === "drone")) && (
            <DroneScreen {...mainTabProps} />
          )}
          {(screen === "walkthrough" ||
            (screen === "create" && activeTab === "walkthrough")) && (
            <WalkthroughScreen {...mainTabProps} />
          )}
          {(screen === "splitview" ||
            (screen === "create" && activeTab === "splitview")) && (
            <SplitViewScreen {...mainTabProps} />
          )}

          {screen === "list" && (
            <ListScreen
              items={items}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onItemClick={handleItemClick}
              onCreateClick={handleCreateClick}
              onBack={() => setScreen("home")}
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
              userAvatar={profile.avatar}
              onUpdateStatus={handleUpdateStatus}
              initialParams={listParams}
            />
          )}

          {screen === "detail" && currentSelectedItem && (
            <TaskDetailScreen
              onOpenCaptures={() => openCaptures("detail")}
              item={currentSelectedItem}
              onBack={() => setScreen(prevScreen || activeTab)}
              onNavigate={handleNavigate}
              onUpdate={handleUpdate}
            />
          )}

          {screen === "create" && (
            <CreateItemScreen
              initialType={createType}
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

          {screen === "sitecapture" && (
            <SiteCaptureScreen
              onBack={() => setScreen(activeTab)}
              onOpenCaptures={() => openCaptures(activeTab)}
            />
          )}

          {screen === "data" && dataCategory && (
            <DataLibraryScreen
              categoryId={dataCategory}
              projectName={selectedProject.name}
              onBack={() => setScreen(activeTab)}
            />
          )}

          {screen === "captures" && (
            <CapturesScreen
              onBack={() => setScreen(capturesOrigin)}
              onOpenCapture={() => setScreen("sitecapture")}
            />
          )}

          {screen === "profile" && (
            <ProfileScreen
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onBack={() => setScreen(activeTab)}
              onSignOut={() => setScreen("logged_out")}
            />
          )}

          {screen === "notifications" && (
            <NotificationsScreen
              notifications={notifications}
              onBack={() => setScreen(activeTab)}
              items={items}
              onItemClick={(item) => {
                setSelectedItem(item)
                setPrevScreen("notifications")
                setScreen("detail")
              }}
              onMarkAllRead={() => {
                setNotifications((prev) =>
                  prev.map((n) => ({ ...n, read: true })),
                )
              }}
              onToggleRead={(id) => {
                setNotifications((prev) =>
                  prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
                )
              }}
              onDeleteNotification={(id) => {
                setNotifications((prev) => prev.filter((n) => n.id !== id))
              }}
            />
          )}
        </div>

        {/* Left Side Navigation Drawer */}
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          profile={profile}
          onOpenProfile={() => {
            setIsDrawerOpen(false)
            setScreen("profile")
          }}
          projects={projectsList}
          selectedProject={selectedProject}
          onSelectProject={(p) => {
            setSelectedProject(p)
            setIsDrawerOpen(false)
          }}
          activeDataCategory={screen === "data" ? dataCategory : null}
          onOpenDataCategory={(id) => {
            setIsDrawerOpen(false)
            /* Survey Data is where site captures live. */
            if (id === "survey") openCaptures(activeTab)
            else openDataCategory(id)
          }}
          onSignOut={() => {
            setIsDrawerOpen(false)
            setScreen("logged_out")
          }}
        />

        {/* Create bottom sheet, launched from the bottom-nav + button */}
        <QuickCreateSheet
          isOpen={isQuickCreateOpen}
          onClose={() => setIsQuickCreateOpen(false)}
          onSelectCreateType={handleSelectCreateType}
          onSiteCapture={handleSiteCapture}
        />

        {/* Global Invite Collaborators Modal */}
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />
      </div>
    </div>
  )
}
