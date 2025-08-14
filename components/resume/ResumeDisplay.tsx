import React, { useEffect, useState } from 'react';
import { ResumeData } from '@/lib/types';
import { TemplateModal } from './TemplateModal';
import { ResumeContent } from './ResumeContent';
import { LoaderPinwheelIcon } from 'lucide-react';

interface ResumeDisplayProps {
  data: ResumeData;
  handleDataChange: (updater: (draft: ResumeData) => void) => void;
}

export const ResumeDisplay = ({
  data,
  handleDataChange,
}: ResumeDisplayProps) => {
  const [resumeData, setResumeData] = useState<ResumeData>(data);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  // Always start with 'modern' to match SSR, then update from localStorage after mount
  const [currentTemplate, setCurrentTemplate] = useState('modern');
  const [isDownloading, setIsDownloading] = useState(false);

  // On mount, update template from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTemplate = localStorage.getItem('resume-template');
      if (savedTemplate && savedTemplate !== currentTemplate) {
        setCurrentTemplate(savedTemplate);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setResumeData(data);
  }, [data]);

  const handleContentEdit = (key: 'name' | 'title', value: string) => {
    handleDataChange((draft) => {
      draft[key] = value;
    });
  };

  const handleTemplateSelect = (template: string) => {
    setCurrentTemplate(template);
    // Save selected template to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('resume-template', template);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: resumeData, template: currentTemplate }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      document.body.appendChild(a); // Required for Firefox
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Header moved to top */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40 w-full h-16 flex items-center">
        <div className="flex justify-between items-center gap-4 px-4 w-full max-w-5xl mx-auto">
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
            <div className="h-6 w-px bg-border/60" />
            <span className="text-sm text-muted-foreground font-medium">
              {currentTemplate.charAt(0).toUpperCase() +
                currentTemplate.slice(1)}{' '}
              Template
            </span>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className={`flex items-center gap-2 bg-linear-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg transition-all shadow-xs hover:shadow-md font-medium ${isDownloading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:from-green-600 hover:to-green-700 hover:scale-[1.02]'
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
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Resume Content */}
      <div className="px-4 pb-4">
        <ResumeContent
          data={resumeData}
          isEditable={true}
          onContentEdit={handleContentEdit}
          template={currentTemplate}
        />
      </div>

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleTemplateSelect}
        currentTemplate={currentTemplate}
      />
    </div>
  );
};
