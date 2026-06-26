interface LayoutProps {
  children: React.ReactNode;
}

export function HomeLayout({ children }: LayoutProps) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "ResumeGPT",
            applicationCategory: "Resume Builder",
            operatingSystem: "Web Browser",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
            },
            description:
              "AI-powered resume builder that helps create professional resumes optimized for ATS systems.",
          }),
        }}
      />

      <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
        {/* Solid background — no gradient */}
        <div className="fixed inset-0 bg-background -z-20"></div>

        {/* Noise texture overlay */}
        <div
          className="fixed inset-0 opacity-[0.03] -z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {children}
      </div>
    </>
  );
}
