import { SmartATSAnalyzer, type SmartATSAnalysis } from "./smart-ats-analyzer";
import { logger } from "@/lib/logger";

export interface ATSScore {
  overall: number;
  keyword: number;
  format: number;
  content: number;
  semantic: number;
}

export interface ATSAnalysisResult {
  scores: ATSScore;
  matchedKeywords: string[];
  missingKeywords: string[];
  criticalMissingKeywords: string[];
  suggestions: string[];
  industryFit: number;
  readabilityScore: number;
  semanticSimilarity: number;
  keywordDensity: number;
  improvementAreas: string[];
  strengthAreas: string[];

  // Enhanced production features
  breakdown: {
    semanticMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    formatQuality: number;
    keywordDensity: number;
  };
  matchedSkills: Array<{
    skill: string;
    category: string;
    weight: number;
    confidence: number;
  }>;
  missingCriticalSkills: string[];
  recommendations: string[];
  experienceMatch: number;
}

export class ATSAnalyzer {
  private smartAnalyzer: SmartATSAnalyzer;

  constructor() {
    this.smartAnalyzer = new SmartATSAnalyzer();
  }

  async analyzeResumeVsJob(
    resumeContent: string,
    jobDescription: string,
  ): Promise<ATSAnalysisResult> {
    try {
      // Use smart NLP-based analyzer for intelligent skill extraction
      const smartResult = this.smartAnalyzer.analyze(
        resumeContent,
        jobDescription,
      );

      // Extract only relevant skills (not all words) using smart analyzer
      const matchedKeywords = smartResult.matchedSkills.map(
        (skill) => skill.skill,
      );
      const missingKeywords = smartResult.missingSkills.map(
        (skill) => skill.skill,
      );
      const criticalMissingKeywords = smartResult.missingSkills
        .filter((skill) => skill.importance > 70)
        .map((skill) => skill.skill);

      // Generate improvement and strength areas from smart analysis
      const improvementAreas = this.generateSmartImprovementAreas(smartResult);
      const strengthAreas = this.generateSmartStrengthAreas(smartResult);

      // Map smart results to legacy format for backward compatibility
      const scores: ATSScore = {
        overall: smartResult.overallScore,
        keyword:
          Math.round(
            (smartResult.matchedSkills.length /
              (smartResult.matchedSkills.length +
                smartResult.missingSkills.length)) *
              100,
          ) || 0,
        format: 85, // Default good format score since we're focusing on content
        content: Math.round(
          (smartResult.breakdown.technicalMatch +
            smartResult.breakdown.businessMatch) /
            2,
        ),
        semantic: Math.round(
          (smartResult.breakdown.technicalMatch +
            smartResult.breakdown.managementMatch) /
            2,
        ),
      };

      return {
        scores,
        matchedKeywords: matchedKeywords.slice(0, 20),
        missingKeywords: missingKeywords.slice(0, 15),
        criticalMissingKeywords,
        suggestions: smartResult.recommendations,
        industryFit: smartResult.overallScore,
        readabilityScore: 85, // Default good readability
        semanticSimilarity: scores.semantic,
        keywordDensity: 60, // Default good keyword density
        improvementAreas,
        strengthAreas,

        // Enhanced features using smart analysis
        breakdown: {
          semanticMatch: scores.semantic,
          skillsMatch: scores.keyword,
          experienceMatch: smartResult.breakdown.experienceMatch,
          formatQuality: scores.format,
          keywordDensity: 60,
        },
        matchedSkills: smartResult.matchedSkills.map((skill) => ({
          skill: skill.skill,
          category: skill.category,
          weight: skill.relevance / 100,
          confidence: skill.confidence,
        })),
        missingCriticalSkills: criticalMissingKeywords,
        recommendations: smartResult.recommendations,
        experienceMatch: smartResult.breakdown.experienceMatch,
      };
    } catch (error) {
      logger.error("ATS Analysis Error:", error);

      // Return fallback analysis
      return this.getFallbackAnalysis();
    }
  }

  private calculateKeywordMatches(
    resumeKeywords: string[],
    jobKeywords: string[],
  ): {
    matchedKeywords: string[];
    missingKeywords: string[];
    criticalMissingKeywords: string[];
  } {
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];
    const criticalMissingKeywords: string[] = [];

    // Critical keywords (high-weight terms)
    const criticalTerms = new Set([
      "javascript",
      "typescript",
      "python",
      "java",
      "react",
      "angular",
      "vue",
      "nodejs",
      "express",
      "mongodb",
      "postgresql",
      "mysql",
      "aws",
      "azure",
      "docker",
      "kubernetes",
      "git",
      "api",
      "rest",
      "graphql",
      "html",
      "css",
      "sql",
    ]);

    resumeKeywords.forEach((resumeKeyword) => {
      const isMatched = jobKeywords.some((jobKeyword) =>
        this.fuzzyMatch(resumeKeyword, jobKeyword),
      );

      if (isMatched && !matchedKeywords.includes(resumeKeyword)) {
        matchedKeywords.push(resumeKeyword);
      }
    });

    jobKeywords.forEach((jobKeyword) => {
      const isInResume = resumeKeywords.some((resumeKeyword) =>
        this.fuzzyMatch(resumeKeyword, jobKeyword),
      );

      if (!isInResume) {
        missingKeywords.push(jobKeyword);

        if (criticalTerms.has(jobKeyword.toLowerCase())) {
          criticalMissingKeywords.push(jobKeyword);
        }
      }
    });

    return { matchedKeywords, missingKeywords, criticalMissingKeywords };
  }

  private fuzzyMatch(
    str1: string,
    str2: string,
    threshold: number = 0.8,
  ): boolean {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    // Exact match
    if (s1 === s2) return true;

    // Substring match
    if (s1.includes(s2) || s2.includes(s1)) return true;

    // Check variations
    const variations: { [key: string]: string[] } = {
      javascript: ["js", "ecmascript", "es6"],
      typescript: ["ts"],
      react: ["reactjs", "react.js"],
      vue: ["vuejs", "vue.js"],
      angular: ["angularjs"],
      nodejs: ["node.js", "node"],
      express: ["expressjs", "express.js"],
      mongodb: ["mongo"],
      postgresql: ["postgres", "psql"],
    };

    for (const [main, variants] of Object.entries(variations)) {
      if (
        (s1 === main && variants.includes(s2)) ||
        (s2 === main && variants.includes(s1))
      ) {
        return true;
      }
    }

    // Calculate similarity ratio
    const longer = s1.length > s2.length ? s1 : s2;

    if (longer.length === 0) return true;
    const editDistance = this.calculateEditDistance(s1, s2);
    const similarity = (longer.length - editDistance) / longer.length;

    return similarity >= threshold;
  }

  private calculateEditDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost,
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private getFallbackAnalysis(): ATSAnalysisResult {
    return {
      scores: {
        overall: 45,
        keyword: 40,
        format: 50,
        content: 45,
        semantic: 40,
      },
      matchedKeywords: [],
      missingKeywords: [],
      criticalMissingKeywords: [],
      suggestions: ["Unable to complete full analysis. Please try again."],
      industryFit: 45,
      readabilityScore: 50,
      semanticSimilarity: 40,
      keywordDensity: 30,
      improvementAreas: ["Analysis Error"],
      strengthAreas: [],
      breakdown: {
        semanticMatch: 40,
        skillsMatch: 40,
        experienceMatch: 45,
        formatQuality: 50,
        keywordDensity: 30,
      },
      matchedSkills: [],
      missingCriticalSkills: [],
      recommendations: ["Please try the analysis again"],
      experienceMatch: 45,
    };
  }

  // Legacy method for backward compatibility
  async analyzeResume(
    resumeText: string,
    jobDescription: string,
  ): Promise<ATSAnalysisResult> {
    return this.analyzeResumeVsJob(resumeText, jobDescription);
  }

  // Method to get keyword placement suggestions
  getKeywordSuggestions(
    resumeText: string,
    missingKeywords: string[],
  ): Array<{
    keyword: string;
    suggestion: string;
    section: string;
    priority: "high" | "medium" | "low";
  }> {
    const suggestions: Array<{
      keyword: string;
      suggestion: string;
      section: string;
      priority: "high" | "medium" | "low";
    }> = [];

    // Critical technical skills get high priority
    const highPriorityKeywords = new Set([
      "javascript",
      "typescript",
      "python",
      "java",
      "react",
      "angular",
      "vue",
      "nodejs",
      "express",
      "mongodb",
      "postgresql",
      "mysql",
      "aws",
      "azure",
      "docker",
      "kubernetes",
    ]);
    missingKeywords.forEach((keyword, index) => {
      const normalizedKeyword = keyword.toLowerCase();
      let section = "skills";
      let suggestion = "";
      let priority: "high" | "medium" | "low" = "medium";

      // Determine priority
      if (highPriorityKeywords.has(normalizedKeyword)) {
        priority = "high";
      } else if (index < 3) {
        priority = "high";
      } else if (index < 7) {
        priority = "medium";
      } else {
        priority = "low";
      }

      // Generate contextual suggestions based on keyword type
      if (this.isProgrammingLanguage(normalizedKeyword)) {
        section = "Technical Skills";
        suggestion = `Add "${keyword}" to your programming languages section. Consider mentioning specific projects where you used ${keyword}.`;
      } else if (this.isFramework(normalizedKeyword)) {
        section = "Technical Skills";
        suggestion = `Include "${keyword}" in your frameworks section. Highlight any projects or experience with ${keyword}.`;
      } else if (this.isDatabase(normalizedKeyword)) {
        section = "Technical Skills";
        suggestion = `Add "${keyword}" to your database technologies. Mention data modeling or query optimization experience.`;
      } else if (this.isCloudTechnology(normalizedKeyword)) {
        section = "Technical Skills";
        suggestion = `Include "${keyword}" in your cloud/DevOps skills. Highlight deployment or infrastructure experience.`;
      } else if (this.isSoftSkill(normalizedKeyword)) {
        section = "Experience";
        suggestion = `Demonstrate "${keyword}" through specific examples in your work experience section.`;
      } else {
        section = "Skills";
        suggestion = `Consider adding "${keyword}" to your relevant skills if you have experience with it.`;
      }

      suggestions.push({
        keyword,
        suggestion,
        section,
        priority,
      });
    });

    // Sort by priority (high first) and limit to top 10
    return suggestions
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 10);
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s.-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private isProgrammingLanguage(keyword: string): boolean {
    const languages = new Set([
      "javascript",
      "typescript",
      "python",
      "java",
      "c++",
      "c#",
      "php",
      "ruby",
      "go",
      "rust",
      "swift",
      "kotlin",
      "scala",
      "r",
      "matlab",
      "sql",
      "html",
      "css",
      "bash",
      "powershell",
    ]);
    return languages.has(keyword);
  }

  private isFramework(keyword: string): boolean {
    const frameworks = new Set([
      "react",
      "angular",
      "vue",
      "svelte",
      "nodejs",
      "express",
      "django",
      "flask",
      "spring",
      "laravel",
      "rails",
      "asp.net",
      "jquery",
      "bootstrap",
      "tailwind",
      "nextjs",
      "nuxtjs",
    ]);
    return frameworks.has(keyword);
  }

  private isDatabase(keyword: string): boolean {
    const databases = new Set([
      "mysql",
      "postgresql",
      "mongodb",
      "redis",
      "elasticsearch",
      "sqlite",
      "oracle",
      "cassandra",
      "firebase",
      "firestore",
      "dynamodb",
      "cosmos",
      "neo4j",
    ]);
    return databases.has(keyword);
  }

  private isCloudTechnology(keyword: string): boolean {
    const cloudTech = new Set([
      "aws",
      "azure",
      "gcp",
      "docker",
      "kubernetes",
      "jenkins",
      "gitlab",
      "github",
      "terraform",
      "ansible",
      "serverless",
      "vercel",
      "netlify",
      "heroku",
    ]);
    return cloudTech.has(keyword);
  }

  private isSoftSkill(keyword: string): boolean {
    const softSkills = new Set([
      "leadership",
      "communication",
      "teamwork",
      "collaboration",
      "problem",
      "solving",
      "analytical",
      "creative",
      "agile",
      "scrum",
      "kanban",
      "project",
      "management",
    ]);
    return softSkills.has(keyword);
  }

  /**
   * Generate improvement areas using smart analysis
   */
  private generateSmartImprovementAreas(
    smartResult: SmartATSAnalysis,
  ): string[] {
    const areas: string[] = [];

    if (smartResult.breakdown.technicalMatch < 70) {
      areas.push("Technical Skills Alignment");
    }
    if (smartResult.breakdown.businessMatch < 50) {
      areas.push("Business Skills Integration");
    }
    if (smartResult.breakdown.managementMatch < 60) {
      areas.push("Leadership & Management Experience");
    }
    if (smartResult.missingSkills.length > 5) {
      areas.push("Keyword Optimization");
    }
    if (smartResult.overallScore < 70) {
      areas.push("Content Relevance");
    }

    return areas;
  }

  /**
   * Generate strength areas using smart analysis
   */
  private generateSmartStrengthAreas(smartResult: SmartATSAnalysis): string[] {
    const areas: string[] = [];

    if (smartResult.breakdown.technicalMatch >= 80) {
      areas.push("Strong Technical Skills Match");
    }
    if (smartResult.breakdown.businessMatch >= 70) {
      areas.push("Excellent Business Alignment");
    }
    if (smartResult.breakdown.managementMatch >= 70) {
      areas.push("Strong Leadership Profile");
    }
    if (smartResult.overallScore >= 80) {
      areas.push("Well-Matched Experience Level");
    }
    if (smartResult.matchedSkills.length >= 10) {
      areas.push("Comprehensive Skill Set");
    }

    // Always include at least one strength
    if (areas.length === 0) {
      areas.push("Clear and Professional Writing");
    }

    return areas;
  }
}
