import {
  AccessToken,
  RoomAgentDispatch,
  RoomConfiguration,
} from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText?.trim()) {
      return NextResponse.json(
        { error: "Resume text is required to start an interview" },
        { status: 400 },
      );
    }

    const roomName = `interview-${Date.now()}`;

    // This JSON string flows to ctx.job.metadata in the Python agent
    const agentMetadata = JSON.stringify({
      resumeText: resumeText.substring(0, 4000),
      jobDescription: jobDescription?.substring(0, 2000) || "",
    });

    const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
      identity: `user-${Date.now()}`,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    // RoomAgentDispatch.metadata → ctx.job.metadata in Python agent
    // Using proper typed imports — no `as any` cast needed
    at.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName: "interview-agent",
          metadata: agentMetadata,
        }),
      ],
    });

    const token = await at.toJwt();

    return NextResponse.json({
      token,
      url: env.NEXT_PUBLIC_LIVEKIT_URL,
    });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json(
      { error: "Failed to generate interview room" },
      { status: 500 },
    );
  }
}
