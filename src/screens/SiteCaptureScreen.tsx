import { useState, useEffect, useRef } from "react"
import camera360Img from "../assets/360camera.png"
import {
  ARRIVE_TOLERANCE,
  CAPTURE_ZONES,
  distanceBetween,
  ORIGIN,
  PlanCanvas,
  pointAtProgress,
  ROUTE_METRES,
  stepToward,
  toMetres,
  type Pt,
  type SavedRange,
} from "../components/CapturePlan"

interface SiteCaptureScreenProps {
  onBack: () => void
  onComplete?: (captureItem: any) => void
  onOpenCaptures?: () => void
}

/**
 * pairing  — find and connect the 360 camera
 * plan     — the drawing full-screen, pick a sheet, review the route
 * capture  — split view: live 360 on top, the same drawing below
 * media_sync — download / upload what was captured
 */
type CaptureStep = "pairing" | "plan" | "capture" | "media_sync"

/** Where the walk stands within the capture step. */
type WalkState = "idle" | "recording" | "paused" | "complete"

interface CaptureSegment {
  id: string
  from: number
  to: number
  metres: number
  nodes: number
}

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

  // Walk state, live segment progress and banked segments
  const [walkState, setWalkState] = useState<WalkState>("idle")
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [walkProgress, setWalkProgress] = useState(0) // 0 to 100 along the route
  const [segments, setSegments] = useState<CaptureSegment[]>([])
  const [walkerPos, setWalkerPos] = useState<Pt>({ x: 100, y: 480 })
  const [isGuiding, setIsGuiding] = useState(false)
  /** How much of the split the live 360 feed takes, 0.18 - 0.78. */
  const [splitRatio, setSplitRatio] = useState(0.42)
  const splitRef = useRef<HTMLDivElement>(null)
  const splitDragRef = useRef(false)
  const [justArrived, setJustArrived] = useState(false)
  const isRecording = walkState === "recording"

  // Media Sync State
  const [syncLocalProgress, setSyncLocalProgress] = useState<number | null>(
    null,
  )
  const [syncCloudProgress, setSyncCloudProgress] = useState<number | null>(
    null,
  )
  const [isSyncLocalDone, setIsSyncLocalDone] = useState(false)
  const [isSyncCloudDone, setIsSyncCloudDone] = useState(false)

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

  // Recording: run the clock and walk the operator along the planned route
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
          const next = Math.min(100, p + 1.6)
          setWalkerPos(pointAtProgress(next))
          if (next >= 100) setWalkState("complete")
          return next
        })
      }, 420)
    }
    return () => {
      clearInterval(timer)
      clearInterval(walkTimer)
    }
  }, [isRecording])

  // Handle local sync transfer
  /* ----- derived walk figures -------------------------------------------
     The anchor is the spot the operator has to be standing on before the
     next control does anything: the route origin for a fresh capture, the
     pause point for a resume. */
  const anchorPoint: Pt | null = walkState === "complete"
    ? null
    : walkState === "paused"
      ? pointAtProgress(walkProgress)
      : ORIGIN
  const distanceToAnchor = anchorPoint
    ? distanceBetween(walkerPos, anchorPoint)
    : 0
  const isAtAnchor = anchorPoint ? distanceToAnchor <= ARRIVE_TOLERANCE : true
  const metresToAnchor = toMetres(distanceToAnchor)

  const liveMetres = (walkProgress / 100) * ROUTE_METRES
  const savedMetres = segments.reduce((sum, seg) => sum + seg.metres, 0)
  const totalMetres = savedMetres + liveMetres
  const liveNodes = Math.floor(liveMetres / 3.5)
  const totalNodes =
    segments.reduce((sum, seg) => sum + seg.nodes, 0) + liveNodes
  const savedRanges: SavedRange[] = segments.map((seg) => ({
    from: seg.from,
    to: seg.to,
  }))

  /* One line of plain-language guidance for whatever the walk is doing. */
  let guidance: { tone: "ok" | "warn" | "rec"; title: string; detail: string }
  if (walkState === "recording") {
    guidance = {
      tone: "rec",
      title: "Recording walk",
      detail: `${liveMetres.toFixed(1)} m · ${liveNodes} nodes captured`,
    }
  } else if (walkState === "complete") {
    guidance = {
      tone: "ok",
      title: "Route complete",
      detail: `${liveMetres.toFixed(1)} m · ${liveNodes} nodes ready to sync`,
    }
  } else if (!isAtAnchor) {
    guidance = {
      tone: "warn",
      title: walkState === "paused"
        ? "Return to the pause point"
        : "Walk to the start point",
      detail: `${metresToAnchor.toFixed(1)} m away · follow the amber line`,
    }
  } else if (walkState === "paused") {
    guidance = {
      tone: "ok",
      title: "Paused on the route",
      detail: `${liveMetres.toFixed(1)} m captured · resume when ready`,
    }
  } else {
    guidance = {
      tone: "ok",
      title: "You are on the start point",
      detail: `${ROUTE_METRES.toFixed(0)} m planned route ahead`,
    }
  }

  /* ----- walk controls --------------------------------------------------- */

  const bankSegment = () => {
    if (walkProgress <= 0) return null
    const segment: CaptureSegment = {
      id: `SEG-${segments.length + 1}`,
      from: 0,
      to: walkProgress,
      metres: Number(liveMetres.toFixed(1)),
      nodes: liveNodes,
    }
    setSegments((current) => [...current, segment])
    return segment
  }

  const resetToOrigin = () => {
    setWalkProgress(0)
    setRecordSeconds(0)
    setWalkState("idle")
    setIsGuiding(false)
  }

  /* Dragging the divider re-balances the 360 feed against the drawing. */
  const setSplitFromClientY = (clientY: number) => {
    const rect = splitRef.current?.getBoundingClientRect()
    if (!rect || rect.height === 0) return
    const ratio = (clientY - rect.top) / rect.height
    setSplitRatio(Math.min(0.78, Math.max(0.18, ratio)))
  }

  const startCapture = () => {
    setRecordSeconds(0)
    setWalkState("recording")
    setIsGuiding(false)
  }

  const pauseCapture = () => {
    setWalkState("paused")
    setIsGuiding(false)
  }

  const resumeCapture = () => setWalkState("recording")

  const discardCapture = () => resetToOrigin()

  const saveAndStartFresh = () => {
    bankSegment()
    resetToOrigin()
  }

  /* Guidance: walk the operator back to whichever point they have to stand
     on — the route origin before a fresh capture, the pause point before a
     resume. Reaching it flips the dock over to the start/resume control. */
  useEffect(() => {
    if (!isGuiding || !anchorPoint) return
    const timer = setInterval(() => {
      setWalkerPos((current) => {
        const next = stepToward(current, anchorPoint, 6)
        if (distanceBetween(next, anchorPoint) <= ARRIVE_TOLERANCE) {
          setIsGuiding(false)
          setJustArrived(true)
        }
        return next
      })
    }, 90)
    return () => clearInterval(timer)
  }, [isGuiding, anchorPoint])

  // Let the "arrived" flash fade on its own
  useEffect(() => {
    if (!justArrived) return
    const timer = setTimeout(() => setJustArrived(false), 1800)
    return () => clearTimeout(timer)
  }, [justArrived])

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
                onClick={() => setStep("plan")}
                className="flex h-10.5 w-full items-center justify-center rounded-full bg-blue-600 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
              >
                Open capture plan
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: FULL DRAWING — PICK THE SHEET, REVIEW THE ROUTE, THEN START */}
      {/* ========================================================================= */}
      {step === "plan" && (
        <div className="relative flex flex-1 overflow-hidden bg-white animate-fade-in">
          {/* The drawing covers the whole screen */}
          <PlanCanvas
            className="h-full w-full"
            fit="cover"
            progress={0}
            userPos={walkerPos}
            anchor={ORIGIN}
            showGuide
            savedRanges={[]}
            onPick={(point) => setWalkerPos(point)}
          />

          {/* Floating top bar — back, sheet picker and Start, over the plan */}
          <div className="pointer-events-none absolute left-2.5 right-2.5 top-2.5 z-40 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStep("pairing")}
              className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm backdrop-blur-xs transition-colors hover:bg-white active:scale-95"
              aria-label="Back to camera"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <div className="pointer-events-auto relative min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setIsPlanDropdownOpen(!isPlanDropdownOpen)}
                className={`flex h-9 w-full items-center justify-between gap-2 rounded-full border px-3 text-left shadow-sm backdrop-blur-xs transition-colors ${
                  isPlanDropdownOpen
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-white/95 hover:bg-white"
                }`}
                aria-expanded={isPlanDropdownOpen}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-bold leading-tight text-slate-900">
                    {selectedPlan.name}
                  </span>
                  <span className="block truncate text-[9px] font-medium leading-tight text-slate-400">
                    {ROUTE_METRES.toFixed(0)} m · {CAPTURE_ZONES.length} zones
                  </span>
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                    isPlanDropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {isPlanDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsPlanDropdownOpen(false)}
                  />
                  <div className="absolute left-0 right-0 top-full z-40 mt-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-[0_12px_32px_rgba(15,23,42,0.18)] animate-slide-up origin-top">
                    {DRAWING_PLANS.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlanId(plan.id)
                          setIsPlanDropdownOpen(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors ${
                          selectedPlanId === plan.id
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`text-[12px] ${
                            selectedPlanId === plan.id
                              ? "font-bold"
                              : "font-semibold"
                          }`}
                        >
                          {plan.name}
                        </span>
                        <span className="text-[9.5px] font-mono text-slate-400">
                          {plan.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep("capture")
                setIsPlanDropdownOpen(false)
              }}
              className="pointer-events-auto flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-4 text-white shadow-md transition-colors hover:bg-blue-700 active:scale-95"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span className="text-[12.5px] font-semibold">Start</span>
            </button>
          </div>

          {/* Floating legend and camera state, out of the way at the bottom */}
          <div className="pointer-events-none absolute bottom-2.5 left-2.5 z-40 flex flex-col gap-1 rounded-lg border border-slate-200 bg-white/90 px-2 py-1.5 shadow-sm backdrop-blur-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 shrink-0 rounded-full bg-[#eab308]" />
              <span className="text-[9.5px] font-semibold text-slate-600">
                Planned route
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-xs border border-[#0055ff]/40 bg-[#0055ff]/10" />
              <span className="text-[9.5px] font-semibold text-slate-600">
                Capture zone
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
              <span className="text-[9.5px] font-semibold text-slate-600">
                You
              </span>
            </span>
          </div>

          <div className="pointer-events-none absolute right-2.5 top-14 z-40 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-slate-600">
              {telemetry.model} · {telemetry.battery}%
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: SPLIT CAPTURE — LIVE 360 ON TOP, THE SAME PLAN BELOW */}
      {/* ========================================================================= */}
      {step === "capture" && (
        <div
          ref={splitRef}
          className="relative flex flex-1 flex-col overflow-hidden bg-white"
          onMouseMove={(event) => {
            if (splitDragRef.current) setSplitFromClientY(event.clientY)
          }}
          onMouseUp={() => {
            splitDragRef.current = false
          }}
          onMouseLeave={() => {
            splitDragRef.current = false
          }}
          onTouchMove={(event) => {
            if (splitDragRef.current) {
              setSplitFromClientY(event.touches[0].clientY)
            }
          }}
          onTouchEnd={() => {
            splitDragRef.current = false
          }}
        >
          {/* Top Half: 360 Camera Feed Canvas */}
          <div
            className="relative shrink-0 overflow-hidden"
            style={{ height: `${splitRatio * 100}%` }}
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
                  onClick={() => setStep("plan")}
                  className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 shadow-md hover:bg-black/60 active:scale-95 transition-all"
                  aria-label="Back to capture plan"
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

                {/* Live recording chip, replacing the old view toggle */}
                {walkState === "recording" && (
                  <div className="flex items-center gap-1.5 rounded-full bg-red-600/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    <span>REC {formatTime(recordSeconds)}</span>
                  </div>
                )}
                {walkState === "paused" && (
                  <div className="flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/20 shadow-sm">
                    <span>PAUSED</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Split adjuster — drag to re-balance the feed against the plan */}
          <div
            className="relative z-30 flex h-[14px] shrink-0 cursor-row-resize items-center justify-center border-y border-slate-200 bg-slate-100 select-none"
            onMouseDown={(event) => {
              splitDragRef.current = true
              setSplitFromClientY(event.clientY)
            }}
            onTouchStart={(event) => {
              splitDragRef.current = true
              setSplitFromClientY(event.touches[0].clientY)
            }}
            role="separator"
            aria-label="Resize the camera and drawing panes"
          >
            <span className="h-[3px] w-9 rounded-full bg-slate-400" />

            {/* Snap presets */}
            <div className="absolute right-1.5 flex items-center gap-0.5">
              <button
                type="button"
                onMouseDown={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
                onClick={() => setSplitRatio(0.18)}
                className="flex h-3.5 w-4 cursor-pointer items-center justify-center rounded-xs text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
                aria-label="Give the drawing most of the screen"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </button>
              <button
                type="button"
                onMouseDown={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
                onClick={() => setSplitRatio(0.42)}
                className="flex h-3.5 w-4 cursor-pointer items-center justify-center rounded-xs text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
                aria-label="Balance both panes"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M5 12h14" />
                </svg>
              </button>
              <button
                type="button"
                onMouseDown={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
                onClick={() => setSplitRatio(0.78)}
                className="flex h-3.5 w-4 cursor-pointer items-center justify-center rounded-xs text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
                aria-label="Give the camera most of the screen"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom Half: the plan the operator just reviewed, now live */}
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
            {/* Sheet selector */}
            <div className="relative z-30 flex h-8 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-3">
              <button
                type="button"
                onClick={() => setIsPlanDropdownOpen(!isPlanDropdownOpen)}
                className="flex items-center gap-1 text-slate-800 hover:text-blue-600"
              >
                <span className="text-[11px] font-bold">
                  {selectedPlan.name}
                </span>
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

              {isPlanDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsPlanDropdownOpen(false)}
                  />
                  <div className="absolute top-8 left-3 z-40 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg animate-fade-in">
                    {DRAWING_PLANS.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlanId(plan.id)
                          setIsPlanDropdownOpen(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left ${
                          selectedPlanId === plan.id
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`text-[11px] ${
                            selectedPlanId === plan.id
                              ? "font-bold"
                              : "font-medium"
                          }`}
                        >
                          {plan.name}
                        </span>
                        <span className="text-[9.5px] font-mono text-slate-400">
                          {plan.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              <span className="text-[10px] tabular-nums text-slate-400">
                {Math.round(walkProgress)}% of route
              </span>
            </div>

            {/* Guidance banner */}
            <div
              className={`flex shrink-0 items-center gap-2 border-b px-3 py-1.5 transition-colors ${
                guidance.tone === "warn"
                  ? "border-amber-100 bg-amber-50"
                  : guidance.tone === "rec"
                    ? "border-red-100 bg-red-50"
                    : "border-emerald-100 bg-emerald-50"
              }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  guidance.tone === "warn"
                    ? "bg-amber-500"
                    : guidance.tone === "rec"
                      ? "bg-red-500 animate-pulse"
                      : "bg-emerald-500"
                }`}
              />
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-[11.5px] font-bold ${
                    guidance.tone === "warn"
                      ? "text-amber-800"
                      : guidance.tone === "rec"
                        ? "text-red-700"
                        : "text-emerald-800"
                  }`}
                >
                  {guidance.title}
                  {walkState === "recording" && ` · ${formatTime(recordSeconds)}`}
                </span>
                <span
                  className={`block truncate text-[10px] ${
                    guidance.tone === "warn"
                      ? "text-amber-700/80"
                      : guidance.tone === "rec"
                        ? "text-red-600/80"
                        : "text-emerald-700/80"
                  }`}
                >
                  {guidance.detail}
                </span>
              </span>
              {justArrived && (
                <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[9.5px] font-bold text-white animate-scale-in">
                  Arrived
                </span>
              )}
            </div>

            {/* The plan itself */}
            <PlanCanvas
              className="flex-1"
              progress={walkProgress}
              userPos={walkerPos}
              anchor={anchorPoint}
              showGuide={!isRecording}
              isRecording={isRecording}
              savedRanges={savedRanges}
              onPick={isRecording
                ? undefined
                : (point) => {
                  setWalkerPos(point)
                  setIsGuiding(false)
                }}
            />

            {/* Banked segments */}
            {segments.length > 0 && (
              <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-t border-slate-100 bg-slate-50/70 px-3 py-1.5 no-scrollbar">
                <span className="shrink-0 text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                  Saved
                </span>
                {segments.map((segment) => (
                  <span
                    key={segment.id}
                    className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {segment.id} · {segment.metres} m
                  </span>
                ))}
              </div>
            )}

            {/* Dock */}
            <div className="shrink-0 border-t border-slate-100 bg-white px-3 py-2">
              {walkState === "recording"
                ? (
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1 text-[11px]">
                      <span className="font-semibold tabular-nums text-slate-800">
                        {liveMetres.toFixed(1)} m
                      </span>
                      <span className="text-slate-400"> · </span>
                      <span className="text-slate-500">{liveNodes} nodes</span>
                    </div>
                    <button
                      type="button"
                      onClick={pauseCapture}
                      className="flex h-8.5 shrink-0 items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3.5 text-amber-700 transition-colors hover:bg-amber-100 active:scale-95"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <rect x="6" y="5" width="4" height="14" rx="1" />
                        <rect x="14" y="5" width="4" height="14" rx="1" />
                      </svg>
                      <span className="text-[12px] font-semibold">Pause</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        bankSegment()
                        setWalkState("complete")
                        setStep("media_sync")
                      }}
                      className="flex h-8.5 shrink-0 items-center rounded-full bg-slate-900 px-3.5 text-white transition-colors hover:bg-slate-800 active:scale-95"
                    >
                      <span className="text-[12px] font-semibold">Finish</span>
                    </button>
                  </div>
                )
                : walkState === "complete"
                ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveAndStartFresh}
                      className="flex h-9 flex-1 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 active:scale-95"
                    >
                      <span className="text-[12.5px] font-semibold">
                        Save &amp; walk again
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        bankSegment()
                        setStep("media_sync")
                      }}
                      className="flex h-9 flex-1 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 active:scale-95"
                    >
                      <span className="text-[12.5px] font-semibold">
                        Finish &amp; sync
                      </span>
                    </button>
                  </div>
                )
                : walkState === "paused"
                ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={discardCapture}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                      aria-label="Discard this capture and start from the origin"
                      title="Discard and start fresh from the origin"
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
                        <path d="M4 7h16M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
                        <path d="M6.5 7 7.5 20h9L17.5 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={saveAndStartFresh}
                      className="flex h-9 shrink-0 items-center justify-center rounded-full border border-slate-200 px-3 text-slate-700 transition-colors hover:bg-slate-50 active:scale-95"
                    >
                      <span className="text-[12px] font-semibold">
                        Save &amp; new
                      </span>
                    </button>
                    {isAtAnchor
                      ? (
                        <button
                          type="button"
                          onClick={resumeCapture}
                          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 active:scale-95"
                        >
                          <span className="h-2 w-2 rounded-full bg-white" />
                          <span className="text-[12.5px] font-semibold">
                            Resume
                          </span>
                        </button>
                      )
                      : (
                        <button
                          type="button"
                          onClick={() => setIsGuiding(true)}
                          disabled={isGuiding}
                          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-amber-500 text-white shadow-sm transition-colors hover:bg-amber-600 active:scale-95 disabled:opacity-70"
                        >
                          <span className="text-[12.5px] font-semibold">
                            {isGuiding ? "Guiding back..." : "Guide me back"}
                          </span>
                        </button>
                      )}
                  </div>
                )
                : (
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1 text-[11px]">
                      <span className="font-semibold text-slate-800">
                        {ROUTE_METRES.toFixed(0)} m route
                      </span>
                      <span className="text-slate-400"> · </span>
                      <span className="text-slate-500">{CAPTURE_ZONES.length} zones</span>
                    </div>
                    {isAtAnchor
                      ? (
                        <button
                          type="button"
                          onClick={startCapture}
                          className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-blue-600 px-5 text-white shadow-sm transition-colors hover:bg-blue-700 active:scale-95"
                        >
                          <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                          <span className="text-[12.5px] font-semibold">
                            Start Capture
                          </span>
                        </button>
                      )
                      : (
                        <>
                          <button
                            type="button"
                            onClick={() => setWalkerPos({ ...ORIGIN })}
                            className="shrink-0 px-1 text-slate-500 transition-colors hover:text-slate-800"
                          >
                            <span className="text-[11px] font-semibold underline">
                              I&apos;m here
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsGuiding(true)}
                            disabled={isGuiding}
                            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-amber-500 px-4 text-white shadow-sm transition-colors hover:bg-amber-600 active:scale-95 disabled:opacity-70"
                          >
                            <span className="text-[12.5px] font-semibold">
                              {isGuiding ? "Guiding..." : "Guide me there"}
                            </span>
                          </button>
                        </>
                      )}
                  </div>
                )}
            </div>
          </div>
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
              {totalMetres.toFixed(1)}m covered · {totalNodes} panoramas ·{" "}
              {segments.length || 1} segment{segments.length === 1 ? "" : "s"}
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
                    distance: `${totalMetres.toFixed(1)}m`,
                    keyframes: totalNodes,
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
