import { Triangles } from './Program'
import { WebGL } from './WebGL'
import vertexShader from './shader/vertexShader.glsl'
import fragmentShader from './shader/fragmentShader.glsl'
import GUI from 'lil-gui'

export class WebGLCanvas extends WebGL {
  private triangles!: Triangles
  private elapsedTime = 0
  private default = { vertexAmount: 10, minRadius: 0.25 }

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)
    this.init()
    this.createTriangles(this.default.vertexAmount, this.default.minRadius)
    this.setUniforms()
    this.setGui()
    this.render()
  }

  private init() {
    const size = Math.min(window.innerWidth, window.innerHeight)
    this.setCanvas(size, size)
    this.setClearColor({ r: 0.1, g: 0.1, b: 0.1, a: 1 })
  }

  private createTriangles(vertexAmount: number, minRadius: number) {
    this.triangles = new Triangles(this.gl, vertexShader, fragmentShader)

    const vertices: { x: number; y: number }[] = []
    const boundingArea = {
      x: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER },
      y: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER },
    }
    for (let i = 0; i < vertexAmount; i++) {
      const angle = Math.PI * 2 * (i / vertexAmount) + Math.PI / 2
      // const r = 0.5
      const r = i % 2 === 0 ? 0.5 : minRadius
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      vertices.push({ x, y })

      if (x < boundingArea.x.min) boundingArea.x.min = x
      if (boundingArea.x.max < x) boundingArea.x.max = x
      if (y < boundingArea.y.min) boundingArea.y.min = y
      if (boundingArea.y.max < y) boundingArea.y.max = y
    }

    const calcUv = (x: number, y: number) => {
      const uvx = (x - boundingArea.x.min) / (boundingArea.x.max - boundingArea.x.min)
      const uvy = (y - boundingArea.y.min) / (boundingArea.y.max - boundingArea.y.min)
      return [uvx, uvy]
    }

    const position: number[] = []
    const uv: number[] = []
    vertices.forEach((vertex, i) => {
      const next = vertices.at((i + 1) % vertices.length)!
      // prettier-ignore
      position.push(
        vertex.x, vertex.y, 0.0,
        next.x, next.y, 0.0,
        0.0, 0.0, 0.0
      )
      // prettier-ignore
      uv.push(
        ...calcUv(vertex.x, vertex.y),
        ...calcUv(next.x, next.y),
        ...calcUv(0.0, 0.0),
      )
    })

    this.triangles.setAttribute('position', new Float32Array(position), 3)
    this.triangles.setAttribute('uv', new Float32Array(uv), 2)
  }

  private setUniforms() {
    this.triangles.setUniform('uTime', '1f', 0)
  }

  private setGui() {
    const obj = { vertexAmount: this.default.vertexAmount, minRadius: this.default.minRadius }
    const change = () => {
      this.createTriangles(obj.vertexAmount, obj.minRadius)
      this.setUniforms()
    }

    const gui = new GUI()
    gui
      .add(obj, 'vertexAmount', 6, 50, 2)
      .name('頂点数')
      .onChange(() => change())
    gui
      .add(obj, 'minRadius', 0.1, 0.5, 0.01)
      .name('スター')
      .onChange(() => change())
  }

  private render = () => {
    requestAnimationFrame(this.render)

    this.setClearColor()
    this.elapsedTime += 0.01
    // this.triangles.addUniformValue('uTime', 0.01)
    this.triangles.updateUniform('uTime', this.elapsedTime)
    this.triangles.draw()
  }
}
