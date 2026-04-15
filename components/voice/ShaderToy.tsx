"use client";

import React, { type ComponentPropsWithoutRef, useEffect, useRef } from 'react';

const PRECISIONS = ['lowp', 'mediump', 'highp'];
const FS_MAIN_SHADER = `\nvoid main(void){
    vec4 color = vec4(0.0,0.0,0.0,1.0);
    mainImage( color, gl_FragCoord.xy );
    gl_FragColor = color;
}`;
const BASIC_VS = `attribute vec3 aVertexPosition;
void main(void) {
    gl_Position = vec4(aVertexPosition, 1.0);
}`;

const UNIFORM_TIME = 'iTime';
const UNIFORM_RESOLUTION = 'iResolution';

export interface ShaderToyProps {
  fs: string;
  vs?: string;
  uniforms?: Record<string, { type: string; value: any }>;
  clearColor?: [number, number, number, number];
  precision?: 'highp' | 'lowp' | 'mediump';
  style?: React.CSSProperties;
  devicePixelRatio?: number;
}

export function ShaderToy({
  fs,
  vs = BASIC_VS,
  uniforms: propUniforms,
  clearColor = [0, 0, 0, 0],
  precision = 'highp',
  style,
  devicePixelRatio = 1,
  ...canvasProps
}: ShaderToyProps & ComponentPropsWithoutRef<'canvas'>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const shaderProgramRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef(propUniforms);

  // Sync propUniforms to ref WITHOUT triggering effect re-run
  useEffect(() => {
    uniformsRef.current = propUniforms;
  }, [propUniforms]);

  // PHASE 1: INITIALIZATION (Only when FS/VS changes)
  useEffect(() => {
    if (!canvasRef.current) return;
    const gl = canvasRef.current.getContext('webgl', { alpha: true });
    if (!gl) return;
    glRef.current = gl;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      }
      return shader;
    };

    const fullFs = `
precision ${precision} float;
uniform float iTime;
uniform vec2 iResolution;
${fs}
${fs.includes('mainImage') ? FS_MAIN_SHADER : ''}`;
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fullFs);
    const vertexShader = createShader(gl.VERTEX_SHADER, vs);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('WebGL Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);
    shaderProgramRef.current = program;

    // Buffer Setup
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, 'aVertexPosition');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);

  }, [fs, vs, precision]);

  // PHASE 2: RENDERING LOOP (Continuous)
  useEffect(() => {
    let frameId: number;
    const render = (time: number) => {
      const gl = glRef.current;
      const program = shaderProgramRef.current;
      const canvas = canvasRef.current;
      if (!gl || !program || !canvas) return;

      // Handle Resize
      const displayWidth = canvas.clientWidth * devicePixelRatio;
      const displayHeight = canvas.clientHeight * devicePixelRatio;
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      gl.clearColor(...clearColor);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      // System Uniforms
      gl.uniform1f(gl.getUniformLocation(program, UNIFORM_TIME), time * 0.001);
      gl.uniform2f(gl.getUniformLocation(program, UNIFORM_RESOLUTION), canvas.width, canvas.height);

      // Custom Uniforms from Ref
      if (uniformsRef.current) {
        Object.entries(uniformsRef.current).forEach(([name, { type, value }]) => {
          const loc = gl.getUniformLocation(program, name);
          if (!loc) return;
          if (type === '1f') gl.uniform1f(loc, value);
          if (type === '3fv') gl.uniform3fv(loc, value);
        });
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [clearColor, devicePixelRatio]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', ...style }} {...canvasProps} />;
}

