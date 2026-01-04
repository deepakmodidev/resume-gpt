"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Key, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiApiKeyModal = ({
  isOpen,
  onClose,
}: GeminiApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Check if user already has a stored API key
      const storedKey = localStorage.getItem("gemini-api-key");
      if (storedKey) {
        setHasStoredKey(true);
        setApiKey(storedKey);
      }
    }
  }, [isOpen]);

  const validateApiKey = async (key: string) => {
    try {
      const response = await fetch("/api/validate-gemini-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: key }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error validating API key:", error);
      return false;
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    if (!apiKey.startsWith("AIza")) {
      toast.error("Invalid Gemini API key format");
      return;
    }

    setIsValidating(true);

    try {
      const isValid = await validateApiKey(apiKey);

      if (isValid) {
        localStorage.setItem("gemini-api-key", apiKey);
        setHasStoredKey(true);
        toast.success("API key saved successfully!");
        onClose();
      } else {
        toast.error("Invalid API key. Please check your key and try again.");
      }
    } catch {
      toast.error("Failed to validate API key. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    localStorage.removeItem("gemini-api-key");
    setApiKey("");
    setHasStoredKey(false);
    toast.success("API key removed successfully!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Gemini API Key
          </DialogTitle>
          <DialogDescription>
            Add your own Gemini API key to use your quota instead of the shared one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          {hasStoredKey && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-200">
                API key is configured and active
              </span>
            </div>
          )}

          {/* API Key Input */}
          <div className="space-y-2">
            <label
              htmlFor="apiKey"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Gemini API Key
            </label>
            <div className="relative mt-2">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isValidating}
              className="flex-1"
            >
              {isValidating
                ? "Validating..."
                : hasStoredKey
                  ? "Update Key"
                  : "Save Key"}
            </Button>

            {hasStoredKey && (
              <Button
                variant="outline"
                onClick={handleRemove}
                className="flex-1"
              >
                Remove Key
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Note:</strong> Ensure your API key has access to Gemini 3 Flash Preview.
            </p>
            <p>
              <strong>How to get your API key:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>
                Visit{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-500 hover:text-blue-600"
                >
                  Google AI Studio
                </a>
              </li>
              <li>Sign in with your Google account</li>
              <li>Click &quot;Get API Key&quot;</li>
              <li>Create a new API key</li>
              <li>Copy and paste it above</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
