import Image from "next/image";
import React from "react";

interface CoverLetterTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: string) => void;
  currentTemplate?: string;
}

const templates = [
  { id: "modern", name: "Modern", preview: "/templates/modern.webp" },
  { id: "minimal", name: "Minimal", preview: "/templates/minimal.webp" },
  { id: "classic", name: "Classic", preview: "/templates/classic.webp" },
  {
    id: "professional",
    name: "Professional",
    preview: "/templates/professional.webp",
  },
  { id: "executive", name: "Executive", preview: "/templates/executive.webp" },
  { id: "corporate", name: "Corporate", preview: "/templates/corporate.webp" },
  { id: "techie", name: "Techie", preview: "/templates/techie.webp" },
  { id: "elegant", name: "Elegant", preview: "/templates/elegant.webp" },
  { id: "creative", name: "Creative", preview: "/templates/creative.webp" },
  { id: "artistic", name: "Artistic", preview: "/templates/artistic.webp" },
];

export const CoverLetterTemplateModal = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentTemplate = "modern",
}: CoverLetterTemplateModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-background text-foreground border border-border rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">
            Choose Template
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-md p-1 hover:bg-accent"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          <div className="flex gap-6 pb-4">
            {templates.map((template, index) => (
              <div
                key={template.id}
                className={`shrink-0 border rounded-lg p-4 cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 bg-card relative ${
                  currentTemplate === template.id
                    ? "border-primary shadow-lg ring-2 ring-primary/20"
                    : "border-border"
                }`}
                onClick={() => {
                  onSelectTemplate(template.id);
                  onClose();
                }}
              >
                <div className="absolute top-2 left-2 z-10">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold ${
                      currentTemplate === template.id
                        ? "bg-primary text-white"
                        : "bg-muted text-white"
                    }`}
                  >
                    {currentTemplate === template.id ? "✓" : index + 1}
                  </span>
                </div>
                <Image
                  height={1000}
                  width={1000}
                  src={template.preview}
                  alt={template.name}
                  className="w-64 h-auto object-contain mb-3 rounded-md border border-border"
                />
                <p
                  className={`text-center font-medium w-64 ${
                    currentTemplate === template.id
                      ? "text-primary font-semibold"
                      : "text-card-foreground"
                  }`}
                >
                  {template.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
