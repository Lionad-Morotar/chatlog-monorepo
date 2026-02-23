import { JsonFormatter } from './jsonFormatter';
import { TableFormatter } from './tableFormatter';
import type { OutputFormatter } from './output';
import { OutputFormat } from './output';

export { OutputFormat };

export function createFormatter(format: OutputFormat): OutputFormatter {
  switch (format) {
    case OutputFormat.Json:
      return new JsonFormatter();
    case OutputFormat.Table:
    default:
      return new TableFormatter();
  }
}
