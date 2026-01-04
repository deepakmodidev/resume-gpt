"use client";

import React, { useState } from "react";
import { CoverLetterData } from "@/lib/types";
import { CoverLetterContent } from "./CoverLetterContent";
import { CoverLetterTemplateModal } from "./CoverLetterTemplateModal";
import { LoaderPinwheelIcon } from "lucide-react";

interface CoverLetterDisplayProps {
    data: CoverLetterData;
}

export const CoverLetterDisplay = ({ data }: CoverLetterDisplayProps) => {
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState("modern");
    const [isDownloading, setIsDownloading] = useState(false);

    const handleTemplateSelect = (template: string) => {
        setCurrentTemplate(template);
        if (typeof window !== "undefined") {
            localStorage.setItem("cover-letter-template", template);
        }
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch("/api/generate-cover-letter-pdf", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ data, template: currentTemplate }),
            });

            if (!response.ok) {
                throw new Error(`Failed to generate PDF: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            // Generate filename from sender name: "Full_Name_Cover_Letter.pdf"
            const senderName = data.senderName || "Cover_Letter";
            const fileName = senderName.trim().replace(/\s+/g, "_") + "_Cover_Letter.pdf";
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading PDF:", error);
            alert("Failed to download PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    // Check if cover letter has content
    const hasContent = data.opening || data.body || data.closing;

    if (!hasContent) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center p-8">
                    <svg
                        className="w-16 h-16 mx-auto mb-4 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="text-lg font-medium">No Cover Letter Yet</p>
                    <p className="text-sm mt-1">
                        Fill in the job details and generate your cover letter
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Action Buttons */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 w-full">
                <div className="flex justify-end items-center gap-3 px-4 py-3">
                    <button
                        onClick={() => setIsTemplateModalOpen(true)}
                        className="text-white flex items-center gap-2 bg-linear-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-lg hover:bg-primary/90 transition-all shadow-xs hover:shadow-md font-medium"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                            />
                        </svg>
                        Templates
                    </button>

                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className={`flex items-center gap-2 bg-linear-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg transition-all shadow-xs hover:shadow-md font-medium ${isDownloading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:from-green-600 hover:to-green-700 hover:scale-[1.02]"
                            }`}
                    >
                        {isDownloading ? (
                            <LoaderPinwheelIcon className="w-4 h-4 animate-spin" />
                        ) : (
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                        )}
                        {isDownloading ? "Downloading..." : "Download PDF"}
                    </button>
                </div>
            </div>

            {/* Cover Letter Preview */}
            <div className="flex-1 overflow-auto px-4 pb-4">
                <CoverLetterContent data={data} template={currentTemplate} />
            </div>

            <CoverLetterTemplateModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onSelectTemplate={handleTemplateSelect}
                currentTemplate={currentTemplate}
            />
        </div>
    );
};
