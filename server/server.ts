import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { telephonyApp } from './telephony.js';
import { storage } from './storage.js';

dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount telephony routes
app.use('/', telephonyApp);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy'l
    timestamp: new Date().toISOString(),
    service: 'diamond-voice-agent',
    version: '1.0.0'
  });
});

// API routes
app.get('/api/roadmap', async (req, res) => {
  try {
    const tasks = await storage.getRoadmapTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/diamonds', async (req, res) => {
  try {
    const diamonds = await storage.getDiamonds();
    res.json(diamonds);
  } catch (error) {
    console.error('Error fetching diamonds:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/calls', async (req, res) => {
  try {
    const calls = await storage.getCallSessions();
    res.json(calls);
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// WebSocket server for media streaming
const mediaWss = new WebSocketServer({ 
  server, 
  path: '/media' 
});

interface TwilioStreamData {
  event: string;
  sequenceNumber?: string;
  media?: {
    timestamp: string;
    chunk: string;
    payload: string;
  };
  start?: {
    streamSed: string;
    accountSid: string;
    callSid: string;
    tracks: string[];
    mediaFormat: {
      encoding: string;
      sampleRate: number;
      channels: number;
    };
  };
  stop?: {
    streamSid: string;
    accountSid: string;
    callSid: string;
  };
}

// Store active connections
const activeConnections = new Map<string, {
  websocket: WebSocket;
  streamSid: string;
  callSid: string;
  startTime: Date;
}>();

mediaWss.on('connection', (ws) => {
  console.log('Twilio media stream connected');
  let connectionInfo: { streamSid: string; callSid: string } | null = null;

  ws.on('message', (message) => {
    try {
      const data: TwilioStreamData = JSON.parse(message.toString());
      
      switch (data.event) {
        case 'start':
          if (data.start) {
            connectionInfo = {
              streamSid: data.start.streamSid,
              callSid: data.start.callSid
            };
            
            // Store connection
            activeConnections.set(data.start.streamSid, {
              websocket: ws,
              streamSid: data.start.streamSid,
              callSid: data.start.callSid,
              startTime: new Date()
            });
            
            console.log('Media stream started:', {
              streamSid: data.start.streamSid,
              callSid: data.start.callSid,
              accountSid: data.start.accountSid,
              mediaFormat: data.start.mediaFormat
            });
          }
          break;
          
        case 'media':
          if (data.media && connectionInfo) {
            // Log media payload (base64 audio chunk)
            console.log('Media payload received:', {
              streamSid: connectionInfo.streamSid,
              timestamp: data.media.timestamp,
              chunk: data.media.chunk, 
              payloadLength: data.media.payload.length
            });
            
            // TODO: Forward to voiceAgent for processing
            // For now, just log the audio data
            console.log('Audio chunk size:', data.media.payload.length, 'bytes (base64)');
          }
          break;
          
        case 'stop':
          if (data.stop && connectionInfo) {
            console.log('Media stream stopped:', {
              streamSid: data.stop.streamSid,
              callSid: data.stop.callSid
            });
            
            // Cleanup connection
            activeConnections.delete(data.stop.streamSid);
            connectionInfo = null;
          }
          break;
          
        default:
          console.log('Unknown Twilio event:', data.event);
      }
    } catch (error) {
      console.error('Error parsing Twilio message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Twilio media stream disconnected');
    if (connectionInfo) {
      activeConnections.delete(connectionInfo.streamSid);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    if (connectionInfo) {
      activeConnections.delete(connectionInfo.streamSid);
    }
  });
});

// Dashboard WebSocket for real-time updates
const dashboardWss = new WebSocketServer({ 
  server, 
  path: '/ws' 
});

dashboardWss.on('connection', (ws) => {
  console.log('Dashboard connected');
  
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Diamond Voice Agent',
    timestamp: new Date().toISOString()
  }));

  ws.on('close', () => {
    console.log('Dashboard disconnected');
  });
});

// Function to broadcast to dashboard clients
function broadcastToDashboard(message: any) {
  dashboardWss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));
    }
  });
}

// Start server
server.listen(port, async () => {
  console.log(`Diamond Voice Agent server running on port ${port}`);
  console.log(`API available at: http://localhost:${port}`);
  console.log(`Media WebSocket at: ws://localhost:${port}/media`);
  console.log(`Dashboard WebSocket at: ws://localhost:${port}/ws`);
  console.log(`Health check: http://localhost:${port}/health`);
  
  // Initialize sample data
  try {
    const { seedDatabase } = await import('./seed.js');
    await seedDatabase();
  } catch (error) {
    console.log('Note: Database seeding skipped (requires database connection)');
  }
});

// Export for testing
export default app;
export { broadcastToDashboard, activeConnections };