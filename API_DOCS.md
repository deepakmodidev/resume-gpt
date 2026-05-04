# ResumeGPT API Reference

Welcome to the API documentation for **ResumeGPT**. This document provides a comprehensive overview of the RESTful endpoints, including request schemas, expected responses, error handling, and cURL examples.

## 1. Global Configuration

- **Base URL**: `http://localhost:3000` (Development) / `https://your-domain.com` (Production)
- **Content-Type**: `application/json` (Unless specified otherwise, e.g., PDF endpoints)
- **Authentication**: The majority of endpoints are protected by **Auth.js (NextAuth)**. Authenticated endpoints require a valid session cookie (`next-auth.session-token` or `__Secure-next-auth.session-token`).

---

## 2. ATS Analyzer

Endpoints for parsing resumes against Job Descriptions (JDs) and calculating match scores.

### `POST /api/ats`
Runs an AI-powered ATS analysis comparing a resume against a job description.

#### **Headers**
| Name | Required | Description |
| :--- | :---: | :--- |
| `Content-Type` | Yes | `application/json` |
| `Cookie` | No | NextAuth session cookie. If provided alongside `resumeId`, the analysis is saved to the database. |

#### **Request Body**
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `resumeContent` | `string` | Yes | Raw text extracted from the user's resume. |
| `jobDescription` | `string` | Yes | The target Job Description text. |
| `resumeId` | `string` | No | Database ID of the resume to attach this analysis to. |

#### **How to Test (Realistically)**
Since this API is protected by NextAuth (Google), you cannot easily test it via standard `curl` in your terminal. The most honest and practical way to test it without a UI is to run a `fetch` request directly in your browser's console while logged into the app (`http://localhost:3000`). The browser will automatically attach the required session cookies.

**Browser Console Example:**
```javascript
fetch('/api/ats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    resumeContent: "Senior Frontend Developer with 5 years experience in React...",
    jobDescription: "Looking for a React expert with Next.js knowledge...",
    resumeId: "cm3a9df8k0001xyz" // Optional
  })
})
.then(res => res.json())
.then(console.log);
```

#### **Success Response (200 OK)**
```json
{
  "success": true,
  "analysis": {
    "scores": {
      "overall": 85,
      "keyword": 90,
      "readability": 80
    },
    "matchedKeywords": ["React", "Frontend"],
    "missingKeywords": ["Next.js", "TypeScript"],
    "criticalMissingKeywords": ["Next.js"]
  },
  "insights": {
    "matchPercentage": 85,
    "topMissingKeywords": ["Next.js"],
    "industryAlignment": 8.5
  },
  "keywordSuggestions": [
    { "keyword": "Next.js", "section": "Skills", "context": "Add under technical skills" }
  ]
}
```

#### **Error Responses**
- **`400 Bad Request`**: Validation failed (e.g., missing `resumeContent`).
- **`500 Internal Server Error`**: AI provider failed to process the analysis.

---

### `GET /api/ats`
Retrieves historical ATS analyses for the currently authenticated user.

#### **Query Parameters**
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `resumeId` | `string` | No | Filter history by a specific resume ID. |
| `limit` | `number` | No | Maximum records to return. Default is `10`. |

#### **Success Response (200 OK)**
```json
{
  "analyses": [
    {
      "id": "cm3a9df8k0001xyz",
      "resumeTitle": "Frontend Dev Resume",
      "analysis": { /* ATS Analysis Object */ },
      "analyzedAt": "2026-05-04T12:00:00.000Z"
    }
  ],
  "total": 1,
  "hasMore": false
}
```

---

## 3. AI Chat & Resume Builder

Endpoints supporting the conversational AI resume builder.

### `POST /api/chat`
Sends a user message and resume context to the Groq AI model.

#### **Headers & API Key Resolution**
Groq API key is resolved in this priority:
1. `x-groq-api-key` header.
2. `userApiKey` in the request body.
3. `GROQ_API_KEY` environment variable on the server.

#### **Request Body**
```json
{
  "history": [
    { "role": "user", "parts": [{ "text": "Can you rewrite my summary to sound more professional?" }] }
  ],
  "resumeData": {
    "personalInfo": { "name": "John Doe", "title": "Developer" },
    "experience": []
  },
  "userApiKey": "gsk_optionalUserKeyHere"
}
```

#### **Success Response (200 OK)**
```json
{
  "response": {
    "personalInfo": {
      "summary": "Innovative Software Engineer with a proven track record..."
    }
  }
}
```

---

### `PUT /api/chat`
Renames an existing chat session.

#### **Request Body**
```json
{
  "chatId": "cm3a9df8k0001xyz",
  "newName": "Google Application Resume"
}
```

#### **Success Response (200 OK)**
```json
{
  "chat": {
    "id": "cm3a9df8k0001xyz",
    "title": "Google Application Resume",
    "updatedAt": "2026-05-04T12:05:00.000Z"
  }
}
```

---

### `DELETE /api/chat`
Deletes a chat session permanently.

#### **Request Body**
```json
{
  "chatId": "cm3a9df8k0001xyz"
}
```

#### **Success Response (200 OK)**
```json
{
  "success": true
}
```

---

## 4. Cover Letter Generator

### `POST /api/cover-letter/generate`
Generates a highly tailored cover letter based on resume data and an optional Job Description.

#### **Request Body**
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `resumeData` | `object` | Yes | The user's parsed resume data. |
| `jobTitle` | `string` | Yes | Target role (e.g., "Senior Engineer"). |
| `companyName` | `string` | Yes | Target company name. |
| `jobDescription` | `string` | No | Full JD text. If omitted, generates a generalized letter. |
| `recipientName` | `string` | No | Hiring Manager name. |
| `tone` | `string` | No | Tone of the letter (e.g., `professional`, `creative`). Default: `professional`. |

#### **Success Response (200 OK)**
```json
{
  "salutation": "Dear Hiring Team,",
  "body": "I am writing to express my strong interest in the Senior Engineer position at Acme Corp. With my background in...",
  "closing": "Best regards,\nJohn Doe"
}
```

---

## 5. PDF Exporters

Generates raw binary PDF files using Puppeteer.

### `POST /api/generate-pdf` (Resume)
### `POST /api/generate-cover-letter-pdf` (Cover Letter)

#### **Request Body**
```json
{
  "data": { /* Full Resume or Cover Letter Object */ },
  "template": "modern"
}
```

#### **Success Response (200 OK)**
- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename=resume.pdf`
- **Body**: `<Binary PDF Buffer>`

---

## 6. Voice Interview

### `POST /api/voice/token`
Provisions a LiveKit room, dispatches the `interview-gpt` agent, and returns a secure JWT for the user to connect.

#### **Request Body**
```json
{
  "resume": "John Doe\nReact Developer...",
  "jd": "We need a frontend developer..."
}
```

#### **Success Response (200 OK)**
```json
{
  "participantToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "participantName": "Candidate",
  "roomName": "voice-interview-abcd-12345",
  "serverUrl": "wss://your-livekit-server.com"
}
```

---

## 7. System Utilities

### `GET /api/health`
Checks the system status, ensuring Database connectivity is stable.

#### **Success Response (200 OK)**
```json
{
  "status": "up",
  "timestamp": "2026-05-04T12:00:00.000Z",
  "database": {
    "status": "up",
    "latency": 24
  },
  "groq": {
    "status": "up"
  }
}
```

### `POST /api/validate-key`
Validates a user-provided Groq API Key by firing a lightweight test query.

#### **Request Body**
```json
{
  "apiKey": "gsk_1234567890abcdef..."
}
```

#### **Success Response (200 OK)**
```json
{
  "valid": true
}
```

#### **Error Response (401 Unauthorized)**
```json
{
  "error": "Invalid API key"
}
```

---

## 8. Common Error Codes

Across all endpoints, you may encounter the following standardized HTTP status codes:

- **`400 Bad Request`**: The request body failed Zod schema validation. The response will include a `details` array of exactly what failed.
- **`401 Unauthorized`**: You are missing a valid NextAuth session cookie, or your API key is invalid.
- **`404 Not Found`**: The requested resource (like a specific `chatId`) does not exist in the database or belongs to another user.
- **`500 Internal Server Error`**: An unexpected failure occurred (e.g., database timeout, AI provider outage).
