import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ResumeGPT - AI Resume Builder',
    short_name: 'ResumeGPT',
    description:
      'Create perfect resumes with AI. Type naturally, watch your resume build in real-time.',
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
