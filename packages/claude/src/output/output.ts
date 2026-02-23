import type { SessionMessage, SessionSummary } from '../models';

export enum OutputFormat {
  Table = 'table',
  Json = 'json'
}

export interface OutputFormatter {
  writeSessions(sessions: SessionSummary[]): void;
  writeSession(session: SessionSummary | null): void;
  writeMessages(messages: SessionMessage[], sessionId?: string): void;
}
