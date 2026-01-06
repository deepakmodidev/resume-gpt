"use client";

import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mic, ArrowRight, FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { CartesiaApiKeyModal } from "@/components/CartesiaApiKeyModal";

interface InterviewSetupProps {
  onStart: (resume: string, jd: string) => void;
}

export const InterviewSetup = ({ onStart }: InterviewSetupProps) => {
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [resumeTab, setResumeTab] = useState<"upload" | "paste">("upload");
  const [fileName, setFileName] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Dynamically import the server action if needed, or just standard import
      // Since this is a client component, we import the server action directly
      const { parseResume } = await import("@/app/actions/parse-resume");

      const result = await parseResume(formData);

      if (result.error) {
        toast.error(result.error);
        setFileName("");
      } else {
        setResumeText(result.text || "");
        setFileName(file.name);
        toast.success("Resume parsed successfully!");
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast.error(`Failed to process file: ${(error as Error).message}`);
      setFileName("");
    } finally {
      setIsUploadingFile(false);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-blue-50/50 dark:to-blue-950/20">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
        {/* Left Side: Pitch */}
        <div className="space-y-6 flex flex-col justify-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Ace Your Next <br />
              <span className="text-blue-600 dark:text-blue-400">
                Interview
              </span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Practice with an AI recruiter that speaks, listens, and adapts to
              your specific job role. Prepare for behavioral and technical
              questions in a realistic voice environment.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-card rounded-xl border shadow-xs">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Context-Aware</h3>
                <p className="text-sm text-muted-foreground">
                  Tailored questions based on your resume
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-card rounded-xl border shadow-xs">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <Mic className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold">Voice Interaction</h3>
                <p className="text-sm text-muted-foreground">
                  Speak naturally, no typing required
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <Card className="border-2 shadow-2xl relative overflow-hidden backdrop-blur-xs bg-card/95">
          <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-blue-500 to-cyan-500" />
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-2xl">Setup Interview Context</CardTitle>
            <CardDescription className="text-base">
              Provide your details so the AI can simulate a relevant interview.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* Resume Section with Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  1. Resume Context
                </Label>
                <div className="flex bg-muted/50 p-1 rounded-lg">
                  <button
                    onClick={() => setResumeTab("upload")}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      resumeTab === "upload"
                        ? "bg-background shadow-xs text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => setResumeTab("paste")}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      resumeTab === "paste"
                        ? "bg-background shadow-xs text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              <div className="min-h-[8px]">
                {resumeTab === "upload" ? (
                  <div className="relative group h-full">
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
                      className={`flex flex-row items-center justify-start gap-4 px-4 h-full min-h-[80px] border-2 border-dashed rounded-xl transition-all duration-200 ${
                        isUploadingFile
                          ? "cursor-not-allowed opacity-50 bg-muted/50 border-muted-foreground/25"
                          : fileName
                            ? "border-green-500/50 bg-green-50/50 dark:bg-green-900/10 cursor-pointer hover:bg-green-100/50 dark:hover:bg-green-900/20"
                            : "border-muted-foreground/25 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:border-blue-500/50 hover:shadow-inner"
                      }`}
                    >
                      {isUploadingFile ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <span className="text-sm font-medium text-muted-foreground">
                            Processing...
                          </span>
                        </>
                      ) : fileName ? (
                        <>
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {fileName}
                            </p>
                            <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                              Ready for interview
                            </p>
                          </div>
                          <div className="bg-background/50 p-1.5 rounded-md text-xs text-muted-foreground shadow-xs border">
                            Replace
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Upload className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-foreground">
                              Click to Upload
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              PDF, TXT, RTF
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <Textarea
                    id="resume"
                    placeholder="Paste your full resume content here..."
                    className="h-full min-h-[80px] resize-none text-sm bg-muted/30 focus:bg-background transition-colors"
                    value={resumeText}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      setResumeText(e.target.value)
                    }
                  />
                )}
              </div>
            </div>

            {/* Job Description Section */}
            <div className="space-y-2">
              <Label
                htmlFor="jd"
                className="block mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                2. Job Description (Optional)
              </Label>
              <Textarea
                id="jd"
                placeholder="Paste the job description..."
                className="min-h-[80px] h-[80px] resize-none text-sm bg-muted/30 focus:bg-background transition-colors"
                value={jdText}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setJdText(e.target.value)
                }
              />
            </div>

            <div className="space-y-3">
              <Button
                className="w-full text-lg font-semibold gap-2 shadow-lg hover:shadow-blue-500/20 transition-all transform active:scale-[0.98]"
                size="lg"
                onClick={() => onStart(resumeText, jdText)}
                disabled={!resumeText.trim()}
              >
                Start Interview <ArrowRight className="h-5 w-5" />
              </Button>

              {/* Cartesia Fast Voice Option */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Want 10x faster voice?
                </span>
                <CartesiaApiKeyModal />
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
                💡 Quick Tips:
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
                <li>Speak clearly and naturally</li>
                <li>Click the mic button to stop speaking</li>
                <li>The AI will respond automatically</li>
                <li>Use a quiet environment for best results</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
