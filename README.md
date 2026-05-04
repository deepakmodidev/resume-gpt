# ResumeGPT - AI-Powered Resume Builder

ResumeGPT is a modern web application that helps you create, edit, and optimize professional resumes using AI-powered suggestions. It supports multiple templates, PDF export, seamless authentication, and advanced ATS compatibility analysis with RAG and NLP.

## Features

- **AI-powered resume content suggestions** (Groq)
- **AI Cover Letter Generator** - Create tailored cover letters instantly
- **AI Voice Interview** - Real-time technical mock interviews (LiveKit + Sarvam)
- **Advanced ATS compatibility analysis** with RAG and NLP
- **Smart skill extraction and matching** using semantic analysis
- **Multiple professional resume templates** (10+ designs)
- **Live editing and preview**
- **PDF export and download**
- **Google OAuth authentication**
- **Chat-based resume building**
- **Real-time ATS scoring with optimization suggestions**

## Tech Stack

- **Next.js** (React, TypeScript)
- **Tailwind CSS**
- **Prisma ORM** (PostgreSQL)
- **NextAuth.js** (Auth.js)
- **Groq AI API** (using Llama 3.3)
- **LiveKit Agents** (Real-time voice AI)
- **Sarvam AI** (Sovereign Indic TTS/STT)
- **Natural Language Processing** (NLP) for skill extraction
- **TF-IDF** for keyword importance analysis
- **Jaro-Winkler algorithm** for fuzzy string matching
- **Puppeteer & @sparticuz/chromium** (PDF generation)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/deepakmodidev/resume-gpt.git
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
   GROQ_API_KEY=your-groq-api-key
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

### 5. Start the AI Interview Agent (Optional)

The AI Voice Interview agent runs as a separate service.

1. Navigate to the agent directory:
   ```bash
   cd voice-agent
   ```
2. Install agent-specific dependencies (requires `pnpm`):
   ```bash
   pnpm install
   ```
3. Run the agent in dev mode:
   ```bash
   pnpm dev
   ```
   *Note: For production deployment, see [LIVEKIT_GUIDE.md](LIVEKIT_GUIDE.md)*

## ATS Analysis Features

The application includes advanced ATS (Applicant Tracking System) analysis powered by RAG (Retrieval-Augmented Generation) and NLP:

- **Semantic skill matching** with bidirectional mapping
- **Multi-modal analysis** (technical, business, management skills)
- **Smart keyword extraction** using TF-IDF analysis
- **Fuzzy matching** for skill variations (85% similarity threshold)
- **Real-time compatibility scoring** with detailed breakdowns
- **Critical missing keyword identification**
- **Industry-specific optimization suggestions**
- **Experience relevance assessment**

### Technical Implementation (Local RAG)

The ATS engine uses a specialized "Local RAG" (Retrieval-Augmented Generation) architecture designed for privacy and speed:

- **Statistical Retrieval**: Uses **TF-IDF** (via `natural`) to retrieve the most significant terms from job descriptions, automatically filtering out marketing "fluff."
- **NLP Entity Extraction**: Leverages **Compromise.js** for machine-learning-based entity recognition to identify technical skills, frameworks, and tools without manual keyword lists.
- **Bidirectional Mapping**: A built-in knowledge base handles skill variations (e.g., mapping `JS` to `JavaScript`) and semantic similarities.
- **Weighted Analysis**: Matches are scored across three distinct pillars—**Technical**, **Business**, and **Management**—using a weighted importance algorithm (Jaro-Winkler distance).

## Usage

- Sign in with Google to create and manage your resumes
- Use AI chat to generate resume content
- Generate tailored cover letters with AI
- Choose from 10+ professional templates (Modern, Executive, Creative, Techie, etc.)
- Analyze resume compatibility with job descriptions using ATS scorer
- Get real-time optimization suggestions based on NLP analysis
- Edit your resume content in real-time with live preview
- Download your resume or cover letter as a PDF

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
- [Groq](https://groq.com/)
