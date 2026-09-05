import type { MouseEvent } from "react"
import type { Item } from "../data/mockData"
import { typeColors, typeIcons } from "../data/mockData"

interface MapViewProps {
  items?: Item[]
  onPinClick?: (item: Item) => void
  targetItem?: Item | null
  showNavPath?: boolean
  navProgress?: number
  currentPos?: { x: number; y: number }
  interactive?: boolean
  onMapTap?: (x: number, y: number) => void
}

export function MapView({
  items = [],
  onPinClick,
  targetItem,
  showNavPath = false,
  navProgress = 0,
  currentPos,
  interactive = true,
  onMapTap,
}: MapViewProps) {
  const handleSvgClick = (e: MouseEvent<SVGSVGElement>) => {
    if (!onMapTap) return
    const rect = e.currentTarget.getBoundingClientRect()
    const scaleX = 400 / rect.width
    const scaleY = 560 / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    onMapTap(Math.round(x), Math.round(y))
  }

  return (
    <svg
      viewBox="0 0 400 560"
      className="w-full h-full select-none"
      style={{ background: "#f8fafc" }}
      onClick={handleSvgClick}
    >
      <defs>
        {/* Subtle dot background grid */}
        <pattern id="bg-blueprint-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="0.75" fill="#e2e8f0" />
        </pattern>

        {/* Lift Lobby Core 45deg Diagonal Hatch Pattern */}
        <pattern
          id="lift-core-hatch"
          width="8"
          height="8"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="8" stroke="#dbeafe" strokeWidth="1.2" />
        </pattern>

        {/* Pin Drop Shadow */}
        <filter id="pin-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Blueprint Grid Background */}
      <rect width="400" height="560" fill="url(#bg-blueprint-grid)" />

      {/* ── Structural Grid Lines (Dashed) ── */}
      {/* Vertical Columns: A (84), B (180), C (240), D (336) */}
      <line x1="84" y1="64" x2="84" y2="486" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4 3" />
      <line x1="180" y1="64" x2="180" y2="486" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4 3" />
      <line x1="240" y1="64" x2="240" y2="486" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4 3" />
      <line x1="336" y1="64" x2="336" y2="486" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4 3" />

      {/* Horizontal Rows: 1 (108), 2 (208), 3 (308), 4 (408) */}
      <line x1="45" y1="108" x2="375" y2="108" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4 3" />
      <line x1="45" y1="208" x2="375" y2="208" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4 3" />
      <line x1="45" y1="308" x2="375" y2="308" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4 3" />
      <line x1="45" y1="408" x2="375" y2="408" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4 3" />

      {/* ── Grid Identification Bubbles ── */}
      {/* Top Column Bubbles: A, B, C, D */}
      {[
        { label: "A", x: 84 },
        { label: "B", x: 180 },
        { label: "C", x: 240 },
        { label: "D", x: 336 },
      ].map(({ label, x }) => (
        <g key={label}>
          <circle cx={x} cy="52" r="9.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          <text
            x={x}
            y="55.5"
            textAnchor="middle"
            fontSize="9"
            fontWeight="bold"
            fill="#64748b"
            fontFamily="Inter, sans-serif"
          >
            {label}
          </text>
        </g>
      ))}

      {/* Left Row Bubbles: 1, 2, 3, 4 */}
      {[
        { label: "1", y: 108 },
        { label: "2", y: 208 },
        { label: "3", y: 308 },
        { label: "4", y: 408 },
      ].map(({ label, y }) => (
        <g key={label}>
          <circle cx="34" cy={y} r="9.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          <text
            x="34"
            y={y + 3.5}
            textAnchor="middle"
            fontSize="9"
            fontWeight="bold"
            fill="#64748b"
            fontFamily="Inter, sans-serif"
          >
            {label}
          </text>
        </g>
      ))}

      {/* ── Outer Perimeter Building Shell ── */}
      <rect
        x="54"
        y="78"
        width="312"
        height="400"
        fill="#ffffff"
        stroke="#334155"
        strokeWidth="4.5"
        rx="1"
      />

      {/* ── Room Special Background Fills ── */}
      {/* Plant 3.06 Room (Light Yellow fill) */}
      <rect x="241.5" y="221.5" width="123" height="113" fill="#fefce8" />

      {/* Lift Lobby Core (Light Blue Diagonal Hatch Fill) */}
      <rect x="241.5" y="79.5" width="123" height="139" fill="url(#lift-core-hatch)" />

      {/* ── Lift Lobby Core Features (Lifts & Stairs) ── */}
      {/* Lift Shaft 1 (Top) */}
      <rect x="314" y="92" width="46" height="40" fill="#ffffff" stroke="#64748b" strokeWidth="1.8" />
      <line x1="314" y1="92" x2="360" y2="132" stroke="#94a3b8" strokeWidth="1.2" />
      <line x1="314" y1="132" x2="360" y2="92" stroke="#94a3b8" strokeWidth="1.2" />
      {/* Center Blue Square in Lift 1 */}
      <rect x="333" y="108" width="8" height="8" fill="#3b82f6" rx="1.5" />

      {/* Lift Shaft 2 (Bottom) */}
      <rect x="314" y="142" width="46" height="40" fill="#ffffff" stroke="#64748b" strokeWidth="1.8" />
      <line x1="314" y1="142" x2="360" y2="182" stroke="#94a3b8" strokeWidth="1.2" />
      <line x1="314" y1="182" x2="360" y2="142" stroke="#94a3b8" strokeWidth="1.2" />

      {/* Staircase (Left of Lifts) */}
      <rect x="250" y="152" width="52" height="66" fill="#ffffff" stroke="#64748b" strokeWidth="1.8" />
      {[160, 169, 178, 187, 196, 205, 214].map((stepY) => (
        <line key={stepY} x1="250" y1={stepY} x2="302" y2={stepY} stroke="#64748b" strokeWidth="1.2" />
      ))}

      {/* ── Walkable Corridor Zone (Light Blue Shaded with Dashed Outline) ── */}
      <path
        d="M 183,106 L 358,106 L 358,144 L 243,144 L 243,458 Q 243,466 235,466 L 191,466 Q 183,466 183,458 Z"
        fill="rgba(239, 246, 255, 0.7)"
        stroke="#93c5fd"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

      {/* Corridor Vertical Label */}
      <text
        x="210"
        y="325"
        transform="rotate(-90 210 325)"
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="bold"
        fill="#94a3b8"
        letterSpacing="3.5px"
        fontFamily="Inter, sans-serif"
      >
        C O R R I D O R
      </text>

      {/* ── Internal Partition Walls (Dark Charcoal #334155) ── */}
      {/* Left Vertical Corridor Wall (x = 180) with door openings */}
      <line x1="180" y1="78" x2="180" y2="106" stroke="#334155" strokeWidth="3" />
      <line x1="180" y1="142" x2="180" y2="206" stroke="#334155" strokeWidth="3" />
      <line x1="180" y1="242" x2="180" y2="306" stroke="#334155" strokeWidth="3" />
      <line x1="180" y1="342" x2="180" y2="406" stroke="#334155" strokeWidth="3" />
      <line x1="180" y1="442" x2="180" y2="478" stroke="#334155" strokeWidth="3" />

      {/* Right Vertical Corridor Wall (x = 240) with door openings */}
      <line x1="240" y1="220" x2="240" y2="250" stroke="#334155" strokeWidth="3" />
      <line x1="240" y1="286" x2="240" y2="360" stroke="#334155" strokeWidth="3" />
      <line x1="240" y1="396" x2="240" y2="478" stroke="#334155" strokeWidth="3" />

      {/* Left Room Horizontal Dividing Walls (x = 54 to 180) */}
      {/* Between Office 3.01 and Office 3.02 */}
      <line x1="54" y1="176" x2="180" y2="176" stroke="#334155" strokeWidth="3" />
      {/* Between Office 3.02 and Meeting 3.03 */}
      <line x1="54" y1="274" x2="180" y2="274" stroke="#334155" strokeWidth="3" />
      {/* Between Meeting 3.03 and Store 3.05 */}
      <line x1="54" y1="358" x2="180" y2="358" stroke="#334155" strokeWidth="3" />

      {/* Right Room Horizontal Dividing Walls (x = 240 to 366) */}
      {/* Between Lift Lobby and Plant 3.06 */}
      <line x1="240" y1="220" x2="366" y2="220" stroke="#334155" strokeWidth="3" />
      {/* Between Plant 3.06 and Office 3.04 */}
      <line x1="240" y1="336" x2="366" y2="336" stroke="#334155" strokeWidth="3" />

      {/* ── Door Leaf & Swing Arcs ── */}
      {/* Office 3.01 Door */}
      <line x1="180" y1="106" x2="152" y2="128" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M 152,128 A 36,36 0 0,0 180,142" fill="none" stroke="#94a3b8" strokeWidth="1.2" />

      {/* Office 3.02 Door */}
      <line x1="180" y1="206" x2="152" y2="228" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M 152,228 A 36,36 0 0,0 180,242" fill="none" stroke="#94a3b8" strokeWidth="1.2" />

      {/* Meeting 3.03 Door */}
      <line x1="180" y1="306" x2="152" y2="328" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M 152,328 A 36,36 0 0,0 180,342" fill="none" stroke="#94a3b8" strokeWidth="1.2" />

      {/* Store 3.05 Door */}
      <line x1="180" y1="406" x2="152" y2="428" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M 152,428 A 36,36 0 0,0 180,442" fill="none" stroke="#94a3b8" strokeWidth="1.2" />

      {/* Plant 3.06 Door */}
      <line x1="240" y1="286" x2="268" y2="264" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M 240,250 A 36,36 0 0,1 268,264" fill="none" stroke="#94a3b8" strokeWidth="1.2" />

      {/* Office 3.04 Door */}
      <line x1="240" y1="396" x2="268" y2="374" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M 240,360 A 36,36 0 0,1 268,374" fill="none" stroke="#94a3b8" strokeWidth="1.2" />

      {/* ── Structural Columns (Solid Bright Blue Squares) ── */}
      {[
        // Row 1
        { x: 84, y: 108 },
        { x: 180, y: 108 },
        { x: 240, y: 108 },
        // Row 2
        { x: 84, y: 208 },
        { x: 180, y: 208 },
        { x: 240, y: 208 },
        { x: 336, y: 208 },
        // Row 3
        { x: 84, y: 308 },
        { x: 180, y: 308 },
        { x: 240, y: 308 },
        { x: 336, y: 308 },
        // Row 4
        { x: 84, y: 408 },
        { x: 180, y: 408 },
        { x: 240, y: 408 },
        { x: 336, y: 408 },
      ].map(({ x, y }, i) => (
        <rect
          key={i}
          x={x - 4.5}
          y={y - 4.5}
          width="9"
          height="9"
          fill="#3b82f6"
          rx="1.5"
        />
      ))}

      {/* ── Badges [A] and [B] ── */}
      <g>
        <rect x="186" y="107" width="13" height="10.5" rx="2.5" fill="#0055ff" />
        <text x="192.5" y="115.2" fill="#ffffff" fontWeight="bold" fontSize="7" textAnchor="middle" fontFamily="Inter, sans-serif">
          A
        </text>
      </g>
      <g>
        <rect x="246" y="107" width="13" height="10.5" rx="2.5" fill="#0055ff" />
        <text x="252.5" y="115.2" fill="#ffffff" fontWeight="bold" fontSize="7" textAnchor="middle" fontFamily="Inter, sans-serif">
          B
        </text>
      </g>

      {/* ── Room Typography & Metadata Labels ── */}
      {/* Office 3.01 */}
      <text x="117" y="125" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#334155" fontFamily="Inter, sans-serif">
        OFFICE 3.01
      </text>
      <text x="117" y="137" textAnchor="middle" fontSize="8" fontWeight="600" fill="#64748b" fontFamily="Inter, sans-serif">
        42 m²
      </text>

      {/* Office 3.02 */}
      <text x="117" y="225" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#334155" fontFamily="Inter, sans-serif">
        OFFICE 3.02
      </text>
      <text x="117" y="237" textAnchor="middle" fontSize="8" fontWeight="600" fill="#64748b" fontFamily="Inter, sans-serif">
        42 m²
      </text>

      {/* Meeting 3.03 */}
      <text x="117" y="318" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#334155" fontFamily="Inter, sans-serif">
        MEETING 3.03
      </text>
      <text x="117" y="330" textAnchor="middle" fontSize="8" fontWeight="600" fill="#64748b" fontFamily="Inter, sans-serif">
        35 m²
      </text>

      {/* Store 3.05 */}
      <text x="117" y="438" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#334155" fontFamily="Inter, sans-serif">
        STORE 3.05
      </text>
      <text x="117" y="450" textAnchor="middle" fontSize="8" fontWeight="600" fill="#64748b" fontFamily="Inter, sans-serif">
        42 m²
      </text>

      {/* Lift Lobby Core */}
      <text x="303" y="152" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155" fontFamily="Inter, sans-serif">
        LIFT LOBBY
      </text>
      <text x="303" y="162" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#64748b" fontFamily="Inter, sans-serif">
        CORE
      </text>

      {/* Plant 3.06 */}
      <text x="303" y="278" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#334155" fontFamily="Inter, sans-serif">
        PLANT 3.06
      </text>
      <text x="303" y="290" textAnchor="middle" fontSize="8" fontWeight="600" fill="#64748b" fontFamily="Inter, sans-serif">
        48 m²
      </text>

      {/* Office 3.04 */}
      <text x="303" y="408" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#334155" fontFamily="Inter, sans-serif">
        OFFICE 3.04
      </text>
      <text x="303" y="420" textAnchor="middle" fontSize="8" fontWeight="600" fill="#64748b" fontFamily="Inter, sans-serif">
        51 m²
      </text>

      {/* ── Wayfinding Navigation Route ── */}
      {/* Concentric Amber Target at START */}
      <g>
        <circle cx="210" cy="444" r="8.5" fill="none" stroke="#d97706" strokeWidth="1.8" />
        <circle cx="210" cy="444" r="5" fill="none" stroke="#d97706" strokeWidth="1.3" />
        <circle cx="210" cy="444" r="2.5" fill="#d97706" />
        <text
          x="210"
          y="458"
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="bold"
          fill="#3b82f6"
          fontFamily="Inter, sans-serif"
          letterSpacing="0.5px"
        >
          — START —
        </text>
      </g>

      {/* Thick Amber Main Route Line (going up corridor and turning right into Lift Lobby) */}
      <path
        d="M 210,435 L 210,126 L 296,126"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="3.8"
        strokeDasharray="6 3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Auxiliary Amber Line to Store 3.05 */}
      <line
        x1="204"
        y1="441"
        x2="114"
        y2="422"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      {/* Blue Waypoint Pin in Store 3.05 */}
      <circle cx="114" cy="422" r="5" fill="#0055ff" stroke="#ffffff" strokeWidth="1.5" />

      {/* ── Dimension Scale & North Compass (Bottom) ── */}
      {/* North Compass Rose */}
      <g>
        <circle cx="72" cy="510" r="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
        <text
          x="72"
          y="504"
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="bold"
          fill="#475569"
          fontFamily="Inter, sans-serif"
        >
          N
        </text>
        <polygon points="72,506 68.5,516 75.5,516" fill="#475569" />
      </g>

      {/* Dimension Line (32.0 m) */}
      <g>
        {/* End Ticks */}
        <line x1="84" y1="504" x2="84" y2="516" stroke="#94a3b8" strokeWidth="1.2" />
        <line x1="336" y1="504" x2="336" y2="516" stroke="#94a3b8" strokeWidth="1.2" />
        {/* Dimension Lines with Break in Middle */}
        <line x1="84" y1="510" x2="190" y2="510" stroke="#cbd5e1" strokeWidth="1.2" />
        <line x1="230" y1="510" x2="336" y2="510" stroke="#cbd5e1" strokeWidth="1.2" />
        {/* Dimension Text */}
        <text
          x="210"
          y="513"
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="bold"
          fill="#64748b"
          fontFamily="Inter, sans-serif"
        >
          32.0 m
        </text>
      </g>

      {/* ── Dynamic Issue / Task Pins ── */}
      {items.map((item, idx) => {
        const pinPresets = [
          { x: 145, y: 146 }, // Office 3.01
          { x: 145, y: 246 }, // Office 3.02
          { x: 145, y: 338 }, // Meeting 3.03
          { x: 285, y: 300 }, // Plant 3.06
          { x: 285, y: 435 }, // Office 3.04
          { x: 80, y: 442 },  // Store 3.05
          { x: 210, y: 220 }, // Corridor
          { x: 280, y: 140 }, // Lift Lobby
        ]
        const preset = pinPresets[idx % pinPresets.length]
        const isValid =
          item.location &&
          item.location.x >= 60 &&
          item.location.x <= 360 &&
          item.location.y >= 85 &&
          item.location.y <= 470
        const px = isValid ? item.location.x : preset.x
        const py = isValid ? item.location.y : preset.y

        return (
          <g
            key={item.id}
            transform={`translate(${px}, ${py})`}
            onClick={(e) => {
              if (!interactive) return
              e.stopPropagation()
              onPinClick?.(item)
            }}
            style={{ cursor: interactive ? "pointer" : "default" }}
            filter="url(#pin-shadow)"
            className="transition-transform hover:scale-115 active:scale-95"
          >
            <circle r="12" fill="#ffffff" />
            <circle r="10" fill={typeColors[item.type] || "#0055ff"} opacity="0.16" />
            <circle r="6.5" fill={typeColors[item.type] || "#0055ff"} />
            <text
              y="2.8"
              textAnchor="middle"
              fontSize="6.5"
              fill="#ffffff"
              fontWeight="bold"
              fontFamily="Inter, sans-serif"
            >
              {typeIcons[item.type] || "•"}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
