import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date, pattern = 'MMM dd, yyyy') {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
}

export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '';
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return `${format(start, 'MMM dd')} — ${format(end, 'MMM dd, yyyy')}`;
}

export function formatRelativeDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getTripStatus(startDate, endDate) {
  const now = new Date();
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  if (isBefore(now, start)) return 'upcoming';
  if (isAfter(now, end)) return 'completed';
  return 'ongoing';
}

export function getBudgetColor(tier) {
  const colors = {
    backpacker: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    budget: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'mid-range': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    luxury: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return colors[tier] || colors['mid-range'];
}

export function getStatusColor(status) {
  const colors = {
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    upcoming: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    ongoing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  return colors[status] || colors.draft;
}

export function getCategoryIcon(category) {
  const icons = {
    food: '🍽️',
    attraction: '🏛️',
    transport: '🚗',
    accommodation: '🏨',
    activity: '🎯',
  };
  return icons[category] || '📍';
}

export function getDestinationGradient(name) {
  // Generate a deterministic gradient based on destination name
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    'from-teal-500 to-blue-600',
    'from-purple-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-rose-500 to-red-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
  ];
  return gradients[hash % gradients.length];
}
