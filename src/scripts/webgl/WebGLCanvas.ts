import { Triangles } from './Triangles'
import { WebGL } from './WebGL'
import vertexShader from './shader/vertexShader.glsl'
import fragmentShader from './shader/fragmentShader.glsl'
import GUI from 'lil-gui'

export class WebGLCanvas extends WebGL {
  private readonly MAX_VERTEX_AMOUNT = 50

  private triangles?: Triangles
  private vertices: { x: number; y: number }[] = []
  private params = { vertexAmount: 10, minRadius: 0.25 }

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)
    this.init()
    this.createTriangles()
    this.setUniforms()
    this.setGui()
    this.render()
  }

  private init() {
    const size = Math.min(window.innerWidth, window.innerHeight)
    this.setCanvas(size, size)
    this.setClearColor({ r: 0.1, g: 0.1, b: 0.1, a: 1 })

    // 動的に頂点数を変更したいので、予め扱う最大の頂点数を保有させておく
    this.vertices = [...Array(this.MAX_VERTEX_AMOUNT)].map(() => ({ x: 0, y: 0 }))
  }

  private createTriangles() {
    this.triangles = new Triangles(this.gl, vertexShader, fragmentShader)
    const { position, uv } = this.createAttributes()

    this.triangles.setAttribute('position', position, 3, 'DYNAMIC_DRAW')
    this.triangles.setAttribute('uv', uv, 2, 'DYNAMIC_DRAW')
  }

  private createAttributes() {
    const { vertexAmount, minRadius } = this.params

    const boundingArea = {
      x: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER },
      y: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER },
    }

    for (let i = 0; i < vertexAmount; i++) {
      // 頂点の位置を求める
      const angle = Math.PI * 2 * (i / vertexAmount) + Math.PI / 2
      const r = i % 2 === 0 ? 0.5 : minRadius
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      this.vertices[i] = { x, y }
      // 包絡矩形を求める
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
    this.vertices.forEach((vertex, i) => {
      const next = this.vertices.at((i + 1) % vertexAmount)!
      // prettier-ignore
      position.push(
        vertex.x, vertex.y, 0.0,
          next.x,   next.y, 0.0,
             0.0,      0.0, 0.0
      )
      // prettier-ignore
      uv.push(
        ...calcUv(vertex.x, vertex.y),
        ...calcUv(next.x, next.y),
        ...calcUv(0.0, 0.0),
      )
    })

    return { position: new Float32Array(position), uv: new Float32Array(uv) }
  }

  private updateAttributes() {
    const { position, uv } = this.createAttributes()
    this.triangles?.updateAttribute('position', position)
    this.triangles?.updateAttribute('uv', uv)
  }

  private setUniforms() {
    this.triangles?.setUniform('uTime', '1f', 0)
  }

  private setGui() {
    const gui = new GUI()
    gui
      .add(this.params, 'vertexAmount', 6, this.MAX_VERTEX_AMOUNT, 2)
      .name('頂点数')
      .onChange(() => this.updateAttributes())
    gui
      .add(this.params, 'minRadius', 0.1, 0.5, 0.01)
      .name('スター')
      .onChange(() => this.updateAttributes())
  }

  private render = () => {
    requestAnimationFrame(this.render)

    this.setClearColor()

    this.triangles?.addUniformValue('uTime', 0.01)
    // 描画する頂点数を指定する
    // ひとつの三角形は3つの頂点からなるので x3 する
    this.triangles?.drawRange(this.params.vertexAmount * 3)
  }
}
