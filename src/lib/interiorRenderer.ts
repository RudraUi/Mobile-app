/** Depth-tested indoor rendering: walls crossing the camera plane are clipped
 * by the GPU instead of disappearing as they would in the exterior painter. */
export default function createInteriorRenderer(
  canvas: HTMLCanvasElement,
  model: {
    count: number
    verts: Float32Array
    fill: string[]
  },
) {
  const gl = canvas.getContext("webgl", { antialias: true, alpha: false })
  if (!gl) return null
  const shaders: WebGLShader[] = []
  const shader = (type: number, source: string) => {
    const value = gl.createShader(type)!
    gl.shaderSource(value, source)
    gl.compileShader(value)
    shaders.push(value)
    if (!gl.getShaderParameter(value, gl.COMPILE_STATUS))
      throw new Error("Interior shader unavailable")
    return value
  }
  const program = gl.createProgram()!
  let buffer: WebGLBuffer | null = null
  const dispose = () => {
    gl.deleteBuffer(buffer)
    gl.deleteProgram(program)
    shaders.forEach((value) => gl.deleteShader(value))
  }
  try {
    gl.attachShader(
      program,
      shader(
        gl.VERTEX_SHADER,
        `
      attribute vec3 position;
      attribute vec3 color;
      uniform vec3 eye;
      uniform vec4 rotation;
      uniform vec2 lens;
      varying vec3 tint;
      void main() {
        vec3 p = position - eye;
        float x = p.x * rotation.x + p.z * rotation.y;
        float z = -p.x * rotation.y + p.z * rotation.x;
        float y = p.y * rotation.z - z * rotation.w;
        z = p.y * rotation.w + z * rotation.z;
        gl_Position = vec4(x * lens.x, y * lens.y, 1.001501 * z - 0.12009, z);
        tint = color;
      }
    `,
      ),
    )
    gl.attachShader(
      program,
      shader(
        gl.FRAGMENT_SHADER,
        `
      precision mediump float;
      varying vec3 tint;
      void main() { gl_FragColor = vec4(tint, 1.0); }
    `,
      ),
    )
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error("Interior renderer unavailable")
    const data = new Float32Array(model.count * 6 * 6)
    let offset = 0
    for (let face = 0; face < model.count; face++) {
      const color = model.fill[face].match(/\d+/g)!.map(Number)
      for (const vertex of [0, 1, 2, 0, 2, 3]) {
        const start = face * 12 + vertex * 3
        data.set(model.verts.subarray(start, start + 3), offset)
        data.set(
          color.map((value) => value / 255),
          offset + 3,
        )
        offset += 6
      }
    }
    buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    gl.useProgram(program)
    for (const [name, offset] of [
      ["position", 0],
      ["color", 12],
    ] as const) {
      const location = gl.getAttribLocation(program, name)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 24, offset)
    }
    const eye = gl.getUniformLocation(program, "eye")
    const rotation = gl.getUniformLocation(program, "rotation")
    const lens = gl.getUniformLocation(program, "lens")
    gl.enable(gl.DEPTH_TEST)
    // Both sides are useful indoors, particularly for thin ceiling panels.
    gl.disable(gl.CULL_FACE)
    gl.clearColor(0.91, 0.94, 0.97, 1)
    return {
      draw(
        camera: { x: number z: number yaw: number pitch: number },
        eyeHeight: number,
      ) {
        const w = canvas.clientWidth,
          h = canvas.clientHeight
        if (!w || !h || gl.isContextLost()) return
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const width = Math.round(w * dpr),
          height = Math.round(h * dpr)
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width
          canvas.height = height
        }
        gl.viewport(0, 0, width, height)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.uniform3f(eye, camera.x, eyeHeight, camera.z)
        gl.uniform4f(
          rotation,
          Math.cos(camera.yaw),
          Math.sin(camera.yaw),
          Math.cos(camera.pitch),
          Math.sin(camera.pitch),
        )
        const focal = Math.min(w, h) * 0.78
        gl.uniform2f(lens, (2 * focal) / w, (2 * focal) / h)
        gl.drawArrays(gl.TRIANGLES, 0, model.count * 6)
      },
      dispose,
    }
  } catch {
    dispose()
    return null
  }
}
