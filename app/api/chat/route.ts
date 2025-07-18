import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import db from '@/prisma/prisma';

// Constants
const SYSTEM_INSTRUCTION = `
You are an AI resume assistant "ResumeGPT", developed by Deepak Modi, that helps users improve and build their resume.

IMPORTANT: Your response MUST be valid JSON with EXACTLY this structure:
{
  "acknowledgement": "Your response text here",
  "updatedSection": {} 
}
DO NOT include any text before or after the JSON object. DO NOT include any formatting or explanation outside the JSON.

You MUST maintain conversation context and remember user's previous instructions and requests.
For each response, review the entire conversation history to ensure consistency with past interactions.

When the user refers to previous messages or requests, your response should reflect that you understand what they're referring to.
For example, if they say "Add what I mentioned earlier", refer back to their previous messages to determine what they mentioned.

For general conversation like greetings or questions about your capabilities:
{
  "acknowledgement": "Your friendly and helpful response here",
  "updatedSection": {}
}

For resume-related queries, provide helpful advice in the acknowledgement.
If no updates to the resume are needed:
{
  "acknowledgement": "Your helpful response about the resume, showing that you remember previous conversation context",
  "updatedSection": {}
}

If resume needs updating, include ONLY the sections that need to be changed:
{
  "acknowledgement": "I've updated your resume with the new information, taking into account our entire conversation.",
  "updatedSection": {
    "sectionName": "new content"
  }
}

CRITICAL: Do NOT include markdown formatting, code blocks, or any non-JSON content in your response.

Remember to be conversational and friendly when responding to general questions.
For example, if asked "Who are you?", respond with something like:
{
  "acknowledgement": "I'm your AI resume assistant, designed to help you create and improve your resume. I can suggest improvements, help you format content, and provide guidance on best practices for resume writing. How can I help with your resume today?",
  "updatedSection": {}
}
`;

const GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.95,
  maxOutputTokens: 2048,
};

// Utility Functions
function validateRequestData(data: any) {
  const { history, resumeData, chatId } = data;

  if (!history || !Array.isArray(history) || history.length === 0) {
    throw new Error('Invalid or missing history');
  }

  if (!chatId) {
    throw new Error('Missing chat ID');
  }

  const latestUserMessage = history[history.length - 1]?.parts?.[0]?.text;
  if (!latestUserMessage || !resumeData) {
    throw new Error('Missing user message or resume data');
  }

  return { latestUserMessage };
}

function getPreDefinedResponse(message: string) {
  const trimmed = message.trim();

  if (trimmed.length >= 20) return null;

  const greeting = /^(hi|hello|hey)$/i.test(trimmed);
  const thanks = /^(thanks|thank you|ty|thx)$/i.test(trimmed);
  const shortResponse = /^(ok|okay|sure|good|nice|great|awesome|cool|yes|no|maybe|fine|good job|well done)$/i.test(trimmed);

  if (greeting) {
    return {
      acknowledgement: "Hello! I'm ResumeGPT, your AI resume assistant. How can I help you with your resume today?",
      updatedSection: {},
    };
  }

  if (thanks) {
    return {
      acknowledgement: "You're welcome! Is there anything else I can help you with regarding your resume?",
      updatedSection: {},
    };
  }

  if (shortResponse) {
    return {
      acknowledgement: "I'm here to help with your resume. What would you like to know or improve?",
      updatedSection: {},
    };
  }

  return null;
}

function parseAIResponse(aiRawText: string) {
  let cleanedText = aiRawText.replace(/```json|```/g, '').trim();

  // Extract JSON if response doesn't look like pure JSON
  if (!cleanedText.startsWith('{') || !cleanedText.endsWith('}')) {
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }
  }

  try {
    return JSON.parse(cleanedText);
  } catch {
    console.error('Failed to parse AI response:', cleanedText);
    return {
      acknowledgement: 'I had trouble processing that request. Could you try rephrasing your question?',
      updatedSection: {},
    };
  }
}

async function updateOrCreateChat(chatId: string, userId: string, latestUserMessage: string, userMsg: any, modelMsg: any, updatedResumeData: any) {
  const existingChat = await db.chat.findUnique({
    where: {
      id: chatId,
      userId: userId,
    },
  });

  if (!existingChat) {
    await db.chat.create({
      data: {
        id: chatId,
        userId: userId,
        title: latestUserMessage.slice(0, 30) || 'New ResumeGPT Chat',
        messages: [userMsg, modelMsg],
        resumeData: updatedResumeData,
        resumeTemplate: 'classic',
      },
    });
  } else {
    await db.chat.update({
      where: {
        id: chatId,
        userId: userId,
      },
      data: {
        messages: {
          push: [userMsg, modelMsg],
        },
        resumeData: updatedResumeData,
      },
    });
  }
}

function deepMerge(target: any, source: any): any {
  if (typeof target !== 'object' || typeof source !== 'object' || !target || !source) {
    return source;
  }

  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (Array.isArray(source[key])) {
      output[key] = source[key];
    } else if (typeof source[key] === 'object') {
      output[key] = deepMerge(target[key] ?? {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

// Main POST Handler
export async function POST(req: NextRequest) {
  try {
    // Parse and validate request data
    const requestData = await req.json();
    const { latestUserMessage } = validateRequestData(requestData);
    const { history, resumeData, chatId, userApiKey } = requestData;

    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate API key
    const apiKey = userApiKey || process.env.GEMINI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'API key not available',
          details: 'Please configure your Gemini API key or contact support',
        },
        { status: 500 },
      );
    }

    // Check for pre-defined responses (greetings, thanks, etc.)
    const preDefinedResponse = getPreDefinedResponse(latestUserMessage);
    let parsedResponse;

    if (preDefinedResponse) {
      parsedResponse = preDefinedResponse;
    } else {
      // Process with AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      const chatSession = model.startChat({
        generationConfig: GENERATION_CONFIG,
        history,
      });

      const prompt = `${latestUserMessage}
    Remember the full conversation history when generating your response. Maintain context from previous messages.
    Resume Data: ${JSON.stringify(resumeData)}`;

      const result = await chatSession.sendMessage(prompt);
      const aiRawText = result.response.text();
      parsedResponse = parseAIResponse(aiRawText);
    }

    // Extract response data
    const acknowledgement = parsedResponse?.acknowledgement || "I'm here to help with your resume. What would you like to know?";
    const updatedSection = parsedResponse?.updatedSection || {};

    // Validate and merge resume data
    const validUpdatedSection = typeof updatedSection === 'object' && updatedSection !== null ? updatedSection : {};
    const updatedResumeData = deepMerge(resumeData, validUpdatedSection);

    // Create message objects
    const userMsg = { role: 'user', parts: [{ text: latestUserMessage }] };
    const modelMsg = { role: 'model', parts: [{ text: acknowledgement }] };

    // Update database
    await updateOrCreateChat(chatId, session.user.id, latestUserMessage, userMsg, modelMsg, updatedResumeData);

    return NextResponse.json({ response: parsedResponse }, { status: 200 });

  } catch (error) {
    console.error('Chat error:', error);

    // Handle validation errors
    if (error.message === 'Invalid or missing history' || error.message === 'Missing chat ID' || error.message === 'Missing user message or resume data') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    );
  }
}

// GET Handler - Fetch user's chats
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const chats = await db.chat.findMany({
    where: { userId: session.user.id },
    select: { id: true, title: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ chats });
}

// DELETE Handler - Delete a chat
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required.' }, { status: 400 });
    }

    const deletedChat = await db.chat.deleteMany({
      where: {
        id: chatId,
        userId: session.user.id,
      },
    });

    if (!deletedChat.count) {
      return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Chat deleted successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT Handler - Update chat name
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId, newName } = await req.json();

    if (!chatId || !newName) {
      return NextResponse.json({ error: 'Chat ID and new name are required.' }, { status: 400 });
    }

    const updatedChat = await db.chat.updateMany({
      where: {
        id: chatId,
        userId: session.user.id,
      },
      data: {
        title: newName,
      },
    });

    if (!updatedChat.count) {
      return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Chat name updated successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Update chat error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
