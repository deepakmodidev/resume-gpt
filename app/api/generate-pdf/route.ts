import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';
import puppeteer from 'puppeteer'; // Used only for local development

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { createElement } = React;
// Assuming '@/components/resume/ResumeContent' is a valid path to your component
const { ResumeContent } = require('@/components/resume/ResumeContent');

// Define a default Chromium URL, though letting @sparticuz/chromium handle it is often best
// const CHROMIUM_URL = "https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar";
// It's generally recommended to let @sparticuz/chromium manage the executable path and version
// unless you have a specific reason to pin it.

// Function to get the appropriate browser instance based on the environment
async function getBrowser() {
  // Check if running on Vercel (VERCEL environment variable is set by Vercel)
  if (process.env.VERCEL) {
    console.log(
      'Running on Vercel, using puppeteer-core with @sparticuz/chromium',
    );
    // Launch puppeteer-core with chromium executable and arguments
    return puppeteerCore.launch({
      args: [
        ...chromium.args, // Recommended arguments from @sparticuz/chromium
        '--disable-web-security',
        '--font-render-hinting=none',
        // Add other necessary args for serverless if needed
        '--no-sandbox', // Required in serverless environments
        '--disable-setuid-sandbox', // Required in serverless environments
      ],
      // Let @sparticuz/chromium find the executable path
      executablePath: await chromium.executablePath(),
      headless: chromium.headless === 'true', // Ensure boolean for Puppeteer
    });
  } else {
    console.log('Running locally, using full puppeteer');
    // Launch full puppeteer for local development
    return puppeteer.launch({
      // Allow custom local paths via environment variable
      executablePath:
        process.env.CHROME_PATH ||
        puppeteer.executablePath() ||
        // Default path for macOS, adjust for other OS if needed
        // Consider using puppeteer.executablePath() here as well for a more robust local setup
        // if you don't want to hardcode paths.
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Recommended args for local
      headless: true, // Run headless locally
    });
  }
}

// POST handler for the API route
export async function POST(request: Request) {
  let browser = null; // Initialize browser variable for finally block

  try {
    const { data, template } = await request.json();

    if (!data) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 },
      );
    }

    // Render the React component to an HTML string
    const resumeHtml = ReactDOMServer.renderToString(
      createElement(ResumeContent, { data, isEditable: false, template }),
    );

    // Get the browser instance based on the environment
    browser = await getBrowser();
    const page = await browser.newPage();

    // Set the content of the page.
    // Note: Relying on a CDN for Tailwind CSS here might have limitations
    // depending on your component's styling. Ensure styles are correctly applied.
    // You might need to inline critical CSS or handle it differently
    // if the CDN approach doesn't fully render your component's styles.
    await page.setContent(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Resume</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <style>
             /* Add any global styles or resets needed for the PDF */
             body { margin: 0; }
          </style>
        </head>
        <body>${resumeHtml}</body>
      </html>
    `,
      {
        // Wait until DOM is loaded and no more than 0 network connections for at least 500ms
        // networkidle0 can sometimes be tricky in serverless; consider networkidle2 or just domcontentloaded
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 60000, // Increased timeout to 60s for potentially longer renders
      },
    );

    // Generate the PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, // Include background colors and images
      // margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
      // // Consider adding displayHeaderFooter and headerTemplate/footerTemplate if needed
    });

    // Close the browser instance
    await browser.close();

    // Return the PDF buffer as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=resume.pdf',
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error); // Log the error for debugging on Vercel
    // Return a JSON error response
    return NextResponse.json(
      { error: 'PDF generation failed', details: error.message }, // Include error message for debugging
      { status: 500 },
    );
  } finally {
    // Ensure the browser is closed even if an error occurs
    if (browser !== null) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

// Ensure the function is treated as dynamic
export const dynamic = 'force-dynamic';
// Specify the Node.js runtime
export const runtime = 'nodejs';
