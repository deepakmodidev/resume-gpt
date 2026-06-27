import Image from "next/image";
import { Heart, FileText, Mail, ScanLine, Mic } from "lucide-react";
import { HeroButton } from "./HeroButton";
import { ResumeFan } from "./ResumeFan";

const capabilities = [
  { icon: FileText, label: "AI Resume" },
  { icon: Mail, label: "Cover Letters" },
  { icon: ScanLine, label: "ATS Check" },
  { icon: Mic, label: "Voice Mock Interviews" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-x-clip pb-24 pt-10">
      {/* Warm gradient blobs — brand-toned, behind everything */}
      <div className="pointer-events-none absolute left-1/2 top-[-18rem] -z-10 size-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-brand to-warning opacity-20 blur-[8em] md:size-[44rem]" />
      <div className="pointer-events-none absolute right-[-10rem] top-[14rem] -z-10 size-[18rem] rounded-full bg-gradient-to-tr from-brand to-warning opacity-15 blur-[7em] md:size-[34rem]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-7 py-12 text-center">


          {/* Headline — one warm gradient accent word */}
          <h1 className="max-w-4xl md:text-6xl text-4xl font-extrabold leading-[0.95] tracking-tight">
            Tailor your resume to every job{" "}
            <span className="bg-gradient-to-r from-brand to-warning bg-clip-text text-transparent">
              automatically
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Describe your experience in plain words. ResumeGPT drafts,
            rewrites, and ATS-checks your resume in real time, then exports a
            clean PDF.
          </p>

          {/* CTAs */}
          <HeroButton />

          {/* Capability pills — signals the full job-seeker toolkit */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            {capabilities.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-sm font-medium text-foreground"
              >
                <Icon className="h-4 w-4 text-brand" />
                {label}
              </span>
            ))}
          </div>

          {/* Fanned resume-template stack — hover to spread the deck */}
          <div className="flex justify-center pt-6 md:pt-10">
            <ResumeFan />
          </div>
        </div>

        {/* Honest social proof — real launch badges */}
        <div className="flex flex-col items-center gap-5 pb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Launched on
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
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
        </div>
      </div>
    </section>
  );
}
