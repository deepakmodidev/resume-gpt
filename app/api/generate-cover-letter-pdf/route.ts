import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { createElement } = React;
const {
  CoverLetterContent,
} = require("@/components/cover-letter/CoverLetterContent");

async function getBrowser() {
  const isServerless =
    !!process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;
  if (isServerless) {
    const executablePath = await chromium.executablePath();
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 794, height: 1123 },
      executablePath,
      headless: true,
    });
  } else {
    try {
      const localPuppeteer = require("puppeteer");
      return localPuppeteer.launch({
        headless: true,
      });
    } catch {
      console.error(
        "Local puppeteer not found. Install with: npm install --save-dev puppeteer",
      );
      throw new Error(
        "Puppeteer not found for local development. Please install puppeteer as a dev dependency.",
      );
    }
  }
}

export async function POST(request: Request) {
  let browser = null;

  try {
    const { data, template } = await request.json();

    if (!data) {
      return NextResponse.json(
        { error: "Cover letter data is required" },
        { status: 400 },
      );
    }

    const coverLetterHtml = ReactDOMServer.renderToString(
      createElement(CoverLetterContent, { data, template }),
    );

    browser = await getBrowser();
    const page = await browser.newPage();

    await page.setContent(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Cover Letter</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <style>
             body { 
               margin: 0; 
               padding: 0;
             }
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
          </style>
        </head>
        <body>${coverLetterHtml}</body>
      </html>
    `,
      {
        waitUntil: ["domcontentloaded", "networkidle2"],
        timeout: 60000,
      },
    );

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=cover-letter.pdf",
      },
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json(
      { error: "PDF generation failed", details: (error as Error).message },
      { status: 500 },
    );
  } finally {
    if (browser !== null) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
