import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Server-side Gemini AI setup
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health / Status endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    aiAvailable: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Gemini Companion endpoint
app.post('/api/companion', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Using local offline emergency knowledge.',
      });
    }

    const systemInstruction = `You are FloodGuard's Emergency Safety AI Assistant.
CRITICAL SAFETY RULES:
1. Provide calm, concise, actionable flood safety and life-saving guidance.
2. NEVER invent fake emergency helpline numbers, fictional shelter addresses, or unverified evacuation routes.
3. Explicitly distinguish between official verified warnings, estimated models, and general safety precautions.
4. Keep answers brief (under 120 words) because users may be under stress, in active danger, or on low battery.
5. Emphasize: Turn Around Don't Drown (never walk or drive through moving water), seek higher ground immediately if water rises, avoid downed power lines, prepare emergency drinking water.
6. Current User Context: Location: ${context?.locationName || 'Unknown'}, Status: ${context?.status || 'Unknown'}, Elevation: ${context?.elevation ? context.elevation + 'm' : 'Unknown'}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'Seek higher ground immediately and monitor local disaster authorities.';
    res.json({ reply, source: 'gemini' });
  } catch (err: any) {
    console.error('Gemini API error:', err);
    res.status(500).json({
      error: 'AI service temporarily unavailable. Use offline safety rules.',
      details: err?.message,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FloodGuard Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
