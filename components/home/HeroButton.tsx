import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";

export function HeroButton() {
  return (
    <div className="flex flex-row flex-nowrap gap-2 sm:gap-3 items-center justify-center">
      <Button
        asChild
        size="lg"
        className="h-12 px-4 sm:px-7 text-sm sm:text-base font-semibold rounded-xl shadow-sm hover:shadow-md whitespace-nowrap"
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
        className="h-12 px-4 sm:px-7 text-sm sm:text-base font-semibold rounded-xl whitespace-nowrap"
      >
        <Link href="/recruiter">
          <Users className="h-4 w-4" />
          Find Talent
        </Link>
      </Button>
    </div>
  );
}
