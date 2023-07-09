precision mediump float;

uniform float uTime;
varying vec2 vUv;
varying vec3 vPos;

void main() {
  float len = length(vPos.xy);
  float wave = sin(len * 50.0 - uTime * 2.0);
  wave *= sin(len * 7.0 - uTime * 2.0) * 0.5 + 0.5;
  vec3 color = vec3(vUv, 1.0);
  color = mix(vec3(0.0), color, smoothstep(0.0, 1.0, wave));

  gl_FragColor = vec4(color, 1.0);
}