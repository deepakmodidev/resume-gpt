import { FinalCTAButton } from "./FinalCTAButton";

export function FinalCTASection() {
  return (
    <section className="py-20 relative">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 md:px-12 md:py-20 text-center">
          {/* Single soft accent glow */}
          <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[32rem] h-64 bg-brand/10 blur-[100px]" />

          <div className="relative z-10 flex flex-col items-center gap-5">
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl">
              Ready to build a resume that gets read?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Describe your experience, let the AI do the heavy lifting, and
              export a polished PDF in minutes.
            </p>
            <div className="pt-2">
              <FinalCTAButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
