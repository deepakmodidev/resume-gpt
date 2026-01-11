"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  Target,
  Brain,
  BarChart3,
  Lightbulb,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

interface ATSScoreProps {
  resumeContent: string;
  resumeId?: string;
  onOptimizationSuggestion?: (suggestion: string) => void;
}

export function ATSScore({
  resumeContent,
  resumeId,
  onOptimizationSuggestion,
}: ATSScoreProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  const handleQuickAnalyze = async () => {
    if (!jobDescription.trim() || !jobTitle.trim()) {
      toast.error("Please provide job title and description");
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
            jobTitle,
            company,
            industry,
            resumeId,
          }),
        }
      );

      setResult(data.analysis);
      setShowFullAnalysis(true);
      toast.success(`ATS Score: ${data.analysis.scores.overall}%`);
    } catch (error) {
      logger.error("ATS analysis error", error as Error);
      toast.error("Failed to analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80)
      return (
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      );
    if (score >= 60)
      return (
        <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      );
    return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80)
      return "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800";
    if (score >= 60)
      return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800";
    return "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800";
  };

  return (
    <div className="space-y-4">
      {/* Compact Analysis Input */}
      <Card className="border-blue-500">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-blue-500" />
            RAG-Powered ATS Analysis
          </CardTitle>
          <CardDescription>
            Get instant AI-powered compatibility score with any job description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste job description here for instant ATS compatibility analysis..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            className="resize-none text-sm"
          />

          <div className="flex items-center gap-4">
            <Input
              placeholder="Job Title (e.g., Senior Software Engineer)"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="text-sm"
            />
            <Button
              onClick={handleQuickAnalyze}
              disabled={
                isAnalyzing || !jobDescription.trim() || !jobTitle.trim()
              }
              className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Analyze ATS
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`${getScoreBgColor(result.scores.overall)}`}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    ATS Compatibility Score
                  </div>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(result.scores.overall)}`}
                  >
                    {result.scores.overall}%
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showFullAnalysis ? (
                  <div className="space-y-4">
                    {/* Quick Overview */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {getScoreIcon(result.scores.keyword)}
                          <span className="text-xs font-medium">Keywords</span>
                        </div>
                        <div
                          className={`text-lg font-bold ${getScoreColor(result.scores.keyword)}`}
                        >
                          {result.scores.keyword}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {getScoreIcon(result.scores.semantic)}
                          <span className="text-xs font-medium">Semantic</span>
                        </div>
                        <div
                          className={`text-lg font-bold ${getScoreColor(result.scores.semantic)}`}
                        >
                          {result.scores.semantic}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {getScoreIcon(result.scores.content)}
                          <span className="text-xs font-medium">Content</span>
                        </div>
                        <div
                          className={`text-lg font-bold ${getScoreColor(result.scores.content)}`}
                        >
                          {result.scores.content}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {getScoreIcon(result.scores.format)}
                          <span className="text-xs font-medium">Format</span>
                        </div>
                        <div
                          className={`text-lg font-bold ${getScoreColor(result.scores.format)}`}
                        >
                          {result.scores.format}%
                        </div>
                      </div>
                    </div>

                    {/* Top Missing Keywords */}
                    {result.criticalMissingKeywords.length > 0 && (
                      <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                        <h5 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          Critical Missing Keywords
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {result.criticalMissingKeywords
                            .slice(0, 6)
                            .map((keyword, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 text-xs cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/70"
                                onClick={() =>
                                  onOptimizationSuggestion?.(keyword)
                                }
                              >
                                {keyword}
                              </Badge>
                            ))}
                          {result.criticalMissingKeywords.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{result.criticalMissingKeywords.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-muted-foreground">
                        Industry Fit: {result.industryFit}% • Readability:{" "}
                        {result.readabilityScore}%
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFullAnalysis(true)}
                        className="text-xs"
                      >
                        View Detailed Analysis
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview" className="text-xs">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="keywords" className="text-xs">
                        Keywords
                      </TabsTrigger>
                      <TabsTrigger value="suggestions" className="text-xs">
                        Suggestions
                      </TabsTrigger>
                      <TabsTrigger value="insights" className="text-xs">
                        Insights
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries({
                          Overall: result.scores.overall,
                          Keywords: result.scores.keyword,
                          Semantic: result.scores.semantic,
                          Content: result.scores.content,
                          Format: result.scores.format,
                        }).map(([label, score]) => (
                          <div
                            key={label}
                            className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg"
                          >
                            <div className="flex items-center justify-center gap-1 mb-2">
                              {getScoreIcon(score)}
                              <span className="text-sm font-medium">
                                {label}
                              </span>
                            </div>
                            <div
                              className={`text-xl font-bold ${getScoreColor(score)}`}
                            >
                              {score}%
                            </div>
                            <Progress value={score} className="mt-2 h-2" />
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="keywords" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Matched ({result.matchedKeywords.length})
                          </h5>
                          <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                            {result.matchedKeywords.map((keyword, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs"
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Missing ({result.missingKeywords.length})
                          </h5>
                          <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                            {result.missingKeywords.map((keyword, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 text-xs cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/70"
                                onClick={() =>
                                  onOptimizationSuggestion?.(keyword)
                                }
                                title="Click to add to resume"
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="suggestions" className="space-y-3 mt-4">
                      {result.suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 rounded-full p-1">
                              <Lightbulb className="h-3 w-3" />
                            </div>
                            <p className="text-sm flex-1">{suggestion}</p>
                            {onOptimizationSuggestion && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  onOptimizationSuggestion(suggestion)
                                }
                                className="text-xs h-6 px-2"
                              >
                                Apply
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                          <h6 className="font-medium text-sm mb-2">
                            Performance Metrics
                          </h6>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Industry Fit</span>
                              <span className="font-semibold">
                                {result.industryFit}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Readability</span>
                              <span className="font-semibold">
                                {result.readabilityScore}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Keyword Density</span>
                              <span className="font-semibold">
                                {result.keywordDensity}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Semantic Match</span>
                              <span className="font-semibold">
                                {result.semanticSimilarity}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                          <h6 className="font-medium text-sm mb-2">
                            Quick Stats
                          </h6>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Keywords</span>
                              <span className="font-semibold">
                                {result.matchedKeywords.length +
                                  result.missingKeywords.length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Match Rate</span>
                              <span className="font-semibold">
                                {(
                                  (result.matchedKeywords.length /
                                    (result.matchedKeywords.length +
                                      result.missingKeywords.length)) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Critical Missing</span>
                              <span className="font-semibold text-red-600 dark:text-red-400">
                                {result.criticalMissingKeywords.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
