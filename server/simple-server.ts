import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { seedDatabase } from './seed.js';

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('Dashboard connected');
  ws.send(JSON.stringify({ type: 'connection', message: 'Connected to Diamond Voice Agent' }));
  
  ws.on('close', () => {
    console.log('Dashboard disconnected');
  });
});

// Basic routes
app.get('/', (req, res) => {
  res.json({
    title: 'Diamond Voice Agent API',
    version: '1.0.0',
    description: 'Real-time voice agent system for diamond sales',
    status: 'ready',
    endpoints: {
      health: '/health',
      api: '/api/*',
      webhook: '/voice/webhook',
      websocket: 'ws://localhost:3000/ws'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'diamond-voice-agent',
    version: '1.0.0'
  });
});

// Mock voice webhook for testing
app.post('/voice/webhook', (req, res) => {
  console.log('Mock voice webhook called:', req.body);
  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Hello! This is a test response from the Diamond Voice Agent. In production, this would connect to the OpenAI voice agent.</Say>
</Response>`);
});

// API placeholder routes
app.get('/api/roadmap', async (req, res) => {
  try {
    // Return mock roadmap for testing
    const mockRoadmap = [
      { id: '1', task: 'Project Setup & Schema', status: 'DONE', notes: 'Complete' },
      { id: '2', task: 'Telephony Integration', status: 'DONE', notes: 'Twilio webhook ready' },
      { id: '3', task: 'Voice Agent Implementation', status: 'DONE', notes: 'OpenAI integration ready' },
      { id: '4', task: 'Dashboard Frontend', status: 'TODO', notes: 'React dashboard' },
      { id: '5', task: 'Production Deployment', status: 'TODO', notes: 'Final deployment' }
    ];
    res.json(mockRoadmap);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/diamonds', async (req, res) => {
  try {
    // Return sample diamond inventory
    const diamonds = [
      {
        id: '1',
        sku: 'DIA001',
        carat: '1.0',
        cut: 'Round',
        color: 'D',
        clarity: 'VVS1',
        price: 8500,
        available: true,
        description: 'Exceptional round brilliant diamond'
      },
      {
        id: '2',
        sku: 'DIA002',
        carat: '0.75',
        cut: 'Princess',
        color: 'E',
        clarity: 'VS1',
        price: 4250,
        available: true,
        description: 'Beautiful princess cut'
      }
    ];
    res.json(diamonds);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/calls', (req, res) => {
  res.json([]);
});

// Start server
server.listen(port, async () => {
  console.log(`Diamond Voice Agent server running on port ${port}`);
  console.log(`API available at: http://localhost:${port}`);
  console.log(`WebSocket at: ws://localhost:${port}/ws`);
  console.log(`Health check: http://localhost:${port}/health`);
  
  // Initialize sample data in memory storage
  try {
    await seedDatabase();
  } catch (error) {
    console.log('Note: Database seeding skipped (requires database connection)');
  }
});

export default app;