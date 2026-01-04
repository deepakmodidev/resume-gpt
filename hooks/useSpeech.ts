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
  const [volume, setVolume] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const finalTranscriptRef = useRef<string>("");
  const shouldBeListeningRef = useRef<boolean>(false);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        setError("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Changed to true for better capture
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        console.log("🎤 Speech recognition started");
        setIsListening(true);
        setError(null);
        onSpeechStart?.();
      };

      recognitionRef.current.onresult = (event: any) => {
        console.log("🎤 Speech result received:", event.results.length);
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            console.log("✅ Final transcript:", transcript);
          } else {
            interimTranscript += transcript;
            console.log("⏳ Interim transcript:", transcript);
          }
        }

        const currentTranscript = (finalTranscript + interimTranscript).trim();
        setTranscript(currentTranscript);

        if (finalTranscript) {
          finalTranscriptRef.current = currentTranscript;
        }
      };

      recognitionRef.current.onend = () => {
        console.log("🎤 Speech recognition ended");
        setIsListening(false);
        
        // Check if we should restart (mic button still pressed)
        if (shouldBeListeningRef.current) {
          console.log("🔄 Auto-restarting recognition (silence detected)");
          // Small delay before restart
          setTimeout(() => {
            if (shouldBeListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log("✅ Recognition restarted");
              } catch (e: any) {
                if (!e.message?.includes("already started")) {
                  console.error("Failed to restart:", e);
                }
              }
            }
          }, 300);
        } else {
          // User manually stopped - send transcript
          const finalText = finalTranscriptRef.current || transcript;
          if (finalText && finalText.trim()) {
            console.log("📤 Sending transcript:", finalText);
            onSpeechEnd?.(finalText);
          } else {
            console.log("⚠️ Recognition ended with no transcript");
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("❌ Speech recognition error:", event.error);
        setIsListening(false);

        let errorMessage = "Speech recognition error occurred.";
        if (event.error === "not-allowed") {
          errorMessage = "Microphone permission denied. Please enable microphone access.";
        } else if (event.error === "no-speech") {
          errorMessage = "No speech detected. Click the mic button and try speaking again.";
        } else if (event.error === "aborted") {
          // Normal when user stops manually
          return;
        } else if (event.error === "network") {
          errorMessage = "Network error. Please check your connection.";
        } else if (event.error === "audio-capture") {
          errorMessage = "Microphone not working. Please check your microphone.";
        }

        setError(errorMessage);
        onError?.(event.error);
      };

      synthRef.current = window.speechSynthesis;

      // CRITICAL: Properly load voices before using
      if (synthRef.current) {
        // Force initial load
        const voices = synthRef.current.getVoices();
        console.log("Initial voices loaded:", voices.length);

        // Listen for voices loaded event (required for Chrome)
        if ('onvoiceschanged' in synthRef.current) {
          synthRef.current.onvoiceschanged = () => {
            const loadedVoices = synthRef.current?.getVoices();
            console.log("Voices changed event - loaded:", loadedVoices?.length);
          };
        }
      }
    }

    return () => {
      // Cleanup: Stop all audio streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }

      // Stop recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }

      // Cancel speech
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [onSpeechStart, onSpeechEnd, onError]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }

    setTranscript("");
    finalTranscriptRef.current = "";
    setError(null);
    shouldBeListeningRef.current = true;
    
    if (recognitionRef.current) {
      try {
        await setupAudioVisualizer();
        recognitionRef.current.start();
        console.log("🎤 Started listening (continuous mode)");
      } catch (e: any) {
        console.error("Speech start error:", e);
        if (e.name === "NotAllowedError") {
          setError("Microphone permission denied. Please enable microphone access in your browser settings.");
        } else if (e.name === "NotFoundError") {
          setError("No microphone found. Please connect a microphone and try again.");
        } else if (e.message && e.message.includes("already started")) {
          console.log("⚠️ Recognition already running");
          return; // Already running, that's fine
        } else {
          setError("Failed to start speech recognition. Please try again.");
        }
        shouldBeListeningRef.current = false;
        onError?.(e);
      }
    }
  }, [isSupported, onError]);

  const stopListening = useCallback(() => {
    shouldBeListeningRef.current = false;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      console.log("🛑 Stopped listening");
    }
    
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const getFinalTranscript = useCallback(() => {
    return finalTranscriptRef.current || transcript;
  }, [transcript]);

  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    if (!synthRef.current) {
      console.error("❌ Speech synthesis not available!");
      setError("Speech synthesis not supported in your browser.");
      return;
    }

    try {
      // CRITICAL FIX: Resume speech synthesis (Chrome bug workaround)
      if (synthRef.current.paused) {
        synthRef.current.resume();
      }

      // Cancel any ongoing speech
      synthRef.current.cancel();

      // Wait a bit for cancel to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // CRITICAL: Wait for voices to load
      let voices = synthRef.current.getVoices();
      let attempts = 0;

      while (voices.length === 0 && attempts < 10) {
        console.log(`⏳ Waiting for voices... attempt ${attempts + 1}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        voices = synthRef.current?.getVoices() || [];
        attempts++;
      }

      if (voices.length === 0) {
        console.error("❌ No voices available after waiting!");
        setError("No speech voices available. Please refresh the page.");
        return;
      }

      console.log(`✅ Voices loaded: ${voices.length} available`);
      voices.forEach((v, i) => {
        if (i < 5) console.log(`  - ${v.name} (${v.lang})`);
      });

      const utterance = new SpeechSynthesisUtterance(text);

      // Track if speech actually started
      let hasStarted = false;

      utterance.onstart = () => {
        console.log("🔊 TTS Started successfully");
        hasStarted = true;
        setIsSpeaking(true);
        setError(null);
      };

      utterance.onend = () => {
        console.log("✅ TTS Ended successfully");
        setIsSpeaking(false);
        onEnd?.();
      };

      utterance.onerror = (e: any) => {
        console.error("❌ TTS Error event fired");
        console.error("Error object:", e);
        console.error("Error type:", typeof e.error, e.error);
        console.error("Has started:", hasStarted);

        setIsSpeaking(false);

        // Chrome bug: sometimes fires error with no details but speech works
        // Only show error if speech never started
        if (!hasStarted && e.error && e.error !== 'canceled' && e.error !== 'interrupted') {
          setError(`Speech error: ${e.error || 'unknown'}. Please check your audio settings.`);
        } else if (!hasStarted) {
          console.warn("⚠️ Error fired but no details - might be Chrome bug, continuing...");
        }

        // Call onEnd even on error
        onEnd?.();
      };

      // Find the best voice
      const preferredVoice = voices.find(
        (v) =>
          (v.lang.startsWith('en') && v.name.includes("Google")) ||
          v.name.includes("Samantha") ||
          (v.lang.startsWith('en') && v.name.includes("Microsoft")) ||
          v.lang === "en-US"
      );

      if (preferredVoice) {
        console.log("✅ Using voice:", preferredVoice.name, `(${preferredVoice.lang})`);
        utterance.voice = preferredVoice;
      } else {
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) {
          console.log("✅ Using English voice:", englishVoice.name);
          utterance.voice = englishVoice;
        } else {
          console.log("⚠️ Using default voice:", voices[0].name);
          utterance.voice = voices[0];
        }
      }

      utterance.rate = 1.1; // Slightly faster speech
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      console.log("🗣️ Speaking:", text.substring(0, 80) + "...");

      // CRITICAL FIX: Split long text into chunks (Chrome has issues with long text)
      if (text.length > 200) {
        console.log("📝 Text is long, will speak in chunks");
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        let currentIndex = 0;

        const speakNext = () => {
          if (currentIndex < sentences.length && synthRef.current) {
            const chunk = sentences[currentIndex];
            const chunkUtterance = new SpeechSynthesisUtterance(chunk);
            chunkUtterance.voice = utterance.voice;
            chunkUtterance.rate = utterance.rate;
            chunkUtterance.pitch = utterance.pitch;
            chunkUtterance.volume = utterance.volume;
            chunkUtterance.lang = utterance.lang;

            chunkUtterance.onend = () => {
              currentIndex++;
              if (currentIndex < sentences.length) {
                speakNext();
              } else {
                console.log("✅ All chunks spoken");
                setIsSpeaking(false);
                onEnd?.();
              }
            };

            chunkUtterance.onerror = utterance.onerror;

            if (currentIndex === 0) {
              chunkUtterance.onstart = utterance.onstart;
            }

            synthRef.current.speak(chunkUtterance);
          }
        };

        speakNext();
      } else {
        synthRef.current.speak(utterance);
      }

    } catch (err) {
      console.error("❌ Speak function error:", err);
      setError("Failed to initialize speech. Please try again.");
      onEnd?.();
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
      // Stop previous stream if exists
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current =
        audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!isListening) {
          setVolume(0);
          return;
        }
        analyserRef.current?.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
        setVolume(average);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e: any) {
      console.error("Audio visualizer setup failed:", e);
      throw e; // Re-throw to be caught by startListening
    }
  };

  return {
    isListening,
    isSpeaking,
    transcript,
    volume,
    isSupported,
    error,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
    getFinalTranscript,
  };
};
