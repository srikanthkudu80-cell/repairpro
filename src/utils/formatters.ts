import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export function formatDate(date: Date | Timestamp | null | undefined): string {
  if (!date) return 'No date';
  const d = date instanceof Timestamp ? date.toDate() : date;
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
}

export function formatTime(date: Date | Timestamp | null | undefined): string {
  if (!date) return '';
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, 'h:mm a');
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
