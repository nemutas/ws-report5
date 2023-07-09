type Color = { r: number; g: number; b: number; a: number }

export abstract class WebGL {
  protected gl: WebGLRenderingContext
  private clearColor: Color = { r: 1, g: 1, b: 1, a: 1 }

  constructor(protected canvas: HTMLCanvasElement) {
    this.gl = this.createContext()
  }

  private createContext() {
    const gl = this.canvas.getContext('webgl')
    if (gl) {
      return gl
    } else {
      throw new Error('webgl not supported')
    }
  }

  protected setCanvas(width: number, height: number) {
    this.canvas.width = width
    this.canvas.height = height
    this.setViewport(0, 0, width, height)
  }

  protected setViewport(x: number, y: number, w: number, h: number) {
    this.gl.viewport(x, y, w, h)
  }

  protected setClearColor(color?: Color) {
    if (color) {
      this.clearColor = { ...color }
    }
    this.gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }
}
