"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { STORAGE_KEYS, EXTERNAL_APIS } from "@/lib/constants";
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

  const apiKeyRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);

  // Initialize Cartesia (using REST API directly - simpler than SDK)
  useEffect(() => {
    const initCartesia = async () => {
      try {
        // Get API key from localStorage or env
        const apiKey =
          localStorage.getItem(STORAGE_KEYS.CARTESIA_API_KEY) ||
          process.env.NEXT_PUBLIC_CARTESIA_API_KEY;

        if (!apiKey) {
          logger.warn(
            "⚠️ Cartesia API key not found. Using browser TTS fallback."
          );
          setError("Cartesia API key not configured");
          return;
        }

        apiKeyRef.current = apiKey;

        // Initialize Web Audio API
        audioContextRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();

        setIsInitialized(true);
        logger.debug("✅ Cartesia TTS initialized with API key");
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        logger.error("❌ Cartesia initialization error:", err);
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    };

    initCartesia();

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

  // Speak text using Cartesia REST API
  const speak = useCallback(
    async (text: string, callback?: () => void) => {
      if (!isInitialized || !apiKeyRef.current || !audioContextRef.current) {
        logger.warn("⚠️ Cartesia not initialized, cannot speak");
        setError("Cartesia not initialized");
        callback?.();
        return;
      }

      try {
        logger.debug("🗣️ Cartesia speaking:", text.substring(0, 80) + "...");
        setIsSpeaking(true);
        setError(null);
        onStart?.();

        // Stop any current playback
        if (currentSourceRef.current) {
          currentSourceRef.current.stop();
          currentSourceRef.current = null;
        }
        audioQueueRef.current = [];

        // Generate audio using Cartesia REST API
        const response = await fetch(EXTERNAL_APIS.CARTESIA_TTS, {
          method: "POST",
          headers: {
            "X-API-Key": apiKeyRef.current,
            "Cartesia-Version": "2024-06-10",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model_id: "sonic-english", // Fast, high-quality model
            transcript: text,
            voice: {
              mode: "id",
              id: "a0e99841-438c-4a64-b679-ae501e7d6091", // Professional female voice
              // Other good voices:
              // "248be419-c632-4f23-adf1-5324ed7dbf1d" - Conversational Woman
              // "17ab4eb9-ef77-4a31-85c5-0603e9fce546" - Matt (Conversational Man)
            },
            output_format: {
              container: "raw",
              encoding: "pcm_f32le",
              sample_rate: 44100,
            },
            language: "en",
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Cartesia API error: ${response.status} ${response.statusText}`
          );
        }

        // Convert response to audio buffer
        const arrayBuffer = await response.arrayBuffer();
        const audioData = new Float32Array(arrayBuffer);
        const audioBuffer = audioContextRef.current.createBuffer(
          1, // mono
          audioData.length,
          44100
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
        const errorMessage = err instanceof Error ? err.message : "Failed to generate speech";
        logger.error("❌ Cartesia TTS error:", err);
        setError(errorMessage);
        setIsSpeaking(false);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        callback?.();
      }
    },
    [isInitialized, onStart, onEnd, onError, playNextInQueue]
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
