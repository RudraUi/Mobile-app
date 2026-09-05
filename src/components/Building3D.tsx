import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import createInteriorRenderer from "../lib/interiorRenderer"

/**
 * A small software 3D renderer for a parametric building.
 *
 * There is no 3D library here. Geometry is built as axis-aligned boxes, each
 * face is transformed into camera space, sorted back-to-front (painter's
 * algorithm) and filled on a 2D canvas with flat Lambert shading. For a massing
 * model of a few hundred opaque faces this is both accurate enough and far
 * cheaper than pulling in a WebGL engine.
 *
 * Anything positioned in the world — the pins — is projected through the same
 * camera, so overlays stay locked to the model as it orbits.
 */

export type V3 = [number, number, number]

export interface WorldPin {
  id: string
  position: V3
  /** Floor index the pin belongs to, for level isolation. */
  floor: number
}

/** Screen-space result handed back for each pin every frame. */
export interface ProjectedPin {
  id: string
  x: number
  y: number
  depth: number
  visible: boolean
}

interface Face {
  points: V3[]
  color: string
  /** Floor this face belongs to; -1 for ground and structure. */
  floor: number
  /** Faces flagged as glass get a lighter edge. */
  glass?: boolean
}

export interface Building3DProps {
  floors?: number
  /** Null shows the whole building; a number isolates that level. */
  activeFloor?: number | null
  pins?: WorldPin[]
  /** Called after every draw with the projected pin positions. */
  onProjectPins?: (projected: ProjectedPin[]) => void
  onCameraChange?: (yawDegrees: number) => void
  className?: string
  /** "orbit" flies around the massing; "walk" puts you inside a storey. */
  mode?: "orbit" | "walk"
  onWalkChange?: (position: {
    x: number
    z: number
    yaw: number
  }) => void
}

/** Imperative camera controls for the on-screen buttons. */
export interface Building3DHandle {
  zoomBy: (delta: number) => void
  reset: () => void
  /** First-person step, in metres, relative to where you are facing. */
  walkMove: (forward: number, strafe: number) => void
  setWalkInput: (forward: number, strafe: number) => void
}

/* ── Geometry ─────────────────────────────────────────────────────── */

const FLOOR_W = 9
const FLOOR_D = 7
const FLOOR_H = 1.55
const SLAB_T = 0.18

function box(
  min: V3,
  max: V3,
  color: string,
  floor: number,
  glass = false,
): Face[] {
  const [x0, y0, z0] = min
  const [x1, y1, z1] = max
  const p: Record<string, V3> = {
    a: [x0, y0, z0],
    b: [x1, y0, z0],
    c: [x1, y1, z0],
    d: [x0, y1, z0],
    e: [x0, y0, z1],
    f: [x1, y0, z1],
    g: [x1, y1, z1],
    h: [x0, y1, z1],
  }
  return [
    { points: [p.d, p.c, p.g, p.h], color, floor, glass }, // top
    { points: [p.a, p.e, p.f, p.b], color, floor, glass }, // bottom
    { points: [p.e, p.h, p.g, p.f], color, floor, glass }, // +z
    { points: [p.b, p.c, p.d, p.a], color, floor, glass }, // -z
    { points: [p.f, p.g, p.c, p.b], color, floor, glass }, // +x
    { points: [p.a, p.d, p.h, p.e], color, floor, glass }, // -x
  ]
}

function buildModel(floors: number): Face[] {
  const faces: Face[] = []
  const hw = FLOOR_W / 2
  const hd = FLOOR_D / 2

  for (let i = 0; i < floors; i++) {
    const base = i * FLOOR_H

    // Slab — the visible concrete edge at every level.
    faces.push(...box([-hw, base, -hd], [hw, base + SLAB_T, hd], "#94a3b8", i))

    // Curtain wall, set back from the slab edge so the floor line reads.
    const inset = 0.22
    faces.push(
      ...box(
        [-hw + inset, base + SLAB_T, -hd + inset],
        [hw - inset, base + FLOOR_H, hd - inset],
        i % 2 === 0 ? "#38bdf8" : "#22a7e0",
        i,
        true,
      ),
    )

    // Mullions, four per long face — enough to read as a facade.
    for (let m = 1; m <= 3; m++) {
      const x = -hw + (FLOOR_W * m) / 4
      faces.push(
        ...box(
          [x - 0.06, base + SLAB_T, -hd + inset - 0.03],
          [x + 0.06, base + FLOOR_H, -hd + inset + 0.03],
          "#e2e8f0",
          i,
        ),
        ...box(
          [x - 0.06, base + SLAB_T, hd - inset - 0.03],
          [x + 0.06, base + FLOOR_H, hd - inset + 0.03],
          "#e2e8f0",
          i,
        ),
      )
    }
  }

  const top = floors * FLOOR_H

  // Corner columns, full height.
  const col = 0.34
  const corners: [number, number][] = [
    [-hw, -hd],
    [hw - col, -hd],
    [-hw, hd - col],
    [hw - col, hd - col],
  ]
  for (const [cx, cz] of corners) {
    faces.push(...box([cx, 0, cz], [cx + col, top, cz + col], "#cbd5e1", -1))
  }

  // Roof slab and parapet.
  faces.push(...box([-hw, top, -hd], [hw, top + SLAB_T, hd], "#a8b4c4", -1))
  const par = 0.14
  const pt = top + SLAB_T
  const ph = pt + 0.55
  faces.push(
    ...box([-hw, pt, -hd], [hw, ph, -hd + par], "#94a3b8", -1),
    ...box([-hw, pt, hd - par], [hw, ph, hd], "#94a3b8", -1),
    ...box([-hw, pt, -hd], [-hw + par, ph, hd], "#94a3b8", -1),
    ...box([hw - par, pt, -hd], [hw, ph, hd], "#94a3b8", -1),
  )

  // Rooftop plant — gives the silhouette something to resolve against.
  faces.push(
    ...box([-2.2, pt, -1.4], [0.6, pt + 1.1, 1.4], "#8f9bad", -1),
    ...box([1.2, pt, -0.9], [2.6, pt + 0.7, 0.9], "#8f9bad", -1),
  )

  // Podium, slightly wider than the tower.
  faces.push(
    ...box(
      [-hw - 1.1, -0.35, -hd - 1.1],
      [hw + 1.1, 0, hd + 1.1],
      "#64748b",
      -1,
    ),
  )

  return faces
}

/* ── Interior ─────────────────────────────────────────────────────

   The exterior is a stylised massing where one storey is 1.55 units. That
   is far too short to stand in, so the walkable interior is modelled in
   real metres in its own space: a 9 x 7 m plate with a 2.9 m ceiling and
   the eye at 1.62. The two never share a camera, so the scales never meet.
   ──────────────────────────────────────────────────────────────── */

const ROOM_W = 9
const ROOM_D = 7
const CEIL_H = 2.9
const EYE_H = 1.62
const WALL_T = 0.14

/** Axis-aligned footprints the walker cannot pass through. */
export interface Blocker {
  x0: number
  z0: number
  x1: number
  z1: number
}

const interiorBlockers: Blocker[] = []

function wall(
  faces: Face[],
  x0: number,
  z0: number,
  x1: number,
  z1: number,
  color = "#e2e8f0",
  height = CEIL_H,
) {
  faces.push(...box([x0, 0, z0], [x1, height, z1], color, 0))
  interiorBlockers.push({ x0, z0, x1, z1 })
}

function buildInterior(): Face[] {
  const faces: Face[] = []
  const hw = ROOM_W / 2
  const hd = ROOM_D / 2

  // Floor plate and ceiling.
  faces.push(...box([-hw, -0.12, -hd], [hw, 0, hd], "#cbd5e1", 0))
  faces.push(...box([-hw, CEIL_H, -hd], [hw, CEIL_H + 0.12, hd], "#f1f5f9", 0))
  // Subtle floor joints, ceiling lights and exposed services give scale when
  // looking down or up without adding textures or external assets.
  for (let x = -4; x <= 4; x++) {
    faces.push(...box([x, 0.001, -hd], [x + 0.012, 0.003, hd], "#aab8c8", 0))
  }
  for (let z = -3; z <= 3; z++) {
    faces.push(...box([-hw, 0.001, z], [hw, 0.003, z + 0.012], "#aab8c8", 0))
  }
  for (const x of [-2.2, 1.45, 3.2]) {
    faces.push(...box([x, 2.83, -2.6], [x + 0.16, 2.88, 2.6], "#fff5cd", 0))
  }
  faces.push(...box([-0.6, 2.55, -3.35], [0, 2.82, 3.35], "#8c9db0", 0))

  // Perimeter: a spandrel below and glazing above, so the walls read as
  // curtain wall rather than solid block from the inside.
  const bands: [number, number, string][] = [
    [0, 0.85, "#94a3b8"],
    [0.85, 2.45, "#7dd3fc"],
    [2.45, CEIL_H, "#94a3b8"],
  ]
  for (const [y0, y1, color] of bands) {
    faces.push(
      ...box([-hw, y0, -hd], [hw, y1, -hd + WALL_T], color, 0),
      ...box([-hw, y0, hd - WALL_T], [hw, y1, hd], color, 0),
      ...box([-hw, y0, -hd], [-hw + WALL_T, y1, hd], color, 0),
      ...box([hw - WALL_T, y0, -hd], [hw, y1, hd], color, 0),
    )
  }
  interiorBlockers.push(
    { x0: -hw, z0: -hd, x1: hw, z1: -hd + WALL_T },
    { x0: -hw, z0: hd - WALL_T, x1: hw, z1: hd },
    { x0: -hw, z0: -hd, x1: -hw + WALL_T, z1: hd },
    { x0: hw - WALL_T, z0: -hd, x1: hw, z1: hd },
  )

  // Mullions between the glazing bands.
  for (let m = 1; m <= 5; m++) {
    const x = -hw + (ROOM_W * m) / 6
    faces.push(
      ...box(
        [x - 0.05, 0.85, -hd],
        [x + 0.05, 2.45, -hd + WALL_T + 0.02],
        "#f8fafc",
        0,
      ),
      ...box(
        [x - 0.05, 0.85, hd - WALL_T - 0.02],
        [x + 0.05, 2.45, hd],
        "#f8fafc",
        0,
      ),
    )
  }

  // Service core, floor to ceiling.
  wall(faces, -1.3, -1.05, 0.9, 1.05, "#b6c2d1")

  // Partitions, each left with a doorway gap.
  wall(faces, -hw + WALL_T, -1.3, -2.6, -1.3 + WALL_T, "#e2e8f0")
  wall(faces, -1.45, -1.3, -1.3, -1.3 + WALL_T, "#e2e8f0")
  wall(faces, 2.1, -hd + WALL_T, 2.1 + WALL_T, -1.1, "#e2e8f0")
  wall(faces, 2.1, 0.5, 2.1 + WALL_T, hd - WALL_T, "#e2e8f0")

  // Desks and a meeting table — something to read depth against.
  const desk = (x: number, z: number) => {
    faces.push(...box([x, 0.68, z], [x + 1.5, 0.76, z + 0.75], "#cbd5e1", 0))
    faces.push(
      ...box([x + 0.06, 0, z + 0.06], [x + 0.16, 0.68, z + 0.16], "#94a3b8", 0),
    )
    faces.push(
      ...box([x + 1.34, 0, z + 0.59], [x + 1.44, 0.68, z + 0.69], "#94a3b8", 0),
    )
    interiorBlockers.push({ x0: x, z0: z, x1: x + 1.5, z1: z + 0.75 })
  }
  desk(-4.1, -3.0)
  desk(-4.1, -2.0)
  desk(-4.1, 1.4)
  desk(-4.1, 2.4)

  faces.push(...box([2.7, 0.72, -0.6], [4.1, 0.8, 1.4], "#b6c2d1", 0))
  interiorBlockers.push({ x0: 2.7, z0: -0.6, x1: 4.1, z1: 1.4 })

  return faces
}

// Shared immutable geometry; multiple viewers cannot reset each other's walls.
const INTERIOR_FACES = buildInterior()
export const INTERIOR_BLOCKERS: readonly Blocker[] = interiorBlockers
const DEFAULT_WALK = { x: -2, z: 2.5, yaw: Math.PI, pitch: 0 }

/** Slide along a wall rather than sticking to it. */
function resolveWalk(x: number, z: number, px: number, pz: number) {
  const r = 0.3
  const hits = (tx: number, tz: number) =>
    interiorBlockers.some(
      (b) => tx > b.x0 - r && tx < b.x1 + r && tz > b.z0 - r && tz < b.z1 + r,
    )
  let nx = x
  let nz = z
  if (hits(nx, pz)) nx = px
  if (hits(px, nz)) nz = pz
  if (hits(nx, nz)) return { x: px, z: pz }
  return { x: nx, z: nz }
}

/* ── Compilation ──────────────────────────────────────────────────

   Everything that does not depend on the camera is computed once: the
   vertex buffer, and — because both the face normal and the light are
   fixed in world space — the exact fill and stroke colours. The per-frame
   loop then does nothing but transform, cull, sort and draw, with no
   allocation and no colour maths.
   ──────────────────────────────────────────────────────────────── */

function shade(hex: string, factor: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.round(((n >> 16) & 255) * factor))
  const g = Math.min(255, Math.round(((n >> 8) & 255) * factor))
  const b = Math.min(255, Math.round((n & 255) * factor))
  return `rgb(${r},${g},${b})`
}

const LIGHT: V3 = [0.42, 0.79, 0.44]

interface Compiled {
  count: number
  /** count * 4 * 3 world-space vertices; every face is a quad. */
  verts: Float32Array
  floor: Int16Array
  fill: string[]
  fillDim: string[]
  stroke: string[]
  strokeDim: string[]
}

function compile(faces: Face[]): Compiled {
  const count = faces.length
  const verts = new Float32Array(count * 12)
  const floor = new Int16Array(count)
  const fill: string[] = new Array(count)
  const fillDim: string[] = new Array(count)
  const stroke: string[] = new Array(count)
  const strokeDim: string[] = new Array(count)

  for (let f = 0; f < count; f++) {
    const face = faces[f]
    for (let v = 0; v < 4; v++) {
      const p = face.points[v]
      const o = f * 12 + v * 3
      verts[o] = p[0]
      verts[o + 1] = p[1]
      verts[o + 2] = p[2]
    }
    floor[f] = face.floor

    // Face normal, and therefore its shading, never changes.
    const [a, b, c] = face.points
    const ux = b[0] - a[0],
      uy = b[1] - a[1],
      uz = b[2] - a[2]
    const vx = c[0] - a[0],
      vy = c[1] - a[1],
      vz = c[2] - a[2]
    let nx = uy * vz - uz * vy
    let ny = uz * vx - ux * vz
    let nz = ux * vy - uy * vx
    const len = Math.hypot(nx, ny, nz) || 1
    nx /= len
    ny /= len
    nz /= len

    const lambert = Math.abs(nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2])
    const light = 0.5 + lambert * 0.62
    fill[f] = shade(face.color, light)
    fillDim[f] = shade(face.color, light * 0.45)
    stroke[f] = face.glass ? "rgba(148,163,184,0.45)" : "rgba(51,65,85,0.34)"
    strokeDim[f] = "rgba(148,163,184,0.22)"
  }

  return { count, verts, floor, fill, fillDim, stroke, strokeDim }
}

const DEFAULT_CAMERA = { yaw: -0.62, pitch: 0.34, dist: 24, panX: 0, panY: 0 }

export const Building3D = forwardRef<Building3DHandle, Building3DProps>(
  function Building3D(
    {
      floors = 8,
      activeFloor = null,
      pins = [],
      onProjectPins,
      onCameraChange,
      className = "",
      mode = "orbit",
      onWalkChange,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const walkCanvasRef = useRef<HTMLCanvasElement>(null)
    const indoorRenderer =
      useRef<ReturnType<typeof createInteriorRenderer>>(null)
    const [walkUnavailable, setWalkUnavailable] = useState(false)
    const frameRef = useRef<number | null>(null)

    const camera = useRef({ ...DEFAULT_CAMERA })
    const model = useRef<Compiled | null>(null)
    // Scratch buffers, sized once with the model: the draw loop must not
    // allocate, or the GC will stutter mid-gesture.
    const scratch = useRef({
      sx: new Float32Array(0),
      sy: new Float32Array(0),
      depth: new Float32Array(0),
      order: new Int32Array(0),
      visible: new Uint8Array(0),
    })
    const interacting = useRef(false)
    const pointers = useRef(new Map<number, { x: number; y: number }>())
    const pinchStart = useRef<{ gap: number; dist: number } | null>(null)
    const lastMid = useRef<{ x: number; y: number } | null>(null)
    const walk = useRef({ ...DEFAULT_WALK })
    const walkInput = useRef({ forward: 0, strafe: 0 })
    const keys = useRef(new Set<string>())
    const lastStep = useRef<number | null>(null)
    const interior = useRef<Compiled | null>(null)

    // Latest props, read inside the imperative draw loop without re-binding it.
    const latest = useRef({
      activeFloor,
      pins,
      onProjectPins,
      onCameraChange,
      mode,
      onWalkChange,
    })
    latest.current = {
      activeFloor,
      pins,
      onProjectPins,
      onCameraChange,
      mode,
      onWalkChange,
    }

    if (model.current === null) setModel(floors)
    useEffect(() => {
      setModel(floors)
      scheduleDraw()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [floors])

    function setModel(count: number) {
      const compiled = compile(buildModel(count))
      if (!interior.current) interior.current = compile(INTERIOR_FACES)
      model.current = compiled
      const most = Math.max(compiled.count, interior.current.count)
      scratch.current = {
        sx: new Float32Array(most * 4),
        sy: new Float32Array(most * 4),
        depth: new Float32Array(most),
        order: new Int32Array(most),
        visible: new Uint8Array(most),
      }
    }

    function scheduleDraw() {
      if (frameRef.current !== null) return
      frameRef.current = requestAnimationFrame((time) => {
        frameRef.current = null
        const held = keys.current
        const forward =
          walkInput.current.forward +
          Number(held.has("w") || held.has("arrowup")) -
          Number(held.has("s") || held.has("arrowdown"))
        const strafe =
          walkInput.current.strafe +
          Number(held.has("d")) -
          Number(held.has("a"))
        const turn =
          Number(held.has("arrowleft")) - Number(held.has("arrowright"))
        const moving =
          latest.current.mode === "walk" &&
          (forward !== 0 || strafe !== 0 || turn !== 0)
        if (moving) {
          const dt =
            lastStep.current === null
              ? 0
              : Math.min((time - lastStep.current) / 1000, 0.05)
          const length = Math.max(1, Math.hypot(forward, strafe))
          walk.current.yaw += turn * dt * 1.4
          moveWalk((forward / length) * dt * 1.8, (strafe / length) * dt * 1.8)
          lastStep.current = time
        } else lastStep.current = null
        draw()
        if (moving) scheduleDraw()
      })
    }

    function moveWalk(forward: number, strafe: number) {
      if (latest.current.mode !== "walk" || !Number.isFinite(forward + strafe))
        return
      const wc = walk.current
      // Sweep short steps so even a large input cannot tunnel through a wall.
      const length = Math.hypot(forward, strafe)
      const steps = Math.max(1, Math.ceil(Math.min(length, 20) / 0.08))
      const limit = length > 20 ? 20 / length : 1
      const dx =
        ((-Math.sin(wc.yaw) * forward + Math.cos(wc.yaw) * strafe) * limit) /
        steps
      const dz =
        ((Math.cos(wc.yaw) * forward + Math.sin(wc.yaw) * strafe) * limit) /
        steps
      for (let i = 0; i < steps; i++) {
        const next = resolveWalk(wc.x + dx, wc.z + dz, wc.x, wc.z)
        wc.x = next.x
        wc.z = next.z
      }
    }

    function draw() {
      if (latest.current.mode === "walk") {
        indoorRenderer.current?.draw(walk.current, EYE_H)
        latest.current.onProjectPins?.(
          latest.current.pins.map((pin) => ({
            id: pin.id,
            x: 0,
            y: 0,
            depth: 0,
            visible: false,
          })),
        )
        latest.current.onWalkChange?.(walk.current)
        latest.current.onCameraChange?.(
          ((((-walk.current.yaw * 180) / Math.PI) % 360) + 360) % 360,
        )
        return
      }
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!canvas || !ctx) return

      // Full resolution when still, 1x while gesturing. A 4x cut in fill
      // rate that is invisible in motion and restored the moment you let go.
      const dpr = interacting.current
        ? 1
        : Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const oc = camera.current
      const cosY = Math.cos(oc.yaw),
        sinY = Math.sin(oc.yaw)
      const cosP = Math.cos(oc.pitch),
        sinP = Math.sin(oc.pitch)
      const cx = w / 2 + oc.panX,
        cyc = h * 0.58 + oc.panY
      const centreY = (floors * FLOOR_H) / 2,
        dist = oc.dist
      const focal = Math.min(w, h) * 1.15
      const compiled = model.current
      if (!compiled) return
      const { sx, sy, depth, order, visible } = scratch.current

      /* Ground grid — orbit only; indoors the floor plate replaces it. */
      ctx.lineWidth = 1
      const G = 22
      const step = interacting.current ? 4 : 2
      for (const pass of [0, 1]) {
        ctx.strokeStyle =
          pass === 0 ? "rgba(100,116,139,0.13)" : "rgba(100,116,139,0.30)"
        ctx.beginPath()
        for (let i = -G; i <= G; i += step) {
          if ((pass === 1) !== (i === 0)) continue
          for (let axis = 0; axis < 2; axis++) {
            const ax = axis === 0 ? i : -G
            const az = axis === 0 ? -G : i
            const bx = axis === 0 ? i : G
            const bz = axis === 0 ? G : i
            // Inline world → camera for both endpoints.
            const az1 = -ax * sinY + az * cosY
            const ay2 = -0.36 - centreY
            const aZ = ay2 * sinP + az1 * cosP + dist
            const bz1 = -bx * sinY + bz * cosY
            const bZ = ay2 * sinP + bz1 * cosP + dist
            if (aZ <= 0.4 || bZ <= 0.4) continue
            const aX = ax * cosY + az * sinY
            const aY = ay2 * cosP - az1 * sinP
            const bX = bx * cosY + bz * sinY
            const bY = ay2 * cosP - bz1 * sinP
            ctx.moveTo(cx + (aX * focal) / aZ, cyc - (aY * focal) / aZ)
            ctx.lineTo(cx + (bX * focal) / bZ, cyc - (bY * focal) / bZ)
          }
        }
        ctx.stroke()
      }

      /* Transform, cull and depth every face — no allocation in here. */
      const isolate = latest.current.activeFloor
      const verts = compiled.verts
      let drawCount = 0

      for (let f = 0; f < compiled.count; f++) {
        visible[f] = 0
        let sum = 0
        let behind = false
        const base = f * 4

        for (let v = 0; v < 4; v++) {
          const o = f * 12 + v * 3
          const x = verts[o]
          const y = verts[o + 1] - centreY
          const z = verts[o + 2]
          const x1 = x * cosY + z * sinY
          const z1 = -x * sinY + z * cosY
          const y2 = y * cosP - z1 * sinP
          const z2 = y * sinP + z1 * cosP + dist
          if (z2 <= 0.4) {
            behind = true
            break
          }
          sx[base + v] = cx + (x1 * focal) / z2
          sy[base + v] = cyc - (y2 * focal) / z2
          sum += z2
        }
        if (behind) continue

        // Backface cull from the screen-space winding.
        let area = 0
        for (let v = 0; v < 4; v++) {
          const n = (v + 1) & 3
          area += sx[base + v] * sy[base + n] - sx[base + n] * sy[base + v]
        }
        if (area >= 0) continue

        depth[f] = sum * 0.25
        visible[f] = 1
        order[drawCount++] = f
      }

      /* Painter's algorithm: sort the visible indices, back to front. */
      const list = order.subarray(0, drawCount)
      Array.prototype.sort.call(
        list,
        (a: number, b: number) => depth[b] - depth[a],
      )

      const skipEdges = interacting.current
      ctx.lineWidth = 0.7
      ctx.lineJoin = "round"

      for (let i = 0; i < drawCount; i++) {
        const f = list[i]
        const base = f * 4
        const dimmed =
          isolate !== null &&
          compiled.floor[f] !== -1 &&
          compiled.floor[f] !== isolate

        ctx.beginPath()
        ctx.moveTo(sx[base], sy[base])
        ctx.lineTo(sx[base + 1], sy[base + 1])
        ctx.lineTo(sx[base + 2], sy[base + 2])
        ctx.lineTo(sx[base + 3], sy[base + 3])
        ctx.closePath()
        ctx.fillStyle = dimmed ? compiled.fillDim[f] : compiled.fill[f]
        ctx.fill()
        if (!skipEdges) {
          ctx.strokeStyle = dimmed ? compiled.strokeDim[f] : compiled.stroke[f]
          ctx.stroke()
        }
      }

      /* Project the pins through the same camera. */
      const report = latest.current.onProjectPins
      if (report) {
        report(
          latest.current.pins.map((pin) => {
            const x = pin.position[0]
            const y = pin.position[1] - centreY
            const z = pin.position[2]
            const x1 = x * cosY + z * sinY
            const z1 = -x * sinY + z * cosY
            const y2 = y * cosP - z1 * sinP
            const z2 = y * sinP + z1 * cosP + dist
            const px = cx + (x1 * focal) / z2
            const py = cyc - (y2 * focal) / z2
            return {
              id: pin.id,
              x: px,
              y: py,
              depth: z2,
              visible:
                z2 > 0.4 &&
                px > -40 &&
                px < w + 40 &&
                py > -40 &&
                py < h + 40 &&
                (isolate === null || pin.floor === isolate),
            }
          }),
        )
      }

      latest.current.onCameraChange?.(
        ((-camera.current.yaw * 180) / Math.PI + 360) % 360,
      )
    }

    /* ── Interaction ──────────────────────────────────────────────── */

    function stopWalking() {
      walkInput.current = { forward: 0, strafe: 0 }
      keys.current.clear()
      lastStep.current = null
    }

    useEffect(() => {
      if (mode !== "walk" || !walkCanvasRef.current || !interior.current) return
      const canvas = walkCanvasRef.current
      const init = () => {
        indoorRenderer.current?.dispose()
        indoorRenderer.current = createInteriorRenderer(
          canvas,
          interior.current!,
        )
        setWalkUnavailable(!indoorRenderer.current)
        scheduleDraw()
      }
      const lost = (event: Event) => {
        event.preventDefault()
        stopWalking()
        setWalkUnavailable(true)
      }
      canvas.addEventListener("webglcontextlost", lost)
      canvas.addEventListener("webglcontextrestored", init)
      init()
      return () => {
        canvas.removeEventListener("webglcontextlost", lost)
        canvas.removeEventListener("webglcontextrestored", init)
        indoorRenderer.current?.dispose()
        indoorRenderer.current = null
      }
    }, [mode])

    useEffect(() => {
      stopWalking()
      pointers.current.clear()
      pinchStart.current = null
      lastMid.current = null
      interacting.current = false
      if (mode === "walk") {
        walk.current = { ...DEFAULT_WALK }
        walkCanvasRef.current?.focus({ preventScroll: true })
      }
      scheduleDraw()
    }, [mode, activeFloor])

    useEffect(() => {
      const canvas = canvasRef.current
      const walkCanvas = walkCanvasRef.current
      if (!canvas || !walkCanvas) return

      const gapOf = () => {
        const [a, b] = [...pointers.current.values()]
        return Math.hypot(a.x - b.x, a.y - b.y)
      }

      const midpoint = () => {
        const [a, b] = [...pointers.current.values()]
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      }

      const onDown = (e: PointerEvent) => {
        const target = e.currentTarget as HTMLCanvasElement
        target.setPointerCapture(e.pointerId)
        if (latest.current.mode === "walk")
          target.focus({ preventScroll: true })
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
        interacting.current = true
        if (pointers.current.size === 2) {
          pinchStart.current = { gap: gapOf(), dist: camera.current.dist }
          lastMid.current = midpoint()
        }
        scheduleDraw()
      }

      const onMove = (e: PointerEvent) => {
        const prev = pointers.current.get(e.pointerId)
        if (!prev) return
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

        if (latest.current.mode === "walk") {
          if (pointers.current.keys().next().value === e.pointerId) {
            walk.current.yaw += (e.clientX - prev.x) * 0.006
            walk.current.pitch = Math.max(
              -1.15,
              Math.min(1.15, walk.current.pitch + (e.clientY - prev.y) * 0.005),
            )
          }
        } else if (pointers.current.size === 2 && pinchStart.current) {
          // Pinch to zoom, and drag the midpoint to pan.
          const ratio = pinchStart.current.gap / (gapOf() || 1)
          camera.current.dist = Math.max(
            12,
            Math.min(52, pinchStart.current.dist * ratio),
          )
          const mid = midpoint()
          if (lastMid.current) {
            camera.current.panX += mid.x - lastMid.current.x
            camera.current.panY += mid.y - lastMid.current.y
          }
          lastMid.current = mid
        } else if (pointers.current.size === 1) {
          camera.current.yaw += (e.clientX - prev.x) * 0.009
          camera.current.pitch = Math.max(
            -0.15,
            Math.min(1.25, camera.current.pitch + (e.clientY - prev.y) * 0.006),
          )
        }
        scheduleDraw()
      }

      const onUp = (e: PointerEvent) => {
        pointers.current.delete(e.pointerId)
        if (pointers.current.size < 2) {
          pinchStart.current = null
          lastMid.current = null
        }
        if (pointers.current.size === 0) {
          // Gesture over — redraw once at full resolution.
          interacting.current = false
          scheduleDraw()
        }
      }

      const onWheel = (e: WheelEvent) => {
        e.preventDefault()
        if (latest.current.mode === "walk") return
        camera.current.dist = Math.max(
          12,
          Math.min(52, camera.current.dist + e.deltaY * 0.035),
        )
        scheduleDraw()
      }

      const onKeyDown = (e: KeyboardEvent) => {
        if (
          e.target !== walkCanvas ||
          latest.current.mode !== "walk" ||
          e.altKey ||
          e.ctrlKey ||
          e.metaKey
        )
          return
        const key = e.key.toLowerCase()
        if (
          ![
            "w",
            "a",
            "s",
            "d",
            "arrowup",
            "arrowdown",
            "arrowleft",
            "arrowright",
          ].includes(key)
        )
          return
        e.preventDefault()
        keys.current.add(key)
        scheduleDraw()
      }
      const onKeyUp = (e: KeyboardEvent) => {
        keys.current.delete(e.key.toLowerCase())
      }
      const onBlur = () => {
        stopWalking()
        pointers.current.clear()
        interacting.current = false
      }
      const onVisibility = () => {
        if (document.hidden) onBlur()
      }
      window.addEventListener("keydown", onKeyDown)
      window.addEventListener("keyup", onKeyUp)
      window.addEventListener("blur", onBlur)
      walkCanvas.addEventListener("blur", stopWalking)
      document.addEventListener("visibilitychange", onVisibility)
      for (const surface of [canvas, walkCanvas]) {
        surface.addEventListener("pointerdown", onDown)
        surface.addEventListener("pointermove", onMove)
        surface.addEventListener("pointerup", onUp)
        surface.addEventListener("pointercancel", onUp)
        surface.addEventListener("lostpointercapture", onUp)
        surface.addEventListener("wheel", onWheel, { passive: false })
      }

      const observer = new ResizeObserver(() => scheduleDraw())
      observer.observe(canvas)
      observer.observe(walkCanvas)
      scheduleDraw()

      return () => {
        stopWalking()
        window.removeEventListener("keydown", onKeyDown)
        window.removeEventListener("keyup", onKeyUp)
        window.removeEventListener("blur", onBlur)
        walkCanvas.removeEventListener("blur", stopWalking)
        document.removeEventListener("visibilitychange", onVisibility)
        for (const surface of [canvas, walkCanvas]) {
          surface.removeEventListener("pointerdown", onDown)
          surface.removeEventListener("pointermove", onMove)
          surface.removeEventListener("pointerup", onUp)
          surface.removeEventListener("pointercancel", onUp)
          surface.removeEventListener("lostpointercapture", onUp)
          surface.removeEventListener("wheel", onWheel)
        }
        observer.disconnect()
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current)
          // Must clear the handle too: StrictMode runs cleanup between its two
          // mount passes, and a stale non-null id would make every later
          // scheduleDraw() bail out and the canvas would never paint.
          frameRef.current = null
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
      scheduleDraw()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFloor, pins])

    useImperativeHandle(ref, () => ({
      zoomBy(delta: number) {
        camera.current.dist = Math.max(
          12,
          Math.min(52, camera.current.dist + delta),
        )
        scheduleDraw()
      },
      reset() {
        stopWalking()
        if (latest.current.mode === "walk") walk.current = { ...DEFAULT_WALK }
        else camera.current = { ...DEFAULT_CAMERA }
        interacting.current = false
        scheduleDraw()
      },
      walkMove(forward, strafe) {
        moveWalk(forward, strafe)
        scheduleDraw()
      },
      setWalkInput(forward, strafe) {
        if (!Number.isFinite(forward + strafe)) return
        walkInput.current = { forward, strafe }
        scheduleDraw()
      },
    }))

    return (
      <>
        <canvas
          ref={canvasRef}
          className={`h-full w-full touch-none ${
            mode === "walk" ? "invisible" : ""
          } ${className}`}
          aria-label="Interactive 3D building model"
          aria-hidden={mode === "walk"}
        />
        <canvas
          ref={walkCanvasRef}
          className={`absolute inset-0 h-full w-full touch-none outline-none ${
            mode === "walk" ? "" : "hidden"
          } ${className}`}
          tabIndex={mode === "walk" ? 0 : -1}
          aria-label="First-person building interior. Drag to look; use W A S D or arrow keys to move."
          aria-hidden={mode !== "walk"}
        />
        {mode === "walk" && walkUnavailable && (
          <div
            role="status"
            className="absolute inset-0 flex items-center justify-center bg-slate-100 px-16 text-center text-sm text-slate-700"
          >
            Interior view needs 3D graphics support. Return to Orbit to view the
            building.
          </div>
        )}
      </>
    )
  },
)

/**
 * Where a pin sits in the world. Slots walk around the facade rather than
 * sitting inside the floor plate, so markers read as attached to the elevation
 * and do not stack on top of each other.
 */
export function pinPosition(floor: number, slot: number): V3 {
  const hw = FLOOR_W / 2 + 0.1
  const hd = FLOOR_D / 2 + 0.1
  const ring: [number, number][] = [
    [-hw * 0.55, -hd],
    [hw * 0.62, -hd],
    [hw, hd * 0.3],
    [hw * 0.3, hd],
    [-hw * 0.7, hd],
    [-hw, -hd * 0.35],
  ]
  const [x, z] = ring[slot % ring.length]
  return [x, floor * FLOOR_H + FLOOR_H * 0.62, z]
}

export const FLOOR_HEIGHT = FLOOR_H
export default Building3D
