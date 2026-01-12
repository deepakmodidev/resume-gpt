"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Target,
  Brain,
  BarChart3,
  Lightbulb,
  TrendingUp,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ATSAnalysisResult } from "@/lib/types";

interface ATSResultsProps {
  analysis: ATSAnalysisResult;
  className?: string;
}

export function ATSResults({ analysis, className }: ATSResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Award className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <Target className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  return (
    <Card
      className={cn(
        "backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-slate-200/60 dark:border-slate-700/60",
        className,
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          ATS Analysis Results
        </CardTitle>
        <CardDescription>
          Comprehensive analysis of your resume compatibility
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="suggestions">Tips</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overall Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                <svg
                  className="w-32 h-32 transform -rotate-90"
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - analysis.scores.overall / 100)}`}
                    className={getScoreColor(analysis.scores.overall)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={cn(
                      "text-3xl font-bold",
                      getScoreColor(analysis.scores.overall),
                    )}
                  >
                    {Math.round(analysis.scores.overall)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ATS Score
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                {getScoreIcon(analysis.scores.overall)}
                <span
                  className={cn(
                    "font-semibold",
                    getScoreColor(analysis.scores.overall),
                  )}
                >
                  {getScoreLabel(analysis.scores.overall)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your resume has a{" "}
                {getScoreLabel(analysis.scores.overall).toLowerCase()} ATS
                compatibility rating
              </p>
            </motion.div>

            {/* Detailed Scores */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="w-4 h-4" />
                Score Breakdown
              </h4>
              <div className="space-y-3">
                {[
                  {
                    label: "Keyword Match",
                    value: analysis.scores.keyword,
                    icon: CheckCircle,
                  },
                  {
                    label: "Format Quality",
                    value: analysis.scores.format,
                    icon: BarChart3,
                  },
                  {
                    label: "Content Relevance",
                    value: analysis.scores.content,
                    icon: Brain,
                  },
                  {
                    label: "Semantic Similarity",
                    value: analysis.scores.semantic,
                    icon: TrendingUp,
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <Progress value={item.value} className="w-16 h-2" />
                      <span
                        className={cn(
                          "text-sm font-semibold w-8",
                          getScoreColor(item.value),
                        )}
                      >
                        {Math.round(item.value)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            {/* Matched Keywords */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Matched Keywords ({analysis.matchedKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.matchedKeywords.slice(0, 15).map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="default"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    {keyword}
                  </Badge>
                ))}
                {analysis.matchedKeywords.length > 15 && (
                  <Badge variant="outline">
                    +{analysis.matchedKeywords.length - 15} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                Missing Keywords ({analysis.missingKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.slice(0, 15).map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                  >
                    {keyword}
                  </Badge>
                ))}
                {analysis.missingKeywords.length > 15 && (
                  <Badge variant="outline">
                    +{analysis.missingKeywords.length - 15} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Critical Missing */}
            {analysis.criticalMissingKeywords.length > 0 && (
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Critical Missing Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.criticalMissingKeywords.map((keyword, index) => (
                    <Badge key={index} variant="destructive">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              Optimization Suggestions
            </h4>
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {suggestion}
                  </p>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              Advanced Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Industry Fit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={analysis.industryFit} className="flex-1" />
                  <span className="text-sm font-semibold">
                    {analysis.industryFit}%
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Readability</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={analysis.readabilityScore}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold">
                    {analysis.readabilityScore}%
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Semantic Match</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={analysis.semanticSimilarity}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold">
                    {analysis.semanticSimilarity}%
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-orange-600" />
                  <span className="font-medium">Keyword Density</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={analysis.keywordDensity * 10}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold">
                    {analysis.keywordDensity}%
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
