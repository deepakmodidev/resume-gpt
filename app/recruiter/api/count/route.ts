import { NextResponse } from "next/server";
import { poolCount } from "@/app/actions/talent";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await poolCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 }, { status: 401 });
  }
}
