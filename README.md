# ResumeGPT - AI-Powered Resume Builder

ResumeGPT is a modern web application that helps you create, edit, and optimize professional resumes using AI-powered suggestions. It supports multiple templates, PDF export, and seamless authentication.

## Features

- AI-powered resume content suggestions (Gemini)
- Multiple professional resume templates
- Live editing and preview
- PDF export and download
- Google OAuth authentication
- User session management
- Responsive and modern UI

## Tech Stack

- Next.js (React, TypeScript)
- Tailwind CSS
- Prisma ORM (PostgreSQL)
- NextAuth.js (Auth.js)
- Gemini AI API
- Puppeteer & @sparticuz/chromium (PDF generation)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/decodewithdeepak/resume-gpt.git
   cd resume-gpt
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   NEXTAUTH_SECRET=your-nextauth-secret
   DATABASE_URL=your-postgres-url
   DIRECT_URL=your-postgres-direct-url
   GEMINI_KEY=your-gemini-api-key
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

- Sign in with Google to create and manage your resumes.
- Use AI chat to generate resume content.
- Choose from multiple templates to customize your resume.
- Edit your resume content in real-time.
- Preview your resume live as you edit.
- Download your resume as a PDF.

## License

MIT

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them
4. Push to your forked repository
5. Create a pull request

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Gemini AI](https://ai.google.dev/gemini)
