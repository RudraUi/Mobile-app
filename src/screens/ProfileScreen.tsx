import { useState, useRef } from "react"
import type { ReactNode } from "react"
import { BackButton } from "../components/BackButton"
import { FloatingMenu, MenuCaption, MenuItem } from "../components/FloatingMenu"

export type AppFontFamily = "proxima" | "helvena" | "mulish" | "googlesans" | "sourcesans3"
export type AppThemeMode = "light" | "dark"

export interface UserProfileData {
  name: string
  email: string
  role: string
  organization: string
  phone: string
  avatar: string
  trade: string
  location: string
  notifications: boolean
  offlineSync: boolean
  fontFamily?: AppFontFamily
  themeMode?: AppThemeMode
}

interface ProfileScreenProps {
  profile: UserProfileData
  onUpdateProfile: (updated: Partial<UserProfileData>) => void
  onBack: () => void
  onSignOut: () => void
  onOpenCaptures?: () => void
  onOpenHelp?: () => void
  onOpenTickets?: () => void
  onNewTicket?: () => void
  onOpenTerms?: () => void
  onOpenPrivacy?: () => void
  openTicketCount?: number
}

export function ProfileScreen({
  profile,
  onUpdateProfile,
  onBack,
  onSignOut,
  onOpenHelp,
  onOpenTickets,
  onNewTicket,
  onOpenTerms,
  onOpenPrivacy,
  openTicketCount = 0,
}: ProfileScreenProps) {
  const [formData, setFormData] = useState<UserProfileData>(profile)
  const [savedToast, setSavedToast] = useState(false)
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isDark =
    formData.themeMode === "dark" ||
    (typeof localStorage !== "undefined" &&
      localStorage.getItem("app_theme") === "dark")

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setFormData((prev) => ({ ...prev, avatar: url }))
    onUpdateProfile({ avatar: url })
  }

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    onUpdateProfile(formData)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2200)
  }

  const currentFont: AppFontFamily =
    formData.fontFamily ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem("app_font")
      : null) as AppFontFamily ||
    "proxima"

  const handleFontChange = (font: AppFontFamily) => {
    setFormData((prev) => ({ ...prev, fontFamily: font }))
    onUpdateProfile({ fontFamily: font })
    document.documentElement.setAttribute("data-font", font)
    document.body.setAttribute("data-font", font)
    const rootEl = document.getElementById("root")
    if (rootEl) rootEl.setAttribute("data-font", font)
    localStorage.setItem("app_font", font)
  }

  const handleThemeChange = (mode: AppThemeMode) => {
    setFormData((prev) => ({ ...prev, themeMode: mode }))
    onUpdateProfile({ themeMode: mode })
    document.documentElement.setAttribute("data-theme", mode)
    document.body.setAttribute("data-theme", mode)
    const rootEl = document.getElementById("root")
    if (rootEl) rootEl.setAttribute("data-theme", mode)
    if (mode === "dark") {
      document.documentElement.classList.add("dark")
      document.body.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
      document.body.classList.remove("dark")
    }
    localStorage.setItem("app_theme", mode)
  }

  const fontOptions: {
    id: AppFontFamily
    name: string
    badge: string
    fontClass: string
  }[] = [
    {
      id: "proxima",
      name: "Proxima Nova",
      badge: "Default Local",
      fontClass: "font-proxima",
    },
    {
      id: "helvena",
      name: "Helvena",
      badge: "Local Grotesk",
      fontClass: "font-helvena",
    },
    {
      id: "mulish",
      name: "Mulish",
      badge: "Google Font",
      fontClass: "font-mulish",
    },
    {
      id: "googlesans",
      name: "Google Sans",
      badge: "Google Font",
      fontClass: "font-googlesans",
    },
    {
      id: "sourcesans3",
      name: "Source Sans 3",
      badge: "Google Font",
      fontClass: "font-sourcesans3",
    },
  ]

  return (
    <div
      className={`relative flex flex-col h-full select-none overflow-hidden transition-colors duration-200 ${
        isDark ? "bg-[#0a0c14] text-slate-100" : "bg-white text-slate-900"
      }`}
    >
      {/* Sleek Minimalist Header */}
      <header
        className={`shrink-0 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between z-20 transition-colors ${
          isDark
            ? "bg-[#0e111d]/90 border-white/[0.08]"
            : "bg-white/95 border-slate-100"
        }`}
      >
        <BackButton
          onClick={onBack}
          className={
            isDark ? "!bg-white/10 !text-white hover:!bg-white/15" : ""
          }
        />

        <h1
          className={`text-[15px] font-bold ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          Profile
        </h1>

        <button
          type="button"
          onClick={() => handleSave()}
          className={`px-3.5 py-1.5 rounded-full bg-[#0055ff] text-white text-[12px] font-semibold hover:bg-blue-600 active:scale-95 transition-all cursor-pointer shadow-xs ${
            isDark ? "shadow-[0_0_14px_rgba(0,85,255,0.4)]" : ""
          }`}
        >
          Save
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Seamless Hero Profile Header */}
        <div className="flex flex-col items-center text-center">
          {/* Avatar with Camera Icon */}
          <div className="relative">
            <div
              className={`w-20 h-20 rounded-full overflow-hidden transition-all ${
                isDark
                  ? "ring-2 ring-blue-500/40 shadow-[0_0_24px_rgba(0,85,255,0.25)] bg-[#121524]"
                  : "ring-4 ring-slate-100 bg-slate-100 shadow-sm"
              }`}
            >
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0055ff] text-white flex items-center justify-center shadow-md hover:bg-blue-600 active:scale-90 transition-all border-2 cursor-pointer ${
                isDark ? "border-[#0a0c14]" : "border-white"
              }`}
              aria-label="Upload photo"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* Name & Subtitle */}
          <h2
            className={`text-[17px] font-bold mt-2.5 tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {formData.name}
          </h2>
          <p
            className={`text-[12.5px] font-medium mt-0.5 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {formData.role} ·{" "}
            <span className={isDark ? "text-slate-200" : "text-slate-700"}>
              {formData.organization}
            </span>
          </p>
        </div>

        {/* Clean Integrated Stats Row */}
        <div
          className={`grid grid-cols-3 py-3 transition-colors ${
            isDark
              ? "border-y border-white/[0.08] bg-[#101322]/40 rounded-xl"
              : "border-y border-slate-100"
          }`}
        >
          <div className="text-center">
            <div
              className={`text-[17px] font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              32
            </div>
            <div className="text-[10.5px] font-medium text-slate-400 mt-0.5">
              Tasks Done
            </div>
          </div>
          <div
            className={`text-center border-x ${
              isDark ? "border-white/[0.08]" : "border-slate-100"
            }`}
          >
            <div
              className={`text-[17px] font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              18
            </div>
            <div className="text-[10.5px] font-medium text-slate-400 mt-0.5">
              Issues Logged
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-[17px] font-bold tracking-tight ${
                isDark ? "text-emerald-400" : "text-emerald-600"
              }`}
            >
              98%
            </div>
            <div className="text-[10.5px] font-medium text-slate-400 mt-0.5">
              On-time Score
            </div>
          </div>
        </div>

        {/* Clean Grouped Form Rows */}
        <div className="space-y-4">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            Personal Information
          </span>

          <div
            className={`divide-y rounded-2xl border px-4 transition-colors ${
              isDark
                ? "divide-white/[0.06] bg-[#121524] border-white/[0.08]"
                : "divide-slate-100 bg-slate-50/60 border-slate-100/80"
            }`}
          >
            {/* Full Name */}
            <div className="py-2.5 flex items-center justify-between gap-3">
              <label className="text-[12.5px] font-medium text-slate-400 shrink-0 w-28">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`text-[13px] font-semibold bg-transparent text-right outline-none flex-1 transition-colors ${
                  isDark
                    ? "text-white focus:text-blue-400"
                    : "text-slate-900 focus:text-[#0055ff]"
                }`}
              />
            </div>

            {/* Email */}
            <div className="py-2.5 flex items-center justify-between gap-3">
              <label className="text-[12.5px] font-medium text-slate-400 shrink-0 w-28">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`text-[13px] font-semibold bg-transparent text-right outline-none flex-1 transition-colors ${
                  isDark
                    ? "text-white focus:text-blue-400"
                    : "text-slate-900 focus:text-[#0055ff]"
                }`}
              />
            </div>

            {/* Phone */}
            <div className="py-2.5 flex items-center justify-between gap-3">
              <label className="text-[12.5px] font-medium text-slate-400 shrink-0 w-28">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className={`text-[13px] font-semibold bg-transparent text-right outline-none flex-1 transition-colors ${
                  isDark
                    ? "text-white focus:text-blue-400"
                    : "text-slate-900 focus:text-[#0055ff]"
                }`}
              />
            </div>

            {/* Trade / Discipline */}
            <div className="py-2.5 flex items-center justify-between gap-3">
              <label className="text-[12.5px] font-medium text-slate-400 shrink-0 w-28">
                Specialization
              </label>
              <input
                type="text"
                value={formData.trade}
                onChange={(e) =>
                  setFormData({ ...formData, trade: e.target.value })
                }
                className={`text-[13px] font-semibold bg-transparent text-right outline-none flex-1 transition-colors ${
                  isDark
                    ? "text-white focus:text-blue-400"
                    : "text-slate-900 focus:text-[#0055ff]"
                }`}
              />
            </div>

            {/* Location */}
            <div className="py-2.5 flex items-center justify-between gap-3">
              <label className="text-[12.5px] font-medium text-slate-400 shrink-0 w-28">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className={`text-[13px] font-semibold bg-transparent text-right outline-none flex-1 transition-colors ${
                  isDark
                    ? "text-white focus:text-blue-400"
                    : "text-slate-900 focus:text-[#0055ff]"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="space-y-4">
          <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            Preferences
          </span>

          <div
            className={`divide-y rounded-2xl border px-4 transition-colors ${
              isDark
                ? "divide-white/[0.06] bg-[#121524] border-white/[0.08]"
                : "divide-slate-100 bg-slate-50/60 border-slate-100/80"
            }`}
          >
            <div className="py-3 flex items-center justify-between">
              <div>
                <div
                  className={`text-[13px] font-semibold ${
                    isDark ? "text-white" : "text-slate-800"
                  }`}
                >
                  Push Notifications
                </div>
                <div className="text-[11px] text-slate-400">
                  Issue alerts and RFI updates
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    notifications: !formData.notifications,
                  })
                }
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  formData.notifications
                    ? "bg-[#0055ff] shadow-[0_0_10px_rgba(0,85,255,0.4)]"
                    : isDark
                      ? "bg-slate-700/80 ring-1 ring-white/15"
                      : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white switch-thumb transition-transform shadow-xs ${
                    formData.notifications ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <div
                  className={`text-[13px] font-semibold ${
                    isDark ? "text-white" : "text-slate-800"
                  }`}
                >
                  Offline Field Cache
                </div>
                <div className="text-[11px] text-slate-400">
                  Save 2D drawings for offline use
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    offlineSync: !formData.offlineSync,
                  })
                }
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  formData.offlineSync
                    ? "bg-[#0055ff] shadow-[0_0_10px_rgba(0,85,255,0.4)]"
                    : isDark
                      ? "bg-slate-700/80 ring-1 ring-white/15"
                      : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white switch-thumb transition-transform shadow-xs ${
                    formData.offlineSync ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Theme Settings Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
              Theme Settings
            </span>
            <span
              className={`text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${
                isDark
                  ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                  : "bg-blue-50 text-[#0055ff] border-blue-100/80"
              }`}
            >
              {isDark ? "Aesthetic Dark" : "Clean Light"}
            </span>
          </div>

          <div
            className={`rounded-2xl border p-3.5 space-y-3 transition-colors ${
              isDark
                ? "bg-[#121524] border-white/[0.08] shadow-lg shadow-black/20"
                : "bg-slate-50/60 border-slate-100/80"
            }`}
          >
            {/* Theme Mode Selector (Light vs Dark Aesthetic Vibe) */}
            <div
              className={`flex items-center justify-between pb-3 border-b ${
                isDark ? "border-white/[0.07]" : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isDark
                      ? "bg-blue-500/15 text-blue-400 shadow-[0_0_12px_rgba(0,85,255,0.2)]"
                      : "bg-blue-50 text-[#0055ff]"
                  }`}
                >
                  {isDark ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  )}
                </div>
                <div>
                  <div
                    className={`text-[12.5px] font-semibold ${
                      isDark ? "text-white" : "text-slate-800"
                    }`}
                  >
                    Dark Theme
                  </div>
                  <div className="text-[10.5px] text-slate-400">
                    {isDark ? "Aesthetic dark vibe" : "Light daylight mode"}
                  </div>
                </div>
              </div>

              {/* Simple On / Off Toggle Switch */}
              <button
                type="button"
                onClick={() => handleThemeChange(isDark ? "light" : "dark")}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  isDark
                    ? "bg-[#0055ff] shadow-[0_0_10px_rgba(0,85,255,0.4)]"
                    : "bg-slate-300"
                }`}
                aria-label="Toggle dark theme"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white switch-thumb transition-transform shadow-xs ${
                    isDark ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Simple Compact Font Dropdown */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isDark
                      ? "bg-purple-500/15 text-purple-400"
                      : "bg-purple-50 text-purple-600"
                  }`}
                >
                  <span className="text-[12px] font-bold">Aa</span>
                </div>
                <div>
                  <div
                    className={`text-[12.5px] font-semibold ${
                      isDark ? "text-white" : "text-slate-800"
                    }`}
                  >
                    Font Family
                  </div>
                  <div className="text-[10.5px] text-slate-400">
                    App typography style
                  </div>
                </div>
              </div>

              {/* Sleek Custom Dropdown Button & Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[12px] font-semibold transition-all cursor-pointer active:scale-95 ${
                    isDark
                      ? "bg-[#181c2f] border-white/10 text-white hover:border-blue-500/50 shadow-sm"
                      : "bg-white border-slate-200 text-slate-800 hover:border-blue-500 shadow-2xs"
                  }`}
                >
                  <span
                    className={
                      fontOptions.find((f) => f.id === currentFont)
                        ?.fontClass || "font-proxima"
                    }
                  >
                    {fontOptions.find((f) => f.id === currentFont)?.name ||
                      "Proxima Nova"}
                  </span>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${
                      fontDropdownOpen ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>

                {/* Compact font menu (opens upward) */}
                {fontDropdownOpen && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setFontDropdownOpen(false)}
                  />
                )}
                <FloatingMenu
                  open={fontDropdownOpen}
                  align="right"
                  placement="top"
                  widthClassName="w-44"
                >
                  <MenuCaption>Typeface</MenuCaption>
                  {fontOptions.map((opt) => (
                    <MenuItem
                      key={opt.id}
                      selected={currentFont === opt.id}
                      onClick={() => {
                        handleFontChange(opt.id)
                        setFontDropdownOpen(false)
                      }}
                      className={opt.fontClass}
                    >
                      {opt.name}
                    </MenuItem>
                  ))}
                </FloatingMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Support & Legal Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
              Support &amp; Legal
            </span>
            {openTicketCount > 0 && (
              <span
                className={`text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${
                  isDark
                    ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                    : "bg-blue-50 text-[#0055ff] border-blue-100/80"
                }`}
              >
                {openTicketCount} open ticket{openTicketCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div
            className={`rounded-2xl border divide-y overflow-hidden transition-colors ${
              isDark
                ? "bg-[#121524] border-white/[0.08] divide-white/[0.07] shadow-lg shadow-black/20"
                : "bg-slate-50/60 border-slate-100/80 divide-slate-100"
            }`}
          >
            <SupportRow
              isDark={isDark}
              tone="blue"
              icon={
                <>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.4-3 4" />
                  <line x1="12" y1="17.5" x2="12" y2="17.5" />
                </>
              }
              title="Help Centre &amp; FAQ"
              detail="Answers to the questions we get most"
              onClick={onOpenHelp}
            />
            <SupportRow
              isDark={isDark}
              tone="violet"
              icon={
                <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.6-.8L3 21l1.9-5A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4Z" />
              }
              title="Contact support"
              detail={
                openTicketCount > 0
                  ? `${openTicketCount} ticket${
                    openTicketCount > 1 ? "s" : ""
                  } waiting on a reply`
                  : "Raise a ticket and talk to a person"
              }
              badge={openTicketCount > 0 ? openTicketCount : undefined}
              onClick={openTicketCount > 0 ? onOpenTickets : onNewTicket}
            />
            <SupportRow
              isDark={isDark}
              tone="slate"
              icon={
                <>
                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5Z" />
                  <path d="M8 7.5h7M8 11h7" />
                </>
              }
              title="Terms &amp; Conditions"
              detail="Updated 1 July 2026"
              onClick={onOpenTerms}
            />
            <SupportRow
              isDark={isDark}
              tone="emerald"
              icon={
                <path d="M12 3l7 3v5.5c0 4.4-2.9 8.3-7 9.5-4.1-1.2-7-5.1-7-9.5V6Z" />
              }
              title="Privacy Policy"
              detail="What we collect and why"
              onClick={onOpenPrivacy}
            />
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="pt-2 pb-6">
          <button
            type="button"
            onClick={onSignOut}
            className={`py-2.5 px-3 text-left text-[13.5px] font-semibold transition-colors cursor-pointer rounded-xl flex items-center gap-2 active:scale-98 ${
              isDark
                ? "text-rose-400 hover:bg-rose-950/30 hover:text-rose-300"
                : "text-red-500 hover:text-red-600 hover:bg-red-50/50"
            }`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </main>

      {/* Saved Toast Alert */}
      {savedToast && (
        <div
          className={`absolute bottom-5 left-1/2 -translate-x-1/2 backdrop-blur-md text-[12px] font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-slide-up z-50 ${
            isDark
              ? "bg-[#14182a]/95 border border-white/10 text-white shadow-[0_0_20px_rgba(0,0,0,0.8)]"
              : "bg-slate-900/90 text-white"
          }`}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Profile saved</span>
        </div>
      )}
    </div>
  )
}

const SUPPORT_TONES: Record<string, { light: string; dark: string }> = {
  blue: {
    light: "bg-blue-50 text-[#0055ff]",
    dark: "bg-blue-500/15 text-blue-400",
  },
  violet: {
    light: "bg-violet-50 text-violet-600",
    dark: "bg-violet-500/15 text-violet-400",
  },
  emerald: {
    light: "bg-emerald-50 text-emerald-600",
    dark: "bg-emerald-500/15 text-emerald-400",
  },
  slate: {
    light: "bg-slate-100 text-slate-600",
    dark: "bg-white/10 text-slate-300",
  },
}

/** One tappable row in the Support & Legal card. */
function SupportRow({
  isDark,
  tone,
  icon,
  title,
  detail,
  badge,
  onClick,
}: {
  isDark: boolean
  tone: keyof typeof SUPPORT_TONES
  icon: ReactNode
  title: string
  detail: string
  badge?: number
  onClick?: () => void
}) {
  const swatch = SUPPORT_TONES[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-left transition-colors cursor-pointer active:scale-[0.99] ${
        isDark ? "hover:bg-white/[0.04]" : "hover:bg-white/70"
      }`}
    >
      <span
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
          isDark ? swatch.dark : swatch.light
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {icon}
        </svg>
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block text-[12.5px] font-semibold leading-tight ${
            isDark ? "text-white" : "text-slate-800"
          }`}
        >
          {title}
        </span>
        <span className="block text-[10.5px] text-slate-400 leading-tight mt-0.5">
          {detail}
        </span>
      </span>

      {badge !== undefined && (
        <span className="shrink-0 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#0055ff] px-1 text-[9.5px] font-bold tabular-nums text-white">
          {badge}
        </span>
      )}

      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-slate-400"
        aria-hidden="true"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  )
}

export default ProfileScreen
