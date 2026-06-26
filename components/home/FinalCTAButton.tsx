import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCTAButton() {
  return (
    <Button
      asChild
      size="lg"
      className="h-12 px-8 text-base font-semibold rounded-xl shadow-sm hover:shadow-md"
    >
      <Link href="/builder">
        Start building now
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}
