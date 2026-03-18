import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the user (DISABLED FOR TESTING)
    const auth = { authorized: true, userId: "guest" }; // Mock auth
    // const auth = await requireAuth();
    // if (!auth.authorized) return auth.response;

    // 2. Parse request body for resume context
    const body = await req.json();
    const { resumeText, jobDescription } = body;

    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text is required to start an interview" },
        { status: 400 }
      );
    }

    // 3. Generate a unique room name for this session
    const roomName = `interview-${auth.userId}-${Date.now()}`;
    const participantName = auth.userId;

    // 4. Create the LiveKit Access Token
    const at = new AccessToken(
      env.LIVEKIT_API_KEY,
      env.LIVEKIT_API_SECRET,
      {
        identity: participantName,
        // Optional: We can pass data to the Python agent via participant metadata or attributes
        metadata: JSON.stringify({
          resumeText: resumeText.substring(0, 4000), // Ensure it fits in metadata limits
          jobDescription: jobDescription?.substring(0, 2000) || "",
        }),
      }
    );

    // 5. Grant permissions to join the specific room and publish/subscribe audio
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    // 6. Auto-Dispatch the Python Agent
    // This tells the LiveKit Cloud to wake up our python worker and put them in this room.
    // We also pass the resume data directly to the agent's metadata here.
    at.roomConfig = {
      name: roomName,
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 2,
      agents: [
        {
          agentName: "interview-agent",
          metadata: JSON.stringify({
            resumeText: resumeText.substring(0, 4000), 
            jobDescription: jobDescription?.substring(0, 2000) || "",
          }),
        },
      ],
    } as any;

    // 6. Generate the JWT string
    const token = await at.toJwt();

    return NextResponse.json({
      token,
      roomName,
      url: env.NEXT_PUBLIC_LIVEKIT_URL,
    });

  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json(
      { error: "Failed to generate interview room" },
      { status: 500 }
    );
  }
}
