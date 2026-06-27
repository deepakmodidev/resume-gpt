import { FinalCTAButton } from "./FinalCTAButton";

export function FinalCTASection() {
  return (
    <section className="py-20 relative">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-sm">

          <div className="relative z-10 flex flex-col items-center gap-6">

            <h2 className="text-3xl md:text-5xl font-bold max-w-2xl leading-[1.05]">
              Ready to build a resume that{" "}
              <span className="bg-gradient-to-r from-brand to-warning bg-clip-text text-transparent">
                gets read?
              </span>
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
