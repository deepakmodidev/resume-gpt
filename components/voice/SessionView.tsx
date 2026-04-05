import { 
  RoomAudioRenderer,
  useAgent,
  useLocalParticipant,
  useMediaDeviceSelect,
  useMultibandTrackVolume,
  useSessionContext,
  useSessionMessages,
  useVoiceAssistant,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  Mic, 
  LogOut, 
  Ear, 
  Brain, 
  Volume2, 
  Zap,
} from "lucide-react";
import { AuraVisualizer } from './AuraVisualizer';
import { AgentChatTranscript } from './transcript/AgentChatTranscript';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * 📊 CANDIDATE VISUALIZER (Replicated from Interview GPT)
 */
const CandidateVisualizer = ({ trackRef }: { trackRef: TrackReferenceOrPlaceholder | undefined }) => {
  const bands = useMultibandTrackVolume(trackRef, { 
    bands: 3, 
    loPass: 5,   
    hiPass: 80, // Concentrated range for better balance
    analyserOptions: { smoothingTimeConstant: 0.15 }
  });
  
  return (
    <div className="flex items-center gap-[2px] h-4">
      {bands.map((band, i) => {
        // Reduced multipliers to restore "bounce" and reactivity
        const multiplier = i === 0 ? 80 : i === 1 ? 120 : 200;
        return (
          <div 
            key={i} 
            className="w-[3px] bg-primary rounded-full transition-all duration-75 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            style={{ height: `${Math.max(30, Math.min(100, band * multiplier))}%` }}
          />
        );
      })}
    </div>
  );
};

/**
 * 🚦 STATUS PULSE
 */
const StatusPulse = ({ state }: { state: string }) => {
  const config = {
    speaking: { icon: Volume2, label: "Agent Speaking" },
    listening: { icon: Ear, label: "Listening" },
    thinking: { icon: Brain, label: "Thinking..." },
    default: { icon: Zap, label: "Ready" }
  };
  const { icon: Icon, label } = config[state as keyof typeof config] || config.default;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/80 backdrop-blur-md border border-border/50 transition-all duration-500">
      <Icon className={cn("w-3.5 h-3.5 text-foreground")} />
      <span className="text-[10px] font-medium text-foreground tracking-wider uppercase">{label}</span>
    </div>
  );
};

export function SessionView() {
  const { state, audioTrack: agentAudioTrack } = useVoiceAssistant();
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const { state: agentState } = useAgent();
  const { microphoneTrack, localParticipant } = useLocalParticipant();
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({ kind: 'audioinput' });

  const activeMicLabel = devices.find(d => d.deviceId === activeDeviceId)?.label || "Microphone";

  return (
    <div className="flex flex-col h-[75vh] w-full max-w-6xl mx-auto gap-8 px-4 lg:px-0">
      <RoomAudioRenderer />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        {/* Left: AI Interviewer */}
        <div className="relative flex items-center justify-center bg-muted/40 rounded-[32px] overflow-hidden p-12 backdrop-blur-sm border border-black/5 dark:border-white/5">
          <div className="relative w-full aspect-square flex items-center justify-center max-w-[300px]">
            <AuraVisualizer state={state} audioTrack={agentAudioTrack} className="w-full h-full" />
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <StatusPulse state={state} />
          </div>
        </div>

        {/* Right: Transcript */}
        <div className="flex flex-col min-h-0">
          <AgentChatTranscript 
            messages={messages} 
            agentState={agentState} 
            className="flex-1 min-h-0 rounded-[32px] bg-muted/40 border border-black/5 dark:border-white/5 overflow-hidden" 
          />
        </div>
      </div>

      {/* 🚀 COMPACT CONTROL BAR */}
      <div className="flex justify-center items-center py-6">
        <div className="flex items-center p-1.5 rounded-full bg-background/80 backdrop-blur-3xl border border-border shadow-lg">
          
          {/* User Mic & Visualizer */}
          <div className="flex items-center gap-3 pl-4 pr-1 h-8">
            <div className="flex items-center gap-3 text-primary/80">
              <Mic className="w-4 h-4" />
              <CandidateVisualizer 
                trackRef={microphoneTrack ? { 
                  publication: microphoneTrack,
                  participant: localParticipant,
                  source: Track.Source.Microphone
                } : undefined} 
              />
            </div>
            
            <Select value={activeDeviceId} onValueChange={setActiveMediaDevice}>
              <SelectTrigger className="flex items-center gap-1.5 h-full bg-transparent border-none focus:ring-0 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors px-2 shadow-none max-w-[160px]">
                <span className="truncate max-w-[110px]">{activeMicLabel}</span>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border backdrop-blur-3xl bg-background/90 shadow-2xl">
                {devices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId} className="rounded-xl text-xs">
                    {device.label || `Device ${device.deviceId.slice(0, 4)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-px h-4 bg-border mx-2" />

          {/* End Interview */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => session.end()}
            className="h-8 px-5 rounded-full text-xs font-medium text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all flex gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            END SESSION
          </Button>
        </div>
      </div>
    </div>
  );
}
