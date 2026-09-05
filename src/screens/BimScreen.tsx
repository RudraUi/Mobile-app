import { useCallback, useEffect, useRef, useState } from "react"
import {
  Building3D,
  type Building3DHandle,
  FLOOR_HEIGHT,
  pinPosition,
  type ProjectedPin,
  type V3,
  type WorldPin,
} from "../components/Building3D"
import { AppHeader } from "../components/AppHeader"
import { BottomNav, type MainTab } from "../components/BottomNav"
import WalkControls from "../components/WalkControls"
import { FilterModal } from "../components/FilterModal"
import { SearchModal } from "../components/SearchModal"
import type { Item, ItemType, Severity, Status } from "../data/mockData"
import { type Project, projectsList } from "../data/projectsData"

interface BimScreenProps {
  items: Item[]
  onItemClick: (item: Item) => void
  onCreateClick: () => void
  onOpenCreateItem?: (type?: ItemType) => void
  activeTab: MainTab
  onTabChange: (tab: MainTab) => void
  markupFilter: string
  onFilterChange: (f: string) => void
  onInviteClick?: () => void
  onProfileClick?: () => void
  userAvatar?: string
  selectedProject?: Project
  onSelectProject?: (p: Project) => void
}

type MarkupToolType = "cloud" | "polygon" | "point"

interface DrawnMarkup {
  id: string
  type: MarkupToolType
  points?: { x: number; y: number }[]
  bounds?: { x1: number; y1: number; x2: number; y2: number }
  center: { x: number; y: number }
}

function generateCloudPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const minX = Math.min(x1, x2)
  const maxX = Math.max(x1, x2)
  const minY = Math.min(y1, y2)
  const maxY = Math.max(y1, y2)
  const w = Math.max(maxX - minX, 40)
  const h = Math.max(maxY - minY, 32)

  const arcR = 12
  const nx = Math.max(3, Math.round(w / (arcR * 1.5)))
  const ny = Math.max(2, Math.round(h / (arcR * 1.5)))
  const dx = w / nx
  const dy = h / ny

  let d = `M ${minX} ${minY + dy}`
  // Top edge
  for (let i = 0; i < nx; i++) {
    const xEnd = minX + (i + 1) * dx
    d += ` A ${arcR} ${arcR} 0 0 1 ${xEnd} ${minY}`
  }
  // Right edge
  for (let i = 0; i < ny; i++) {
    const yEnd = minY + (i + 1) * dy
    d += ` A ${arcR} ${arcR} 0 0 1 ${maxX} ${yEnd}`
  }
  // Bottom edge
  for (let i = nx; i > 0; i--) {
    const xEnd = minX + (i - 1) * dx
    d += ` A ${arcR} ${arcR} 0 0 1 ${xEnd} ${maxY}`
  }
  // Left edge
  for (let i = ny; i > 0; i--) {
    const yEnd = minY + (i - 1) * dy
    d += ` A ${arcR} ${arcR} 0 0 1 ${minX} ${yEnd}`
  }
  d += " Z"
  return d
}

const FLOOR_COUNT = 8

export function BimScreen({
  items,
  onItemClick,
  onCreateClick,
  onOpenCreateItem,
  activeTab,
  onTabChange,
  markupFilter,
  onFilterChange,
  onInviteClick,
  onProfileClick,
  userAvatar,
  selectedProject = projectsList[0],
  onSelectProject,
}: BimScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<ItemType | "all">("all")
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all")
  const [filterPriority, setFilterPriority] = useState<Severity | "all">("all")

  const [navMode, setNavMode] = useState<"orbit" | "walk">("orbit")
  const [selectedPinItem, setSelectedPinItem] = useState<Item | null>(null)
  const [activeFloor, setActiveFloor] = useState<number | null>(null)
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false)
  const levelDropdownRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const [compass, setCompass] = useState(0)
  const viewerRef = useRef<Building3DHandle>(null)
  const walkMarker = useRef<SVGGElement>(null)

  // 3D Markup & Annotation tool states
  const [isMarkupMenuOpen, setIsMarkupMenuOpen] = useState(false)
  const [activeMarkupTool, setActiveMarkupTool] =
    useState<MarkupToolType | null>(null)
  const [currentDrawingPoints, setCurrentDrawingPoints] = useState<{
    x: number
    y: number
  }[]>([])
  const [cloudDragBox, setCloudDragBox] = useState<{
    x1: number
    y1: number
    x2: number
    y2: number
  } | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [polygonRedoPoints, setPolygonRedoPoints] = useState<{
    x: number
    y: number
  }[]>([])
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null,
  )
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null)

  const handlePolygonUndo = useCallback(() => {
    setCurrentDrawingPoints((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      setPolygonRedoPoints((redo) => [...redo, last])
      return prev.slice(0, -1)
    })
  }, [])

  const handlePolygonRedo = useCallback(() => {
    setPolygonRedoPoints((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo
      const next = prevRedo[prevRedo.length - 1]
      setCurrentDrawingPoints((pts) => [...pts, next])
      return prevRedo.slice(0, -1)
    })
  }, [])

  const handleFinishPolygon = useCallback(() => {
    if (currentDrawingPoints.length < 3) return
    const pts = currentDrawingPoints
    const centerX = pts.reduce((acc, p) => acc + p.x, 0) / pts.length
    const centerY = pts.reduce((acc, p) => acc + p.y, 0) / pts.length

    const markup: DrawnMarkup = {
      id: `polygon-${Date.now()}`,
      type: "polygon",
      points: pts,
      center: { x: centerX, y: centerY },
    }
    setDrawnMarkup(markup)
    setCurrentDrawingPoints([])
    setPolygonRedoPoints([])
    setCursorPos(null)
    setActiveMarkupTool(null)
    setIsMarkupMenuOpen(false)
    if (onOpenCreateItem) {
      onOpenCreateItem("task")
    } else {
      onCreateClick()
    }
  }, [currentDrawingPoints, onOpenCreateItem, onCreateClick])

  const handleCreateAtFppLocation = useCallback(
    (type: ItemType = "task") => {
      viewerRef.current?.pauseAutoRotate?.()
      if (stageRef.current) {
        const rect = stageRef.current.getBoundingClientRect()
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const markup: DrawnMarkup = {
          id: `point-${Date.now()}`,
          type: "point",
          center: { x: centerX, y: centerY },
        }
        setDrawnMarkup(markup)
      }
      if (onOpenCreateItem) {
        onOpenCreateItem(type)
      } else {
        onCreateClick()
      }
    },
    [onOpenCreateItem, onCreateClick],
  )

  const [drawnMarkup, setDrawnMarkup] = useState<DrawnMarkup | null>(null)

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isFullscreen])

  useEffect(() => {
    if (!isLevelDropdownOpen) return
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        levelDropdownRef.current &&
        !levelDropdownRef.current.contains(e.target as Node)
      ) {
        setIsLevelDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isLevelDropdownOpen])

  // Pin elements are positioned imperatively from the render loop — going
  // through React state every frame would re-render the tree on each orbit.
  const pinRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const handleProjectPins = (projected: ProjectedPin[]) => {
    const occupied: { x: number; y: number }[] = []

    for (const pin of projected) {
      const el = pinRefs.current[pin.id]
      if (!el) continue

      let isHiddenByOverlap = false
      if (pin.visible) {
        for (const occ of occupied) {
          // If two pins overlap on screen within 26px horizontally and 36px vertically
          if (Math.abs(pin.x - occ.x) < 26 && Math.abs(pin.y - occ.y) < 36) {
            isHiddenByOverlap = true
            break
          }
        }
        if (!isHiddenByOverlap) {
          occupied.push({ x: pin.x, y: pin.y })
        }
      }

      const isVis = pin.visible && !isHiddenByOverlap
      el.style.transform = `translate3d(${pin.x}px, ${pin.y}px, 0) scale(${pin.scale.toFixed(3)})`
      el.style.opacity = isVis ? "1" : "0"
      el.style.visibility = isVis ? "visible" : "hidden"
      // Keep pin z-index within local range 1-20, so pins never bleed over bottom sheets or dialogs (z-50)
      el.style.zIndex = String(
        Math.max(1, Math.min(20, Math.round(20 - pin.depth * 0.3))),
      )
    }
  }

  const handleCameraChange = (yaw: number) => {
    setCompass((current) =>
      Math.abs(current - yaw) > 1.5 ? Math.round(yaw) : current,
    )
  }

  const filteredItems = items.filter((item) => {
    if (markupFilter !== "all" && item.type !== markupFilter) return false
    if (filterType !== "all" && item.type !== filterType) return false
    if (filterStatus !== "all" && item.status !== filterStatus) return false
    if (filterPriority !== "all" && item.severity !== filterPriority)
      return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesTitle = item.title.toLowerCase().includes(q)
      const matchesId = item.id.toLowerCase().includes(q)
      const matchesDesc = item.description?.toLowerCase().includes(q)
      return matchesTitle || matchesId || matchesDesc
    }
    return true
  })

  const pinnedItems = filteredItems.slice(0, 6)
  // Distinct storeys, so elevation tags never land on the same line.
  const PIN_FLOORS = [6, 4, 2, 7, 1, 3]
  const pinFloor = (index: number) => PIN_FLOORS[index % PIN_FLOORS.length]
  const worldPins: WorldPin[] = pinnedItems.map((item, index) => {
    const interiorPositions: V3[] = [
      [-2.1, 1.4, -1.3],
      [2.1, 1.5, 0.5],
      [-1.3, 1.3, 0.0],
      [-3.3, 0.9, -2.4],
      [-1.3, 1.5, -1.0],
      [0.0, 1.6, 1.05],
    ]
    const pos =
      navMode === "walk"
        ? interiorPositions[index % interiorPositions.length]
        : pinPosition(pinFloor(index), index)

    return {
      id: item.id,
      position: pos,
      floor: pinFloor(index),
      normal: [0, 0, -1],
    }
  })

  const getPinColor = (type: string) => {
    if (type === "issue") return "#EF4444"
    if (type === "rfi") return "#F59E0B"
    if (type === "task") return "#0055ff"
    return "#10B981"
  }

  const getPinIcon = (type: string) => {
    if (type === "issue") return "!"
    if (type === "rfi") return "?"
    if (type === "task") return "T"
    return "N"
  }

  return (
    <div className="model-stage flex flex-col h-full select-none overflow-hidden text-slate-900">
      {/* Standard AppHeader (hidden in full view) */}
      {!isFullscreen && (
        <AppHeader
          markupFilter={markupFilter}
          onFilterChange={onFilterChange}
          onSearchClick={() => setIsSearchOpen(true)}
          onSplitViewClick={() => onTabChange("splitview")}
          isSplitViewActive={activeTab === "splitview"}
          onFilterClick={() => setIsFilterModalOpen(true)}
          isFilterActive={
            filterType !== "all" ||
            filterStatus !== "all" ||
            filterPriority !== "all"
          }
          onInviteClick={onInviteClick}
          onProfileClick={onProfileClick}
          userAvatar={userAvatar}
          selectedProject={selectedProject}
          onSelectProject={onSelectProject}
        />
      )}

      {/* Main 3D BIM Viewport — a real model, rendered on canvas */}
      <div
        ref={stageRef}
        className="model-stage bim-viewport flex-1 relative overflow-hidden isolate z-0 bg-slate-900/5 transition-all"
      >
        <Building3D
          floors={FLOOR_COUNT}
          activeFloor={activeFloor}
          mode={navMode}
          pins={worldPins}
          ref={viewerRef}
          onProjectPins={handleProjectPins}
          onCameraChange={handleCameraChange}
          onWalkChange={({ x, z, yaw }) => {
            walkMarker.current?.setAttribute(
              "transform",
              `translate(${x} ${z}) rotate(${(yaw * 180) / Math.PI})`,
            )
          }}
        />

        {/* Spatial pins, projected through the model's own camera.
            The pin marker scales proportionally as the model zooms, and maintains
            a comfortable tap target via pseudo-elements. */}
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out">
          {pinnedItems.map((item, idx) => (
            <div
              key={item.id}
              ref={(el) => {
                pinRefs.current[item.id] = el
              }}
              className="absolute left-0 top-0 pointer-events-none will-change-transform origin-top-left"
              style={{ opacity: 0, transformOrigin: "0 0" }}
            >
              <div className="flex flex-col items-center -translate-x-1/2 -translate-y-full">
                <span className="mb-0.5 px-1 py-[0.5px] rounded-[4px] bg-white/95 border border-slate-200 text-[7px] font-bold text-[#0055ff] shadow-2xs tabular-nums leading-tight tracking-tight">
                  +{(pinFloor(idx) * FLOOR_HEIGHT).toFixed(1)}m
                </span>
                <button
                  type="button"
                  onClick={() => {
                    viewerRef.current?.pauseAutoRotate?.()
                    setSelectedPinItem(item)
                    onItemClick(item)
                  }}
                  aria-label={`Open ${item.title}`}
                  className="pointer-events-auto relative w-5 h-5 rounded-[10px_10px_10px_0] -rotate-45 flex items-center justify-center shadow-md shadow-black/35 transition-transform hover:scale-110 active:scale-95 cursor-pointer before:absolute before:-inset-2.5 before:content-['']"
                  style={{ backgroundColor: getPinColor(item.type) }}
                >
                  <span className="rotate-45 text-white font-black text-[9px] leading-none">
                    {getPinIcon(item.type)}
                  </span>
                </button>
                <div className="w-2.5 h-1 bg-black/30 rounded-full blur-[0.75px] mt-0.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Rendered Persistent Drawn Markup */}
        {drawnMarkup && (
          <div className="absolute inset-0 pointer-events-none z-15">
            <svg className="w-full h-full">
              {drawnMarkup.type === "cloud" && drawnMarkup.bounds && (
                <path
                  d={generateCloudPath(
                    drawnMarkup.bounds.x1,
                    drawnMarkup.bounds.y1,
                    drawnMarkup.bounds.x2,
                    drawnMarkup.bounds.y2,
                  )}
                  fill="rgba(245, 158, 11, 0.16)"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              )}
              {drawnMarkup.type === "polygon" && drawnMarkup.points && (
                <polygon
                  points={drawnMarkup.points
                    .map((p) => `${p.x},${p.y}`)
                    .join(" ")}
                  fill="rgba(0, 85, 255, 0.16)"
                  stroke="#0055ff"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              )}
              {drawnMarkup.type === "point" && (
                <g>
                  <circle
                    cx={drawnMarkup.center.x}
                    cy={drawnMarkup.center.y}
                    r="16"
                    fill="rgba(239, 68, 68, 0.22)"
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="animate-pulse"
                  />
                  <circle
                    cx={drawnMarkup.center.x}
                    cy={drawnMarkup.center.y}
                    r="6"
                    fill="#EF4444"
                  />
                </g>
              )}
            </svg>

            {/* Floating Tag over Markup */}
            <div
              className="absolute pointer-events-auto -translate-x-1/2 -translate-y-full flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xl border border-white/20"
              style={{
                left: drawnMarkup.center.x,
                top: drawnMarkup.center.y - 12,
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-0.5" />
              <span>
                {drawnMarkup.type === "cloud"
                  ? "Cloud Markup"
                  : drawnMarkup.type === "polygon"
                    ? "Polygon Markup"
                    : "Point Markup"}
              </span>
              <button
                type="button"
                onClick={() => setDrawnMarkup(null)}
                className="w-4 h-4 ml-1 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-[9px] cursor-pointer"
                title="Clear markup"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Interactive Markup Drawing Canvas Overlay */}
        {activeMarkupTool && (
          <div
            className="absolute inset-0 z-20 cursor-crosshair touch-none select-none"
            onPointerDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top
              pointerDownPosRef.current = { x, y }
              setIsDrawing(true)
              viewerRef.current?.pauseAutoRotate?.()

              if (activeMarkupTool === "point") {
                const markup: DrawnMarkup = {
                  id: `point-${Date.now()}`,
                  type: "point",
                  center: { x, y },
                }
                setDrawnMarkup(markup)
                setIsDrawing(false)
                setActiveMarkupTool(null)
                setIsMarkupMenuOpen(false)
                if (onOpenCreateItem) {
                  onOpenCreateItem("task")
                } else {
                  onCreateClick()
                }
              } else if (activeMarkupTool === "cloud") {
                setCloudDragBox({ x1: x, y1: y, x2: x, y2: y })
              }
            }}
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top

              if (activeMarkupTool === "polygon") {
                setCursorPos({ x, y })
              } else if (
                isDrawing &&
                activeMarkupTool === "cloud" &&
                cloudDragBox
              ) {
                setCloudDragBox((prev) =>
                  prev ? { ...prev, x2: x, y2: y } : null,
                )
              }
            }}
            onPointerLeave={() => {
              if (activeMarkupTool === "polygon") {
                setCursorPos(null)
              }
            }}
            onPointerUp={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top
              setIsDrawing(false)

              if (activeMarkupTool === "cloud" && cloudDragBox) {
                const x1 = cloudDragBox.x1
                const y1 = cloudDragBox.y1
                const x2 = x
                const y2 = y
                const finalX1 =
                  Math.abs(x2 - x1) < 15 ? x - 40 : Math.min(x1, x2)
                const finalX2 =
                  Math.abs(x2 - x1) < 15 ? x + 40 : Math.max(x1, x2)
                const finalY1 =
                  Math.abs(y2 - y1) < 15 ? y - 30 : Math.min(y1, y2)
                const finalY2 =
                  Math.abs(y2 - y1) < 15 ? y + 30 : Math.max(y1, y2)

                const markup: DrawnMarkup = {
                  id: `cloud-${Date.now()}`,
                  type: "cloud",
                  bounds: {
                    x1: finalX1,
                    y1: finalY1,
                    x2: finalX2,
                    y2: finalY2,
                  },
                  center: {
                    x: (finalX1 + finalX2) / 2,
                    y: (finalY1 + finalY2) / 2,
                  },
                }
                setDrawnMarkup(markup)
                setCloudDragBox(null)
                setActiveMarkupTool(null)
                setIsMarkupMenuOpen(false)
                if (onOpenCreateItem) {
                  onOpenCreateItem("task")
                } else {
                  onCreateClick()
                }
              } else if (activeMarkupTool === "polygon") {
                // Check if user tapped near the first point to close the polygon
                if (
                  currentDrawingPoints.length >= 3 &&
                  Math.hypot(
                    x - currentDrawingPoints[0].x,
                    y - currentDrawingPoints[0].y,
                  ) < 28
                ) {
                  handleFinishPolygon()
                  return
                }

                // Add the vertex to the polygon
                setCurrentDrawingPoints((prev) => [...prev, { x, y }])
                setPolygonRedoPoints([])
              }
            }}
          >
            <svg className="w-full h-full pointer-events-none">
              <defs>
                <filter
                  id="bim-markup-glow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="3"
                    floodColor="#0055ff"
                    floodOpacity="0.35"
                  />
                </filter>
              </defs>

              {/* Active in-progress Cloud Drag */}
              {isDrawing && activeMarkupTool === "cloud" && cloudDragBox && (
                <path
                  d={generateCloudPath(
                    cloudDragBox.x1,
                    cloudDragBox.y1,
                    cloudDragBox.x2,
                    cloudDragBox.y2,
                  )}
                  fill="rgba(0, 85, 255, 0.15)"
                  stroke="#0055ff"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                  filter="url(#bim-markup-glow)"
                />
              )}

              {/* Active in-progress Polygon */}
              {activeMarkupTool === "polygon" &&
                currentDrawingPoints.length > 0 && (
                  <>
                    {/* Translucent fill when at least 3 points */}
                    {currentDrawingPoints.length >= 3 && (
                      <polygon
                        points={currentDrawingPoints
                          .map((p) => `${p.x},${p.y}`)
                          .join(" ")}
                        fill="rgba(0, 85, 255, 0.16)"
                        stroke="none"
                      />
                    )}

                    {/* Connected line segments between vertices */}
                    <polyline
                      points={currentDrawingPoints
                        .map((p) => `${p.x},${p.y}`)
                        .join(" ")}
                      fill="none"
                      stroke="#0055ff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Rubber-band dashed line to current pointer position */}
                    {cursorPos && (
                      <line
                        x1={
                          currentDrawingPoints[currentDrawingPoints.length - 1]
                            .x
                        }
                        y1={
                          currentDrawingPoints[currentDrawingPoints.length - 1]
                            .y
                        }
                        x2={cursorPos.x}
                        y2={cursorPos.y}
                        stroke="#0055ff"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        opacity="0.8"
                      />
                    )}

                    {/* Closing preview dashed line when >= 3 points */}
                    {currentDrawingPoints.length >= 3 && (
                      <line
                        x1={
                          currentDrawingPoints[currentDrawingPoints.length - 1]
                            .x
                        }
                        y1={
                          currentDrawingPoints[currentDrawingPoints.length - 1]
                            .y
                        }
                        x2={currentDrawingPoints[0].x}
                        y2={currentDrawingPoints[0].y}
                        stroke="#0055ff"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        opacity="0.6"
                      />
                    )}

                    {/* Vertices */}
                    {currentDrawingPoints.map((p, idx) => {
                      const isFirst = idx === 0
                      const canClose =
                        isFirst && currentDrawingPoints.length >= 3
                      return (
                        <g key={idx}>
                          {canClose && (
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="12"
                              fill="rgba(0, 85, 255, 0.18)"
                              stroke="#0055ff"
                              strokeWidth="1.5"
                              className="animate-ping"
                            />
                          )}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={canClose ? "6" : "4"}
                            fill="#ffffff"
                            stroke="#0055ff"
                            strokeWidth={canClose ? "2.5" : "2"}
                          />
                        </g>
                      )
                    })}
                  </>
                )}
            </svg>
          </div>
        )}

        {/* Level selector dropdown — isolates one storey or shows all */}
        <div ref={levelDropdownRef} className="absolute left-3.5 top-3.5 z-20">
          <button
            type="button"
            onClick={() => setIsLevelDropdownOpen((prev) => !prev)}
            className={`h-7 rounded-lg px-2 text-[10px] font-bold backdrop-blur-md border transition-all cursor-pointer flex items-center gap-1 shadow-xs ${
              activeFloor !== null
                ? "bg-[#0055ff] text-white border-[#0055ff]"
                : "bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
            aria-label="Select building level"
          >
            <svg
              className={`w-3 h-3 ${
                activeFloor !== null ? "text-white" : "text-[#0055ff]"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span>
              {activeFloor === null ? "All Levels" : `L${activeFloor}`}
            </span>
            <svg
              className={`w-2.5 h-2.5 transition-transform duration-200 ${
                isLevelDropdownOpen ? "rotate-180" : ""
              } ${activeFloor !== null ? "text-white/80" : "text-slate-400"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isLevelDropdownOpen && (
            <div className="absolute left-0 top-full mt-1 w-28 max-h-52 overflow-y-auto rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg shadow-slate-900/10 p-0.5 flex flex-col gap-0.5 z-30">
              <button
                type="button"
                onClick={() => {
                  viewerRef.current?.pauseAutoRotate?.()
                  setNavMode("orbit")
                  setActiveFloor(null)
                  setIsLevelDropdownOpen(false)
                }}
                className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                  activeFloor === null
                    ? "bg-[#0055ff] text-white font-bold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>All Levels</span>
                {activeFloor === null && (
                  <svg
                    className="w-2.5 h-2.5 text-white ml-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              <div className="h-px bg-slate-100 my-0.5" />

              {Array.from(
                { length: FLOOR_COUNT },
                (_, i) => FLOOR_COUNT - 1 - i,
              ).map((floor) => (
                <button
                  key={floor}
                  type="button"
                  onClick={() => {
                    viewerRef.current?.pauseAutoRotate?.()
                    setActiveFloor(floor)
                    setIsLevelDropdownOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer tabular-nums ${
                    activeFloor === floor
                      ? "bg-[#0055ff] text-white font-bold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>Level {floor}</span>
                  <span
                    className={`text-[8px] ${
                      activeFloor === floor ? "text-white/80" : "text-slate-400"
                    }`}
                  >
                    +{(floor * FLOOR_HEIGHT).toFixed(1)}m
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Left-side Vertical Markup Toolbar (Only icons, no text) */}
        {(isMarkupMenuOpen || activeMarkupTool !== null) && (
          <div className="absolute left-3.5 top-12 z-25 flex flex-col items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/15 animate-in fade-in slide-in-from-left-2 duration-200">
            {/* Cloud Markup */}
            <button
              type="button"
              onClick={() => {
                setActiveMarkupTool("cloud")
                setCurrentDrawingPoints([])
                setPolygonRedoPoints([])
                setCursorPos(null)
              }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeMarkupTool === "cloud"
                  ? "bg-[#0055ff] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 active:scale-95"
              }`}
              title="Cloud Markup"
              aria-label="Cloud Markup"
              aria-pressed={activeMarkupTool === "cloud"}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              </svg>
            </button>

            {/* Polygon Markup */}
            <button
              type="button"
              onClick={() => setActiveMarkupTool("polygon")}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeMarkupTool === "polygon"
                  ? "bg-[#0055ff] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 active:scale-95"
              }`}
              title="Polygon Markup"
              aria-label="Polygon Markup"
              aria-pressed={activeMarkupTool === "polygon"}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 8.5 5 19 19 19 22 8.5" />
              </svg>
            </button>

            {/* Point Markup */}
            <button
              type="button"
              onClick={() => {
                setActiveMarkupTool("point")
                setCurrentDrawingPoints([])
                setPolygonRedoPoints([])
                setCursorPos(null)
              }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeMarkupTool === "point"
                  ? "bg-[#0055ff] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 active:scale-95"
              }`}
              title="Point Markup"
              aria-label="Point Markup"
              aria-pressed={activeMarkupTool === "point"}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" />
                <circle cx="12" cy="9" r="2.5" fill="currentColor" />
              </svg>
            </button>

            {/* Subtle Divider */}
            <div className="w-4 h-px bg-slate-200 my-0.5" />

            {/* Polygon Actions (Undo, Redo, Finish) - Only Icons, No Text */}
            {activeMarkupTool === "polygon" && (
              <>
                {/* Undo Button */}
                <button
                  type="button"
                  onClick={handlePolygonUndo}
                  disabled={currentDrawingPoints.length === 0}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    currentDrawingPoints.length > 0
                      ? "text-slate-700 hover:bg-slate-100 active:scale-95"
                      : "text-slate-300 cursor-not-allowed opacity-40"
                  }`}
                  title="Undo Vertex"
                  aria-label="Undo Vertex"
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
                    <path d="M3 7v6h6" />
                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                  </svg>
                </button>

                {/* Redo Button */}
                <button
                  type="button"
                  onClick={handlePolygonRedo}
                  disabled={polygonRedoPoints.length === 0}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    polygonRedoPoints.length > 0
                      ? "text-slate-700 hover:bg-slate-100 active:scale-95"
                      : "text-slate-300 cursor-not-allowed opacity-40"
                  }`}
                  title="Redo Vertex"
                  aria-label="Redo Vertex"
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
                    <path d="M21 7v6h-6" />
                    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
                  </svg>
                </button>

                {/* Finish / Complete Polygon Button */}
                <button
                  type="button"
                  onClick={handleFinishPolygon}
                  disabled={currentDrawingPoints.length < 3}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    currentDrawingPoints.length >= 3
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs animate-in zoom-in-90 duration-150 active:scale-95"
                      : "text-slate-300 cursor-not-allowed opacity-40"
                  }`}
                  title={
                    currentDrawingPoints.length >= 3
                      ? "Complete Polygon"
                      : "Add at least 3 points"
                  }
                  aria-label="Complete Polygon"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>

                <div className="w-4 h-px bg-slate-200 my-0.5" />
              </>
            )}

            {/* Close Markup */}
            <button
              type="button"
              onClick={() => {
                setActiveMarkupTool(null)
                setIsMarkupMenuOpen(false)
                setCurrentDrawingPoints([])
                setPolygonRedoPoints([])
                setCursorPos(null)
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              title="Close Markup Tools"
              aria-label="Close Markup Tools"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Top-Right 3D Controls (Fullscreen, Split Screen, 3D View Cube & Zoom) */}
        <div className="absolute top-3.5 right-3.5 z-20 flex flex-col gap-1.5">
          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`w-8 h-8 rounded-xl backdrop-blur-md flex items-center justify-center shadow-md border transition-all cursor-pointer ${
              isFullscreen
                ? "bg-[#0055ff] text-white border-[#0055ff] shadow-blue-500/25"
                : "bg-white/95 hover:bg-slate-50 active:scale-95 text-[#0055ff] border-slate-200 shadow-slate-900/10"
            }`}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
              </svg>
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            )}
          </button>

          {/* Split Screen Button */}
          <button
            type="button"
            onClick={() => onTabChange("splitview")}
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-slate-50 active:scale-95 backdrop-blur-md text-[#0055ff] flex items-center justify-center shadow-md shadow-slate-900/10 border border-slate-200 transition-all cursor-pointer"
            aria-label="Split Screen View"
            title="Split Screen View"
          >
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
              <rect
                x="2.5"
                y="3"
                width="6.5"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <rect
                x="11"
                y="3"
                width="6.5"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </button>
          {/* View cube — shows the live heading, tap to restore the ISO view */}
          <button
            type="button"
            onClick={() => viewerRef.current?.reset()}
            title={
              navMode === "walk"
                ? "Reset walking position"
                : "Reset to front view"
            }
            aria-label={
              navMode === "walk"
                ? "Reset walking position"
                : "Reset to front view"
            }
            className="w-8 h-8 rounded-xl bg-white/95 hover:bg-slate-50 active:scale-95 backdrop-blur-md text-[#0055ff] flex flex-col items-center justify-center shadow-md shadow-slate-900/10 border border-slate-200 transition-all cursor-pointer"
          >
            <span className="text-[8px] font-extrabold leading-none tracking-tight">
              {navMode === "walk" ? "START" : "FRONT"}
            </span>
            <span className="text-[7.5px] font-bold leading-none tabular-nums text-slate-400 mt-0.5">
              {compass}&deg;
            </span>
          </button>
          {/* Zoom: the lens indoors, the dolly outside */}
          <>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => viewerRef.current?.zoomBy(-5)}
              className="w-8 h-8 rounded-xl bg-white/95 hover:bg-slate-50 active:scale-95 backdrop-blur-md text-slate-700 flex items-center justify-center shadow-md shadow-slate-900/10 border border-slate-200 transition-all cursor-pointer text-[15px] font-bold"
            >
              +
            </button>
            {/* Zoom Out */}
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => viewerRef.current?.zoomBy(5)}
              className="w-8 h-8 rounded-xl bg-white/95 hover:bg-slate-50 active:scale-95 backdrop-blur-md text-slate-700 flex items-center justify-center shadow-md shadow-slate-900/10 border border-slate-200 transition-all cursor-pointer text-[15px] font-bold"
            >
              -
            </button>
          </>
          {/* Mode Switcher (Orbit / Walk) */}
          <button
            type="button"
            onClick={() => {
              setSelectedPinItem(null)
              if (navMode === "orbit") setActiveFloor((current) => current ?? 0)
              setNavMode((m) => (m === "orbit" ? "walk" : "orbit"))
            }}
            className={`w-8 h-8 rounded-xl backdrop-blur-md flex items-center justify-center shadow-md border transition-all cursor-pointer ${
              navMode === "walk"
                ? "bg-[#0055ff] text-white border-[#0055ff] shadow-blue-500/25"
                : "bg-white/95 hover:bg-slate-50 active:scale-95 text-[#0055ff] border-slate-200 shadow-slate-900/10"
            }`}
            title={
              navMode === "walk"
                ? "Exit FPP (return to orbit view)"
                : "Enter FPP (first-person view)"
            }
            aria-label={
              navMode === "walk"
                ? "Exit FPP (return to orbit view)"
                : "Enter FPP (first-person view)"
            }
            aria-pressed={navMode === "walk"}
          >
            <span className="text-[8px] font-extrabold tracking-tight">
              FPP
            </span>
          </button>

          {/* Markup Mode Button (below FPP) */}
          <button
            type="button"
            onClick={() => {
              const next = !isMarkupMenuOpen
              setIsMarkupMenuOpen(next)
              if (next && !activeMarkupTool) {
                setActiveMarkupTool("cloud")
              } else if (!next) {
                setActiveMarkupTool(null)
              }
              viewerRef.current?.pauseAutoRotate?.()
            }}
            className={`w-8 h-8 rounded-xl backdrop-blur-md flex items-center justify-center shadow-md border transition-all cursor-pointer ${
              isMarkupMenuOpen || activeMarkupTool !== null
                ? "bg-[#0055ff] text-white border-[#0055ff] shadow-blue-500/25"
                : "bg-white/95 hover:bg-slate-50 active:scale-95 text-[#0055ff] border-slate-200 shadow-slate-900/10"
            }`}
            title={
              isMarkupMenuOpen ? "Close 3D Markup Tools" : "3D Markup Tools"
            }
            aria-label="3D Markup Tools"
            aria-pressed={isMarkupMenuOpen}
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
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        </div>

        {/* First-person Walk Controls & HUD with smooth transition */}
        <div
          className={`transition-all duration-500 ease-out ${
            navMode === "walk"
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          {navMode === "walk" && (
            <>
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 rounded-xl bg-white/95 backdrop-blur-md px-3 py-1.5 text-center pointer-events-none border border-slate-200/80 shadow-sm animate-in fade-in duration-300">
                <p className="text-[11px] font-bold text-slate-800">
                  L{activeFloor ?? 0} · First person
                </p>
                <p className="text-[9px] font-medium text-slate-500">
                  Sample interior · Typical floor
                </p>
              </div>

              {/* FPP Quick Tag Action Bar for Inner Elements */}
              <div className="absolute top-15 left-1/2 -translate-x-1/2 z-25 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-900/10 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1.5">
                  Tag Inner:
                </span>
                {/* Create Issue on Inner Element */}
                <button
                  type="button"
                  onClick={() => handleCreateAtFppLocation("issue")}
                  className="flex items-center gap-1 px-2 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 text-[10px] font-bold active:scale-95 transition-all cursor-pointer shadow-2xs"
                  title="Tag Issue on interior element"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Issue
                </button>
                {/* Create Task on Inner Element */}
                <button
                  type="button"
                  onClick={() => handleCreateAtFppLocation("task")}
                  className="flex items-center gap-1 px-2 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0055ff] border border-blue-200/80 text-[10px] font-bold active:scale-95 transition-all cursor-pointer shadow-2xs"
                  title="Tag Task on interior element"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0055ff]" />
                  Task
                </button>
                {/* Create RFI on Inner Element */}
                <button
                  type="button"
                  onClick={() => handleCreateAtFppLocation("rfi")}
                  className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 text-[10px] font-bold active:scale-95 transition-all cursor-pointer shadow-2xs"
                  title="Tag RFI on interior element"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  RFI
                </button>
                {/* Create Field Note on Inner Element */}
                <button
                  type="button"
                  onClick={() => handleCreateAtFppLocation("fieldnote")}
                  className="flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold active:scale-95 transition-all cursor-pointer shadow-2xs"
                  title="Tag Field Note on interior element"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Note
                </button>
              </div>

              {/* Interactive Center Reticle Crosshair */}
              <button
                type="button"
                onClick={() => handleCreateAtFppLocation("task")}
                title="Tap crosshair to tag item on interior element"
                aria-label="Tag item on interior element"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center pointer-events-auto cursor-crosshair group"
              >
                <span className="w-2 h-2 rounded-full bg-white ring-2 ring-[#0055ff] group-hover:scale-150 transition-transform shadow-md" />
              </button>
              <WalkControls marker={walkMarker} />
            </>
          )}
        </div>

        {/* Bottom-Left Model Stats Pill */}
        <div
          className={`absolute bottom-3.5 left-3.5 z-20 hidden ${
            navMode === "orbit" ? "sm:flex" : ""
          } items-center gap-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 text-[9.5px] text-slate-500 font-semibold`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>IFC 4.3 · LOD 350 · 60 FPS</span>
        </div>

        {/* Bottom Floating Pin Preview Card */}
        {selectedPinItem && (
          <div className="absolute bottom-4 left-4 right-4 z-20 animate-slide-up">
            <div className="bg-white/97 backdrop-blur-md p-3 rounded-2xl shadow-[0_12px_32px_rgba(15,23,42,0.16)] border border-slate-200 flex items-center justify-between gap-3 text-slate-900">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[11px] shrink-0"
                  style={{ backgroundColor: getPinColor(selectedPinItem.type) }}
                >
                  {getPinIcon(selectedPinItem.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">
                      {selectedPinItem.id}
                    </span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                      {selectedPinItem.status}
                    </span>
                  </div>
                  <h4 className="text-[12px] font-bold text-white truncate">
                    {selectedPinItem.title}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onItemClick(selectedPinItem)}
                className="px-3 py-1.5 rounded-xl bg-[#0055ff] hover:bg-blue-600 text-white text-[11.5px] font-bold shrink-0 transition-all cursor-pointer shadow-xs"
              >
                Inspect
              </button>
            </div>
          </div>
        )}

        {/* Fullscreen Floating Exit Pill */}
        {isFullscreen && (
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`absolute ${
              selectedPinItem ? "bottom-24" : "bottom-5"
            } left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 active:scale-95 backdrop-blur-md text-white border border-white/20 shadow-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
            </svg>
            <span>Exit Fullscreen</span>
          </button>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        statusFilter={filterStatus}
        onStatusChange={(s) => setFilterStatus(s as Status | "all")}
        priorityFilter={filterPriority}
        onPriorityChange={(p) => setFilterPriority(p as Severity | "all")}
        typeFilter={filterType}
        onTypeChange={(t) => setFilterType(t as ItemType | "all")}
        onReset={() => {
          setFilterType("all")
          setFilterStatus("all")
          setFilterPriority("all")
        }}
      />

      {/* Dedicated Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        items={items}
        onItemClick={onItemClick}
      />

      {/* Bottom Nav (hidden in full view) */}
      {!isFullscreen && (
        <BottomNav
          active={activeTab}
          onChange={onTabChange}
          onFabClick={onCreateClick}
        />
      )}
    </div>
  )
}
