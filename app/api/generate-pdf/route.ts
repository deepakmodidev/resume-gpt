import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { createElement } = React;
const { ResumeContent } = require('@/components/resume/ResumeContent');

// Use @sparticuz/chromium to manage the Chromium executable path and version for serverless environments.

// Function to get the appropriate browser instance for both local and Vercel
async function getBrowser() {
  const isServerless = !!process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;
  if (isServerless) {
    // Serverless (e.g., Vercel): use @sparticuz/chromium and puppeteer-core
    const executablePath = await chromium.executablePath();
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 794, height: 1123 }, // A4 size in px at 96dpi
      executablePath,
      headless: true,
    });
  } else {
    // Local development: use Puppeteer's default Chromium
    try {
      const localPuppeteer = require('puppeteer');
      return localPuppeteer.launch({
        headless: true,
      });
    } catch {
      console.error('Local puppeteer not found. Install with: npm install --save-dev puppeteer');
      throw new Error('Puppeteer not found for local development. Please install puppeteer as a dev dependency.');
    }
  }
}

// POST handler for the API route
export async function POST(request: Request) {
  let browser = null; // Ensure browser can be closed in finally block

  try {
    const { data, template } = await request.json();

    if (!data) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 },
      );
    }

    // Render the resume React component to an HTML string
    const resumeHtml = ReactDOMServer.renderToString(
      createElement(ResumeContent, { data, isEditable: false, template }),
    );

    // Launch browser and open a new page
    browser = await getBrowser();
    const page = await browser.newPage();

    // Set the HTML content for the page. Uses CDN Tailwind for styling.
    // If styles are missing in the PDF, consider inlining critical CSS.
    await page.setContent(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Resume</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <style>
             body { margin: 0; }
          </style>
        </head>
        <body>${resumeHtml}</body>
      </html>
    `,
      {
        // Wait for DOM and network to be mostly idle for reliable rendering
        waitUntil: ['domcontentloaded', 'networkidle2'],
        timeout: 60000,
      },
    );

    // Generate the PDF from the rendered page
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, // Ensures backgrounds and images are included
      // margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
      // To add headers/footers, use displayHeaderFooter and headerTemplate/footerTemplate
    });

    // Close the browser instance after PDF generation
    await browser.close();

    // Return the PDF as a downloadable response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=resume.pdf',
      },
    });
  } catch (error) {
    // Log and return error details for debugging
    console.error('PDF Generation Error:', error);
    return NextResponse.json(
      { error: 'PDF generation failed', details: error.message },
      { status: 500 },
    );
  } finally {
    // Always close the browser if it was opened, even on error
    if (browser !== null) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

// Mark the route as dynamic and specify Node.js runtime for serverless compatibility
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
