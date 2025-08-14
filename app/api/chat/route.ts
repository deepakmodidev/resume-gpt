import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '@/lib/auth';
import db from '@/prisma/prisma';

// Types
interface ParsedResponse {
  acknowledgement: string;
  updatedSection: Record<string, unknown>;
}

// Constants
const SYSTEM_INSTRUCTION = `
You are ResumeGPT, an AI resume assistant developed by Deepak Modi, that helps users create professional, ATS-optimized resumes with instant preview and download capabilities. 

RESPONSE FORMAT - CRITICAL:
Your response MUST be valid JSON with EXACTLY this structure:
{
  "acknowledgement": "Your response text here",
  "updatedSection": {} 
}

FORMATTING RULES:
- Never use Markdown, asterisks, or any formatting characters in your responses
- Only reply with clean, plain text—no bold, italics, bullet points, or special formatting
- Never mention JSON, data structures, or technical implementation details
- Always provide clean, plain text responses as if speaking directly to the user
- Never reply with empty objects - always provide meaningful acknowledgements
- When referring to resume updates, say things like "I've updated your resume" or "Your resume has been enhanced"
- If a user asks where their resume is, tell them they can preview their resume on the preview screen to the right

RESUME DATA STRUCTURE:
- ALWAYS ensure 'skills' field is an array of strings: ["JavaScript", "React", "Python"]
- Never return 'skills' as a single string, object, or any other type
- Maintain consistent data types across all resume sections
- Use proper date formats for experience and education (e.g., "Jan 2023 - Present")
- Keep contact information in standard professional formats

CONVERSATION CONTEXT:
- Remember ALL previous interactions in the conversation
- For each response, review the entire conversation history to ensure consistency with past interactions
- Reference past requests when users say "add what I mentioned earlier"
- Maintain consistency with previously discussed resume content
- Show understanding of the user's career goals and industry

RESUME OPTIMIZATION EXPERTISE:
- Suggest ATS-friendly keywords relevant to the user's target role
- Transform weak descriptions into impactful, results-oriented statements
- Recommend quantifiable achievements with specific metrics
- Help optimize content for both ATS systems and human reviewers
- Ensure proper professional formatting and structure

TECHNICAL REQUIREMENTS:
- DO NOT include any text before or after the JSON object
- DO NOT include any formatting, code blocks, icons, images, or explanation outside the JSON
- If you cannot answer in the required JSON format, you MUST return:
{"acknowledgement": "I cannot process this request.", "updatedSection": {}}

RESPONSE GUIDELINES:
For general conversation like greetings or questions about your capabilities:
{
  "acknowledgement": "I'm ResumeGPT, your AI resume assistant designed to help you create professional, job-winning resumes. I can enhance your content, suggest improvements, and optimize your resume for ATS systems. How can I help with your resume today?",
  "updatedSection": {}
}

For resume-related queries without updates needed:
{
  "acknowledgement": "Your helpful response about the resume, showing that you remember previous conversation context and provide actionable advice",
  "updatedSection": {}
}

For resume updates, include ONLY the sections that need to be changed:
{
  "acknowledgement": "I've enhanced your resume with stronger content that will help you stand out to employers and pass ATS screening.",
  "updatedSection": {
    "sectionName": "new content"
  }
}

Remember to be conversational, professional, and focused on helping users create resumes that land interviews and job offers.
`;

const GENERATION_CONFIG = {
  temperature: 0.6,
  topP: 0.9,
  maxOutputTokens: 2048,
};

// Utility Functions
const validateData = (data: Record<string, unknown>) => {
  const { history, resumeData, chatId } = data;
  if (!Array.isArray(history) || !history.length) throw new Error('Invalid history');
  if (!chatId) throw new Error('Missing chat ID');
  const message = (history.at(-1) as { parts?: { text?: string }[] })?.parts?.[0]?.text;
  if (!message || !resumeData) throw new Error('Missing message or resume data');
  return message;
};

const getQuickResponse = (msg: string): ParsedResponse | null => {
  if (msg.length > 20) return null;
  const responses = {
    greeting: /^(hi|hello|hey)$/i,
    thanks: /^(thanks|thank you|ty|thx)$/i,
    short: /^(ok|okay|sure|good|nice|great|awesome|cool|yes|no|maybe|fine|good job|well done)$/i
  };

  if (responses.greeting.test(msg)) return {
    acknowledgement: "Hello! I'm ResumeGPT, your AI resume assistant. How can I help you with your resume today?",
    updatedSection: {}
  };

  if (responses.thanks.test(msg)) return {
    acknowledgement: "You're welcome! Is there anything else I can help you with regarding your resume?",
    updatedSection: {}
  };

  if (responses.short.test(msg)) return {
    acknowledgement: "I'm here to help with your resume. What would you like to know or improve?",
    updatedSection: {}
  };

  return null;
};

const parseResponse = (text: string): ParsedResponse => {
  const cleaned = text.replace(/``````/g, '').trim();
  const jsonText = cleaned.startsWith('{') ? cleaned : cleaned.match(/{[\s\S]*}/)?.[0] || cleaned;

  try {
    return JSON.parse(jsonText);
  } catch {
    return { acknowledgement: jsonText, updatedSection: {} };
  }
};

const deepMerge = (target: Record<string, unknown>, source: Record<string, unknown>) => {
  if (!target || !source || typeof target !== 'object' || typeof source !== 'object') return source;

  const result = { ...target };
  Object.entries(source).forEach(([key, value]) => {
    result[key] = Array.isArray(value) ? value :
      (value && typeof value === 'object') ? deepMerge(result[key] as Record<string, unknown> ?? {}, value as Record<string, unknown>) : value;
  });
  return result;
};

const upsertChat = async (chatId: string, userId: string, message: string, userMsg: unknown, modelMsg: unknown, resumeData: unknown) => {
  const chat = await db.chat.findUnique({ where: { id: chatId, userId } });

  if (chat) {
    await db.chat.update({
      where: { id: chatId, userId },
      data: {
        messages: { push: [userMsg, modelMsg] as never },
        resumeData: resumeData as never
      }
    });
  } else {
    await db.chat.create({
      data: {
        id: chatId, userId,
        title: message.slice(0, 30) || 'New ResumeGPT Chat',
        messages: [userMsg, modelMsg] as never,
        resumeData: resumeData as never,
        resumeTemplate: 'classic'
      }
    });
  }
};

const handleError = (error: unknown, defaultStatus = 500) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const status = ['Invalid history', 'Missing chat ID', 'Missing message or resume data'].includes(message) ? 400 : defaultStatus;
  return NextResponse.json({ error: message }, { status });
};

// Handlers
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const message = validateData(data);
    const { history, resumeData, chatId, userApiKey } = data;

    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = userApiKey || process.env.GEMINI_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API key not available' }, { status: 500 });

    let response = getQuickResponse(message.trim());

    if (!response) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: SYSTEM_INSTRUCTION });
      const chat = model.startChat({ generationConfig: GENERATION_CONFIG, history });
      const result = await chat.sendMessage(`${message}\nResume Data: ${JSON.stringify(resumeData)}`);
      response = parseResponse(result.response.text());
    }

    const acknowledgement = response?.acknowledgement && response.acknowledgement.trim() !== ''
      ? response.acknowledgement
      : "I'm here to help with your resume. What would you like to know?";
    const updatedSection = response?.updatedSection || {};

    const mergedData = deepMerge(resumeData, updatedSection);

    const userMsg = { role: 'user', parts: [{ text: message }] };
    const modelMsg = { role: 'model', parts: [{ text: acknowledgement }] };

    await upsertChat(chatId, session.user.id, message, userMsg, modelMsg, mergedData);
    return NextResponse.json({ response });

  } catch (error) {
    return handleError(error);
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const chats = await db.chat.findMany({
      where: { userId: session.user.id },
      select: { id: true, title: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ chats });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { chatId } = await req.json();
    if (!chatId) return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });

    const deleted = await db.chat.deleteMany({ where: { id: chatId, userId: session.user.id } });
    if (!deleted.count) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });

    return NextResponse.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { chatId, newName } = await req.json();
    if (!chatId || !newName) return NextResponse.json({ error: 'Chat ID and name required' }, { status: 400 });

    const updated = await db.chat.updateMany({
      where: { id: chatId, userId: session.user.id },
      data: { title: newName }
    });

    if (!updated.count) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    return NextResponse.json({ message: 'Chat updated successfully' });
  } catch (error) {
    return handleError(error);
  }
}
