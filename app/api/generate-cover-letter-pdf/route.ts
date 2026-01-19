import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { generatePDF } from "@/lib/pdf-service";

const {
  CoverLetterContent,
} = require("@/components/cover-letter/CoverLetterContent");

export async function POST(request: Request) {
  try {
    const rawData = await request.json();

    if (!rawData.data) {
      return NextResponse.json(
        { error: "Cover letter data is required" },
        { status: 400 },
      );
    }

    const { data, template } = rawData;

    // PDF-specific styles to remove visual artifacts
    const customStyles = `
      /* PDF-specific overrides - remove visual artifacts */
      [class*="rounded"] { border-radius: 0 !important; }
      [class*="shadow"] { box-shadow: none !important; }
      [class*="max-w"] { max-width: 100% !important; }
      [class*="mx-auto"] { margin-left: 0 !important; margin-right: 0 !important; }
      [class*="border-l-"] { border-left: none !important; }
      [class*="border-t-"] { border-top: none !important; }
      [class*="border-2"] { border: none !important; }
      /* Ensure full width and clean background */
      .template-modern, .template-classic, .template-minimal, 
      .template-creative, .template-professional, .template-elegant,
      .template-executive, .template-techie, .template-artistic, 
      .template-corporate {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }
    `;

    // Generate PDF using shared service
    const pdfData = await generatePDF(
      CoverLetterContent,
      { data, template },
      {
        title: "Cover Letter",
        filename: "cover-letter.pdf",
        customStyles,
      },
    );

    // Convert Uint8Array to Buffer for NextResponse compatibility
    const pdfBuffer = Buffer.from(pdfData);

    // Return the PDF as a downloadable response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=cover-letter.pdf",
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
