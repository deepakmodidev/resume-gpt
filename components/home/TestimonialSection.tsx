import { Star, Quote, CheckCircle } from "lucide-react";

const testimonials = [
  {
    name: "Sandeep Nandi",
    role: "Software Engineer",
    company: "Google",
    content:
      "ResumeGPT helped me land my dream job at Google. The AI suggestions were spot-on and the templates are incredibly professional.",
    rating: 5,
    image: "SN",
  },
  {
    name: "Vishal Singh",
    role: "Product Manager",
    company: "Meta",
    content:
      "The ATS optimization feature is a game-changer. My resume now passes all screening systems effortlessly.",
    rating: 5,
    image: "VS",
  },
  {
    name: "Nitish Modi",
    role: "Data Scientist",
    company: "Microsoft",
    content:
      "I've tried many resume builders, but ResumeGPT's AI assistance is unmatched. It understood my field perfectly.",
    rating: 5,
    image: "NM",
  },
  {
    name: "Prateek Verman",
    role: "UX Designer",
    company: "Apple",
    content:
      "The templates are beautiful and the export quality is exceptional. Got interviews at all FAANG companies!",
    rating: 5,
    image: "PV",
  },
  {
    name: "Kanhaiya Kumar",
    role: "Marketing Director",
    company: "Amazon",
    content:
      "ResumeGPT transformed my career. The AI helped me highlight achievements I didn't even know were important.",
    rating: 5,
    image: "KK",
  },
  {
    name: "Ashutosh Tiwari",
    role: "DevOps Engineer",
    company: "Netflix",
    content:
      "Lightning fast, incredibly smart AI, and professional results. This is the future of resume building.",
    rating: 5,
    image: "AT",
  },
];

export function TestimonialSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50/30 via-transparent to-blue-50/30 dark:from-blue-950/10 dark:via-transparent dark:to-blue-950/10"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-background/80 to-background/60 backdrop-blur-xl border border-border/50 rounded-full px-6 py-3 shadow-lg mb-6">
            <Star className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Trusted by
            </span>
            <span className="text-sm font-bold bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              10,000+ Professionals
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-6">
            <span className="bg-linear-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              Success Stories from
            </span>
            <br />
            <span className="bg-linear-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              Top Companies
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of professionals who&apos;ve landed their dream jobs
            with ResumeGPT&apos;s AI-powered resume builder.
          </p>
        </div>

        {/* Enhanced Grid Layout with Feature Card Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-muted/30 hover:bg-muted/50 transition-all duration-700 rounded-2xl p-2 group relative overflow-hidden border border-border/50 cursor-pointer"
            >
              <div className="rounded-2xl bg-card backdrop-blur-xs h-full transition-all duration-700 relative overflow-hidden w-full p-6 flex flex-col justify-between min-h-[200px]">
                {/* Animated gradient background */}
                <div className="absolute -bottom-40 left-[50%] translate-x-[-50%] group-hover:opacity-100 opacity-0 z-1 bg-linear-to-t from-blue-500/10 to-blue-300/20 blur-[6em] rounded-xl transition-all duration-700 ease-out w-40 h-80 rotate-12" />

                {/* Content - relative z-10 for proper layering */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Quote icon */}
                  <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <Quote className="h-12 w-12 text-foreground" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <blockquote className="text-foreground/90 leading-relaxed mb-6 flex-1">
                    &ldquo;{testimonial.content}&rdquo;
                  </blockquote>

                  {/* Profile */}
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {testimonial.image}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                    <div className="text-blue-500">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Star className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Average rating: </span>
            <span className="font-bold text-foreground">4.9/5</span>
            <span className="text-sm">from 10,000+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
