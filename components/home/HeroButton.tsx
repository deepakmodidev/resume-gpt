import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroButton() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
      <Button
        asChild
        size="lg"
        className="h-12 px-7 text-base font-semibold rounded-xl shadow-sm hover:shadow-md"
      >
        <Link href="/builder">
          Build my resume
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>

      <Button
        asChild
        variant="outline"
        size="lg"
        className="h-12 px-7 text-base font-semibold rounded-xl"
      >
        <Link href="/ats-analyzer">Analyze ATS score</Link>
      </Button>
    </div>
  );
}
