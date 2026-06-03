import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { poolCount } from "@/app/actions/talent";
import { Header } from "@/components/home/Header";
import RecruiterClient from "./RecruiterClient";

export const dynamic = "force-dynamic";

export default async function RecruiterPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");

  const initialCount = await poolCount().catch(() => 0);

  return (
    <div className="min-h-screen">
      <Header />
      <RecruiterClient initialCount={initialCount} />
    </div>
  );
}
