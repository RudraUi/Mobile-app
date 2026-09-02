import { useState, useCallback } from "react";
import { LoginScreen } from "./screens/LoginScreen";
import { OtpScreen } from "./screens/OtpScreen";
import { SuccessScreen } from "./screens/SuccessScreen";
import { LoggedOutScreen } from "./screens/LoggedOutScreen";
import { SplashScreen } from "./screens/SplashScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { MapScreen } from "./screens/MapScreen";
import { DrawingScreen } from "./screens/DrawingScreen";
import { BimScreen } from "./screens/BimScreen";
import { DroneScreen } from "./screens/DroneScreen";
import { WalkthroughScreen } from "./screens/WalkthroughScreen";
import { SplitViewScreen } from "./screens/SplitViewScreen";
import { ListScreen, type ListFilterInitialParams } from "./screens/ListScreen";
import { ItemDetailScreen } from "./screens/ItemDetailScreen";
import { CreateItemScreen } from "./screens/CreateItemScreen";
import { NavigateScreen } from "./screens/NavigateScreen";
import { ProfileScreen, type UserProfileData } from "./screens/ProfileScreen";
import { InviteModal } from "./components/InviteModal";
import { projectsList, type Project } from "./data/projectsData";
import type { Item, ItemType, Severity, Status } from "./data/mockData";
import { mockItems } from "./data/mockData";
import type { MainTab } from "./components/BottomNav";

type Screen =
  | "login"
  | "otp"
  | "success"
  | "logged_out"
  | MainTab
  | "list"
  | "detail"
  | "create"
  | "navigate"
  | "profile"
  | "walkthrough";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState<Screen>("home");
  const [email, setEmail] = useState("alphainvent@gmail.com");
  const [activeTab, setActiveTab] = useState<MainTab>("home");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [navigateItem, setNavigateItem] = useState<Item | null>(null);
  const [items, setItems] = useState<Item[]>(mockItems);
  const [markupFilter, setMarkupFilter] = useState("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project>(projectsList[0]);
  const [listParams, setListParams] = useState<ListFilterInitialParams>({ viewMode: "list" });
  const [prevScreen, setPrevScreen] = useState<Screen>("home");

  const [profile, setProfile] = useState<UserProfileData>({
    name: "Anil Kumar Patra",
    email: "alphainvent@gmail.com",
    role: "Senior BIM Coordinator",
    organization: "Stalwart Infrastructure",
    phone: "+1 (555) 438-9210",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    trade: "Structural & MEP Coordination",
    location: "Tower B, Level 03",
    notifications: true,
    offlineSync: true,
  });

  const handleLogin = useCallback((e: string) => {
    setEmail(e);
    setScreen("success");
  }, []);

  const handleVerify = useCallback(() => setScreen("success"), []);
  const handleSuccessDone = useCallback(() => setScreen("home"), []);

  const handleTabChange = useCallback((tab: MainTab) => {
    setActiveTab(tab);
    setScreen(tab);
  }, []);

  const handleItemClick = useCallback((item: Item) => {
    setPrevScreen(screen);
    setSelectedItem(item);
    setScreen("detail");
  }, [screen]);

  const handleViewAll = useCallback((params?: ListFilterInitialParams) => {
    setListParams(params || { viewMode: "list" });
    setScreen("list");
  }, []);

  const handleUpdateStatus = useCallback((id: string, newStatus: Status) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
    setSelectedItem((prev) =>
      prev?.id === id ? ({ ...prev, status: newStatus } as Item) : prev
    );
  }, []);

  const handleCreateClick = useCallback(() => setScreen("create"), []);

  const handleNavigate = useCallback((item: Item) => {
    setNavigateItem(item);
    setScreen("navigate");
  }, []);

  const handleUpdate = useCallback((id: string, changes: Partial<Item>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
    setSelectedItem((prev) => (prev?.id === id ? ({ ...prev, ...changes } as Item) : prev));
  }, []);

  const handleCreateSubmit = useCallback(
    (
      type: ItemType,
      title: string,
      description: string,
      severity: Severity,
      dueDate: string,
      assignToMe: boolean,
    ) => {
      const prefix: Record<ItemType, string> = { issue: "ISSUE", task: "TASK", rfi: "RFI", fieldnote: "FN" };
      const newItem: Item = {
        id: `${prefix[type]}-${Math.floor(Math.random() * 900) + 100}`,
        type,
        title,
        description,
        status: "TO DO",
        severity,
        assignees: assignToMe
          ? [{ id: "you", name: "You", initials: "YO", color: "#1558F5" }]
          : [],
        dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        location: { x: 150 + Math.random() * 180, y: 200 + Math.random() * 450, label: `${selectedProject.name} location` },
        photos: [],
        activity: [
          {
            id: "init",
            text: `Item created in ${selectedProject.name}`,
            date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          },
        ],
        tags: [selectedProject.code],
        phase: "Construction Execution",
        category: "Structural",
      };
      setItems((prev) => [newItem, ...prev]);
      setActiveTab("home");
      setScreen("home");
    },
    [selectedProject]
  );

  const currentSelectedItem = selectedItem
    ? items.find((i) => i.id === selectedItem.id) ?? selectedItem
    : null;

  const mainTabProps = {
    items,
    onItemClick: handleItemClick,
    onCreateClick: handleCreateClick,
    activeTab,
    onTabChange: handleTabChange,
    markupFilter,
    onFilterChange: setMarkupFilter,
    onInviteClick: () => setIsInviteModalOpen(true),
    onProfileClick: () => setScreen("profile"),
    userAvatar: profile.avatar,
    selectedProject,
    onSelectProject: setSelectedProject,
    onViewAll: handleViewAll,
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#18191c]">
      <div
        className="relative flex h-full w-full flex-col overflow-hidden"
        style={{
          width: "100%",
          maxWidth: "430px",
          height: "100%",
          backgroundColor: "#ffffff",
          boxShadow: "0 0 50px rgba(0, 0, 0, 0.45)",
        }}
      >
        {/* Modern Animated Splash Screen */}
        {showSplash && (
          <SplashScreen
            onFinish={() => {
              setShowSplash(false);
              setScreen("home");
              setActiveTab("home");
            }}
          />
        )}

        <div key={screen} className="flex flex-col h-full animate-fade-in">
          {screen === "login" && (
            <LoginScreen onLogin={handleLogin} onOtp={() => setScreen("otp")} />
          )}

          {screen === "otp" && (
            <OtpScreen email={email} onVerify={handleVerify} onBack={() => setScreen("login")} />
          )}

          {screen === "success" && <SuccessScreen onDone={handleSuccessDone} />}
          {screen === "logged_out" && <LoggedOutScreen onDone={() => setScreen("login")} />}

          {(screen === "home" || (screen === "create" && activeTab === "home")) && <HomeScreen {...mainTabProps} />}
          {(screen === "map" || (screen === "create" && activeTab === "map")) && <MapScreen {...mainTabProps} />}
          {(screen === "drawing" || (screen === "create" && activeTab === "drawing")) && <DrawingScreen {...mainTabProps} />}
          {(screen === "bim" || (screen === "create" && activeTab === "bim")) && <BimScreen {...mainTabProps} />}
          {(screen === "drone" || (screen === "create" && activeTab === "drone")) && <DroneScreen {...mainTabProps} />}
          {(screen === "walkthrough" || (screen === "create" && activeTab === "walkthrough")) && <WalkthroughScreen {...mainTabProps} />}
          {(screen === "splitview" || (screen === "create" && activeTab === "splitview")) && <SplitViewScreen {...mainTabProps} />}

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
            <ItemDetailScreen
              item={currentSelectedItem}
              onBack={() => setScreen(prevScreen || activeTab)}
              onNavigate={handleNavigate}
              onUpdate={handleUpdate}
            />
          )}

          {screen === "create" && (
            <CreateItemScreen
              initialType="task"
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

          {screen === "profile" && (
            <ProfileScreen
              profile={profile}
              onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
              onBack={() => setScreen(activeTab)}
              onSignOut={() => setScreen("logged_out")}
            />
          )}
        </div>

        {/* Global Invite Collaborators Modal */}
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />
      </div>
    </div>
  );
}
