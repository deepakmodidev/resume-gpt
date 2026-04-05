"use client";

import React, { useMemo } from 'react';
import { ShaderToy } from './ShaderToy';
import { useAuraVisualizer } from '@/hooks/useAuraVisualizer';

const DEFAULT_COLOR = '#1FD5F9';

function hexToRgb(hexColor: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ] : [0, 0.7, 1];
}

const auraShader = `
uniform float uSpeed;
uniform float uScale;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uMix;
uniform vec3 uColor;
uniform float uShape;
uniform float uBlur;
uniform float uBloom;
uniform float uSpacing;
uniform float uColorShift;
uniform float uVariance;
uniform float uSmoothing;
uniform float uMode;

const float TAU = 6.283185;

// Noise for dithering
vec2 randFibo(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.xx + p.yx) * p.xy);
}

// Tonemap
vec3 Tonemap(vec3 x) {
  x *= 4.0;
  return x / (1.0 + x);
}

// Luma for alpha
float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

// RGB to HSV
vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// HSV to RGB
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// SDF shapes
float sdCircle(vec2 st, float r) {
  return length(st) - r;
}

float sdLine(vec2 p, float r) {
  float halfLen = r * 2.0;
  vec2 a = vec2(-halfLen, 0.0);
  vec2 b = vec2(halfLen, 0.0);
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float getSdf(vec2 st) {
  if(uShape == 1.0) return sdCircle(st, uScale);
  else if(uShape == 2.0) return sdLine(st, uScale);
  return sdCircle(st, uScale); // Default
}

vec2 turb(vec2 pos, float t, float it) {
  mat2 rotation = mat2(0.6, -0.25, 0.25, 0.9);
  mat2 layerRotation = mat2(0.6, -0.8, 0.8, 0.6);
  float frequency = mix(2.0, 15.0, uFrequency);
  float amplitude = uAmplitude;
  float frequencyGrowth = 1.4;
  float animTime = t * 0.1 * uSpeed;
  const int LAYERS = 4;
  for(int i = 0; i < LAYERS; i++) {
    vec2 rotatedPos = pos * rotation;
    vec2 wave = sin(frequency * rotatedPos + float(i) * animTime + it);
    pos += (amplitude / frequency) * rotation[0] * wave;
    rotation *= layerRotation;
    amplitude *= mix(1.0, max(wave.x, wave.y), uVariance);
    frequency *= frequencyGrowth;
  }
  return pos;
}

const float ITERATIONS = 36.0;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  vec3 pp = vec3(0.0);
  vec3 bloomSource = vec3(0.0);
  float t = iTime * 0.5;
  vec2 pos = uv - 0.5;
  vec2 prevPos = turb(pos, t, 0.0 - 1.0 / ITERATIONS);
  float spacing = mix(1.0, TAU, uSpacing);

  for(float i = 1.0; i < ITERATIONS + 1.0; i++) {
    float iter = i / ITERATIONS;
    vec2 st = turb(pos, t, iter * spacing);
    float d = abs(getSdf(st));
    float pd = distance(st, prevPos);
    prevPos = st;
    float dynamicBlur = exp2(pd * 2.0 * 1.44) - 1.0;
    float ds = smoothstep(0.0, uBlur * 0.05 + max(dynamicBlur * uSmoothing, 0.001), d);
    
    vec3 color = uColor;
    if(uColorShift > 0.01) {
      vec3 hsv = rgb2hsv(color);
      hsv.x = fract(hsv.x + (1.0 - iter) * uColorShift * 0.3); 
      color = hsv2rgb(hsv);
    }
    
    float invd = 1.0 / max(d + dynamicBlur, 0.001);
    pp += (ds - 1.0) * color;
    bloomSource += clamp(invd, 0.0, 250.0) * color;
  }

  pp *= 1.0 / ITERATIONS;
  vec3 bloom = bloomSource / (bloomSource + 2e4);
  vec3 color = (-pp + bloom * 3.0 * uBloom) * 1.2;
  color += (randFibo(fragCoord).x - 0.5) / 255.0; // Dither
  color = Tonemap(color);
  
  float alpha = luma(color) * uMix;
  fragColor = vec4(color * uMix, clamp(alpha, 0.1, 0.9));
}`;

export function AuraVisualizer({ state, audioTrack, className }: { state?: string, audioTrack?: any, className?: string }) {
  const { speed, scale, amplitude, frequency, brightness } = useAuraVisualizer(state, audioTrack);
  const rgbColor = useMemo(() => hexToRgb(DEFAULT_COLOR), []);

  const uniforms = useMemo(() => ({
    uSpeed: { type: '1f', value: speed },
    uScale: { type: '1f', value: scale },
    uAmplitude: { type: '1f', value: amplitude },
    uFrequency: { type: '1f', value: frequency },
    uMix: { type: '1f', value: brightness },
    uColor: { type: '3fv', value: rgbColor },
    // 1:1 Parameter Additions
    uShape: { type: '1f', value: 1.0 }, // Circle
    uBlur: { type: '1f', value: 0.2 },
    uBloom: { type: '1f', value: 0.05 },
    uSpacing: { type: '1f', value: 0.5 },
    uColorShift: { type: '1f', value: 0.05 },
    uVariance: { type: '1f', value: 0.1 },
    uSmoothing: { type: '1f', value: 1.0 },
    uMode: { type: '1f', value: 0.0 }, // Dark mode
  }), [speed, scale, amplitude, frequency, brightness, rgbColor]);

  return (
    <div className={className}>
      <ShaderToy 
        fs={auraShader} 
        uniforms={uniforms}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
