"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { STORAGE_KEYS, API_ENDPOINTS } from "@/lib/constants";
import { logger } from "@/lib/logger";

interface UseCartesiaTTSProps {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export const useCartesiaTTS = ({
  onStart,
  onEnd,
  onError,
}: UseCartesiaTTSProps = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const userApiKeyRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);

  // Initialize Audio Context (no API key needed - it's on the server now!)
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Get user's API key from localStorage (optional - for BYOK)
        userApiKeyRef.current = localStorage.getItem(
          STORAGE_KEYS.CARTESIA_API_KEY,
        );

        // Initialize Web Audio API
        audioContextRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();

        setIsInitialized(true);
        logger.debug("✅ TTS Audio initialized");
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        logger.error("❌ Audio initialization error:", err);
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [onError]);

  // Play audio from queue
  const playNextInQueue = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      onEnd?.();
      return;
    }

    if (!audioContextRef.current) return;

    const audioBuffer = audioQueueRef.current.shift()!;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);

    source.onended = () => {
      playNextInQueue();
    };

    currentSourceRef.current = source;
    source.start(0);
  }, [onEnd]);

  // Speak text using SERVER PROXY (API key hidden on server!)
  const speak = useCallback(
    async (text: string, callback?: () => void) => {
      if (!isInitialized || !audioContextRef.current) {
        logger.warn("⚠️ Audio not initialized, cannot speak");
        setError("Audio not initialized");
        callback?.();
        return;
      }

      try {
        logger.debug(
          "🗣️ Speaking via server proxy:",
          text.substring(0, 80) + "...",
        );
        setIsSpeaking(true);
        setError(null);
        onStart?.();

        // Stop any current playback
        if (currentSourceRef.current) {
          currentSourceRef.current.stop();
          currentSourceRef.current = null;
        }
        audioQueueRef.current = [];

        // Call OUR server proxy instead of Cartesia directly
        // API key is hidden on the server!
        const response = await fetch(API_ENDPOINTS.TTS, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            userApiKey: userApiKeyRef.current, // Optional: user's own key
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `TTS error: ${response.status}`);
        }

        // Convert response to audio buffer
        const arrayBuffer = await response.arrayBuffer();
        const audioData = new Float32Array(arrayBuffer);
        const audioBuffer = audioContextRef.current.createBuffer(
          1, // mono
          audioData.length,
          44100,
        );
        audioBuffer.getChannelData(0).set(audioData);

        // Add to queue and play
        audioQueueRef.current.push(audioBuffer);

        if (!isPlayingRef.current) {
          isPlayingRef.current = true;
          playNextInQueue();
        }

        // Call callback when done
        if (callback) {
          const duration = audioBuffer.duration * 1000;
          setTimeout(callback, duration);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate speech";
        logger.error("❌ TTS error:", err);
        setError(errorMessage);
        setIsSpeaking(false);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        callback?.();
      }
    },
    [isInitialized, onStart, onEnd, onError, playNextInQueue],
  );

  // Stop speaking
  const stop = useCallback(() => {
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    error,
    isInitialized,
  };
};
