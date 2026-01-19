import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroButton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
      <Button
        asChild
        size="lg"
        className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-base md:text-xl px-8 py-4 md:px-12 md:py-6 h-auto rounded-xl md:rounded-2xl shadow-2xl transition-all duration-300"
      >
        <Link href="/builder/new">
          <span className="text-sm md:text-base">Build Resume</span>
          <ArrowRight className="h-4 w-4 md:h-6 md:w-6" />
        </Link>
      </Button>

      <Button
        asChild
        variant="outline"
        size="lg"
        className="border-2 border-blue-500/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:bg-blue-50/80 dark:hover:bg-slate-800/80 font-bold text-base md:text-xl px-8 py-4 md:px-12 md:py-6 h-auto rounded-xl md:rounded-2xl shadow-lg transition-all duration-300"
      >
        <Link href="/ats-analyzer">
          <span className="text-sm md:text-base text-blue-600 dark:text-blue-400">
            Analyze ATS Score
          </span>
        </Link>
      </Button>
    </div>
  );
}
