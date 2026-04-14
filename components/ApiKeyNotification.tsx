"use client";

import { useState, useEffect } from "react";
import { X, Key, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORAGE_KEYS } from "@/lib/constants";

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
      const userApiKey = localStorage.getItem(STORAGE_KEYS.GROQ_API_KEY);
      setHasApiKey(!!userApiKey);

      const isDismissed = localStorage.getItem(STORAGE_KEYS.API_KEY_NOTIFICATION_DISMISSED);

      // Show notification if no API key AND not dismissed
      if (!userApiKey && !isDismissed) {
        setIsVisible(true);
      }
    };

    checkApiKey();

    const handleStorageChange = () => {
      checkApiKey();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEYS.API_KEY_NOTIFICATION_DISMISSED, "true");
  };

  if (!isVisible || hasApiKey) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 dark:text-purple-200 text-sm">
              Using Shared Groq Key
            </h3>
            <p className="text-purple-800 dark:text-purple-300 text-sm mt-1 leading-relaxed">
              Add your own <strong>Groq API key</strong> for even faster responses and unlimited resume builds.
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={onManageKey}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white h-8"
              >
                <Key className="h-4 w-4 mr-1" />
                Manage Key
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
                className="h-8 border-purple-200 hover:bg-purple-100 text-purple-700"
              >
                Dismiss
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-purple-400 hover:text-purple-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
