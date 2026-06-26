import Image from "next/image";
import { FileText, ScanLine, FileDown } from "lucide-react";
import { HeroButton } from "./HeroButton";
import { ResumePreview } from "./ResumePreview";

export function HeroSection() {
  return (
    <section className="relative pb-20 overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Text Content — centered in the first screen */}
        <div className="min-h-screen text-center flex flex-col items-center justify-center gap-8">
          {/* Launch badges — real, verifiable social proof */}
          <div className="flex flex-wrap justify-center items-center gap-6 py-2">
            <a
              href="https://www.producthunt.com/products/resumegpt?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-resumegpt-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=998447&theme=neutral&t=1753680271015"
                alt="ResumeGPT featured on Product Hunt"
                width={250}
                height={54}
                style={{ width: "230px", height: "40px" }}
                priority
              />
            </a>
            <a
              href="https://peerlist.io/deepakmodi/project/resumegpt"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://peerlist.io/images/Launch_Badge_Light.svg"
                alt="ResumeGPT launched on Peerlist"
                className="block dark:hidden"
                width={200}
                height={44}
                style={{ width: "184px", height: "40px" }}
              />
              <Image
                src="https://peerlist.io/images/Launch_Badge_Dark.svg"
                alt="ResumeGPT launched on Peerlist"
                className="hidden dark:block"
                width={200}
                height={44}
                style={{ width: "184px", height: "40px" }}
              />
            </a>
          </div>

          {/* Headline — solid ink, one accent word */}
          <h1 className="max-w-4xl text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.95]">
            Tailor your resume to every job,{" "}
            <span className="text-brand">automatically</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Describe your experience in plain words. ResumeGPT drafts, rewrites,
            and ATS-checks your resume in real time — then exports a clean PDF.
          </p>

          {/* CTAs */}
          <HeroButton />

          {/* Honest, feature-based trust line — no fabricated logos */}
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 pt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand" />
              10+ ATS-friendly templates
            </span>
            <span className="inline-flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-brand" />
              Built-in ATS score check
            </span>
            <span className="inline-flex items-center gap-2">
              <FileDown className="h-4 w-4 text-brand" />
              Free PDF export
            </span>
          </div>
        </div>

        {/* Resume Preview */}
        <div className="mt-20 md:mt-28">
          <ResumePreview />
        </div>
      </div>
    </section>
  );
}
