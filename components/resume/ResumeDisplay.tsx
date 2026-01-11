import React, { useState } from "react";
import { ResumeData } from "@/lib/types";
import { API_ENDPOINTS, STORAGE_KEYS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { TemplateModal } from "./TemplateModal";
import { ResumeContent } from "./ResumeContent";
import { ATSScore } from "@/components/ats/ATSScore";
import { LoaderPinwheelIcon, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResumeDisplayProps {
  data: ResumeData;
  handleDataChange: (updater: (draft: ResumeData) => void) => void;
}

export const ResumeDisplay = ({
  data,
  handleDataChange,
}: ResumeDisplayProps) => {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  // Always start with 'modern' to match SSR, then update from localStorage after mount
  const [currentTemplate, setCurrentTemplate] = useState("modern");
  const [isDownloading, setIsDownloading] = useState(false);

  // On mount, update template from localStorage if available
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTemplate = localStorage.getItem(STORAGE_KEYS.RESUME_TEMPLATE);
      if (savedTemplate && savedTemplate !== currentTemplate) {
        setCurrentTemplate(savedTemplate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContentEdit = (key: "name" | "title", value: string) => {
    handleDataChange((draft) => {
      draft[key] = value;
    });
  };

  const handleTemplateSelect = (template: string) => {
    setCurrentTemplate(template);
    // Save selected template to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.RESUME_TEMPLATE, template);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(API_ENDPOINTS.PDF, {
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
      a.download = "resume.pdf";
      document.body.appendChild(a); // Required for Firefox
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      logger.error("PDF download error", error as Error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="resume" className="h-full flex flex-col">
        {/* Tab Navigation Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 w-full">
          <div className="flex justify-between items-center gap-4 px-4 py-3 max-w-5xl mx-auto">
            {/* Tab List */}
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="resume" className="flex items-center gap-2">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Resume
              </TabsTrigger>
              <TabsTrigger value="ats" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                ATS Analysis
              </TabsTrigger>
            </TabsList>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
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
                className={`flex items-center gap-2 bg-linear-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg transition-all shadow-xs hover:shadow-md font-medium ${
                  isDownloading
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
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {/* Resume Tab */}
          <TabsContent value="resume" className="mt-0 h-full">
            <div className="px-4 pb-4 max-w-5xl mx-auto">
              <ResumeContent
                data={data}
                isEditable={true}
                onContentEdit={handleContentEdit}
                template={currentTemplate}
              />
            </div>
          </TabsContent>

          {/* ATS Analysis Tab */}
          <TabsContent value="ats" className="mt-0 h-full">
            <div className="p-4 max-w-5xl mx-auto">
              <Card className="mb-4">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        ATS Score Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Get AI-powered insights on how your resume performs
                        against job requirements
                      </p>
                    </div>
                  </div>

                  <ATSScore
                    resumeContent={
                      `${data.name || ""}\n${data.title || ""}\n` +
                      `${data.contact?.email || ""} ${data.contact?.phone || ""}\n` +
                      `${data.summary || ""}\n` +
                      `${data.experience?.map((exp) => `${exp.title} at ${exp.company}\n${exp.description}`).join("\n") || ""}\n` +
                      `${data.education?.map((edu) => `${edu.degree} - ${edu.institution}`).join("\n") || ""}\n` +
                      `${data.skills?.join(", ") || ""}\n` +
                      `${data.projects?.map((proj) => `${proj.name}: ${proj.description}`).join("\n") || ""}`
                    }
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleTemplateSelect}
        currentTemplate={currentTemplate}
      />
    </div>
  );
};
