import { v4 as uuidv4 } from "uuid";
import { HomeLayout } from "@/components/home/HomeLayout";
import { Header } from "@/components/home/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { ResumeBuildingSection } from "@/components/home/ResumeBuildingSection";
import { DemoSection } from "@/components/home/DemoSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { TestimonialSection } from "@/components/home/TestimonialSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import { Footer } from "@/components/home/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ResumeGPT - AI-Powered Resume Builder",
  description:
    "Create perfect resumes with AI. Type naturally, watch your resume build in real-time.",
};

export default function HomePage() {
  // Generate UUID on server - no need for "use client"
  const chatId = uuidv4();

  return (
    <HomeLayout>
      <Header />
      <main className="flex-1">
        <HeroSection chatId={chatId} />
        <ResumeBuildingSection />
        <DemoSection />
        <FeaturesSection />
        <TestimonialSection />
        <FinalCTASection chatId={chatId} />
      </main>
      <Footer />
    </HomeLayout>
  );
}
