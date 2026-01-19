import { NextResponse } from "next/server";
import { requireAuth, isAuthorized } from "@/lib/auth-middleware";
import { validateRequest, PDFRequestSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";
import { generatePDF } from "@/lib/pdf-service";

const { ResumeContent } = require("@/components/resume/ResumeContent");

export async function POST(request: Request) {
  try {
    // Authentication required for PDF generation
    const authResult = await requireAuth();
    if (!isAuthorized(authResult)) {
      return authResult.response;
    }

    const rawData = await request.json();

    // Validate request body
    const validation = validateRequest(PDFRequestSchema, rawData);
    if (!validation.success) {
      const { error } = validation;
      logger.warn("PDF generation validation failed:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    const { data, template } = validation.data;

    // Generate PDF using shared service
    const pdfData = await generatePDF(
      ResumeContent,
      { data, isEditable: false, template },
      {
        title: "Resume",
        filename: "resume.pdf",
      },
    );

    // Convert Uint8Array to Buffer for NextResponse compatibility
    const pdfBuffer = Buffer.from(pdfData);

    // Return the PDF as a downloadable response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resume.pdf",
      },
    });
  } catch (error) {
    logger.error("PDF Generation Error:", error);
    return NextResponse.json(
      {
        error: "PDF generation failed",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
