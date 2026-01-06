import { motion } from "framer-motion";

interface AudioVisualizerProps {
  mode: "idle" | "listening" | "speaking" | "processing";
  volume: number; // 0 to 255
}

export const AudioVisualizer = ({ mode, volume }: AudioVisualizerProps) => {
  // Normalize volume for scaling (0 to 1 -> 1 to 2ish)
  const scale = 1 + (volume / 255) * 1.5;

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: mode === "listening" ? scale : [1, 1.1, 1],
          opacity: mode === "idle" ? 0.3 : 0.6,
        }}
        transition={{
          duration: mode === "idle" ? 2 : 0.1,
          repeat: mode === "idle" ? Infinity : 0,
          ease: "easeInOut",
        }}
        className={`absolute inset-0 rounded-full blur-3xl 
          ${mode === "idle" && "bg-gray-500"}
          ${mode === "listening" && "bg-green-500"}
          ${mode === "speaking" && "bg-blue-500"}
          ${mode === "processing" && "bg-cyan-500"}
        `}
      />

      {/* Core Circle */}
      <motion.div
        animate={{
          scale:
            mode === "listening"
              ? scale
              : mode === "speaking"
                ? [1, 1.2, 1]
                : 1,
          rotate: mode === "processing" ? 360 : 0,
        }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.2 },
        }}
        className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-lg border-4 
          ${mode === "idle" && "border-gray-400 bg-gray-900"}
          ${mode === "listening" && "border-green-400 bg-green-900"}
          ${mode === "speaking" && "border-blue-400 bg-blue-900"}
          ${mode === "processing" && "border-cyan-400 bg-cyan-900 border-t-transparent"}
        `}
      >
        {/* Inner Icon/Effect */}
        {mode === "processing" && (
          <div className="w-16 h-16 border-4 border-cyan-200 border-t-transparent rounded-full animate-spin" />
        )}
      </motion.div>

      {/* Ripple Effect for User Voice */}
      {mode === "listening" && (
        <motion.div
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 rounded-full border border-green-500/50"
        />
      )}
    </div>
  );
};
