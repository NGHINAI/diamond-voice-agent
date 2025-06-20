import twilio from 'twilio';
import { WebSocket } from 'ws';
import { VoiceAgent } from './voiceAgent.js';
import { storage } from './storage.js';

export interface TwilioStreamData {
  event: string;
  sequenceNumber?: string;
  media?: {
    timestamp: string;
    chunk: string;
    payload: string;
  };
  start?: {
    streamSid: string;
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

export class TwilioVoiceHandler {
  private callSid: string;
  private streamSid: string | null = null;
  private voiceAgent: VoiceAgent | null = null;
  private websocket: WebSocket;
  private callSessionId: string;

  constructor(websocket: WebSocket, callSid: string, callSessionId: string) {
    this.websocket = websocket;
    this.callSid = callSid;
    this.callSessionId = callSessionId;
    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers(): void {
    this.websocket.on('message', async (message) => {
      try {
        const data: TwilioStreamData = JSON.parse(message.toString());
        await this.handleTwilioMessage(data);
      } catch (error) {
        console.error('Error parsing Twilio message:', error);
      }
    });

    this.websocket.on('close', () => {
      console.log(`Twilio stream closed for call ${this.callSid}`);
      if (this.voiceAgent) {
        this.voiceAgent.disconnect();
      }
    });

    this.websocket.on('error', (error) => {
      console.error('Twilio WebSocket error:', error);
    });
  }

  private async handleTwilioMessage(data: TwilioStreamData): Promise<void> {
    switch (data.event) {
      case 'connected':
        console.log('Twilio WebSocket connected');
        break;

      case 'start':
        if (data.start) {
          this.streamSid = data.start.streamSid;
          console.log(`Audio stream started: ${this.streamSid}`);
          
          // Initialize voice agent
          this.voiceAgent = new VoiceAgent({
            callSessionId: this.callSessionId,
            callerNumber: data.start.callSid,
            onIntentDetected: this.handleIntentDetected.bind(this),
            onTranscript: this.handleTranscript.bind(this),
            onAgentResponse: this.handleAgentResponse.bind(this)
          });

          await this.voiceAgent.initialize();
        }
        break;

      case 'media':
        if (data.media && this.voiceAgent) {
          // Convert Twilio audio payload to buffer
          const audioBuffer = Buffer.from(data.media.payload, 'base64');
          this.voiceAgent.sendAudio(audioBuffer);
        }
        break;

      case 'stop':
        console.log('Audio stream stopped');
        if (this.voiceAgent) {
          this.voiceAgent.disconnect();
        }
        break;

      default:
        console.log('Unknown Twilio event:', data.event);
    }
  }

  private async handleIntentDetected(intent: string, confidence: number, extractedData: any): Promise<void> {
    console.log(`Intent detected: ${intent} (confidence: ${confidence}%)`, extractedData);
    
    // Broadcast intent detection to dashboard
    this.broadcastEvent({
      type: 'intent:detected',
      payload: { intent, confidence, extractedData, callSid: this.callSid }
    });
  }

  private async handleTranscript(transcript: string): Promise<void> {
    console.log('Transcript:', transcript);
    
    // Update call session with transcript
    await storage.updateCallSession(this.callSessionId, {
      transcript: transcript
    });

    // Broadcast transcript to dashboard
    this.broadcastEvent({
      type: 'call:transcript',
      payload: { transcript, callSid: this.callSid, timestamp: new Date() }
    });
  }

  private async handleAgentResponse(response: string): Promise<void> {
    console.log('Agent response:', response);
    
    // Broadcast agent response to dashboard
    this.broadcastEvent({
      type: 'agent:response',
      payload: { response, callSid: this.callSid, timestamp: new Date() }
    });
  }

  private broadcastEvent(event: any): void {
    // This would be handled by the main server's broadcast function
    // For now, we'll log it
    console.log('Broadcasting event:', event.type);
  }

  public sendAudioToTwilio(audioData: Buffer): void {
    if (this.websocket && this.streamSid) {
      const mediaMessage = {
        event: 'media',
        streamSid: this.streamSid,
        media: {
          payload: audioData.toString('base64')
        }
      };
      
      this.websocket.send(JSON.stringify(mediaMessage));
    }
  }

  public async endCall(): Promise<void> {
    // Update call session status
    await storage.updateCallSession(this.callSessionId, {
      status: 'completed',
      endTime: new Date()
    });

    if (this.voiceAgent) {
      this.voiceAgent.disconnect();
    }

    if (this.websocket) {
      this.websocket.close();
    }
  }
}

export function createTwilioResponse(streamUrl: string): string {
  const twiml = new twilio.twiml.VoiceResponse();
  
  // Greet the caller
  twiml.say({
    voice: 'alice',
    language: 'en-US'
  }, 'Hello! Welcome to Diamond Sales. I\'m connecting you with our AI consultant who will help you find the perfect diamond.');

  // Start streaming audio to WebSocket
  const connect = twiml.connect();
  connect.stream({
    url: streamUrl,
    name: 'diamond-agent-stream'
  });

  return twiml.toString();
}

export default TwilioVoiceHandler;