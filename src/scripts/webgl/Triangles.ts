import { Program } from './Program'

export class Triangles extends Program {
  constructor(gl: WebGLRenderingContext, vertexShader: string, fragmentShader: string) {
    super(gl, vertexShader, fragmentShader)
  }

  draw() {
    if (!this.vertexCount) return
    super.draw()
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount)
  }

  drawRange(vertexCount: number) {
    super.draw()
    this.gl.drawArrays(this.gl.TRIANGLES, 0, vertexCount)
  }
}
