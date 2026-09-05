/** Depth-tested indoor rendering: walls crossing the camera plane are clipped
 * by the GPU instead of disappearing as they would in the exterior painter.
 *
 * Two looks share one program. Schematic draws the colour the exterior painter
 * baked — flat, diagram-like, and cheap. Realistic lights every surface on the
 * GPU instead: a hemispheric ambient plus the ceiling light, contact shading
 * near the floor, depth haze, and a procedural treatment per material, so tile
 * joints, plank lines and the sheen on the glazing come out of the shader
 * rather than out of a texture the app would have to ship. */
export default function createInteriorRenderer(
  canvas: HTMLCanvasElement,
  model: {
    count: number
    verts: Float32Array
    fill: string[]
    base: string[]
    material: Uint8Array
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
      attribute vec3 flatColor;
      attribute vec3 baseColor;
      attribute vec3 normal;
      attribute float material;
      uniform vec3 eye;
      uniform vec4 rotation;
      uniform vec2 lens;
      varying vec3 vFlat;
      varying vec3 vBase;
      varying vec3 vNormal;
      varying vec3 vWorld;
      varying float vMaterial;
      varying float vDepth;
      void main() {
        vec3 p = position - eye;
        float x = p.x * rotation.x + p.z * rotation.y;
        float z = -p.x * rotation.y + p.z * rotation.x;
        float y = p.y * rotation.z - z * rotation.w;
        z = p.y * rotation.w + z * rotation.z;
        gl_Position = vec4(x * lens.x, y * lens.y, 1.001501 * z - 0.12009, z);
        vFlat = flatColor;
        vBase = baseColor;
        vNormal = normal;
        vWorld = position;
        vMaterial = material;
        vDepth = z;
      }
    `,
      ),
    )
    gl.attachShader(
      program,
      shader(
        gl.FRAGMENT_SHADER,
        `
      #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
      #else
      precision mediump float;
      #endif
      uniform float realistic;
      uniform vec3 eye;
      varying vec3 vFlat;
      varying vec3 vBase;
      varying vec3 vNormal;
      varying vec3 vWorld;
      varying float vMaterial;
      varying float vDepth;

      /* 0 on a joint line, 1 out in the field. */
      float seam(float coordinate, float spacing, float width) {
        float d = abs(fract(coordinate / spacing - 0.5) - 0.5) * spacing;
        return smoothstep(0.0, width, d);
      }

      float hash(vec2 cell) {
        return fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        if (realistic < 0.5) {
          gl_FragColor = vec4(vFlat, 1.0);
          return;
        }

        vec3 viewDir = normalize(eye - vWorld);
        vec3 n = normalize(vNormal);
        /* Everything is drawn two-sided, so turn the normal towards the camera
           and the winding of the source geometry stops mattering. */
        if (dot(n, viewDir) < 0.0) n = -n;

        float kind = floor(vMaterial + 0.5);
        vec3 albedo = vBase;
        float gloss = 0.05;
        float emissive = 0.0;
        /* The horizontal axis a vertical surface runs along. */
        float along = abs(n.x) > abs(n.z) ? vWorld.z : vWorld.x;

        if (kind == 1.0) {
          /* Floor: 600 mm tiles, each a shade off its neighbour. */
          float joint = min(seam(vWorld.x, 0.6, 0.015), seam(vWorld.z, 0.6, 0.015));
          albedo *= mix(0.74, 1.0, joint);
          albedo *= 0.96 + 0.07 * hash(floor(vWorld.xz / 0.6));
          gloss = 0.22;
        } else if (kind == 2.0) {
          /* Ceiling: 1.2 m acoustic panels. */
          float joint = min(seam(vWorld.x, 1.2, 0.018), seam(vWorld.z, 1.2, 0.018));
          albedo *= mix(0.86, 1.0, joint);
        } else if (kind == 3.0) {
          /* Partitions: a joint every 1.2 m, and a shadow line at the skirting. */
          albedo *= mix(0.9, 1.0, seam(along, 1.2, 0.011));
          albedo *= mix(0.7, 1.0, smoothstep(0.0, 0.12, vWorld.y));
          gloss = 0.08;
        } else if (kind == 4.0) {
          /* Glazing: daylight towards the head, a fresnel sheen at grazing
             angles, and the sky picked up in the reflection. */
          albedo = mix(
            albedo * 0.94,
            vec3(0.97, 0.99, 1.0),
            smoothstep(0.85, 2.45, vWorld.y) * 0.72
          );
          albedo += pow(1.0 - abs(dot(n, viewDir)), 3.0) * 0.3;
          gloss = 0.85;
        } else if (kind == 5.0) {
          /* Brushed metal: mullions, desk legs, the exposed services. */
          albedo *= 0.95 + 0.08 * seam(along, 0.22, 0.03);
          gloss = 0.55;
        } else if (kind == 6.0) {
          /* Desks: warm the grey towards oak, then lay the planks. */
          albedo *= vec3(1.08, 0.87, 0.64);
          albedo *= mix(0.88, 1.0, seam(vWorld.x, 0.32, 0.009));
          albedo *= 0.94 + 0.09 * hash(floor(vec2(vWorld.x / 0.32, vWorld.z)));
          gloss = 0.3;
        } else if (kind == 7.0) {
          emissive = 1.0;
        } else if (kind == 8.0) {
          /* Fair-faced concrete core: fine speckle and the shutter joints. */
          albedo *= 0.94 + 0.09 * hash(floor(vWorld.xz * 7.0 + vWorld.y));
          albedo *= mix(0.92, 1.0, seam(vWorld.y, 1.2, 0.013));
        }

        /* Key light down from the ceiling strip, over a hemispheric ambient:
           cool from the glazing above, warm bounce off the floor. */
        vec3 key = normalize(vec3(0.24, 1.0, 0.19));
        vec3 ambient = mix(
          vec3(0.56, 0.54, 0.52),
          vec3(0.87, 0.92, 1.0),
          n.y * 0.5 + 0.5
        );
        /* Contact shading: a surface loses the bounce as it meets the floor. */
        float contact = mix(0.74, 1.0, smoothstep(0.0, 0.5, vWorld.y));
        float ao = mix(contact, 1.0, smoothstep(0.55, 0.95, abs(n.y)));

        vec3 lit = albedo * (ambient * 0.88 + max(dot(n, key), 0.0) * 0.55) * ao;
        vec3 halfway = normalize(key + viewDir);
        lit += gloss * pow(max(dot(n, halfway), 0.0), 44.0) * vec3(1.0, 0.98, 0.93) * 0.5;
        lit = mix(lit, albedo * 1.32, emissive);

        /* Depth haze, so a long bay reads as a long bay. */
        lit = mix(lit, vec3(0.88, 0.91, 0.95), (1.0 - exp(-vDepth * 0.032)) * 0.42);
        gl_FragColor = vec4(pow(clamp(lit, 0.0, 1.0), vec3(0.94)), 1.0);
      }
    `,
      ),
    )
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error("Interior renderer unavailable")

    const rgb = (color: string) => {
      if (color[0] === "#") {
        const n = parseInt(color.slice(1), 16)
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
      }
      return color.match(/\d+/g)!.map((value) => Number(value) / 255)
    }

    // position(3) flat(3) base(3) normal(3) material(1)
    const STRIDE = 13
    const data = new Float32Array(model.count * 6 * STRIDE)
    let offset = 0
    for (let face = 0; face < model.count; face++) {
      const flat = rgb(model.fill[face])
      const base = rgb(model.base[face])
      const material = model.material[face]

      // Face normal, from the first corner of the quad.
      const start = face * 12
      const ax = model.verts[start],
        ay = model.verts[start + 1],
        az = model.verts[start + 2]
      const ux = model.verts[start + 3] - ax,
        uy = model.verts[start + 4] - ay,
        uz = model.verts[start + 5] - az
      const vx = model.verts[start + 6] - ax,
        vy = model.verts[start + 7] - ay,
        vz = model.verts[start + 8] - az
      const nx = uy * vz - uz * vy
      const ny = uz * vx - ux * vz
      const nz = ux * vy - uy * vx
      const length = Math.hypot(nx, ny, nz) || 1

      for (const vertex of [0, 1, 2, 0, 2, 3]) {
        data.set(
          model.verts.subarray(start + vertex * 3, start + vertex * 3 + 3),
          offset,
        )
        data.set(flat, offset + 3)
        data.set(base, offset + 6)
        data[offset + 9] = nx / length
        data[offset + 10] = ny / length
        data[offset + 11] = nz / length
        data[offset + 12] = material
        offset += STRIDE
      }
    }
    buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    gl.useProgram(program)
    for (const [name, size, offset] of [
      ["position", 3, 0],
      ["flatColor", 3, 12],
      ["baseColor", 3, 24],
      ["normal", 3, 36],
      ["material", 1, 48],
    ] as const) {
      const location = gl.getAttribLocation(program, name)
      if (location < 0) continue
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(
        location,
        size,
        gl.FLOAT,
        false,
        STRIDE * 4,
        offset,
      )
    }
    const eye = gl.getUniformLocation(program, "eye")
    const rotation = gl.getUniformLocation(program, "rotation")
    const lens = gl.getUniformLocation(program, "lens")
    const realistic = gl.getUniformLocation(program, "realistic")
    gl.enable(gl.DEPTH_TEST)
    // Both sides are useful indoors, particularly for thin ceiling panels.
    gl.disable(gl.CULL_FACE)
    return {
      draw(
        camera: {
          x: number
          z: number
          yaw: number
          pitch: number
        },
        eyeHeight: number,
        /** Focal multiplier: 1 is the standing lens, above 1 zooms in. */
        zoom = 1,
        /** Light the surfaces here rather than drawing the baked flat colour. */
        lit = false,
        /**
         * Ceiling on the backing-store scale. Phones report a device ratio of
         * 3, which quadruples the shading work for detail no one can see at
         * arm's length; capping it is what keeps a walk at frame rate.
         */
        dprCap = 2,
      ) {
        const w = canvas.clientWidth,
          h = canvas.clientHeight
        if (!w || !h || gl.isContextLost()) return
        const dpr = Math.min(window.devicePixelRatio || 1, dprCap)
        const width = Math.round(w * dpr),
          height = Math.round(h * dpr)
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width
          canvas.height = height
        }
        gl.viewport(0, 0, width, height)
        if (lit) gl.clearColor(0.88, 0.91, 0.95, 1)
        else gl.clearColor(0.91, 0.94, 0.97, 1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.uniform1f(realistic, lit ? 1 : 0)
        gl.uniform3f(eye, camera.x, eyeHeight, camera.z)
        gl.uniform4f(
          rotation,
          Math.cos(camera.yaw),
          Math.sin(camera.yaw),
          Math.cos(camera.pitch),
          Math.sin(camera.pitch),
        )
        const focal = Math.min(w, h) * 0.78 * (zoom > 0 ? zoom : 1)
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
