precision mediump float;

attribute vec3 position;
attribute vec2 uv;
uniform float uTime;
varying vec2 vUv;
varying vec3 vPos;

#include '../glsl/rotate.glsl'

void main() {
  vUv = uv;
  vec3 pos = position;
  pos.xy = rotate(pos.xy, uTime * 0.3);
  vPos = pos;

  gl_Position = vec4(pos, 1.0);
}