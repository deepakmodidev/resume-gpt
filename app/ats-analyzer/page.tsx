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
import { Footer } from "@/components/home/Footer";
import { motion } from "framer-motion";

interface ATSAnalysisResult {
  scores: {
    overall: number;
    keyword: number;
    format: number;
    content: number;
    semantic: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  criticalMissingKeywords: string[];
  suggestions: string[];
  industryFit: number;
  readabilityScore: number;
  semanticSimilarity: number;
  keywordDensity: number;
}

export default function ATSAnalysisPage() {
  const [resumeContent, setResumeContent] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<ATSAnalysisResult | null>(null);

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
      console.error("File upload error:", error);
      toast.error(`Failed to process file: ${(error as Error).message}`);
    } finally {
      setIsUploadingFile(false);
      event.target.value = ""; // Reset input
    }
  };

  const handleAnalysis = async () => {
    if (!resumeContent.trim() || !jobDescription.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeContent,
          jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
      toast.success("ATS analysis completed!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen ">
      <Header />

      {/* Background Pattern */}
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className="fill-blue-500/30 dark:fill-blue-400/30"
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
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Powered by GenAI & RAG Pipeline
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-6">
              ATS Resume Analyzer
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Get instant ATS compatibility scores and optimization suggestions
              using advanced AI analysis. Upload your resume and job description
              to discover how to beat the ATS systems.
            </p>

            <div className="flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
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
                <Card className="h-full backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-slate-200/60 dark:border-slate-700/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
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
                            className={`flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg transition-colors ${
                              isUploadingFile
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
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
                        <div className="text-center text-sm text-slate-500">
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
                        !resumeContent.trim() ||
                        !jobDescription.trim()
                      }
                      className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        "Analyzing..."
                      ) : (
                        <>
                          Analyze ATS Compatibility
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
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
                  <Card className="h-full backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-slate-200/60 dark:border-slate-700/60">
                    <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                        <BarChart3 className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Ready for Analysis
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Upload your resume and job description to get started
                        with ATS analysis
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Target className="w-4 h-4" />
                          ATS Scoring
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <FileText className="w-4 h-4" />
                          Keyword Analysis
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Sparkles className="w-4 h-4" />
                          AI Suggestions
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
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
  );
}
