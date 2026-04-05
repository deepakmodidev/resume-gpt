import { AccessToken, AgentDispatchClient } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { requireAuth } from "@/lib/auth-middleware";

export async function POST(req: Request) {
  try {
    // 1. Authenticate (Optional toggled via requireAuth)
    // For now, mirroring the "interview-gpt" style where focus is on functionality.
    // Uncomment the lines below to enforce auth in production.
    /*
    const auth = await requireAuth();
    if (!auth.authorized) return auth.response;
    const userId = auth.userId;
    */
    const userId = "guest-" + Math.random().toString(36).slice(2, 7);

    // 2. Parse request body for resume context
    const { resume } = await req.json();

    if (!resume) {
      return NextResponse.json(
        { error: "Resume context is required" },
        { status: 400 }
      );
    }

    // 3. Room & Participant Config
    const roomName = `voice-interview-${userId}-${Date.now()}`;
    const participantIdentity = `user-${userId}`;

    // 4. Dispatch the Agent (Official 2026 Pattern)
    // We pass the resume context through Job Metadata to decouple it from JWT limits.
    const dispatchClient = new AgentDispatchClient(
      env.LIVEKIT_URL,
      env.LIVEKIT_API_KEY,
      env.LIVEKIT_API_SECRET
    );

    console.log(`--- Dispatching agent for room: ${roomName} ---`);
    await dispatchClient.createDispatch(roomName, "interview-gpt", {
      metadata: JSON.stringify({ resume }),
    });

    // 5. Generate Access Token for the User
    const at = new AccessToken(
      env.LIVEKIT_API_KEY,
      env.LIVEKIT_API_SECRET,
      {
        identity: participantIdentity,
        name: "Candidate",
      }
    );

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    const participantToken = await at.toJwt();

    return NextResponse.json({
      participantToken,
      participantName: "Candidate",
      roomName,
      serverUrl: env.LIVEKIT_URL,
    });

  } catch (error) {
    console.error("❌ Voice Token Error:", error);
    return NextResponse.json(
      { error: "Failed to initialize voice session" },
      { status: 500 }
    );
  }
}
