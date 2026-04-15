"use client";

import { useEffect, useState, useRef } from 'react';
import { useTrackVolume, type TrackReference, type TrackReferenceOrPlaceholder } from '@livekit/components-react';

const DEFAULT_SPEED = 10;
const DEFAULT_AMPLITUDE = 2;
const DEFAULT_FREQUENCY = 0.5;
const DEFAULT_SCALE = 0.2;
const DEFAULT_BRIGHTNESS = 1.2;

function lerp(start: number, end: number, t: number) {
  return start * (1 - t) + end * t;
}

export function useAuraVisualizer(state: string | undefined, audioTrack?: TrackReferenceOrPlaceholder | undefined) {
  // 1. Config targets (State-driven)
  const targetsRef = useRef({
    speed: DEFAULT_SPEED,
    scale: DEFAULT_SCALE,
    amplitude: DEFAULT_AMPLITUDE,
    frequency: DEFAULT_FREQUENCY,
    brightness: DEFAULT_BRIGHTNESS,
  });

  // 2. High-Frequency Value Tracking (Refs prevent unnecessary re-renders)
  const volumeRef = useRef(0);
  const stateRef = useRef(state);

  // 3. Current smooth values (React state for the uniforms)
  const [current, setCurrent] = useState({
    speed: DEFAULT_SPEED,
    scale: DEFAULT_SCALE,
    amplitude: DEFAULT_AMPLITUDE,
    frequency: DEFAULT_FREQUENCY,
    brightness: DEFAULT_BRIGHTNESS,
  });

  const volume = useTrackVolume(audioTrack as TrackReference, {
    fftSize: 512,
    smoothingTimeConstant: 0.75, // Lower constant = more reactive, but can be jumpy
  });

  // Keep refs in sync with incoming data
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Update targets based on state changes (Low Frequency)
  useEffect(() => {
    switch (state) {
      case 'idle':
      case 'failed':
      case 'disconnected':
        targetsRef.current = { speed: 5, scale: 0.18, amplitude: 0.8, frequency: 0.3, brightness: 1.0 };
        break;
      case 'listening':
      case 'pre-connect-buffering':
        targetsRef.current = { speed: 12, scale: 0.22, amplitude: 1.0, frequency: 0.5, brightness: 1.3 };
        break;
      case 'thinking':
      case 'connecting':
      case 'initializing':
        targetsRef.current = { speed: 18, scale: 0.25, amplitude: 0.35, frequency: 0.9, brightness: 1.1 };
        break;
      case 'speaking':
        targetsRef.current = { speed: 28, scale: 0.28, amplitude: 0.65, frequency: 1.1, brightness: 1.5 };
        break;
      default:
        targetsRef.current = { speed: 5, scale: 0.18, amplitude: 0.8, frequency: 0.3, brightness: 1.0 };
        break;
    }
  }, [state]);

  // 4. Decoupled Animation Loop (Static Dependency)
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      // Calculate delta time
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Access latest data via refs
      const vol = volumeRef.current;
      const currentState = stateRef.current;

      setCurrent(prev => {
        // High-speed reactivity for volume (affects scale and brightness)
        const volumeFactor = Math.pow(vol, 1.4); 
        const targetScale = (currentState === 'speaking' || currentState === 'listening')
          ? targetsRef.current.scale + (0.1 * volumeFactor)
          : targetsRef.current.scale;
        
        const targetBrightness = targetsRef.current.brightness + (0.8 * volumeFactor);

        // Ultra-smoothed transitions for organic state changes (slowed to 0.015)
        return {
          speed: lerp(prev.speed, targetsRef.current.speed, 0.015),
          scale: lerp(prev.scale, targetScale, 0.06),
          amplitude: lerp(prev.amplitude, targetsRef.current.amplitude, 0.015),
          frequency: lerp(prev.frequency, targetsRef.current.frequency, 0.015),
          brightness: lerp(prev.brightness, targetBrightness, 0.04),
        };
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []); // Run once on mount, loop reads from refs

  return { ...current };
}

