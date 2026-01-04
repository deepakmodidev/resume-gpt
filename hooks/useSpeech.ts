import { useState, useEffect, useCallback, useRef } from "react";

interface UseSpeechProps {
  onSpeechStart?: () => void;
  onSpeechEnd?: (text: string) => void;
  onError?: (error: any) => void;
}

export const useSpeech = ({
  onSpeechStart,
  onSpeechEnd,
  onError,
}: UseSpeechProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [volume, setVolume] = useState(0); // For visualizer

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Stop after one sentence/phrase
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          onSpeechStart?.();
        };

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          onError?.(event.error);
        };
      }

      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Handle final transcript on end
  // We wrap the recognition logic to access current transcript
  const startListening = useCallback(() => {
    setTranscript("");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setupAudioVisualizer();
      } catch (e) {
        console.error("Speech start error:", e);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (synthRef.current) {
      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = (e) => {
        console.error("TTS Error:", e);
        setIsSpeaking(false);
      };

      // Select a nice voice if available
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.name.includes("Google US English") || v.name.includes("Samantha")
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      synthRef.current.speak(utterance);
    }
  }, []);

  const cancelSpeech = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Visualizer Logic
  const setupAudioVisualizer = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!isListening) return;
        analyserRef.current?.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
        setVolume(average);
        requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e) {
      console.error("Audio visualizer setup failed:", e);
    }
  };

  return {
    isListening,
    isSpeaking,
    transcript,
    volume,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
  };
};
