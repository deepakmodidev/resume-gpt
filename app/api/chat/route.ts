import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import db from '@/prisma/prisma';

export async function POST(req: NextRequest) {
  try {
    const { history, resumeData, chatId, userApiKey } = await req.json();

    if (!history || !Array.isArray(history) || history.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing history' },
        { status: 400 },
      );
    }

    if (!chatId) {
      return NextResponse.json({ error: 'Missing chat ID' }, { status: 400 });
    }

    const latestUserMessage = history[history.length - 1]?.parts?.[0]?.text;
    if (!latestUserMessage || !resumeData) {
      return NextResponse.json(
        { error: 'Missing user message or resume data' },
        { status: 400 },
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use user's API key if provided, otherwise fall back to default
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: `
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
      `,
    });

    const chatSession = model.startChat({
      generationConfig: {
        temperature: 0.7, // Lower temperature for more consistent and focused responses
        topP: 0.95,
        maxOutputTokens: 2048, // Allow longer responses for better context handling
      },
      history,
    });

    const prompt = `${latestUserMessage}

Remember the full conversation history when generating your response. Maintain context from previous messages.

Resume Data: ${JSON.stringify(resumeData)}`;

    // Special handling for very short messages (greetings, thanks, etc.)
    let parsedResponse;
    if (
      latestUserMessage.length < 20 &&
      /^(hi|hello|hey|thanks|thank you|ty|ok|okay|sure|good|nice|great|awesome|cool|yes|no|maybe|fine|good job|well done|thx|ty)$/i.test(
        latestUserMessage.trim(),
      )
    ) {
      // Pre-defined responses for common short messages
      const greeting = /^(hi|hello|hey)$/i.test(latestUserMessage.trim());
      const thanks = /^(thanks|thank you|ty|thx)$/i.test(
        latestUserMessage.trim(),
      );

      if (greeting) {
        parsedResponse = {
          acknowledgement:
            "Hello! I'm ResumeGPT, your AI resume assistant. How can I help you with your resume today?",
          updatedSection: {},
        };
      } else if (thanks) {
        parsedResponse = {
          acknowledgement:
            "You're welcome! Is there anything else I can help you with regarding your resume?",
          updatedSection: {},
        };
      } else {
        parsedResponse = {
          acknowledgement:
            "I'm here to help with your resume. What would you like to know or improve?",
          updatedSection: {},
        };
      }
    } else {
      // Normal AI processing for longer or more complex messages
      const result = await chatSession.sendMessage(prompt);
      const aiRawText = result.response.text(); // Clean up the response by removing markdown code blocks and trimming whitespace
      let cleanedText = aiRawText.replace(/```json|```/g, '').trim();

      // If the response doesn't look like JSON, try to extract JSON from it
      if (!cleanedText.startsWith('{') || !cleanedText.endsWith('}')) {
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedText = jsonMatch[0];
        }
      }

      try {
        parsedResponse = JSON.parse(cleanedText);
      } catch {
        console.error('Failed to parse AI response:', cleanedText);

        // Fallback response when parsing fails
        parsedResponse = {
          acknowledgement:
            'I had trouble processing that request. Could you try rephrasing your question?',
          updatedSection: {},
        };
      }
    }

    const acknowledgement =
      parsedResponse?.acknowledgement ||
      "I'm here to help with your resume. What would you like to know?";
    const updatedSection = parsedResponse?.updatedSection || {};

    // Validate that updatedSection is an object
    const validUpdatedSection =
      typeof updatedSection === 'object' && updatedSection !== null
        ? updatedSection
        : {};

    const updatedResumeData = deepMerge(resumeData, validUpdatedSection);

    // Create user and model messages with full content
    const userMsg = { role: 'user', parts: [{ text: latestUserMessage }] };
    const modelMsg = { role: 'model', parts: [{ text: acknowledgement }] };

    // Update database with full messages for better context preservation

    const existingChat = await db.chat.findUnique({
      where: {
        id: chatId,
        userId: session.user.id, // Added check to ensure user owns this chat
      },
    });

    if (!existingChat) {
      await db.chat.create({
        data: {
          id: chatId,
          userId: session.user.id,
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
          userId: session.user.id, // Added check to ensure user owns this chat
        },
        data: {
          messages: {
            push: [userMsg, modelMsg],
          },
          resumeData: updatedResumeData,
        },
      });
    }

    return NextResponse.json({ response: parsedResponse }, { status: 200 });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    );
  }
}

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

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required.' },
        { status: 400 },
      );
    }

    // Actually delete the chat, checking user ownership
    const deletedChat = await db.chat.deleteMany({
      where: {
        id: chatId,
        userId: session.user.id,
      },
    });

    if (!deletedChat.count) {
      return NextResponse.json(
        { error: 'Chat not found or unauthorized' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: 'Chat deleted successfully.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId, newName } = await req.json();

    if (!chatId || !newName) {
      return NextResponse.json(
        { error: 'Chat ID and new name are required.' },
        { status: 400 },
      );
    }

    // Update chat name in the database, checking user ownership
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
      return NextResponse.json(
        { error: 'Chat not found or unauthorized' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: 'Chat name updated successfully.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Update chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(target: any, source: any): any {
  if (
    typeof target !== 'object' ||
    typeof source !== 'object' ||
    !target ||
    !source
  ) {
    return source;
  }

  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (Array.isArray(source[key])) {
      output[key] = source[key]; // Replace arrays directly
    } else if (typeof source[key] === 'object') {
      output[key] = deepMerge(target[key] ?? {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}
