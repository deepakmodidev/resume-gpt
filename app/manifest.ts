import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ResumeGPT Pro - RAG-Powered AI Resume Intelligence',
    short_name: 'ResumeGPT Pro',
    description:
      'Advanced GenAI resume builder with RAG pipeline, vector search, ATS analysis, and AI-powered optimization. Features semantic matching, keyword intelligence, and industry insights.',
    start_url: '/',
    display: 'standalone',
    background_color: '#2563eb', // blue-600
    theme_color: '#2563eb', // blue-600
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
  };
}
