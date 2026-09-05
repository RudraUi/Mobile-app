import { useEffect, useRef, type RefObject } from "react"
import { INTERIOR_BLOCKERS, type Building3DHandle } from "./Building3D"

export default function WalkControls({
  viewer,
  marker,
}: {
  viewer: RefObject<Building3DHandle | null>
  marker: RefObject<SVGGElement | null>
}) {
  const held = useRef(new Map<number, [number, number]>())
  const update = () => {
    let forward = 0,
      strafe = 0
    held.current.forEach(([f, s]) => {
      forward += f
      strafe += s
    })
    viewer.current?.setWalkInput(forward, strafe)
  }
  useEffect(() => {
    const reset = () => {
      held.current.clear()
      viewer.current?.setWalkInput(0, 0)
    }
    const visibility = () => {
      if (document.hidden) reset()
    }
    window.addEventListener("blur", reset)
    document.addEventListener("visibilitychange", visibility)
    return () => {
      reset()
      window.removeEventListener("blur", reset)
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [viewer])

  return (
    <div className="absolute inset-x-3.5 bottom-3.5 z-20 flex items-end justify-between pointer-events-none">
      <div
        className="grid grid-cols-3 grid-rows-3 gap-1"
        role="group"
        aria-label="First-person movement"
      >
        {([
          ["Move forward", 1, 0, "col-start-2 row-start-1", 0],
          ["Move left", 0, -1, "col-start-1 row-start-2", -90],
          ["Move right", 0, 1, "col-start-3 row-start-2", 90],
          ["Move backward", -1, 0, "col-start-2 row-start-3", 180],
        ] as const).map(([label, forward, strafe, position, rotation]) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            className={`pointer-events-auto touch-none h-10 w-10 rounded-xl border border-slate-200 bg-white/95 text-[#0055ff] shadow-sm active:bg-blue-100 active:scale-95 flex items-center justify-center ${position}`}
            onContextMenu={(event) => event.preventDefault()}
            onPointerDown={(event) => {
              event.preventDefault()
              event.currentTarget.setPointerCapture(event.pointerId)
              held.current.set(event.pointerId, [forward, strafe])
              update()
            }}
            onPointerUp={(event) => {
              held.current.delete(event.pointerId)
              update()
            }}
            onPointerCancel={(event) => {
              held.current.delete(event.pointerId)
              update()
            }}
            onLostPointerCapture={(event) => {
              held.current.delete(event.pointerId)
              update()
            }}
            onClick={(event) => {
              if (event.detail === 0)
                viewer.current?.walkMove(forward * 0.3, strafe * 0.3)
            }}
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <path d="m6 13 6-6 6 6M12 7v12" />
            </svg>
          </button>
        ))}
      </div>
      <div className="flex flex-col items-end gap-2">
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
        <div className="rounded-lg bg-white/95 px-2 py-1 text-right text-[10px] leading-4 font-semibold text-slate-600">
          Drag to look
          <br />
          Hold arrows to walk
        </div>
      </div>
    </div>
  )
}
