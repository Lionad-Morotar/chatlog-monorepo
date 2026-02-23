import type { OutputFormatter } from './output';
import type { SessionMessage, SessionSummary } from '../models';
import { formatBytes, formatDateTime, formatDateTimeUTC, formatTime, truncate } from '../utils/format';

export class TableFormatter implements OutputFormatter {
  writeSessions(sessions: SessionSummary[]): void {
    if (sessions.length === 0) {
      // eslint-disable-next-line no-console
      console.log('No sessions found.');
      return;
    }

    // eslint-disable-next-line no-console
    console.log(`${'#'.padEnd(4)} ${'Created'.padEnd(18)} ${'Branch'.padEnd(16)} ${'Msgs'.padEnd(6)} ${'Tools'.padEnd(7)} ${'Size'.padEnd(8)} First Prompt`);
    // eslint-disable-next-line no-console
    console.log('-'.repeat(120));

    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      const created = formatDateTime(s.created, false);
      const prompt = truncate((s.firstPrompt ?? '').replace(/\n/g, ' '), 50);
      const size = formatBytes(s.fileSizeBytes);
      const branch = truncate(s.gitBranch, 16);

      // eslint-disable-next-line no-console
      console.log(`${String(i + 1).padEnd(4)} ${created.padEnd(18)} ${branch.padEnd(16)} ${String(s.userMessageCount).padEnd(6)} ${String(s.toolUseCount).padEnd(7)} ${size.padEnd(8)} ${prompt}`);
    }

    // eslint-disable-next-line no-console
    console.log();
    // eslint-disable-next-line no-console
    console.log(`${sessions.length} sessions, ${sessions.reduce((sum, s) => sum + s.userMessageCount, 0)} total user messages`);
  }

  writeSession(session: SessionSummary | null): void {
    if (!session) {
      // eslint-disable-next-line no-console
      console.log('Session not found.');
      return;
    }

    // eslint-disable-next-line no-console
    console.log(`Session:    ${session.sessionId}`);
    // eslint-disable-next-line no-console
    console.log(`Branch:     ${session.gitBranch ?? '-'}`);
    // eslint-disable-next-line no-console
    console.log(`Project:    ${session.projectPath}`);
    // eslint-disable-next-line no-console
    console.log(`Created:    ${formatDateTime(session.created, true)}`);
    // eslint-disable-next-line no-console
    console.log(`Modified:   ${formatDateTimeUTC(session.modified, true)}`);
    // eslint-disable-next-line no-console
    console.log(`Messages:   ${session.userMessageCount} user, ${session.assistantMessageCount} assistant`);
    // eslint-disable-next-line no-console
    console.log(`Tool uses:  ${session.toolUseCount}`);
    // eslint-disable-next-line no-console
    console.log(`Size:       ${formatBytes(session.fileSizeBytes)}`);
    // eslint-disable-next-line no-console
    console.log(`Prompt:     ${session.firstPrompt ?? '-'}`);
  }

  writeMessages(messages: SessionMessage[], _sessionId?: string): void {
    if (messages.length === 0) {
      // eslint-disable-next-line no-console
      console.log('No messages found.');
      return;
    }

    for (const msg of messages) {
      const time = formatTime(msg.timestamp);
      const role = msg.role === 'user' ? 'USER' : 'ASST';
      const roleColor = msg.role === 'user' ? '\x1b[36m' : '\x1b[33m';
      const reset = '\x1b[0m';

      // eslint-disable-next-line no-console
      console.log(`${roleColor}[${time}] ${role}${reset}`);

      if (msg.toolUses.length > 0) {
        const toolNames = msg.toolUses.map(t => t.name).join(', ');
        // eslint-disable-next-line no-console
        console.log(`  Tools: ${toolNames}`);
      }

      if (msg.content) {
        const lines = msg.content.split('\n');
        for (const line of lines.slice(0, 20)) {
          // eslint-disable-next-line no-console
          console.log(`  ${line}`);
        }
        if (lines.length > 20) {
          // eslint-disable-next-line no-console
          console.log(`  ... (${lines.length - 20} more lines)`);
        }
      }

      // eslint-disable-next-line no-console
      console.log();
    }

    // eslint-disable-next-line no-console
    console.log(`${messages.length} messages`);
  }
}
