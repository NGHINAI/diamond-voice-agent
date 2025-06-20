# Diamond Voice Agent

A real-time voice agent system for diamond sales using Twilio, OpenAI, and Supabase with low-latency audio streaming.

## Overview

This system provides a conversational AI agent that can handle incoming phone calls, understand diamond-related queries, and provide real-time responses with inventory lookups from a Supabase database.

## Features

- Real-time voice interaction via Twilio Programmable Voice
- OpenAI speech-to-speech integration for natural conversations
- Intent detection for diamond-related queries (carat, cut, color, clarity)
- Live inventory lookup from Supabase database
- Sub-500ms response latency
- Call transcription and interaction logging
- Live dashboard for monitoring calls and agent performance

## Architecture

- **Telephony Layer**: Twilio Programmable Voice with WebSocket streaming
- **Voice Processing**: OpenAI Realtime API for speech-to-speech
- **Intent Detection**: Real-time analysis of customer queries
- **Database**: Supabase PostgreSQL for diamond inventory and call logs
- **Backend**: Node.js/Express with WebSocket support
- **Frontend**: React dashboard for monitoring and analytics

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials
3. Run database migrations: `npm run db:migrate`
4. Start the development server: `npm run dev`
5. Configure Twilio webhook to point to your server

## Environment Variables

See `.env.example` for required environment variables including:
- Twilio credentials
- OpenAI API key
- Supabase database URL
- Server configuration

## API Endpoints

- `POST /api/voice/webhook` - Twilio voice webhook
- `GET /api/calls` - List call sessions
- `GET /api/diamonds` - Diamond inventory
- `POST /api/diamonds/search` - Search diamonds by criteria

## WebSocket Events

- `call:start` - New call initiated
- `call:transcript` - Real-time transcription
- `intent:detected` - Diamond query detected
- `agent:response` - AI agent response

## Development

```bash
npm run dev          # Start development server
npm run db:studio    # Open database studio
npm run build        # Build for production
npm run start        # Start production server
```

## Deployment

This project is configured for deployment on Replit with automatic builds and health checks.