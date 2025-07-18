import { ResumeData } from '@/lib/types';

export const EMPTY_RESUME: ResumeData = {
  name: '',
  title: '',
  contact: {
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    blogs: '',
  },
  summary: '',
  experience: [
    { title: '', company: '', location: '', period: '', description: '' },
  ],
  education: [{ degree: '', institution: '', year: '' }],
  skills: [],
  projects: [{ name: '', description: '', techStack: [] }],
  achievements: [],
};

export const ANIMATION_VARIANTS = {
  welcome: {
    initial: { opacity: 1 },
    exit: { opacity: 0 },
  },
  message: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  resume: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
};
