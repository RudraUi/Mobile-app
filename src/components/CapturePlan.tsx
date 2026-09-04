import { useRef, useState } from "react"

/**
 * Geometry and drawing surface shared by the capture planner and the split
 * capture view, so the plan the user sees before starting is literally the
 * same canvas they walk against.
 */

export interface Pt {
  x: number
  y: number
}

/** The plan is drawn portrait so it fills a phone screen edge to edge. */
export const PLAN_W = 400
export const PLAN_H = 620

/** The planned walk, in the canvas' viewBox units. */
export const ROUTE: Pt[] = [
  { x: 200, y: 515 },
  { x: 200, y: 375 },
  { x: 200, y: 235 },
  { x: 200, y: 120 },
  { x: 285, y: 120 },
]

/** Zones the walk is meant to cover — the marked-up area on the drawing. */
export const CAPTURE_ZONES = [
  { id: "a", tag: "A", x: 173, y: 96, w: 54, h: 434, label: "Zone A · Corridor" },
  { id: "b", tag: "B", x: 233, y: 92, w: 124, h: 58, label: "Zone B · Lift lobby" },
]

/** Rooms on the plate, used for both the tint and the label. */
const ROOMS = [
  { id: "r1", name: "OFFICE 3.01", area: "42 m²", x: 43, y: 63, w: 124, h: 124, tint: "#f8fafc" },
  { id: "r2", name: "OFFICE 3.02", area: "42 m²", x: 43, y: 193, w: 124, h: 124, tint: "#f8fafc" },
  { id: "r3", name: "MEETING 3.03", area: "35 m²", x: 43, y: 323, w: 124, h: 104, tint: "#f8fafc" },
  { id: "r4", name: "STORE 3.05", area: "42 m²", x: 43, y: 433, w: 124, h: 124, tint: "#f8fafc" },
  { id: "r5", name: "LIFT LOBBY", area: "CORE", x: 233, y: 63, w: 124, h: 184, tint: "#eef2ff" },
  { id: "r6", name: "PLANT 3.06", area: "48 m²", x: 233, y: 253, w: 124, h: 144, tint: "#fffbeb" },
  { id: "r7", name: "OFFICE 3.04", area: "51 m²", x: 233, y: 403, w: 124, h: 154, tint: "#f8fafc" },
]

/** Interior walls as [x1, y1, x2, y2]. */
const PARTITIONS: [number, number, number, number][] = [
  [170, 60, 170, 560],
  [230, 60, 230, 560],
  [40, 190, 170, 190],
  [40, 320, 170, 320],
  [40, 430, 170, 430],
  [230, 250, 360, 250],
  [230, 400, 360, 400],
]

/** Door openings: `axis` is the wall's direction, `dir` the swing side. */
const DOORS: { axis: "v" | "h"; x: number; y: number; dir: number }[] = [
  { axis: "v", x: 170, y: 110, dir: -1 },
  { axis: "v", x: 170, y: 240, dir: -1 },
  { axis: "v", x: 170, y: 350, dir: -1 },
  { axis: "v", x: 230, y: 105, dir: 1 },
  { axis: "v", x: 230, y: 290, dir: 1 },
  { axis: "v", x: 230, y: 450, dir: 1 },
]

const UNITS_TO_METRES = 0.1

/** How close the walker must be to an anchor to count as standing on it. */
export const ARRIVE_TOLERANCE = 12

export function distanceBetween(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function toMetres(units: number) {
  return units * UNITS_TO_METRES
}

const segmentLengths = ROUTE.slice(1).map((point, index) =>
  distanceBetween(ROUTE[index], point),
)

export const ROUTE_LENGTH = segmentLengths.reduce((sum, n) => sum + n, 0)
export const ROUTE_METRES = toMetres(ROUTE_LENGTH)

/** The point sitting `percent` (0-100) of the way along the planned walk. */
export function pointAtProgress(percent: number): Pt {
  const target = (Math.min(100, Math.max(0, percent)) / 100) * ROUTE_LENGTH
  let travelled = 0
  for (let i = 0; i < segmentLengths.length; i++) {
    const length = segmentLengths[i]
    if (travelled + length >= target) {
      const t = length === 0 ? 0 : (target - travelled) / length
      return {
        x: ROUTE[i].x + (ROUTE[i + 1].x - ROUTE[i].x) * t,
        y: ROUTE[i].y + (ROUTE[i + 1].y - ROUTE[i].y) * t,
      }
    }
    travelled += length
  }
  return ROUTE[ROUTE.length - 1]
}

export const ORIGIN = ROUTE[0]

const routePath = ROUTE.map(
  (point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
).join(" ")

/** Move `from` towards `to` by at most `step` units. */
export function stepToward(from: Pt, to: Pt, step: number): Pt {
  const gap = distanceBetween(from, to)
  if (gap <= step) return { ...to }
  return {
    x: from.x + ((to.x - from.x) / gap) * step,
    y: from.y + ((to.y - from.y) / gap) * step,
  }
}

export interface SavedRange {
  from: number
  to: number
}

interface PlanCanvasProps {
  /** How much of the route the live segment has covered, 0-100. */
  progress: number
  userPos: Pt
  /** Where the walker has to stand to start or resume; null hides it. */
  anchor?: Pt | null
  /** Draws the leader line from the walker to the anchor. */
  showGuide?: boolean
  isRecording?: boolean
  /** Segments already banked, drawn behind the live one. */
  savedRanges?: SavedRange[]
  /** Tapping the plan repositions the walker (demo control). */
  onPick?: (point: Pt) => void
  /** "cover" fills the frame and crops; "contain" fits the whole plan in. */
  fit?: "cover" | "contain"
  className?: string
}

const MIN_SCALE = 1
const MAX_SCALE = 5

interface View {
  scale: number
  x: number
  y: number
}

/**
 * Keeps the drawing from being dragged away from its frame. When the drawing
 * is larger than the frame it stays covering it; when it is smaller (a
 * contained plan at 1x) it centres instead.
 */
function clampAxis(
  value: number,
  offset: number,
  size: number,
  scale: number,
  frame: number,
) {
  const min = frame - (offset + size) * scale
  const max = -offset * scale
  return min > max
    ? (min + max) / 2
    : Math.min(max, Math.max(min, value))
}

/** Zoom to `scale` while holding the point under (fx, fy) still. */
function zoomAbout(view: View, scale: number, fx: number, fy: number): View {
  const ratio = scale / view.scale
  return {
    scale,
    x: fx - (fx - view.x) * ratio,
    y: fy - (fy - view.y) * ratio,
  }
}

function touchGap(touches: React.TouchList) {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.hypot(dx, dy)
}

export function PlanCanvas({
  progress,
  userPos,
  anchor = null,
  showGuide = false,
  isRecording = false,
  savedRanges = [],
  onPick,
  fit = "contain",
  className = "",
}: PlanCanvasProps) {
  const atAnchor = anchor ? distanceBetween(userPos, anchor) <= ARRIVE_TOLERANCE : false

  const frameRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 })
  const dragRef = useRef<
    { px: number; py: number; x: number; y: number; moved: boolean } | null
  >(null)
  const pinchRef = useRef<
    { gap: number; scale: number; fx: number; fy: number } | null
  >(null)
  const [isPanning, setIsPanning] = useState(false)

  /* Measured on demand rather than tracked in state: the drawing box is
     sized by CSS (aspect-ratio plus min/max), and this mirrors that maths
     so panning knows where the edges are. */
  const metrics = () => {
    const rect = frameRef.current?.getBoundingClientRect()
    const fw = rect?.width ?? 0
    const fh = rect?.height ?? 0
    const aspect = PLAN_W / PLAN_H
    const wider = fh > 0 ? fw / fh > aspect : false
    const byWidth = fit === "cover" ? !wider : wider
    const bw = byWidth ? fw : fh * aspect
    const bh = byWidth ? fw / aspect : fh
    return { rect, fw, fh, bw, bh, bx: (fw - bw) / 2, by: (fh - bh) / 2 }
  }

  const clamp = (next: View): View => {
    const { fw, fh, bw, bh, bx, by } = metrics()
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next.scale))
    return {
      scale,
      x: clampAxis(next.x, bx, bw, scale, fw),
      y: clampAxis(next.y, by, bh, scale, fh),
    }
  }

  const applyView = (next: View) => setView(clamp(next))

  /** Zoom by a step, holding the centre of the frame still. */
  const nudgeZoom = (factor: number) => {
    const { fw, fh, bx, by } = metrics()
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * factor))
    applyView(zoomAbout(view, scale, fw / 2 - bx, fh / 2 - by))
  }

  const resetView = () => setView({ scale: 1, x: 0, y: 0 })

  const startDrag = (px: number, py: number) => {
    dragRef.current = { px, py, x: view.x, y: view.y, moved: false }
    setIsPanning(true)
  }

  const moveDrag = (px: number, py: number) => {
    const drag = dragRef.current
    if (!drag) return
    const dx = px - drag.px
    const dy = py - drag.py
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.moved = true
    applyView({ scale: view.scale, x: drag.x + dx, y: drag.y + dy })
  }

  const endDrag = () => setIsPanning(false)

  /** A tap that did not turn into a pan repositions the walker. */
  const handleTap = (clientX: number, clientY: number) => {
    if (!onPick || dragRef.current?.moved) return
    const { rect, bw, bh, bx, by } = metrics()
    if (!rect || bw === 0) return
    const localX = (clientX - rect.left - bx - view.x) / view.scale
    const localY = (clientY - rect.top - by - view.y) / view.scale
    onPick({
      x: (localX / bw) * PLAN_W,
      y: (localY / bh) * PLAN_H,
    })
  }

  const isZoomed = view.scale > 1.01

  return (
    /* The plan is pinned to a 400 x 250 box so the SVG's user units and the
       overlaid walker dot share one coordinate space. Pan and zoom ride on a
       transform above that box, so the geometry never has to change. */
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-[#fafbfc] ${className}`}
    >
      <div
        ref={frameRef}
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{ touchAction: "none" }}
        onWheel={(event) => {
          const { rect, bx, by } = metrics()
          if (!rect) return
          const scale = Math.min(
            MAX_SCALE,
            Math.max(MIN_SCALE, view.scale * (event.deltaY < 0 ? 1.12 : 0.89)),
          )
          applyView(
            zoomAbout(
              view,
              scale,
              event.clientX - rect.left - bx,
              event.clientY - rect.top - by,
            ),
          )
        }}
        onMouseDown={(event) => startDrag(event.clientX, event.clientY)}
        onMouseMove={(event) => moveDrag(event.clientX, event.clientY)}
        onMouseUp={(event) => {
          handleTap(event.clientX, event.clientY)
          dragRef.current = null
          endDrag()
        }}
        onMouseLeave={() => {
          dragRef.current = null
          endDrag()
        }}
        onDoubleClick={() => (isZoomed ? resetView() : nudgeZoom(2))}
        onTouchStart={(event) => {
          if (event.touches.length === 2) {
            const { rect, bx, by } = metrics()
            if (!rect) return
            pinchRef.current = {
              gap: touchGap(event.touches),
              scale: view.scale,
              fx:
                (event.touches[0].clientX + event.touches[1].clientX) / 2 -
                rect.left -
                bx,
              fy:
                (event.touches[0].clientY + event.touches[1].clientY) / 2 -
                rect.top -
                by,
            }
            dragRef.current = null
          } else {
            startDrag(event.touches[0].clientX, event.touches[0].clientY)
          }
        }}
        onTouchMove={(event) => {
          const pinch = pinchRef.current
          if (pinch && event.touches.length === 2) {
            const ratio = touchGap(event.touches) / (pinch.gap || 1)
            const scale = Math.min(
              MAX_SCALE,
              Math.max(MIN_SCALE, pinch.scale * ratio),
            )
            applyView(zoomAbout(view, scale, pinch.fx, pinch.fy))
          } else if (event.touches.length === 1) {
            moveDrag(event.touches[0].clientX, event.touches[0].clientY)
          }
        }}
        onTouchEnd={(event) => {
          if (event.touches.length === 0) {
            const touch = event.changedTouches[0]
            if (touch && !pinchRef.current) {
              handleTap(touch.clientX, touch.clientY)
            }
            pinchRef.current = null
            dragRef.current = null
            endDrag()
          }
        }}
      >
      <div
        className={`relative shrink-0 origin-top-left ${
          isPanning ? "cursor-grabbing" : onPick ? "cursor-crosshair" : "cursor-grab"
        }`}
        style={{
          aspectRatio: `${PLAN_W} / ${PLAN_H}`,
          ...(fit === "cover"
            ? { minWidth: "100%", minHeight: "100%" }
            : { width: "100%", maxWidth: "100%", maxHeight: "100%" }),
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
      >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${PLAN_W} ${PLAN_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="plan-grid"
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
          <pattern
            id="core-hatch"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke="#c7d2fe" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={PLAN_W} height={PLAN_H} fill="#f8fafc" />
        <rect
          width={PLAN_W}
          height={PLAN_H}
          fill="url(#plan-grid)"
          opacity="0.55"
        />

        {/* Slab */}
        <rect x="40" y="60" width="320" height="500" fill="#ffffff" />

        {/* Room tints */}
        {ROOMS.map((room) => (
          <rect
            key={room.id}
            x={room.x}
            y={room.y}
            width={room.w}
            height={room.h}
            fill={room.tint}
          />
        ))}

        {/* Core hatch */}
        <rect
          x="233"
          y="63"
          width="124"
          height="184"
          fill="url(#core-hatch)"
          opacity="0.5"
        />

        {/* Grid lines through the plate */}
        {[70, 170, 230, 330].map((x) => (
          <line
            key={`gx-${x}`}
            x1={x}
            y1="34"
            x2={x}
            y2="566"
            stroke="#cbd5e1"
            strokeWidth="0.8"
            strokeDasharray="6 4"
          />
        ))}
        {[100, 230, 360, 490].map((y) => (
          <line
            key={`gy-${y}`}
            x1="14"
            y1={y}
            x2="366"
            y2={y}
            stroke="#cbd5e1"
            strokeWidth="0.8"
            strokeDasharray="6 4"
          />
        ))}

        {/* Interior partitions */}
        {PARTITIONS.map(([x1, y1, x2, y2], index) => (
          <line
            key={`w-${index}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#94a3b8"
            strokeWidth="3"
            strokeLinecap="square"
          />
        ))}

        {/* Exterior wall */}
        <rect
          x="40"
          y="60"
          width="320"
          height="500"
          fill="none"
          stroke="#475569"
          strokeWidth="5"
        />

        {/* Door openings and swings */}
        {DOORS.map((door, index) => (
          <g key={`d-${index}`}>
            {door.axis === "v"
              ? (
                <>
                  <line
                    x1={door.x}
                    y1={door.y}
                    x2={door.x}
                    y2={door.y + 30}
                    stroke="#ffffff"
                    strokeWidth="5"
                  />
                  <path
                    d={`M ${door.x} ${door.y} A 30 30 0 0 1 ${
                      door.x + 30 * door.dir
                    } ${door.y + 30}`}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                </>
              )
              : (
                <>
                  <line
                    x1={door.x}
                    y1={door.y}
                    x2={door.x + 30}
                    y2={door.y}
                    stroke="#ffffff"
                    strokeWidth="5"
                  />
                  <path
                    d={`M ${door.x} ${door.y} A 30 30 0 0 1 ${door.x + 30} ${
                      door.y + 30 * door.dir
                    }`}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                </>
              )}
          </g>
        ))}

        {/* Lift cars and stair run in the core */}
        {[80, 142].map((y) => (
          <g key={`lift-${y}`}>
            <rect
              x="306"
              y={y}
              width="46"
              height="52"
              fill="#ffffff"
              stroke="#94a3b8"
              strokeWidth="1.6"
            />
            <path
              d={`M 306 ${y} L 352 ${y + 52} M 352 ${y} L 306 ${y + 52}`}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          </g>
        ))}
        <rect
          x="242"
          y="156"
          width="50"
          height="86"
          fill="#ffffff"
          stroke="#94a3b8"
          strokeWidth="1.6"
        />
        {[0, 1, 2, 3, 4, 5].map((step) => (
          <line
            key={`step-${step}`}
            x1="242"
            y1={168 + step * 14}
            x2="292"
            y2={168 + step * 14}
            stroke="#cbd5e1"
            strokeWidth="1"
          />
        ))}

        {/* Room labels */}
        {ROOMS.map((room) => (
          <g key={`t-${room.id}`}>
            <text
              x={room.x + room.w / 2}
              y={room.y + room.h / 2}
              textAnchor="middle"
              fill="#64748b"
              style={{ fontSize: "9px", fontWeight: 700 }}
            >
              {room.name}
            </text>
            <text
              x={room.x + room.w / 2}
              y={room.y + room.h / 2 + 11}
              textAnchor="middle"
              fill="#94a3b8"
              style={{ fontSize: "7.5px", fontWeight: 600 }}
            >
              {room.area}
            </text>
          </g>
        ))}
        <text
          x="200"
          y="330"
          textAnchor="middle"
          fill="#94a3b8"
          transform="rotate(-90 200 330)"
          style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "1.5px" }}
        >
          CORRIDOR
        </text>

        {/* Grid bubbles */}
        {[["A", 70], ["B", 170], ["C", 230], ["D", 330]].map(
          ([label, x]) => (
            <g key={`bx-${label}`}>
              <circle
                cx={Number(x)}
                cy="30"
                r="9"
                fill="#ffffff"
                stroke="#94a3b8"
                strokeWidth="1.2"
              />
              <text
                x={Number(x)}
                y="33.5"
                textAnchor="middle"
                fill="#64748b"
                style={{ fontSize: "8.5px", fontWeight: 700 }}
              >
                {label}
              </text>
            </g>
          ),
        )}
        {[["1", 100], ["2", 230], ["3", 360], ["4", 490]].map(
          ([label, y]) => (
            <g key={`by-${label}`}>
              <circle
                cx="18"
                cy={Number(y)}
                r="9"
                fill="#ffffff"
                stroke="#94a3b8"
                strokeWidth="1.2"
              />
              <text
                x="18"
                y={Number(y) + 3.5}
                textAnchor="middle"
                fill="#64748b"
                style={{ fontSize: "8.5px", fontWeight: 700 }}
              >
                {label}
              </text>
            </g>
          ),
        )}

        {/* Overall dimension */}
        <g>
          <line
            x1="40"
            y1="590"
            x2="360"
            y2="590"
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <line x1="40" y1="584" x2="40" y2="596" stroke="#94a3b8" strokeWidth="1" />
          <line
            x1="360"
            y1="584"
            x2="360"
            y2="596"
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <rect x="176" y="583" width="48" height="14" fill="#f8fafc" />
          <text
            x="200"
            y="593.5"
            textAnchor="middle"
            fill="#64748b"
            style={{ fontSize: "8px", fontWeight: 700 }}
          >
            32.0 m
          </text>
        </g>

        {/* North arrow */}
        <g>
          <circle
            cx="60"
            cy="592"
            r="14"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1"
          />
          <path d="M 60 582 L 65 596 L 60 592.5 L 55 596 Z" fill="#64748b" />
          <text
            x="60"
            y="578"
            textAnchor="middle"
            fill="#64748b"
            style={{ fontSize: "7px", fontWeight: 700 }}
          >
            N
          </text>
        </g>

        {/* Marked-up capture zones */}
        {CAPTURE_ZONES.map((zone) => (
          <g key={zone.id}>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.w}
              height={zone.h}
              rx="4"
              fill="#0055ff"
              fillOpacity="0.07"
              stroke="#0055ff"
              strokeOpacity="0.4"
              strokeWidth="1.2"
              strokeDasharray="5 3"
            />
            <rect
              x={zone.x + 3}
              y={zone.y + 3}
              width="13"
              height="11"
              rx="2.5"
              fill="#0055ff"
              fillOpacity="0.85"
            />
            <text
              x={zone.x + 9.5}
              y={zone.y + 11}
              textAnchor="middle"
              fill="#ffffff"
              style={{ fontSize: "7.5px", fontWeight: 700 }}
            >
              {zone.tag}
            </text>
          </g>
        ))}

        {/* Columns */}
        {[70, 170, 230, 330].flatMap((cx) =>
          [100, 230, 360, 490].map((cy) => (
            <rect
              key={`c-${cx}-${cy}`}
              x={cx - 5}
              y={cy - 5}
              width="10"
              height="10"
              fill="#3b82f6"
              opacity="0.75"
            />
          ))
        )}

        {/* Planned walk */}
        <path
          d={routePath}
          fill="none"
          stroke="#eab308"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="5 4"
        />

        {/* Segments already banked */}
        {savedRanges.map((range, index) => (
          <path
            key={index}
            d={routePath}
            pathLength={100}
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${Math.max(0, range.to - range.from)} 100`}
            strokeDashoffset={-range.from}
          />
        ))}

        {/* The live segment */}
        {progress > 0 && (
          <path
            d={routePath}
            pathLength={100}
            fill="none"
            stroke="#2563eb"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress} 100`}
            strokeDashoffset={0}
          />
        )}

        {/* Guide leader from the walker to the anchor */}
        {showGuide && anchor && !atAnchor && (
          <g>
            <line
              x1={userPos.x}
              y1={userPos.y}
              x2={anchor.x}
              y2={anchor.y}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
            <circle
              cx={anchor.x}
              cy={anchor.y}
              r="9"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          </g>
        )}

        {/* Anchor marker */}
        {anchor && (
          <g>
            <circle
              cx={anchor.x}
              cy={anchor.y}
              r="5.5"
              fill="#fff"
              stroke={atAnchor ? "#10b981" : "#f59e0b"}
              strokeWidth="2.5"
            />
            <circle
              cx={anchor.x}
              cy={anchor.y}
              r="2"
              fill={atAnchor ? "#10b981" : "#f59e0b"}
            />
          </g>
        )}

        {/* Origin flag, so the start of the route is always legible */}
        <g>
          <circle
            cx={ORIGIN.x}
            cy={ORIGIN.y}
            r="3"
            fill="#64748b"
            opacity="0.7"
          />
          <text
            x={ORIGIN.x - 4}
            y={ORIGIN.y + 16}
            fill="#64748b"
            style={{ fontSize: "7px", fontWeight: 700 }}
          >
            START
          </text>
        </g>
      </svg>

      {/* Walker — an HTML dot so it can carry the pulse animation. It is
          counter-scaled so it stays the same size however far you zoom in. */}
      <div
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
        style={{
          left: `${(userPos.x / PLAN_W) * 100}%`,
          top: `${(userPos.y / PLAN_H) * 100}%`,
        }}
      >
        <div
          className="relative flex h-6 w-6 items-center justify-center"
          style={{ transform: `scale(${1 / view.scale})` }}
        >
          <div
            className={`h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${
              isRecording ? "bg-red-500" : "bg-blue-600"
            }`}
          />
          <div
            className={`absolute h-6 w-6 rounded-full animate-ping ${
              isRecording ? "bg-red-500/25" : "bg-blue-500/20"
            }`}
          />
        </div>
      </div>
      </div>
      </div>

      {/* Pan / zoom controls */}
      <div className="absolute bottom-2 right-2 z-30 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white/95 shadow-sm backdrop-blur-xs">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            nudgeZoom(1.5)
          }}
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          disabled={view.scale >= MAX_SCALE}
          className="flex h-7 w-7 cursor-pointer items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-300"
          aria-label="Zoom in"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <span className="h-px bg-slate-200" />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            nudgeZoom(1 / 1.5)
          }}
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          disabled={view.scale <= MIN_SCALE}
          className="flex h-7 w-7 cursor-pointer items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-300"
          aria-label="Zoom out"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M5 12h14" />
          </svg>
        </button>
        {isZoomed && (
          <>
            <span className="h-px bg-slate-200" />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                resetView()
              }}
              onMouseDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
              className="flex h-7 w-7 cursor-pointer items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 active:bg-slate-100"
              aria-label="Fit plan to screen"
              title="Fit to screen"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 3H4.5A1.5 1.5 0 0 0 3 4.5V9" />
                <path d="M15 3h4.5A1.5 1.5 0 0 1 21 4.5V9" />
                <path d="M9 21H4.5A1.5 1.5 0 0 1 3 19.5V15" />
                <path d="M15 21h4.5a1.5 1.5 0 0 0 1.5-1.5V15" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Zoom read-out */}
      {isZoomed && (
        <span className="absolute bottom-2 left-2 z-30 rounded-md bg-slate-900/75 px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums text-white">
          {view.scale.toFixed(1)}×
        </span>
      )}
    </div>
  )
}

export default PlanCanvas
