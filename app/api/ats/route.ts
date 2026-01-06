import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/prisma/prisma";
import { ATSAnalyzer } from "@/lib/rag/ats-analyzer";

interface ResumeData {
  atsAnalysis?: {
    scores: Record<string, number>;
    matchedKeywords: string[];
    missingKeywords: string[];
    suggestions: string[];
    analyzedAt: string;
  };
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  try {
    // Make authentication optional - get session but don't require it
    const session = await auth();
    const isAuthenticated = !!session?.user?.id;

    const { resumeContent, jobDescription, resumeId } = await req.json();

    // Validate input
    if (!resumeContent || !jobDescription) {
      return NextResponse.json(
        { error: "Missing required fields: resumeContent, jobDescription" },
        { status: 400 },
      );
    }

    // Initialize ATS analyzer
    const analyzer = new ATSAnalyzer();

    // Perform ATS analysis
    const analysis = await analyzer.analyzeResumeVsJob(
      resumeContent,
      jobDescription,
    );

    // Get keyword placement suggestions
    const keywordSuggestions = analyzer.getKeywordSuggestions(
      resumeContent,
      analysis.missingKeywords.slice(0, 10), // Top 10 missing keywords
    );

    // Store analysis results in database if resumeId is provided and user is authenticated
    if (resumeId && isAuthenticated) {
      try {
        // Fetch existing chat data first (avoids N+1 query)
        const existingChat = await db.chat.findUnique({
          where: { id: resumeId, userId: session.user.id },
          select: { resumeData: true },
        });

        // Ensure atsAnalysis is fully serializable (no class instances)
        const atsAnalysis = JSON.parse(
          JSON.stringify({
            scores: analysis.scores,
            matchedKeywords: analysis.matchedKeywords,
            missingKeywords: analysis.missingKeywords,
            suggestions: analysis.suggestions,
            analyzedAt: new Date().toISOString(),
          }),
        );

        if (existingChat) {
          await db.chat.update({
            where: {
              id: resumeId,
              userId: session.user.id,
            },
            data: {
              resumeData: {
                ...((existingChat.resumeData as ResumeData) || {}),
                atsAnalysis,
              },
            },
          });
        }
      } catch (dbError) {
        console.warn("Database update failed:", dbError);
        // Continue without DB storage - don't fail the main analysis
      }
    }

    // Calculate insights
    const insights = {
      totalKeywords:
        analysis.matchedKeywords.length + analysis.missingKeywords.length,
      matchPercentage: analysis.scores.keyword,
      topMissingKeywords: analysis.criticalMissingKeywords.slice(0, 5),
      strengthAreas: analysis.strengthAreas,
      improvementAreas: analysis.improvementAreas,
      quickWins: keywordSuggestions
        .filter((suggestion) => suggestion.section === "Skills")
        .slice(0, 3)
        .map((s) => s.keyword),
      industryAlignment: analysis.industryFit,
      competitiveAdvantage:
        analysis.scores.overall > 75
          ? "High"
          : analysis.scores.overall > 60
            ? "Medium"
            : "Low",
    };

    return NextResponse.json({
      success: true,
      analysis: {
        scores: analysis.scores,
        matchedKeywords: analysis.matchedKeywords,
        missingKeywords: analysis.missingKeywords,
        criticalMissingKeywords: analysis.criticalMissingKeywords,
        suggestions: analysis.suggestions,
        industryFit: analysis.industryFit,
        readabilityScore: analysis.readabilityScore,
        semanticSimilarity: analysis.semanticSimilarity,
        keywordDensity: analysis.keywordDensity,
      },
      insights,
      keywordSuggestions,
      metadata: {
        analyzedAt: new Date().toISOString(),
        processingTime: "Real-time analysis completed",
      },
    });
  } catch (error) {
    console.error("ATS Analysis error:", error);

    // Return more specific error information
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const statusCode = errorMessage.includes("Unauthorized")
      ? 401
      : errorMessage.includes("Missing")
        ? 400
        : 500;

    return NextResponse.json(
      {
        error: "ATS analysis failed",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // If not authenticated, return empty analysis history
    if (!session?.user?.id) {
      return NextResponse.json({
        analyses: [],
        total: 0,
        hasMore: false,
        message: "Login required to view analysis history",
      });
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get("resumeId");
    const limit = parseInt(searchParams.get("limit") || "10");

    let analyses = [];

    if (resumeId) {
      // Get analysis for specific resume
      const chat = await db.chat.findUnique({
        where: {
          id: resumeId,
          userId: session.user.id,
        },
        select: {
          id: true,
          title: true,
          resumeData: true,
          updatedAt: true,
        },
      });

      if (chat && chat.resumeData) {
        const resumeData = chat.resumeData as ResumeData;
        if (resumeData.atsAnalysis) {
          analyses = [
            {
              id: chat.id,
              resumeTitle: chat.title,
              analysis: resumeData.atsAnalysis,
              analyzedAt: resumeData.atsAnalysis.analyzedAt || chat.updatedAt,
            },
          ];
        }
      }
    } else {
      // Get recent analyses for user
      const recentChats = await db.chat.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          title: true,
          resumeData: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
      });

      analyses = recentChats
        .filter((chat) => {
          const resumeData = chat.resumeData as ResumeData;
          return resumeData?.atsAnalysis;
        })
        .map((chat) => {
          const resumeData = chat.resumeData as ResumeData;
          return {
            id: chat.id,
            resumeTitle: chat.title,
            analysis: resumeData.atsAnalysis,
            analyzedAt: resumeData.atsAnalysis.analyzedAt || chat.updatedAt,
          };
        });
    }

    return NextResponse.json({
      analyses,
      total: analyses.length,
      hasMore: analyses.length === limit,
    });
  } catch (error) {
    console.error("Get ATS analyses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 },
    );
  }
}
