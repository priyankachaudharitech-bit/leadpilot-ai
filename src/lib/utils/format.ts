import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(date: string | Date, formatStr = 'MMM d, yyyy'): string {
  return format(new Date(date), formatStr);
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatScore(score: number): string {
  return score.toString();
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})?(\d{3})(\d{4})$/);
  if (!match) return phone;
  return match[1] ? `(${match[1]}) ${match[2]}-${match[3]}` : `${match[2]}-${match[3]}`;
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}
