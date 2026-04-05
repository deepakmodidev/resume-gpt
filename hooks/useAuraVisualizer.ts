"use client";

import { useEffect, useState, useRef } from 'react';
import { useTrackVolume, type TrackReference } from '@livekit/components-react';

const DEFAULT_SPEED = 10;
const DEFAULT_AMPLITUDE = 2;
const DEFAULT_FREQUENCY = 0.5;
const DEFAULT_SCALE = 0.2;
const DEFAULT_BRIGHTNESS = 1.5;

function lerp(start: number, end: number, t: number) {
  return start * (1 - t) + end * t;
}

export function useAuraVisualizer(state: string | undefined, audioTrack?: any) {
  // Config targets
  const targetsRef = useRef({
    speed: DEFAULT_SPEED,
    scale: DEFAULT_SCALE,
    amplitude: DEFAULT_AMPLITUDE,
    frequency: DEFAULT_FREQUENCY,
    brightness: DEFAULT_BRIGHTNESS,
  });

  // Current smooth values (React state for the uniforms)
  const [current, setCurrent] = useState({
    speed: DEFAULT_SPEED,
    scale: DEFAULT_SCALE,
    amplitude: DEFAULT_AMPLITUDE,
    frequency: DEFAULT_FREQUENCY,
    brightness: DEFAULT_BRIGHTNESS,
  });

  const volume = useTrackVolume(audioTrack as TrackReference, {
    fftSize: 512,
    smoothingTimeConstant: 0.8, // Slightly smoother for Aura
  });

  // 1. Update targets based on state changes (Low Frequency)
  useEffect(() => {
    switch (state) {
      case 'idle':
      case 'failed':
      case 'disconnected':
        targetsRef.current = { speed: 10, scale: 0.2, amplitude: 1.2, frequency: 0.4, brightness: 1.0 };
        break;
      case 'listening':
      case 'pre-connect-buffering':
        targetsRef.current = { speed: 20, scale: 0.3, amplitude: 1.2, frequency: 0.7, brightness: 1.5 };
        break;
      case 'thinking':
      case 'connecting':
      case 'initializing':
        targetsRef.current = { speed: 30, scale: 0.3, amplitude: 0.5, frequency: 1.0, brightness: 1.2 };
        break;
      case 'speaking':
        targetsRef.current = { speed: 70, scale: 0.3, amplitude: 0.75, frequency: 1.25, brightness: 1.5 };
        break;
      default:
        targetsRef.current = { speed: 10, scale: 0.2, amplitude: 1.2, frequency: 0.4, brightness: 1.0 };
        break;
    }
  }, [state]);

  // 2. High-Frequency Animation Loop (Once per frame)
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      setCurrent(prev => {
        // High-speed reactivity for volume (affects scale and brightness)
        const volumeFactor = Math.pow(volume, 1.5); // Accentuates peaks
        const targetScale = state === 'speaking' || state === 'listening' 
          ? targetsRef.current.scale + (0.15 * volumeFactor)
          : targetsRef.current.scale;
        
        const targetBrightness = targetsRef.current.brightness + (1.2 * volumeFactor);

        return {
          speed: lerp(prev.speed, targetsRef.current.speed, 0.08),
          scale: lerp(prev.scale, targetScale, 0.15),
          amplitude: lerp(prev.amplitude, targetsRef.current.amplitude, 0.08),
          frequency: lerp(prev.frequency, targetsRef.current.frequency, 0.08),
          brightness: lerp(prev.brightness, targetBrightness, 0.1),
        };
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [state, volume]); // Loop re-syncs on state/volume but only ONE exists at a time

  return { ...current };
}

