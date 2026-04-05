"use client";

import React, { useMemo } from 'react';
import { 
  useVoiceAssistant, 
  RoomAudioRenderer,
  useSessionContext,
  useSessionMessages,
  useAgent,
  BarVisualizer,
  useMediaDeviceSelect,
} from '@livekit/components-react';
import { Mic, LogOut } from 'lucide-react';
import { AuraVisualizer } from './AuraVisualizer';
import { AgentChatTranscript } from './transcript/AgentChatTranscript';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * 🛠️ HELPER: Standard Glass Pill Wrapper (Borderless)
 */
const ControlPill = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn(
    "flex items-center gap-1 p-2 px-3 rounded-full bg-background/40",
    "backdrop-blur-3xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)]",
    "transition-colors hover:bg-background/60",
    className
  )}>
    {children}
  </div>
);

/**
 * 🚦 HELPER: State-Aware Status Pulse
 */
const StatusPulse = ({ state }: { state: string }) => {
  const config = {
    speaking: { color: "bg-emerald-400 shadow-emerald-400/50", label: "Agent Speaking" },
    listening: { color: "bg-blue-400 shadow-blue-400/50", label: "Listening" },
    thinking: { color: "bg-amber-400 shadow-amber-400/50", label: "Processing..." },
    default: { color: "bg-muted-foreground/30 shadow-transparent", label: "Ready" }
  };
  const { color, label } = config[state as keyof typeof config] || config.default;

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/20 backdrop-blur-md">
      <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px] transition-colors duration-500 animate-pulse", color)} />
      <span className="text-[11px] font-semibold text-muted-foreground/80 tracking-wide">{label}</span>
    </div>
  );
};

export function SessionView() {
  const { state, audioTrack } = useVoiceAssistant();
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const { state: agentState } = useAgent();
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({ kind: 'audioinput' });

  const activeLabel = useMemo(() => 
    devices.find(d => d.deviceId === activeDeviceId)?.label || "Select Microphone",
  [devices, activeDeviceId]);

  return (
    <div className="flex flex-col h-[75vh] w-full max-w-6xl mx-auto gap-8 px-4 lg:px-0">
      <RoomAudioRenderer />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        {/* Left: Interactive Aura Visualization (Borderless) */}
        <div className="relative flex items-center justify-center bg-secondary/5 rounded-[32px] overflow-hidden p-12 backdrop-blur-sm shadow-[inset_0_0_80px_rgba(31,213,249,0.03)] group transition-colors duration-700 hover:bg-secondary/10">
          <div className="relative w-full aspect-square flex items-center justify-center max-w-sm">
            <AuraVisualizer state={state} audioTrack={audioTrack} className="w-full h-full scale-110" />
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <span className="text-[10px] font-bold tracking-[.25em] text-muted-foreground/30 uppercase">System Status</span>
              <StatusPulse state={state} />
            </div>
          </div>
        </div>

        {/* Right: Message Transcript (Borderless) */}
        <div className="flex flex-col min-h-0">
          <AgentChatTranscript 
            messages={messages} 
            agentState={agentState} 
            className="flex-1 min-h-0 rounded-[32px] bg-secondary/5 overflow-hidden shadow-xl" 
          />
        </div>
      </div>

      {/* 🚀 DECOUPLED PREMIUM CONTROLS */}
      <div className="flex justify-center items-center gap-4 shrink-0 py-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Pill A: Media Management */}
        <ControlPill>
          <Select value={activeDeviceId} onValueChange={setActiveMediaDevice}>
            <SelectTrigger className="w-fit h-10 bg-secondary/10 border-none focus:ring-0 text-sm font-semibold hover:bg-secondary/20 rounded-full transition-colors flex gap-3 px-4 shadow-none">
              <Mic className="w-4 h-4 text-primary/80 shrink-0" />
              <div className="text-left whitespace-nowrap">
                <SelectValue placeholder={activeLabel} />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/50 backdrop-blur-3xl bg-background/80">
              {devices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId} className="rounded-xl cursor-pointer hover:bg-primary/10">
                  {device.label || `Mic ${device.deviceId.slice(0, 5)}...`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-8 w-[80px] flex items-center justify-center px-1 mr-1">
             <BarVisualizer trackRef={audioTrack} barCount={12} className="h-full w-full opacity-60" />
          </div>
        </ControlPill>

        {/* Pill B: Disconnect Session */}
        <ControlPill>
          <Button 
            variant="destructive" size="sm" onClick={() => session.end()}
            className="h-10 px-7 rounded-full font-bold shadow-lg shadow-destructive/20 hover:scale-[1.03] active:scale-[0.98] transition-transform flex gap-2.5 bg-destructive/90 hover:bg-destructive"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </Button>
        </ControlPill>
      </div>
    </div>
  );
}





