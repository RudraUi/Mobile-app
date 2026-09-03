import { useState, useEffect } from "react"
import camera360Img from "../assets/360camera.png"

interface SiteCaptureScreenProps {
  onBack: () => void
  onComplete?: (captureItem: any) => void
  onOpenCaptures?: () => void
}

type CaptureStep = "pairing" | "live_view" | "split_view" | "recording" | "media_sync" // WiFi check & Insta360 discovery/connecting/connected // Fullscreen 360 live camera view with floating minimap // 360 live feed on top + CAD drawing on bottom // Live walk active // Camera media list, Sync Local & Sync Cloud

type PairingPhase = "welcome" | "searching" | "found" | "connecting" | "connected"

const DRAWING_PLANS = [
  { id: "L03-STR", name: "Level 03 - Structural Plan", code: "STR-301" },
  { id: "L03-MEP", name: "Level 03 - MEP Plan", code: "MEP-302" },
  { id: "L04-STR", name: "Level 04 - Slab Plan", code: "STR-401" },
]

export function SiteCaptureScreen({
  onBack,
  onComplete,
  onOpenCaptures,
}: SiteCaptureScreenProps) {
  const [step, setStep] = useState<CaptureStep>("pairing")
  const [pairingPhase, setPairingPhase] = useState<PairingPhase>("welcome")
  const [circleProgress, setCircleProgress] = useState(0)

  // Camera Telemetry
  const telemetry = {
    model: "Insta360 X4",
    serial: "IX4-884920",
    battery: 88,
    storageFreeGb: 184.2,
    resolution: "8K 30fps",
  }

  // 360 Camera View Interaction
  const [panX, setPanX] = useState(0)
  const [isDraggingPan, setIsDraggingPan] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [captureMode, setCaptureMode] = useState<"walk" | "interval" | "photo">(
    "walk",
  )

  // CAD Drawing & Split screen state
  const [selectedPlanId, setSelectedPlanId] = useState("L03-STR")
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false)
  const [isLocationSynced, setIsLocationSynced] = useState(false)
  const [userStandingPos, setUserStandingPos] = useState({ x: 38, y: 72 })

  // Recording State & Blue path progress
  const [isRecording, setIsRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [walkProgress, setWalkProgress] = useState(0) // 0 to 100%
  const [keyframesCount, setKeyframesCount] = useState(0)
  const [distanceMeters, setDistanceMeters] = useState(0)

  // Media Sync State
  const [syncLocalProgress, setSyncLocalProgress] = useState<number | null>(
    null,
  )
  const [syncCloudProgress, setSyncCloudProgress] = useState<number | null>(
    null,
  )
  const [isSyncLocalDone, setIsSyncLocalDone] = useState(false)
  const [isSyncCloudDone, setIsSyncCloudDone] = useState(false)
  const [isPoorInternet, setIsPoorInternet] = useState(false)

  // Step 1: Auto-search and find device after 1.4 seconds
  useEffect(() => {
    if (step === "pairing" && pairingPhase === "searching") {
      const timer = setTimeout(() => {
        setPairingPhase("found")
      }, 1400)
      return () => clearTimeout(timer)
    }
  }, [step, pairingPhase])

  // Step 2 -> 3: Connecting circular progress animation
  useEffect(() => {
    if (step === "pairing" && pairingPhase === "connecting") {
      setCircleProgress(0)
      const interval = setInterval(() => {
        setCircleProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setPairingPhase("connected")
            return 100
          }
          return prev + 10
        })
      }, 140)
      return () => clearInterval(interval)
    }
  }, [step, pairingPhase])

  // Recording timer & path walk progress effect
  useEffect(() => {
    let timer: any
    let walkTimer: any
    if (isRecording) {
      timer = setInterval(() => {
        setRecordSeconds((s) => s + 1)
      }, 1000)

      walkTimer = setInterval(() => {
        setWalkProgress((p) => {
          if (p >= 100) return 100
          const next = p + 2.5
          setDistanceMeters(Number((next * 0.58).toFixed(1)))
          setKeyframesCount(Math.floor(next / 5.5))
          return next
        })
      }, 600)
    }
    return () => {
      clearInterval(timer)
      clearInterval(walkTimer)
    }
  }, [isRecording])

  // Handle local sync transfer
  const handleSyncLocal = () => {
    setSyncLocalProgress(0)
    const interval = setInterval(() => {
      setSyncLocalProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval)
          setIsSyncLocalDone(true)
          return 100
        }
        return prev + 20
      })
    }, 250)
  }

  // Handle cloud sync transfer
  const handleSyncCloud = () => {
    if (isPoorInternet) return
    setSyncCloudProgress(0)
    const interval = setInterval(() => {
      setSyncCloudProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval)
          setIsSyncCloudDone(true)
          return 100
        }
        return prev + 15
      })
    }, 280)
  }

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  const selectedPlan =
    DRAWING_PLANS.find((p) => p.id === selectedPlanId) || DRAWING_PLANS[0]

  // Circular progress calculations for connecting state (radius 48, circumference ~301.6)
  const circleRadius = 48
  const circleCircumference = 2 * Math.PI * circleRadius
  const circleDashOffset =
    circleCircumference - (circleProgress / 100) * circleCircumference

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden bg-white text-slate-900 select-none"
      style={{
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header only on Welcome / Pairing screens */}
      {(step === "pairing" || step === "media_sync") && (
        <header className="relative z-30 flex h-11 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (step === "pairing" && pairingPhase !== "welcome") {
                  setPairingPhase("welcome")
                } else {
                  onBack()
                }
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 active:scale-95"
              aria-label="Back"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span className="text-[13.5px] font-bold text-slate-900">
              Site Capture
            </span>
          </div>

          {/* Minimal status indicator if connected */}
          {pairingPhase === "connected" && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              <span>Insta360 X4</span>
              <span className="text-slate-300">·</span>
              <span>{telemetry.battery}%</span>
            </div>
          )}
        </header>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: WELCOME & DEVICES -> SEARCH -> FOUND -> CONNECTING -> CONNECTED */}
      {/* ========================================================================= */}
      {step === "pairing" && (
        <div className="relative flex flex-1 flex-col justify-between p-4.5 animate-fade-in">
          {/* PHASE 0: WELCOME & PREVIOUSLY CONNECTED DEVICES */}
          {pairingPhase === "welcome" && (
            <div className="w-full flex flex-1 flex-col justify-between animate-fade-in">
              <div>
                {/* Top Prominent Camera Graphic */}
                <div className="flex flex-col items-center pt-2 text-center">
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-blue-50/70 border border-blue-100/80 shadow-xs p-2.5">
                    <img
                      src={camera360Img}
                      alt="360 Camera"
                      className="h-22 w-22 object-contain drop-shadow-md transition-transform hover:scale-105"
                    />
                  </div>

                  <h2 className="mt-3.5 text-[18px] font-bold text-slate-900">
                    360° Site Camera
                  </h2>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    Connect your 360 camera to capture site walkthroughs
                  </p>
                </div>

                {/* Paired Devices List */}
                <div className="mt-5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Paired Devices
                    </span>
                    <span className="text-[10px] text-slate-400">
                      2 cameras
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {/* Device 1: Available Nearby */}
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100/50 p-1">
                          <img
                            src={camera360Img}
                            alt="Insta360 X4"
                            className="h-9 w-9 object-contain"
                          />
                        </div>

                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[14px] font-bold text-slate-900">
                              {telemetry.model}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Available
                            </span>
                            <span>·</span>
                            <span>{telemetry.battery}% 🔋</span>
                          </div>
                        </div>
                      </div>

                      {/* Connect Button */}
                      <button
                        type="button"
                        onClick={() => setPairingPhase("connecting")}
                        className="rounded-full bg-blue-600 px-4 py-1.5 text-[12px] font-semibold text-white shadow-xs transition-all hover:bg-blue-700 active:scale-95"
                      >
                        Connect
                      </button>
                    </div>

                    {/* Device 2: Offline / Not in Range */}
                    <div className="flex items-center justify-between py-3 opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200/50 p-1">
                          <img
                            src={camera360Img}
                            alt="Insta360 X3"
                            className="h-9 w-9 object-contain grayscale"
                          />
                        </div>

                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[14px] font-bold text-slate-700">
                              Insta360 X3 (Site Unit B)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 text-slate-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                              Not in Range
                            </span>
                            <span>·</span>
                            <span>Last seen 2d ago</span>
                          </div>
                        </div>
                      </div>

                      {/* Offline badge */}
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-400">
                        Offline
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Connect New Camera */}
              <div className="pt-4 pb-1">
                <button
                  type="button"
                  onClick={() => setPairingPhase("searching")}
                  className="flex h-10.5 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 text-[13px] font-semibold text-slate-800 transition-all hover:bg-slate-100 active:scale-95 shadow-xs"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Pair New Camera</span>
                </button>
              </div>
            </div>
          )}

          {pairingPhase !== "welcome" && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              {/* PHASE A: SEARCHING FOR NEARBY CAMERAS */}
              {pairingPhase === "searching" && (
                <div className="flex flex-col items-center animate-fade-in">
                  {/* Radar Ripple Waves Animation with Big Prominent Camera */}
                  <div className="relative flex h-36 w-36 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping" />
                    <div className="absolute inset-3 rounded-full bg-blue-500/15" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50/80 p-2">
                      <img
                        src={camera360Img}
                        alt="360 Camera"
                        className="h-20 w-20 object-contain drop-shadow-md"
                      />
                    </div>
                  </div>

                  <h2 className="mt-4 text-[16px] font-bold text-slate-900">
                    Searching for nearby cameras...
                  </h2>
                  <p className="mt-1 text-[12px] text-slate-400">
                    Scanning for 5GHz Wi-Fi Direct devices
                  </p>
                </div>
              )}

              {/* PHASE B: DUMMY DEVICE FOUND - VERTICAL STACKED (ONE BELOW ANOTHER) */}
              {pairingPhase === "found" && (
                <div className="w-full flex flex-col items-center text-center animate-fade-in">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    1 Device Found Nearby
                  </span>

                  {/* 1. Big Prominent 360 Camera Image */}
                  <div className="mt-4 flex h-32 w-32 items-center justify-center rounded-3xl bg-blue-50/60 p-3">
                    <img
                      src={camera360Img}
                      alt="Insta360 X4"
                      className="h-26 w-26 object-contain drop-shadow-lg"
                    />
                  </div>

                  {/* 2. Device Name */}
                  <div className="mt-3.5 flex items-center justify-center gap-1.5">
                    <h2 className="text-[18px] font-bold text-slate-900">
                      {telemetry.model}
                    </h2>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {/* 3. Subtitle / Specs */}
                  <p className="mt-0.5 text-[12px] text-slate-400">
                    {telemetry.serial} · 5GHz Wi-Fi Direct
                  </p>

                  {/* 4. Simple Blue Rounded Connect Button (Compact Width) */}
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setPairingPhase("connecting")}
                      className="flex h-9.5 min-w-[130px] px-6 items-center justify-center rounded-full bg-blue-600 text-[12.5px] font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE C: ANIMATED CONNECTING IN CIRCLE PROGRESS */}
              {pairingPhase === "connecting" && (
                <div className="flex flex-col items-center animate-fade-in">
                  {/* SVG Circular Progress Wheel with Prominent Camera */}
                  <div className="relative flex h-40 w-40 items-center justify-center">
                    <svg
                      className="h-full w-full -rotate-90 transform"
                      viewBox="0 0 120 120"
                    >
                      {/* Background track circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r={circleRadius}
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="6"
                      />
                      {/* Animated Progress circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r={circleRadius}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circleCircumference}
                        strokeDashoffset={circleDashOffset}
                        className="transition-all duration-150 ease-out"
                      />
                    </svg>

                    {/* Center percentage & prominent camera image */}
                    <div className="absolute flex flex-col items-center justify-center">
                      <img
                        src={camera360Img}
                        alt="Connecting camera"
                        className="h-13 w-13 object-contain mb-0.5 drop-shadow-sm"
                      />
                      <span className="text-[13.5px] font-bold text-slate-900 leading-tight">
                        {circleProgress}%
                      </span>
                    </div>
                  </div>

                  <h2 className="mt-4 text-[15px] font-bold text-slate-900">
                    Connecting to Insta360 X4...
                  </h2>
                  <p className="mt-0.5 text-[11.5px] text-slate-400">
                    Authenticating Wi-Fi Direct stream
                  </p>
                </div>
              )}

              {/* PHASE D: CONNECTED IN CENTER WITH BIG BLUE TICK ANIMATION */}
              {pairingPhase === "connected" && (
                <div className="flex flex-col items-center animate-fade-in">
                  {/* Big Blue Tick Badge */}
                  <div className="relative flex h-24 w-24 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-blue-500/15 animate-ping" />
                    <div className="absolute inset-2 rounded-full bg-blue-50" />
                    <div className="relative flex h-18 w-18 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)] transition-transform duration-500 scale-100">
                      <svg
                        width="38"
                        height="38"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>

                  <h2 className="mt-4 text-[17px] font-bold text-slate-900">
                    Insta360 X4 Connected!
                  </h2>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    8K 360° Live Stream Ready
                  </p>

                  {/* Minimal Telemetry Line (No Box-in-Box) */}
                  <div className="mt-5 flex items-center justify-center gap-4 text-[12px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">8K</span>
                      <span className="text-slate-400">30fps</span>
                    </div>
                    <span className="text-slate-200">|</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-blue-600">
                        {telemetry.battery}%
                      </span>
                      <span className="text-slate-400">Battery</span>
                    </div>
                    <span className="text-slate-200">|</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-blue-600">
                        {telemetry.storageFreeGb} GB
                      </span>
                      <span className="text-slate-400">Free</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Action (Visible once connected) */}
          {pairingPhase === "connected" && (
            <div className="pb-2 animate-fade-in">
              <button
                type="button"
                onClick={() => setStep("live_view")}
                className="flex h-10.5 w-full items-center justify-center rounded-full bg-blue-600 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
              >
                Launch Live 360° View
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2 & 3: LIVE 360 VIEW WITH FLOATING MINIMAP & SPLIT DRAWING VIEW */}
      {/* ========================================================================= */}
      {(step === "live_view" ||
        step === "split_view" ||
        step === "recording") && (
        <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
          {/* Top Half: 360 Camera Feed Canvas */}
          <div
            className={
              "relative flex-1 overflow-hidden transition-all duration-300 " +
              (step === "live_view"
                ? "h-full"
                : "h-[45%] shrink-0 border-b border-slate-100")
            }
            onMouseDown={(e) => {
              setIsDraggingPan(true)
              setDragStartX(e.clientX)
            }}
            onMouseMove={(e) => {
              if (isDraggingPan) {
                const diff = e.clientX - dragStartX
                setPanX((prev) => prev + diff * 0.5)
                setDragStartX(e.clientX)
              }
            }}
            onMouseUp={() => setIsDraggingPan(false)}
            onMouseLeave={() => setIsDraggingPan(false)}
            onTouchStart={(e) => {
              setIsDraggingPan(true)
              setDragStartX(e.touches[0].clientX)
            }}
            onTouchMove={(e) => {
              if (isDraggingPan) {
                const diff = e.touches[0].clientX - dragStartX
                setPanX((prev) => prev + diff * 0.5)
                setDragStartX(e.touches[0].clientX)
              }
            }}
            onTouchEnd={() => setIsDraggingPan(false)}
          >
            {/* 360 Panoramic Live FPP Construction Background */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform"
              style={{
                backgroundImage: `url('/assets/site_capture_live_fpp.jpg')`,
                transform: `scale(1.25) translateX(${panX % 180}px)`,
                filter: "brightness(0.98) contrast(1.02)",
              }}
            />

            {/* Top Floating Transparent Overlay (Back button + Telemetry + Split button) */}
            <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
              {/* Left: Transparent Floating Circular Back Button + Live Tag */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep("pairing")}
                  className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 shadow-md hover:bg-black/60 active:scale-95 transition-all"
                  aria-label="Back to camera list"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>

                <span className="flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-white/20 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>8K LIVE</span>
                </span>
              </div>

              {/* Right: Floating Telemetry Text & Floating Circular Split Toggle Button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white border border-white/20 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{telemetry.model}</span>
                  <span className="text-white/40">·</span>
                  <span>{telemetry.battery}% 🔋</span>
                </div>

                {/* Split / Full toggle button - Transparent Floating Circular */}
                <button
                  type="button"
                  onClick={() => {
                    if (step === "live_view") {
                      setStep("split_view")
                    } else {
                      setStep("live_view")
                    }
                  }}
                  className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 shadow-md hover:bg-black/60 active:scale-95 transition-all"
                  aria-label={
                    step === "live_view"
                      ? "Split Drawing View"
                      : "Full 360 View"
                  }
                  title={
                    step === "live_view"
                      ? "Split Drawing View"
                      : "Full 360 View"
                  }
                >
                  {step === "live_view" ? (
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
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 12h18" />
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
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* ================================================================= */}
            {/* USER REQUEST: FLOATING MINIMAP INSIDE FULL 360 VIEW WITH LIVE PATH */}
            {/* ================================================================= */}
            {step === "live_view" && (
              <div
                onClick={() => setStep("split_view")}
                className="absolute right-3 bottom-14 z-20 w-36 h-24 rounded-xl border border-white/80 bg-white/95 p-1.5 shadow-lg backdrop-blur-xs cursor-pointer transition-all hover:scale-105 active:scale-95 animate-fade-in"
                title="Tap to open full drawing split view"
              >
                <div className="flex items-center justify-between px-0.5 pb-1">
                  <span className="text-[8.5px] font-bold text-slate-700 truncate">
                    {selectedPlan.name}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>

                {/* Minimap Blueprint Canvas */}
                <div className="relative h-[calc(100%-16px)] w-full overflow-hidden rounded-lg bg-[#f8fafc] border border-slate-100">
                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 400 250"
                  >
                    <rect
                      x="25"
                      y="25"
                      width="350"
                      height="200"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="3"
                    />
                    <line
                      x1="25"
                      y1="125"
                      x2="375"
                      y2="125"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />

                    {/* Columns */}
                    <rect
                      x="50"
                      y="120"
                      width="10"
                      height="10"
                      fill="#3b82f6"
                    />
                    <rect
                      x="140"
                      y="120"
                      width="10"
                      height="10"
                      fill="#3b82f6"
                    />
                    <rect
                      x="260"
                      y="120"
                      width="10"
                      height="10"
                      fill="#3b82f6"
                    />
                    <rect
                      x="350"
                      y="120"
                      width="10"
                      height="10"
                      fill="#3b82f6"
                    />

                    {/* Planned Yellow Path */}
                    <path
                      d="M 60 125 L 140 125 L 260 125 L 340 125 L 340 60"
                      fill="none"
                      stroke="#eab308"
                      strokeWidth="5"
                      strokeDasharray="8 6"
                    />

                    {/* Captured Blue Path */}
                    {isRecording && (
                      <path
                        d="M 60 125 L 140 125 L 260 125 L 340 125 L 340 60"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray="400"
                        strokeDashoffset={400 - (walkProgress / 100) * 400}
                      />
                    )}
                  </svg>

                  {/* Minimap User Dot */}
                  <div
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${
                        isRecording
                          ? 15 + (walkProgress / 100) * 70
                          : userStandingPos.x
                      }%`,
                      top: `${isRecording ? 50 : userStandingPos.y}%`,
                    }}
                  >
                    <div className="h-2.5 w-2.5 rounded-full border border-white bg-blue-600 shadow-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Floating Capture Dock in Full 360 view */}
            {step === "live_view" && (
              <div className="absolute bottom-3.5 left-3 right-3 flex items-center justify-center pointer-events-none">
                {/* Quick Capture Pill */}
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecording(true)
                      setRecordSeconds(0)
                      setWalkProgress(0)
                    }}
                    className="pointer-events-auto flex h-9 items-center gap-2 rounded-full bg-blue-600 px-5 text-[12.5px] font-semibold text-white shadow-md hover:bg-blue-700 active:scale-95"
                  >
                    <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                    <span>Start Capture</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecording(false)
                      setStep("media_sync")
                    }}
                    className="pointer-events-auto flex h-9 items-center gap-2 rounded-full bg-slate-900 px-5 text-[12.5px] font-semibold text-white shadow-md hover:bg-slate-800 active:scale-95"
                  >
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span>Finish Walk ({formatTime(recordSeconds)})</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Half: CAD Drawing View (Split screen mode) */}
          {(step === "split_view" || step === "recording") && (
            <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
              {/* Drawing Header */}
              <div className="relative z-10 flex h-8 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-3 text-[11px]">
                <button
                  type="button"
                  onClick={() => setIsPlanDropdownOpen(!isPlanDropdownOpen)}
                  className="flex items-center gap-1 font-bold text-slate-800 hover:text-blue-600"
                >
                  <span>{selectedPlan.name}</span>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-slate-400"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isPlanDropdownOpen && (
                  <div className="absolute top-8 left-3 z-40 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg animate-fade-in">
                    {DRAWING_PLANS.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlanId(plan.id)
                          setIsPlanDropdownOpen(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11px] ${
                          selectedPlanId === plan.id
                            ? "bg-blue-50 font-bold text-blue-600"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{plan.name}</span>
                        <span className="text-[9.5px] text-slate-400 font-mono">
                          {plan.code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-slate-400">Grid C-4</span>
              </div>

              {/* Drawing Canvas */}
              <div
                className="relative flex-1 overflow-hidden bg-[#fafbfc] cursor-crosshair"
                onClick={(e) => {
                  if (!isRecording) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = ((e.clientX - rect.left) / rect.width) * 100
                    const y = ((e.clientY - rect.top) / rect.height) * 100
                    setUserStandingPos({ x, y })
                    setIsLocationSynced(true)
                  }
                }}
              >
                {/* Subtle Grid */}
                <svg
                  className="absolute inset-0 h-full w-full opacity-40"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="grid-cad-clean"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="0.6"
                      />
                    </pattern>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    fill="url(#grid-cad-clean)"
                  />
                </svg>

                {/* Structural Walls & Columns */}
                <svg
                  className="absolute inset-0 h-full w-full pointer-events-none"
                  viewBox="0 0 400 250"
                >
                  <rect
                    x="25"
                    y="25"
                    width="350"
                    height="200"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="25"
                    y1="90"
                    x2="375"
                    y2="90"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="25"
                    y1="160"
                    x2="375"
                    y2="160"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="140"
                    y1="25"
                    x2="140"
                    y2="225"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="260"
                    y1="25"
                    x2="260"
                    y2="225"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />

                  {/* Columns */}
                  {[
                    [50, 45],
                    [140, 45],
                    [260, 45],
                    [350, 45],
                    [50, 125],
                    [140, 125],
                    [260, 125],
                    [350, 125],
                    [50, 205],
                    [140, 205],
                    [260, 205],
                    [350, 205],
                  ].map(([cx, cy], idx) => (
                    <rect
                      key={idx}
                      x={cx - 4}
                      y={cy - 4}
                      width="8"
                      height="8"
                      fill="#3b82f6"
                      opacity="0.8"
                    />
                  ))}

                  {/* Planned Walk Route (Yellow Dashed Line) */}
                  <path
                    d="M 60 125 L 140 125 L 260 125 L 340 125 L 340 60 L 260 60"
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="3"
                    strokeDasharray="5 4"
                  />

                  {/* Captured Live Route (Solid Vivid Blue Line) */}
                  {isRecording && (
                    <path
                      d="M 60 125 L 140 125 L 260 125 L 340 125 L 340 60 L 260 60"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="400"
                      strokeDashoffset={400 - (walkProgress / 100) * 400}
                    />
                  )}
                </svg>

                {/* User Current Position Dot */}
                <div
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                  style={{
                    left: `${
                      isRecording
                        ? 15 + (walkProgress / 100) * 70
                        : userStandingPos.x
                    }%`,
                    top: `${isRecording ? 50 : userStandingPos.y}%`,
                  }}
                >
                  <div className="relative flex h-6 w-6 items-center justify-center">
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600 shadow-sm" />
                    <div className="absolute h-6 w-6 rounded-full bg-blue-500/20 animate-ping" />
                  </div>
                </div>

                {/* Simple Sync guidance pill */}
                {!isRecording && (
                  <div className="absolute top-2 left-3 right-3 flex items-center justify-between rounded-full bg-white/95 px-3 py-1 text-[11px] shadow-sm border border-slate-200">
                    <span className="text-slate-600">
                      {isLocationSynced
                        ? "Position synced"
                        : "Tap drawing to set start position"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLocationSynced(true)
                        setUserStandingPos({ x: 15, y: 50 })
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                    >
                      {isLocationSynced ? "✓ Synced" : "Sync Origin"}
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Dock */}
              <div className="border-t border-slate-100 bg-white px-3 py-2">
                {!isRecording ? (
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-800">
                        64m planned route
                      </span>
                    </div>

                    {/* Simple Blue Rounded Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRecording(true)
                        setRecordSeconds(0)
                        setWalkProgress(0)
                      }}
                      className="flex h-8.5 items-center gap-1.5 rounded-full bg-blue-600 px-4 text-[12px] font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
                    >
                      <span>Start Capture</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1 font-bold text-red-600">
                        <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                        {formatTime(recordSeconds)}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-semibold text-slate-800">
                        {distanceMeters} m
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">
                        {keyframesCount} nodes
                      </span>
                    </div>

                    {/* Simple Rounded Finish Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRecording(false)
                        setStep("media_sync")
                      }}
                      className="flex h-8 items-center rounded-full bg-slate-900 px-3.5 text-[11.5px] font-semibold text-white hover:bg-slate-800 active:scale-95"
                    >
                      Finish Walk
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: MEDIA SYNC (CENTERED, MINIMAL, FLAT DIVIDED ROWS) */}
      {/* ========================================================================= */}
      {step === "media_sync" && (
        <div className="relative flex flex-1 flex-col justify-between p-5 animate-fade-in">
          {/* Centered Content */}
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            {/* Success Check Badge */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-3.5 shadow-xs">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Header info - Centered */}
            <h2 className="text-[17px] font-bold text-slate-900">
              Walk Capture Complete
            </h2>
            <p className="mt-1 text-[12px] text-slate-500">
              {distanceMeters || 24.6}m covered · {keyframesCount || 7}{" "}
              Panoramas · 2.4 GB
            </p>

            {/* Flat divided action rows */}
            <div className="mt-6 w-full max-w-xs divide-y divide-slate-100 border-y border-slate-100 text-left">
              {/* Row 1: Sync Local */}
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <span className="block text-[13.5px] font-semibold text-slate-900">
                    Download to Mobile
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Wi-Fi Direct (~35 MB/s)
                  </span>
                </div>

                {!isSyncLocalDone ? (
                  <button
                    type="button"
                    onClick={handleSyncLocal}
                    disabled={
                      syncLocalProgress !== null && syncLocalProgress < 100
                    }
                    className="flex h-8 items-center rounded-full bg-blue-600 px-4 text-[12px] font-semibold text-white hover:bg-blue-700 active:scale-95 disabled:opacity-50 shadow-xs"
                  >
                    {syncLocalProgress !== null
                      ? `${syncLocalProgress}%`
                      : "Download"}
                  </button>
                ) : (
                  <span className="text-[12px] font-bold text-emerald-600">
                    ✓ Downloaded
                  </span>
                )}
              </div>

              {/* Row 2: Sync Cloud */}
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <span className="block text-[13.5px] font-semibold text-slate-900">
                    Upload to Cloud
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Project workspace
                  </span>
                </div>

                {!isSyncCloudDone ? (
                  <button
                    type="button"
                    onClick={handleSyncCloud}
                    disabled={
                      syncCloudProgress !== null && syncCloudProgress < 100
                    }
                    className="flex h-8 items-center rounded-full bg-blue-600 px-4 text-[12px] font-semibold text-white hover:bg-blue-700 active:scale-95 disabled:opacity-50 shadow-xs"
                  >
                    {syncCloudProgress !== null
                      ? `${syncCloudProgress}%`
                      : "Upload"}
                  </button>
                ) : (
                  <span className="text-[12px] font-bold text-emerald-600">
                    ✓ In Cloud
                  </span>
                )}
              </div>
            </div>

            {/* Poor Internet indicator & toggle */}
            <div className="mt-3.5 flex w-full max-w-xs items-center justify-between">
              <span className="text-[11px] text-slate-400 text-left">
                {isPoorInternet ? (
                  <span className="flex items-center gap-1 font-semibold text-amber-600">
                    <span>⚠️ Poor signal (24 kbps) · Cloud paused</span>
                  </span>
                ) : (
                  <span>Network: High Speed 5G</span>
                )}
              </span>

              <button
                type="button"
                onClick={() => setIsPoorInternet(!isPoorInternet)}
                className="text-[10.5px] font-medium text-slate-500 hover:text-slate-800 underline"
              >
                {isPoorInternet ? "Test Good Signal" : "Test Poor Signal"}
              </button>
            </div>
          </div>

          {/* Bottom actions: review what was just synced, or finish */}
          <div className="flex gap-2 pb-1 pt-3">
            {onOpenCaptures && (
              <button
                type="button"
                onClick={onOpenCaptures}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:scale-95"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.2l2 2.5h7.8A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5Z" />
                </svg>
                View captures
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (onComplete) {
                  onComplete({
                    id: `WALK-${Math.floor(Math.random() * 900) + 100}`,
                    title: `360° Walk: ${selectedPlan.name}`,
                    distance: `${distanceMeters || 54.8}m`,
                    keyframes: keyframesCount || 18,
                  })
                }
                onBack()
              }}
              className="flex h-10 flex-1 items-center justify-center rounded-full bg-blue-600 text-[13px] font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
