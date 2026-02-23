import type { OutputFormatter } from './output';
import type { SessionMessage, SessionSummary } from '../models';

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toLocalISOStringWithOffset(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  const ms = String(d.getMilliseconds()).padStart(3, '0');

  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  const oh = pad2(Math.floor(abs / 60));
  const om = pad2(abs % 60);

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}.${ms}${sign}${oh}:${om}`;
}

function jsonReplacer(key: string, value: unknown): unknown {
  if (value instanceof Date) {
    // Match legacy C# output more closely:
    // - modified was stored as UTC (ends with Z)
    // - created/timestamp were local time (include offset)
    if (key === 'modified') return value.toISOString();
    return toLocalISOStringWithOffset(value);
  }
  return value;
}

export class JsonFormatter implements OutputFormatter {
  writeSessions(sessions: SessionSummary[]): void {
    // matches C# indented output
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(sessions, jsonReplacer, 2));
  }

  writeSession(session: SessionSummary | null): void {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(session, jsonReplacer, 2));
  }

  writeMessages(messages: SessionMessage[], _sessionId?: string): void {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(messages, jsonReplacer, 2));
  }
}
