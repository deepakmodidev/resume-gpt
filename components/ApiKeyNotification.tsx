"use client";

import { useState, useEffect } from "react";
import { X, Key, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiKeyNotificationProps {
  onManageKey?: () => void;
}

export const ApiKeyNotification = ({
  onManageKey,
}: ApiKeyNotificationProps) => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkApiKey = () => {
      const userApiKey = localStorage.getItem("gemini-api-key");

      setHasApiKey(!!userApiKey);

      // Show notification if no API key (will show on every refresh)
      const isDismissed = localStorage.getItem("api-key-notification-dismissed");

      // Show notification if no API key AND not dismissed
      if (!userApiKey && !isDismissed) {
        setIsVisible(true);
      }
    };

    checkApiKey();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkApiKey();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("api-key-notification-dismissed", "true");
  };

  if (!isVisible || hasApiKey) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 text-sm">
              Using Shared API Key
            </h3>
            <p className="text-blue-800 dark:text-blue-300 text-sm mt-1">
              Add your own Gemini API key to avoid rate limits and get better
              performance.
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={onManageKey}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Key className="h-4 w-4 mr-1" />
                Add API Key
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
                className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/30"
              >
                Dismiss
              </Button>
            </div>
          </div>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
