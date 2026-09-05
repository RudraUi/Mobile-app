import type { RefObject } from "react"
import { INTERIOR_BLOCKERS } from "./Building3D"

/**
 * First-person HUD. Movement is the viewport's own job now — mouse look with
 * W A S D and the space bar, or drag-to-look with a second finger to walk — so
 * all that is left on screen is where you are standing.
 */
export default function WalkControls({
  marker,
}: {
  marker: RefObject<SVGGElement | null>
}) {
  return (
    <div className="absolute inset-x-3.5 bottom-3.5 z-20 flex items-end justify-end pointer-events-none">
      <div className="rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-sm">
        <svg
          viewBox="-4.7 -3.7 9.4 7.4"
          width="94"
          height="74"
          role="img"
          aria-label="Floor plan and your position"
        >
          <rect x="-4.5" y="-3.5" width="9" height="7" fill="#f1f5f9" />
          {INTERIOR_BLOCKERS.map((block, i) => (
            <rect
              key={i}
              x={block.x0}
              y={block.z0}
              width={block.x1 - block.x0}
              height={block.z1 - block.z0}
              fill="#94a3b8"
            />
          ))}
          <g ref={marker}>
            <circle r="0.28" fill="white" />
            <path
              d="M0 .46 -.23 -.2 .23 -.2Z"
              fill="#0055ff"
              stroke="white"
              strokeWidth=".05"
            />
          </g>
        </svg>
      </div>
    </div>
  )
}
