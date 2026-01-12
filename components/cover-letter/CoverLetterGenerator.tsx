"use client";

import React, { useState } from "react";
import { CoverLetterData, ResumeData } from "@/lib/types";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { CoverLetterDisplay } from "./CoverLetterDisplay";
import {
  Sparkles,
  Loader2,
  FileText,
  Building2,
  User,
  Briefcase,
  Upload,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface CoverLetterGeneratorProps {
  initialResumeData?: ResumeData;
}

const defaultResumeData: ResumeData = {
  name: "",
  title: "",
  contact: {
    email: "",
    phone: "",
    location: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  achievements: [],
};

export const CoverLetterGenerator = ({
  initialResumeData,
}: CoverLetterGeneratorProps) => {
  const [resumeContent, setResumeContent] = useState("");
  const [resumeData, setResumeData] = useState<ResumeData>(
    initialResumeData || defaultResumeData
  );
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [tone, setTone] = useState<
    "professional" | "friendly" | "enthusiastic"
  >("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverLetterData, setCoverLetterData] =
    useState<CoverLetterData | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Import server action
      const { parseResume: parseResumeAction } =
        await import("@/app/actions/parse-resume");

      const result = await parseResumeAction(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        const text = result.text || "";
        setResumeContent(text);
        // Parse basic info from resume text
        parseResumeFromText(text);
        toast.success("Resume parsed successfully!");
      }
    } catch (error) {
      logger.error("File upload error:", error);
      toast.error(`Failed to process file: ${(error as Error).message}`);
    } finally {
      setIsUploadingFile(false);
      event.target.value = ""; // Reset input
    }
  };

  // Basic parsing of resume text to extract name, email, phone
  const parseResumeFromText = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());

    // Extract name - look for a short line (likely the name) before email
    // Limit to first 100 chars to avoid validation errors
    let name = "";
    for (const line of lines.slice(0, 5)) {
      // Check first 5 lines
      const trimmedLine = line.trim();
      // Name is typically short (2-4 words, < 50 chars) and doesn't contain common resume keywords
      if (
        trimmedLine.length < 50 &&
        trimmedLine.length > 2 &&
        !/EXPERIENCE|EDUCATION|SKILLS|SUMMARY|PROFILE|PROJECTS|CONTACT/i.test(
          trimmedLine
        )
      ) {
        name = trimmedLine;
        break;
      }
    }

    // Extract email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : "";

    // Extract phone
    const phoneMatch = text.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{7,}/);
    const phone = phoneMatch ? phoneMatch[0] : "";

    // Extract location (common patterns)
    const locationMatch =
      text.match(/(?:Location|Address|City)[:\s]*([^\n]+)/i) ||
      text.match(/([A-Za-z\s]+,\s*[A-Z]{2})/);
    const location = locationMatch ? locationMatch[1]?.trim() : "";

    setResumeData({
      ...defaultResumeData,
      name,
      contact: {
        email,
        phone,
        location,
      },
      summary: text.substring(0, 500), // Use first 500 chars as summary context
    });
  };

  const handleGenerate = async () => {
    if (!companyName.trim()) {
      setError("Please enter the company name");
      return;
    }
    if (!jobTitle.trim()) {
      setError("Please enter the job title");
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      // Prepare data - ensure name is not too long for validation
      const dataToSend = {
        ...resumeData,
        name: resumeData.name?.substring(0, 100) || "Applicant", // Truncate to 100 chars max
        ...(resumeContent && { rawContent: resumeContent }),
      };

      const data = await apiRequest<{ coverLetterData: any }>(
        API_ENDPOINTS.COVER_LETTER,
        {
          method: "POST",
          body: JSON.stringify({
            resumeData: dataToSend,
            jobDescription: jobDescription.trim() || undefined,
            companyName,
            jobTitle,
            recipientName: recipientName || undefined,
            tone,
          }),
        }
      );

      setCoverLetterData(data.coverLetterData);
      setHasGenerated(true);
      toast.success("Cover letter generated!");
    } catch (err) {
      logger.error("Cover letter generation error", err as Error);
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      {/* Left Panel - Form (2/5 width) */}
      <div className="flex flex-col h-full min-h-0 w-full md:w-2/5">
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-border">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">AI Cover Letter Generator</h1>
                <p className="text-sm text-muted-foreground">
                  Generate a tailored cover letter in seconds
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              {/* Resume Upload Section */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Your Resume
                </Label>

                {/* File Upload */}
                <div className="relative">
                  <input
                    type="file"
                    accept=".txt,.pdf,.rtf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                    disabled={isUploadingFile}
                  />
                  <label
                    htmlFor="resume-upload"
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg transition-colors ${
                      isUploadingFile
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:bg-muted/50 hover:border-primary/50"
                    }`}
                  >
                    {isUploadingFile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Processing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Upload Resume (TXT/PDF/RTF)
                        </span>
                      </>
                    )}
                  </label>
                </div>

                {/* Resume content indicator */}
                {resumeContent && (
                  <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      Resume uploaded ({resumeContent.length} chars)
                    </span>
                  </div>
                )}

                <textarea
                  className="w-full min-h-25 px-3 py-2.5 text-sm rounded-lg border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                  placeholder="Or paste your resume content here..."
                  value={resumeContent}
                  onChange={(e) => {
                    setResumeContent(e.target.value);
                    parseResumeFromText(e.target.value);
                  }}
                />
              </div>

              {/* Job Title & Company - Side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="jobTitle"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    Job Title *
                  </Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="companyName"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Company *
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Hiring Manager */}
              <div className="space-y-2">
                <Label
                  htmlFor="recipientName"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  Hiring Manager
                  <span className="text-xs text-muted-foreground">
                    (Optional)
                  </span>
                </Label>
                <Input
                  id="recipientName"
                  placeholder="e.g., Jane Smith"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Mic className="w-4 h-4 text-muted-foreground" />
                  Tone
                </Label>
                <Select
                  value={tone}
                  onValueChange={(value: typeof tone) => setTone(value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <Label
                  htmlFor="jobDescription"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Job Description
                  <span className="text-xs text-muted-foreground">
                    (Optional)
                  </span>
                </Label>
                <textarea
                  id="jobDescription"
                  className="w-full min-h-25 px-3 py-2.5 text-sm rounded-lg border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                  placeholder="Paste job description for tailored letter, or leave empty for general letter..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-9 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-sm shadow-md shadow-blue-500/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Preview (3/5 width, always visible) */}
      <div className="hidden md:flex flex-col h-full min-h-0 overflow-hidden bg-card border-l border-border w-3/5">
        <ScrollArea className="flex-1 min-h-0">
          {coverLetterData ? (
            <CoverLetterDisplay data={coverLetterData} />
          ) : (
            <div className="flex items-center justify-center h-full min-h-125 text-center p-10">
              <div className="text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Preview</p>
                <p className="text-sm mt-1">
                  Your cover letter will appear here
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
