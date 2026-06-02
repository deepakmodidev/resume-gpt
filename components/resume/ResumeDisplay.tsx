import React, { useState } from "react";
import { toast } from "sonner";
import { ResumeData } from "@/lib/types";
import { API_ENDPOINTS, STORAGE_KEYS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { normalizeForHash, resumeToText } from "@/lib/utils";
import {
  existingHashes,
  ingestProfile,
  removeFromPool,
} from "@/app/actions/talent";
import { TemplateModal } from "./TemplateModal";
import { ResumeContent } from "./ResumeContent";
import { ATSScore } from "@/components/ats/ATSScore";
import {
  LoaderPinwheelIcon,
  Target,
  FileText,
  LayoutTemplate,
  Download,
  UserPlus,
  Check,
  ScanSearch,
  Trash2,
} from "lucide-react";

const MIN_POOL_TEXT_LEN = 50;

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(s),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
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
  const [poolState, setPoolState] = useState<
    "idle" | "working" | "added" | "exists" | "removing"
  >("idle");

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

  const handleAddToPool = async () => {
    if (poolState === "working") return;
    setPoolState("working");
    const toastId = toast.loading("Adding to talent pool…");
    try {
      const text = resumeToText(data);
      if (text.trim().length < MIN_POOL_TEXT_LEN) {
        toast.error("Add more resume content before sharing to the pool.", {
          id: toastId,
        });
        setPoolState("idle");
        return;
      }

      const hash = await sha256Hex(normalizeForHash(text));
      const existing = await existingHashes([hash]);
      if (existing.includes(hash)) {
        toast.success("This resume is already in the talent pool.", {
          id: toastId,
        });
        setPoolState("exists");
        return;
      }

      toast.loading("Preparing AI engine (one-time model load)…", {
        id: toastId,
      });
      const { embedPassage } = await import("@/lib/ai/worker-client");
      const vector = await embedPassage(text);

      toast.loading("Saving to talent pool…", { id: toastId });
      const res = await ingestProfile(text, vector);
      if (res.ok) {
        toast.success("Added to the talent pool — recruiters can find you now.", {
          id: toastId,
        });
        setPoolState("added");
      } else {
        toast.error(res.error ?? "Could not add to talent pool.", {
          id: toastId,
        });
        setPoolState("idle");
      }
    } catch (error) {
      logger.error("Add to talent pool failed", error as Error);
      toast.error(
        error instanceof Error ? error.message : "Could not add to talent pool.",
        { id: toastId },
      );
      setPoolState("idle");
    }
  };

  const handleRemoveFromPool = async () => {
    if (poolState === "removing") return;
    setPoolState("removing");
    const toastId = toast.loading("Removing from talent pool…");
    try {
      const text = resumeToText(data);
      const hash = await sha256Hex(normalizeForHash(text));
      const res = await removeFromPool(hash);
      if (res.ok) {
        if (res.deleted === 0) {
          toast.warning(
            "This version isn't in the pool — it may have changed since you added it.",
            { id: toastId },
          );
        } else {
          toast.success("Removed from the talent pool.", { id: toastId });
        }
        setPoolState("idle");
      } else {
        toast.error(res.error ?? "Could not remove from pool.", {
          id: toastId,
        });
        setPoolState("exists");
      }
    } catch (error) {
      logger.error("Remove from talent pool failed", error as Error);
      toast.error(
        error instanceof Error ? error.message : "Could not remove from pool.",
        { id: toastId },
      );
      setPoolState("exists");
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
                <FileText className="w-4 h-4 shrink-0" />
                Resume
              </TabsTrigger>
              <TabsTrigger value="ats" className="flex items-center gap-2">
                <ScanSearch className="w-4 h-4 shrink-0" />
                ATS Analysis
              </TabsTrigger>
            </TabsList>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {poolState === "added" ||
              poolState === "exists" ||
              poolState === "removing" ? (
                <Button
                  variant="outline"
                  onClick={handleRemoveFromPool}
                  disabled={poolState === "removing"}
                  title="Remove this resume from the talent pool"
                  className="group gap-2 rounded-lg shadow-xs hover:shadow-md bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-950/30 dark:hover:text-red-300 dark:hover:border-red-800"
                >
                  {poolState === "removing" ? (
                    <>
                      <LoaderPinwheelIcon className="animate-spin" />
                      <span>Removing…</span>
                    </>
                  ) : (
                    <>
                      <Check className="group-hover:hidden" />
                      <Trash2 className="hidden group-hover:inline-block" />
                      <span className="group-hover:hidden">In talent pool</span>
                      <span className="hidden group-hover:inline-block">
                        Remove from pool
                      </span>
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleAddToPool}
                  disabled={poolState === "working"}
                  title="Make this resume searchable by recruiters in the talent pool"
                  className="gap-2 rounded-lg shadow-xs hover:shadow-md text-white bg-linear-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 hover:scale-[1.02]"
                >
                  {poolState === "working" ? (
                    <LoaderPinwheelIcon className="animate-spin" />
                  ) : (
                    <UserPlus />
                  )}
                  <span>
                    {poolState === "working" ? "Adding…" : "Add to talent pool"}
                  </span>
                </Button>
              )}

              <Button
                onClick={() => setIsTemplateModalOpen(true)}
                className="gap-2 rounded-lg shadow-xs hover:shadow-md text-white bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02]"
              >
                <LayoutTemplate />
                <span>Templates</span>
              </Button>

              <Button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="gap-2 rounded-lg shadow-xs hover:shadow-md text-white bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-[1.02]"
              >
                {isDownloading ? (
                  <LoaderPinwheelIcon className="animate-spin" />
                ) : (
                  <Download />
                )}
                <span>{isDownloading ? "Downloading..." : "Download PDF"}</span>
              </Button>
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
                isEditable={false}
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
                      `${(Array.isArray(data.skills) ? data.skills : []).join(", ") || ""}\n` +
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
