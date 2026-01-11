"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ApiKeySchema } from "@/lib/validators";
import { STORAGE_KEYS } from "@/lib/constants";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, ExternalLink } from "lucide-react";

export const CartesiaApiKeyModal = () => {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEYS.CARTESIA_API_KEY);
    if (storedKey) {
      setApiKey(storedKey);
      setHasKey(true);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    // Validate API key format
    const validation = ApiKeySchema.safeParse(apiKey.trim());
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    localStorage.setItem(STORAGE_KEYS.CARTESIA_API_KEY, validation.data);
    setHasKey(true);
    toast.success("Cartesia API key saved successfully!");
    setOpen(false);
  };

  const handleRemove = () => {
    localStorage.removeItem(STORAGE_KEYS.CARTESIA_API_KEY);
    setApiKey("");
    setHasKey(false);
  };

  return (
    <>
      <Button
        variant={hasKey ? "outline" : "default"}
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Zap className="h-4 w-4" />
        {hasKey ? "Cartesia Enabled ⚡" : "Enable Fast Voice"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Ultra-Fast Voice (Cartesia)
            </DialogTitle>
            <DialogDescription>
              Enable Cartesia for **10x faster** interview voice responses.
              <br />
              <span className="text-xs text-muted-foreground">
                Cost: ~$0.05/hour | Latency: &lt;200ms
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cartesia-key">Cartesia API Key</Label>
              <Input
                id="cartesia-key"
                type="password"
                placeholder="Enter your Cartesia API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Don't have a key?{" "}
                <a
                  href="https://play.cartesia.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Get one free <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Benefits:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✅ 10x faster than browser voice</li>
                <li>✅ Natural, professional voices</li>
                <li>✅ Streaming audio (starts instantly)</li>
                <li>✅ Works in all browsers</li>
                <li>✅ Very affordable ($0.05/1M chars)</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 p-3 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Your API key is stored locally in your
                browser and never sent to our servers.
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            {hasKey && (
              <Button variant="destructive" size="sm" onClick={handleRemove}>
                Remove Key
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!apiKey.trim()}>
                Save & Enable
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

