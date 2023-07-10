precision mediump float;

uniform float uTime;
varying vec2 vUv;
varying vec3 vPos;

#define PI 3.141592653589793
#define PI2 PI * 2.

void main() {
  float len = length(vPos.xy);
  float wave = sin(len * 50.0 - uTime * 2.0 * PI2 + PI) * 0.5 + 0.5;
  wave *= sin(len * 5.0 - uTime * 0.5 * PI2) * 0.5 + 0.5;
  vec3 color = vec3(vUv, 1.0);
  color = mix(vec3(0.0), color, smoothstep(0.6, 1.0, wave));

  gl_FragColor = vec4(color, 1.0);
}