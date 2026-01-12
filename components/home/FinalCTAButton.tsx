import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCTAButton() {
  return (
    <Button
      asChild
      size="lg"
      className="bg-linear-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 font-semibold text-lg px-8 py-4 h-auto rounded-xl shadow-lg"
    >
      <Link href="/builder/new">
        Start Building Now
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </Button>
  );
}
