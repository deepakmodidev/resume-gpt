import { NextResponse } from 'next/server';
import db from '@/prisma/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Health check results
    const health: Record<string, { status: 'ok' | 'error'; message?: string }> = {};

    // 1. Backend (always up if this runs)
    health.backend = { status: 'ok' };

    // 2. Database check
    try {
        // Simple query to check DB connection
        await db.user.findFirst({ select: { id: true } });
        health.database = { status: 'ok' };
    } catch (error: any) {
        health.database = { status: 'error', message: error?.message || 'DB error' };
    }

    // 3. Gemini API check
    try {
        const apiKey = process.env.GEMINI_KEY;
        if (!apiKey || !apiKey.startsWith('AIza')) {
            throw new Error('Missing or invalid Gemini API key');
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        // Use a very simple prompt to test
        await model.generateContent('ping');
        health.gemini = { status: 'ok' };
    } catch (error: any) {
        health.gemini = { status: 'error', message: error?.message || 'Gemini error' };
    }

    // 4. Prisma client check (redundant, but explicit)
    health.prisma = health.database.status === 'ok' ? { status: 'ok' } : { status: 'error', message: health.database.message };

    // 5. Environment variables
    const requiredEnv = ['DATABASE_URL', 'GEMINI_KEY', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'NEXTAUTH_SECRET'];
    health.env = { status: 'ok' };
    for (const key of requiredEnv) {
        if (!process.env[key]) {
            health.env = { status: 'error', message: `Missing env: ${key}` };
            break;
        }
    }

    // 6. Uptime (optional)
    health.uptime = { status: 'ok', message: `${process.uptime?.() ? Math.floor(process.uptime()) : 'N/A'}s` };

    // 7. Timestamp
    health.timestamp = { status: 'ok', message: new Date().toISOString() };

    // 8. Overall
    const allOk = Object.values(health).every((h) => h.status === 'ok');
    health.status = { status: allOk ? 'ok' : 'error' };

    return NextResponse.json(health, { status: allOk ? 200 : 500 });
}
