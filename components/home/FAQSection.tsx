const faqs = [
  {
    q: "Is ResumeGPT free to use?",
    a: "Yes. You can build, edit, and export your resume to PDF without paying. Sign in with Google to save your work and come back to it later.",
  },
  {
    q: "Do I have to write every bullet point myself?",
    a: "No. Describe your experience in plain language and the assistant drafts and rewrites it with stronger action verbs and quantified results.",
  },
  {
    q: "Will my resume pass ATS screening?",
    a: "The built-in ATS analyzer scores your resume against a job description and suggests fixes. The templates use clean, parseable formatting that applicant tracking systems can read.",
  },
  {
    q: "Can I tailor a resume to a specific job?",
    a: "Paste the job description and ResumeGPT adjusts wording and keywords to match it. You can also generate a cover letter built from the same details.",
  },
  {
    q: "What can I do besides the resume builder?",
    a: "Generate matching cover letters, run an ATS score check, and practice with AI voice mock interviews powered by LiveKit and Sarvam AI.",
  },
  {
    q: "Which templates are included?",
    a: "10+ ATS-friendly templates including Modern, Executive, and Creative layouts. You can switch templates at any time without re-entering your content.",
  },
];

export function FAQSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16">
          {/* Left: heading */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
               <span className="text-brand">Frequently</span> Asked Questions 
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              The practical details before you start. Still unsure about
              something? Reach out and we&apos;ll help.
            </p>
          </div>

          {/* Right: side-by-side Q&A list (no accordions) */}
          <dl className="divide-y divide-border">
            {faqs.map((item) => (
              <div key={item.q} className="py-6 first:pt-0">
                <dt className="font-semibold text-foreground text-lg mb-2">
                  {item.q}
                </dt>
                <dd className="text-muted-foreground leading-relaxed">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
