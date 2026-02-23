export function truncate(value: string | undefined, maxLength: number): string {
  if (!value) return '-';
  return value.length <= maxLength ? value : value.slice(0, maxLength - 3) + '...';
}

export function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'] as const;
  let order = 0;
  let size = bytes;
  while (size >= 1024 && order < sizes.length - 1) {
    order++;
    size /= 1024;
  }
  const rounded = order === 0 ? String(Math.round(size)) : size.toFixed(size >= 10 ? 0 : 1);
  return `${rounded} ${sizes[order]}`;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatDateTime(d: Date | undefined, withSeconds = false): string {
  if (!d) return '-';
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return withSeconds ? `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}` : `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export function formatDateTimeUTC(d: Date | undefined, withSeconds = false): string {
  if (!d) return '-';
  const yyyy = d.getUTCFullYear();
  const mm = pad2(d.getUTCMonth() + 1);
  const dd = pad2(d.getUTCDate());
  const hh = pad2(d.getUTCHours());
  const mi = pad2(d.getUTCMinutes());
  const ss = pad2(d.getUTCSeconds());
  return withSeconds ? `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}` : `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export function formatTime(d: Date | undefined): string {
  if (!d) return '??:??:??';
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return `${hh}:${mi}:${ss}`;
}
