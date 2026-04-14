"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS, STORAGE_KEYS } from "@/lib/constants";
import { logger } from "@/lib/logger";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Standard API Key Modal for Groq
 * Purged of Gemini legacy code
 */
export const ApiKeyModal = ({
  isOpen,
  onClose,
}: ApiKeyModalProps) => {
  const [groqKey, setGroqKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem(STORAGE_KEYS.GROQ_API_KEY);
      if (storedKey) {
        setHasStoredKey(true);
        setGroqKey(storedKey);
      }
    }
  }, [isOpen]);

  const validateApiKey = async (key: string) => {
    try {
      const response = await apiRequest<{ valid: boolean }>(API_ENDPOINTS.VALIDATE_KEY, {
        method: "POST",
        body: JSON.stringify({ apiKey: key }),
      });
      return !!response?.valid;
    } catch (error) {
      logger.error("Error validating API key:", error);
      return false;
    }
  };

  const handleSave = async () => {
    const key = groqKey.trim();
    if (!key) {
      toast.error("Please enter an API key");
      return;
    }

    if (!key.startsWith("gsk_")) {
      toast.error("Invalid key format. Groq keys start with 'gsk_'");
      return;
    }

    setIsValidating(true);
    try {
      const isValid = await validateApiKey(key);
      if (isValid) {
        localStorage.setItem(STORAGE_KEYS.GROQ_API_KEY, key);
        setHasStoredKey(true);
        toast.success("Groq API key saved!");
        onClose();
      } else {
        toast.error("Invalid Groq API key.");
      }
    } catch {
      toast.error("Validation failed.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    localStorage.removeItem(STORAGE_KEYS.GROQ_API_KEY);
    setGroqKey("");
    setHasStoredKey(false);
    toast.success("Groq API key removed.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Groq API Key
          </DialogTitle>
          <DialogDescription>
            Add your own Groq API key to use your personal quota for chat and generation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
           <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Groq API Key</label>
              {hasStoredKey && (
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase">Active</span>
              )}
            </div>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="pr-10 border-purple-200 focus:ring-purple-500"
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isValidating} className="flex-1 bg-purple-600 hover:bg-purple-700">
                {isValidating ? "Validating..." : (hasStoredKey ? "Update Key" : "Save Key")}
              </Button>
              {hasStoredKey && (
                <Button variant="outline" onClick={handleRemove}>Remove</Button>
              )}
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground p-3 bg-muted rounded-md border border-purple-100 dark:border-purple-900/30">
            <p className="font-semibold mb-1">How to get your key:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Visit the <a href="https://console.groq.com/keys" target="_blank" className="text-purple-600 underline">Groq Cloud Console</a></li>
              <li>Create a new API key</li>
              <li>Copy and paste it above</li>
            </ol>
            <p className="mt-2 opacity-80">Groq provides high-speed inference for Llama models used in this app.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
