"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  FileText,
  Target,
  Sparkles,
  ArrowRight,
  BarChart3,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ATSResults } from "@/components/ats/ATSResults";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Header } from "@/components/home/Header";
import { useSession, signIn } from "next-auth/react";
import { Footer } from "@/components/home/Footer";
import { motion } from "framer-motion";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { logger } from "@/lib/logger";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ATSAnalysisResult } from "@/lib/types";

export default function ATSAnalysisPage() {
  const [resumeContent, setResumeContent] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<ATSAnalysisResult | null>(null);
  const { status } = useSession();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { parseResume } = await import("@/app/actions/parse-resume");
      const result = await parseResume(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        setResumeContent(result.text || "");
        toast.success("Resume uploaded successfully!");
      }
    } catch (error) {
      toast.error(`Failed to process file: ${(error as Error).message}`);
    } finally {
      setIsUploadingFile(false);
      event.target.value = ""; // Reset input
    }
  };

  const handleAnalysis = async () => {
    if (resumeContent.trim().length < 10) {
      toast.error("Resume content must be at least 10 characters");
      return;
    }
    if (jobDescription.trim().length < 10) {
      toast.error("Job description must be at least 10 characters");
      return;
    }

    setIsAnalyzing(true);
    try {
      const data = await apiRequest<{ analysis: ATSAnalysisResult }>(
        API_ENDPOINTS.ATS,
        {
          method: "POST",
          body: JSON.stringify({
            resumeContent,
            jobDescription,
          }),
        },
      );

      setAnalysisResult(data.analysis);
      toast.success("ATS analysis completed!");
    } catch (error) {
      logger.error("Analysis error:", error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Header />

        {/* Background Pattern */}
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
          className="fill-foreground/6"
        />

        <div className="relative z-10 pt-24 pb-20">
          <div className="container mx-auto px-4">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-brand" />
                <span className="text-sm font-medium text-brand">
                  Powered by GenAI & RAG Pipeline
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                ATS Resume <span className="text-brand">Analyzer</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Get instant ATS compatibility scores and optimization
                suggestions using advanced AI analysis. Upload your resume and
                job description to discover how to beat the ATS systems.
              </p>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Real-time Scoring
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Keyword Analysis
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Suggestions
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="h-full backdrop-blur-sm bg-card/70 border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand" />
                        Upload and Analyze
                      </CardTitle>
                      <CardDescription>
                        Provide your resume and target job details for
                        comprehensive ATS analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Resume Upload */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Resume Content *
                        </label>
                        <div className="space-y-3">
                          <div className="relative">
                            <input
                              type="file"
                              accept=".txt,.pdf,.rtf"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="resume-upload"
                              disabled={isUploadingFile}
                            />
                            <label
                              htmlFor="resume-upload"
                              className={`flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg transition-colors ${
                                isUploadingFile
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer hover:bg-muted"
                              }`}
                            >
                              {isUploadingFile ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  Upload Resume (TXT/PDF/RTF)
                                </>
                              )}
                            </label>
                          </div>
                          <div className="text-center text-sm text-muted-foreground">
                            or
                          </div>
                          <Textarea
                            placeholder="Paste your resume content here..."
                            value={resumeContent}
                            onChange={(e) => setResumeContent(e.target.value)}
                            className="min-h-[100px] resize-none"
                          />
                        </div>
                      </div>

                      {/* Job Description */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Job Description *
                        </label>
                        <Textarea
                          placeholder="Paste the full job description here..."
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          className="min-h-[100px] resize-none"
                        />
                      </div>

                      {/* Analyze Button */}
                      <Button
                        onClick={handleAnalysis}
                        disabled={
                          isAnalyzing ||
                          resumeContent.trim().length < 10 ||
                          jobDescription.trim().length < 10
                        }
                        className="w-full gap-2"
                        size="lg"
                      >
                        Analyze ATS Compatibility
                        {isAnalyzing ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <ArrowRight className="w-5 h-5" />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Results Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {analysisResult ? (
                    <ATSResults analysis={analysisResult} className="h-full" />
                  ) : (
                    <Card className="h-full backdrop-blur-sm bg-card/70 border-border">
                      <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-4">
                          <BarChart3 className="w-8 h-8 text-brand" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          Ready for Analysis
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Upload your resume and job description to get started
                          with ATS analysis
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="w-4 h-4" />
                            ATS Scoring
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="w-4 h-4" />
                            Keyword Analysis
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Sparkles className="w-4 h-4" />
                            AI Suggestions
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <BarChart3 className="w-4 h-4" />
                            Industry Insights
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}
