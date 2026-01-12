import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import type { Browser } from "puppeteer-core";
import { logger } from "@/lib/logger";

const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { createElement } = React;

/**
 * Shared PDF Generation Service
 * Eliminates duplication between resume and cover letter PDF generation
 */

interface PDFOptions {
    title: string;
    filename: string;
    customStyles?: string;
}

/**
 * Get the appropriate browser instance for both local and serverless environments
 */
async function getBrowser(): Promise<Browser> {
    const isServerless =
        !!process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;

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
            const localPuppeteer = require("puppeteer");
            return localPuppeteer.launch({
                headless: true,
            });
        } catch {
            logger.error(
                "Local puppeteer not found. Install with: npm install --save-dev puppeteer"
            );
            throw new Error(
                "Puppeteer not found for local development. Please install puppeteer as a dev dependency."
            );
        }
    }
}

/**
 * Generate PDF from a React component
 * @param component - React component to render (e.g., ResumeContent, CoverLetterContent)
 * @param props - Props to pass to the component
 * @param options - PDF generation options (title, filename, custom styles)
 * @returns PDF buffer
 */
export async function generatePDF(
    component: any,
    props: Record<string, any>,
    options: PDFOptions
): Promise<Uint8Array> {
    let browser: Browser | null = null;

    try {
        // Render the React component to an HTML string
        const componentHtml = ReactDOMServer.renderToString(
            createElement(component, props)
        );

        // Launch browser and open a new page
        browser = await getBrowser();
        const page = await browser.newPage();

        // Default styles for all PDFs
        const defaultStyles = `
      body { 
        margin: 0; 
        padding: 0;
      }
    `;

        // Set the HTML content for the page. Uses CDN Tailwind for styling.
        await page.setContent(
            `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${options.title}</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <style>
            ${defaultStyles}
            ${options.customStyles || ""}
          </style>
        </head>
        <body>${componentHtml}</body>
      </html>
    `,
            {
                // Wait for DOM and network to be mostly idle for reliable rendering
                waitUntil: ["domcontentloaded", "networkidle2"],
                timeout: 60000,
            }
        );

        // Generate the PDF from the rendered page
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true, // Ensures backgrounds and images are included
        });

        // Close the browser instance after PDF generation
        await browser.close();

        return pdfBuffer;
    } catch (error) {
        logger.error("PDF Generation Error:", error);
        throw error;
    } finally {
        // Always close the browser if it was opened, even on error
        if (browser !== null) {
            try {
                await browser.close();
            } catch (closeError) {
                logger.error("Error closing browser:", closeError);
            }
        }
    }
}
