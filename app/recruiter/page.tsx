import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { poolCount } from "@/app/actions/talent";
import { AppShell } from "@/components/AppShell";
import RecruiterClient from "./RecruiterClient";

export const dynamic = "force-dynamic";

export default async function RecruiterPage() {
  const session = await auth();
  if (!session?.user) redirect("/?signin=true");

  const initialCount = await poolCount().catch(() => 0);

  return (
    <AppShell>
      <RecruiterClient initialCount={initialCount} />
    </AppShell>
  );
}
