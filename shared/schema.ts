import { pgTable, text, timestamp, uuid, integer, jsonb, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Roadmap table for tracking project progress
export const roadmap = pgTable('roadmap', {
  id: uuid('id').defaultRandom().primaryKey(),
  task: text('task').notNull(),
  status: text('status').notNull().default('TODO'), // TODO, IN_PROGRESS, DONE
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Call sessions table
export const callSessions = pgTable('call_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  twilioCallSid: text('twilio_call_sid').notNull().unique(),
  callerNumber: text('caller_number').notNull(),
  status: text('status').notNull().default('active'), // active, completed, failed
  startTime: timestamp('start_time').defaultNow().notNull(),
  endTime: timestamp('end_time'),
  duration: integer('duration'), // in seconds
  transcript: text('transcript'),
  metadata: jsonb('metadata'),
});

// Diamond inventory table
export const diamonds = pgTable('diamonds', {
  id: uuid('id').defaultRandom().primaryKey(),
  sku: text('sku').notNull().unique(),
  carat: text('carat').notNull(),
  cut: text('cut').notNull(),
  color: text('color').notNull(),
  clarity: text('clarity').notNull(),
  price: integer('price').notNull(), // in cents
  available: boolean('available').notNull().default(true),
  description: text('description'),
  certificateNumber: text('certificate_number'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Intent detection events
export const intentEvents = pgTable('intent_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  callSessionId: uuid('call_session_id').references(() => callSessions.id).notNull(),
  intent: text('intent').notNull(), // diamond_inquiry, price_check, availability_check, etc.
  confidence: integer('confidence').notNull(), // 0-100
  extractedData: jsonb('extracted_data'), // carat, cut, color, clarity, etc.
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  agentResponse: text('agent_response'),
});

// Agent responses and interactions
export const agentInteractions = pgTable('agent_interactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  callSessionId: uuid('call_session_id').references(() => callSessions.id).notNull(),
  type: text('type').notNull(), // user_speech, agent_response, system_event
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  metadata: jsonb('metadata'),
});

// Insert schemas
export const insertRoadmapSchema = createInsertSchema(roadmap).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCallSessionSchema = createInsertSchema(callSessions).omit({
  id: true,
  startTime: true,
});

export const insertDiamondSchema = createInsertSchema(diamonds).omit({
  id: true,
  createdAt: true,
});

export const insertIntentEventSchema = createInsertSchema(intentEvents).omit({
  id: true,
  timestamp: true,
});

export const insertAgentInteractionSchema = createInsertSchema(agentInteractions).omit({
  id: true,
  timestamp: true,
});

// Types
export type InsertRoadmap = z.infer<typeof insertRoadmapSchema>;
export type InsertCallSession = z.infer<typeof insertCallSessionSchema>;
export type InsertDiamond = z.infer<typeof insertDiamondSchema>;
export type InsertIntentEvent = z.infer<typeof insertIntentEventSchema>;
export type InsertAgentInteraction = z.infer<typeof insertAgentInteractionSchema>;

export type Roadmap = typeof roadmap.$inferSelect;
export type CallSession = typeof callSessions.$inferSelect;
export type Diamond = typeof diamonds.$inferSelect;
export type IntentEvent = typeof intentEvents.$inferSelect;
export type AgentInteraction = typeof agentInteractions.$inferSelect;