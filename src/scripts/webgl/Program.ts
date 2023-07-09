abstract class Program {
  private program: WebGLProgram
  private uniforms: { [name in string]: { location: WebGLUniformLocation | null; setter?: (value: any) => void } } = {}
  protected vertexCount?: number

  constructor(protected gl: WebGLRenderingContext, vertexShader: string, fragmentShader: string) {
    const vs = this.createShaderObject(vertexShader, 'vertex')
    const fs = this.createShaderObject(fragmentShader, 'fragment')
    this.program = this.createProgramObject(vs, fs)
  }

  /**
   * シェーダオブジェクトを生成する
   */
  private createShaderObject(shaderSource: string, type: 'vertex' | 'fragment') {
    const gl = this.gl
    const _type = type === 'vertex' ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER
    const shader = gl.createShader(_type)
    if (!shader) throw new Error('cannot created shader')

    gl.shaderSource(shader, shaderSource)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'error')

    return shader
  }

  /**
   * プログラムオブジェクトを生成する
   */
  private createProgramObject(vs: WebGLShader, fs: WebGLShader) {
    const gl = this.gl
    const program = gl.createProgram()
    if (!program) throw new Error('cannot created program')

    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'error')

    gl.useProgram(program)
    return program
  }

  /**
   * attributeを設定する
   * @param name 一意な名前
   * @param datas BufferArray
   * @param count 1組になるデータの数
   * @param usage データの扱い方
   */
  setAttribute(name: string, datas: BufferSource, count: number, usage: 'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW' = 'STATIC_DRAW') {
    if (!this.vertexCount) {
      this.vertexCount = (datas as any).length / count
    }

    const gl = this.gl
    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, datas, gl[usage])

    const location = gl.getAttribLocation(this.program, name)
    gl.enableVertexAttribArray(location)
    gl.vertexAttribPointer(location, count, gl.FLOAT, false, 0, 0)
  }

  /**
   * uniformを設定する
   * @param name 一意な名前
   * @param type データ型
   * @param defaultValue 初期値
   */
  setUniform(name: string, type: '1f' | '1fv', defaultValue?: any) {
    const gl = this.gl
    const location = gl.getUniformLocation(this.program, name)
    let setter: ((value: any) => void) | undefined
    if (type === '1f') setter = (value: any) => gl.uniform1f(location, value)
    else if (type === '1fv') setter = (value: any) => gl.uniform1fv(location, value)
    this.uniforms[name] = { location, setter }

    defaultValue && this.updateUniform(name, defaultValue)
  }

  /**
   * uniformの値を取得する
   */
  getUniformValue(name: string): any | null {
    if (!this.uniforms[name]?.location) return null
    return this.gl.getUniform(this.program, this.uniforms[name].location!)
  }

  /**
   * uniformを更新する
   */
  updateUniform(name: string, value: any) {
    if (this.uniforms[name]?.location) {
      this.uniforms[name].setter?.(value)
    }
  }

  /**
   * 数値uniformに加算する
   */
  addUniformValue(name: string, value: number) {
    const origin = this.getUniformValue(name)
    if (typeof origin === 'number') {
      this.updateUniform(name, origin + value)
    }
  }

  draw() {
    this.gl.useProgram(this.program)
  }
}

// --------------------
export class Triangles extends Program {
  constructor(gl: WebGLRenderingContext, vertexShader: string, fragmentShader: string) {
    super(gl, vertexShader, fragmentShader)
  }

  draw() {
    if (!this.vertexCount) return

    super.draw()
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount)
  }
}