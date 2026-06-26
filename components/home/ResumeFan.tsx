import { cn } from "@/lib/utils";

/* A small token-based line used throughout the mini resume cards. */
const Line = ({ className }: { className?: string }) => (
  <div className={cn("h-1.5 rounded-full bg-muted-foreground/25", className)} />
);

const Chip = ({ className }: { className?: string }) => (
  <span
    className={cn(
      "h-4 w-10 rounded-md bg-muted-foreground/15",
      className,
    )}
  />
);

type Variant = "classic" | "showcase" | "sidebar";

/* A stylized resume thumbnail. Three distinct layouts stand in for the
   "10+ templates" idea — all token-based, no images, no hardcoded colors. */
function MiniResume({
  variant,
  className,
}: {
  variant: Variant;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-72 w-44 shrink-0 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-[0_20px_50px_-20px_hsl(24_30%_12%/0.4)] md:h-80 md:w-56 md:p-5",
        className,
      )}
    >
      {variant === "showcase" ? (
        <>
          {/* Brand header band */}
          <div className="-mx-4 -mt-4 mb-4 flex items-center gap-3 bg-gradient-to-r from-brand to-warning p-4 md:-mx-5 md:-mt-5 md:mb-5 md:p-5">
            <div className="size-9 rounded-full bg-background/90 md:size-10" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2 w-3/4 rounded-full bg-background/90" />
              <div className="h-1.5 w-1/2 rounded-full bg-background/60" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Line className="h-2 w-1/3 bg-brand/60" />
              <Line className="w-full" />
              <Line className="w-5/6" />
              <Line className="w-11/12" />
            </div>
            <div className="space-y-1.5">
              <Line className="h-2 w-2/5 bg-brand/60" />
              <Line className="w-full" />
              <Line className="w-3/4" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Chip />
              <Chip className="w-12" />
              <Chip className="w-8" />
            </div>
          </div>
        </>
      ) : variant === "sidebar" ? (
        <div className="flex h-full gap-3">
          {/* Left rail */}
          <div className="flex w-1/3 flex-col items-center gap-3 rounded-xl bg-muted/70 p-2.5">
            <div className="size-8 rounded-full bg-muted-foreground/20" />
            <div className="w-full space-y-1.5">
              <Line className="h-1 w-full" />
              <Line className="h-1 w-3/4" />
              <Line className="h-1 w-full" />
            </div>
            <div className="mt-1 w-full space-y-1.5">
              <Line className="h-1 w-full" />
              <Line className="h-1 w-2/3" />
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <Line className="h-2.5 w-2/3 bg-muted-foreground/40" />
              <Line className="h-1.5 w-1/2" />
            </div>
            <div className="space-y-1.5">
              <Line className="h-2 w-1/3 bg-brand/60" />
              <Line className="w-full" />
              <Line className="w-5/6" />
              <Line className="w-full" />
            </div>
            <div className="space-y-1.5">
              <Line className="h-2 w-2/5 bg-brand/60" />
              <Line className="w-full" />
              <Line className="w-3/4" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Classic centered header */}
          <div className="mb-4 flex flex-col items-center gap-2 border-b border-border pb-4 text-center">
            <div className="h-2.5 w-2/3 rounded-full bg-muted-foreground/40" />
            <div className="h-1.5 w-2/5 rounded-full bg-muted-foreground/25" />
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Line className="h-2 w-2/5 bg-brand/60" />
              <Line className="w-full" />
              <Line className="w-11/12" />
              <Line className="w-5/6" />
            </div>
            <div className="space-y-1.5">
              <Line className="h-2 w-1/3 bg-brand/60" />
              <Line className="w-full" />
              <Line className="w-3/4" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Chip className="w-8" />
              <Chip />
              <Chip className="w-12" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* Three resume cards fanned like a hand of cards. On hover the deck spreads
   open — the side cards rotate out and slide apart, the centre lifts. */
export function ResumeFan() {
  return (
    <div className="group relative flex w-fit cursor-pointer items-center justify-center">
      <MiniResume
        variant="classic"
        className="origin-bottom -rotate-[10deg] bg-gradient-to-br from-card to-muted/40 transition-transform duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)] will-change-transform group-hover:-translate-x-6 group-hover:-rotate-[20deg]"
      />
      <MiniResume
        variant="showcase"
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)] will-change-transform group-hover:-translate-y-[54%]"
      />
      <MiniResume
        variant="sidebar"
        className="origin-bottom rotate-[10deg] bg-gradient-to-bl from-card to-muted/40 transition-transform duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)] will-change-transform group-hover:translate-x-6 group-hover:rotate-[20deg]"
      />
    </div>
  );
}
