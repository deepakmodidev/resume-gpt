'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Target, Sparkles, ArrowRight, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ATSResults } from '@/components/ats/ATSResults';
import { DotPattern } from '@/components/ui/dot-pattern';
import { Header } from '@/components/home/Header';
import { Footer } from '@/components/home/Footer';
import { motion } from 'framer-motion';

interface ATSAnalysisResult {
    scores: {
        overall: number;
        keyword: number;
        format: number;
        content: number;
        semantic: number;
    };
    matchedKeywords: string[];
    missingKeywords: string[];
    criticalMissingKeywords: string[];
    suggestions: string[];
    industryFit: number;
    readabilityScore: number;
    semanticSimilarity: number;
    keywordDensity: number;
}

export default function ATSAnalysisPage() {
    const [resumeContent, setResumeContent] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);

    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            console.log('📄 Starting PDF extraction for file:', file.name, 'Size:', file.size);

            // Dynamic import PDF.js to avoid SSR issues
            const pdfjsLib = await import('pdfjs-dist');

            // Set up worker options - use local worker file
            pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

            const arrayBuffer = await file.arrayBuffer();
            console.log('📦 ArrayBuffer created, size:', arrayBuffer.byteLength);

            // Configure PDF.js with options
            const loadingTask = pdfjsLib.getDocument({
                data: arrayBuffer,
                useWorkerFetch: false,
                isEvalSupported: false,
                useSystemFonts: true
            });

            const pdf = await loadingTask.promise;
            console.log('📖 PDF loaded, pages:', pdf.numPages);

            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                console.log(`📃 Processing page ${i}/${pdf.numPages}`);
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item) => {
                        if ('str' in item) {
                            return item.str;
                        }
                        return '';
                    })
                    .join(' ');
                fullText += pageText + '\n';
                console.log(`✅ Page ${i} extracted, text length:`, pageText.length);
            }

            console.log('🎉 PDF extraction complete, total text length:', fullText.length);
            return fullText.trim();
        } catch (error) {
            console.error('❌ PDF parsing error details:', error);

            // Fallback: try with a different approach
            if (error.message?.includes('GlobalWorkerOptions.workerSrc') || error.message?.includes('worker')) {
                console.log('🔄 Retrying with different worker configuration...');
                try {
                    const pdfjsLib = await import('pdfjs-dist');

                    // Try with a CDN worker as fallback
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

                    const arrayBuffer = await file.arrayBuffer();
                    const loadingTask = pdfjsLib.getDocument({
                        data: arrayBuffer,
                        useWorkerFetch: false,
                        isEvalSupported: false
                    });

                    const pdf = await loadingTask.promise;
                    let fullText = '';

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items
                            .map((item) => {
                                if ('str' in item) {
                                    return item.str;
                                }
                                return '';
                            })
                            .join(' ');
                        fullText += pageText + '\n';
                    }

                    console.log('✅ PDF extraction successful with CDN worker');
                    return fullText.trim();
                } catch (fallbackError) {
                    console.error('❌ Fallback PDF parsing also failed:', fallbackError);
                    throw new Error(`Failed to parse PDF file. Please try saving your PDF as text and uploading a .txt file instead.`);
                }
            }

            throw new Error(`Failed to parse PDF file: ${error.message}`);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        console.log('📁 File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
        setIsUploadingFile(true);

        try {
            if (file.type === 'text/plain' || file.type === 'text/rtf' || file.name.endsWith('.rtf')) {
                console.log('📝 Processing text/RTF file');
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target?.result as string;
                    // Basic RTF to text conversion (removes RTF formatting)
                    const cleanContent = content.replace(/\\[a-z]+\d*\s?/g, '').replace(/[{}]/g, '');
                    setResumeContent(cleanContent);
                    toast.success('Resume uploaded successfully!');
                    setIsUploadingFile(false);
                };
                reader.onerror = (e) => {
                    console.error('FileReader error:', e);
                    toast.error('Failed to read file');
                    setIsUploadingFile(false);
                };
                reader.readAsText(file);
            } else if (file.type === 'application/pdf') {
                console.log('📄 Processing PDF file');
                toast.info('Parsing PDF...');
                const pdfText = await extractTextFromPDF(file);
                setResumeContent(pdfText);
                toast.success('PDF resume parsed successfully!');
            } else {
                console.warn('❌ Unsupported file type:', file.type);
                toast.error('Please upload a supported file format: TXT, PDF, or RTF.');
            }
        } catch (error) {
            console.error('❌ File upload error:', error);
            toast.error(`Failed to process file: ${error.message}`);
        } finally {
            setIsUploadingFile(false);
        }
    };

    const handleAnalysis = async () => {
        if (!resumeContent.trim() || !jobDescription.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/ats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resumeContent,
                    jobDescription
                }),
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            setAnalysisResult(data.analysis);
            toast.success('ATS analysis completed!');
        } catch (error) {
            console.error('Analysis error:', error);
            toast.error('Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
            <Header />

            {/* Background Pattern */}
            <DotPattern
                width={20}
                height={20}
                cx={1}
                cy={1}
                cr={1}
                className="fill-blue-500/20 dark:fill-blue-400/20"
            />

            <div className="relative z-10 pt-24 pb-20">
                <div className="container mx-auto px-4">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
                            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Powered by GenAI & RAG Pipeline
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-6">
                            ATS Resume Analyzer
                        </h1>

                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
                            Get instant ATS compatibility scores and optimization suggestions using advanced AI analysis.
                            Upload your resume and job description to discover how to beat the ATS systems.
                        </p>

                        <div className="flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Real-time Scoring
                            </div>
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Keyword Analysis
                            </div>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                AI Suggestions
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Input Section */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <Card className="h-full backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-slate-200/60 dark:border-slate-700/60">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            Upload & Analyze
                                        </CardTitle>
                                        <CardDescription>
                                            Provide your resume and target job details for comprehensive ATS analysis
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Resume Upload */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Resume Content *
                                            </label>
                                            <div className="space-y-3">
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
                                                        className={`flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg transition-colors ${isUploadingFile
                                                            ? 'cursor-not-allowed opacity-50'
                                                            : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800'
                                                            }`}
                                                    >
                                                        {isUploadingFile ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="w-4 h-4" />
                                                                Upload Resume (TXT/PDF/RTF)
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                                <div className="text-center text-sm text-slate-500">or</div>
                                                <Textarea
                                                    placeholder="Paste your resume content here..."
                                                    value={resumeContent}
                                                    onChange={(e) => setResumeContent(e.target.value)}
                                                    className="min-h-[200px] resize-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Job Description */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Job Description *
                                            </label>
                                            <Textarea
                                                placeholder="Paste the full job description here..."
                                                value={jobDescription}
                                                onChange={(e) => setJobDescription(e.target.value)}
                                                className="min-h-[150px] resize-none"
                                            />
                                        </div>

                                        {/* Analyze Button */}
                                        <Button
                                            onClick={handleAnalysis}
                                            disabled={isAnalyzing || !resumeContent.trim() || !jobDescription.trim()}
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                            size="lg"
                                        >
                                            {isAnalyzing ? (
                                                'Analyzing...'
                                            ) : (
                                                <>
                                                    <Target className="w-4 h-4 mr-2" />
                                                    Analyze ATS Compatibility
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Results Section */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                {analysisResult ? (
                                    <ATSResults
                                        analysis={analysisResult}
                                        className="h-full"
                                    />
                                ) : (
                                    <Card className="h-full backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-slate-200/60 dark:border-slate-700/60">
                                        <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
                                            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                                                <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">Ready for Analysis</h3>
                                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                                Upload your resume and job description to get started with ATS analysis
                                            </p>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Target className="w-4 h-4" />
                                                    ATS Scoring
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <FileText className="w-4 h-4" />
                                                    Keyword Analysis
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Sparkles className="w-4 h-4" />
                                                    AI Suggestions
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <BarChart3 className="w-4 h-4" />
                                                    Industry Insights
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
