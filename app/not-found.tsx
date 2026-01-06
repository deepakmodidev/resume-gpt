import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-gray-100 to-primary leading-none">
            404
          </h1>
          <div className="absolute inset-0 text-[150px] md:text-[200px] font-bold text-primary/10 blur-xl leading-none">
            404
          </div>
        </div>

        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="p-6 bg-primary/10 rounded-full animate-bounce">
            <svg
              className="w-16 h-16 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-md mx-auto">
          The page you&apos;re looking for seems to have wandered off.
          Let&apos;s get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go Home
          </Link>

          <Link
            href="/builder/new"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card border-2 border-border text-foreground font-semibold rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-300"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Build Resume
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Popular destinations:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/ats-analyzer"
              className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              ATS Analyzer
            </Link>
            <span className="text-border">•</span>
            <Link
              href="/cover-letter"
              className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              Cover Letter Generator
            </Link>
            <span className="text-border">•</span>
            <Link
              href="/builder/new"
              className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              Resume Builder
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
