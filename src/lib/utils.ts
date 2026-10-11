import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function findBetween(s, start, end) {
  const si = s.indexOf(start);
  if (si === -1) return '';
  const from = si + start.length;
  const ei = s.indexOf(end, from);
  if (ei === -1) return '';
  return s.substring(from, ei);
}

export const formatBytes = (bytes: string | number | undefined) => {
  if (bytes === undefined || bytes === null) return ""
  const b = typeof bytes === "string" ? parseInt(bytes, 10) : bytes
  if (isNaN(b)) return String(bytes)
  if (b === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(b) / Math.log(1024))
  const value = b / Math.pow(1024, i)
  return `${value.toFixed(2)} ${units[i]}`
}
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function dateTimeAgo(dt:Date){
  const now = new Date();
  const seconds = Math.floor((now.getTime() - dt.getTime()) / 1000);

  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (hours < 24) {
    return remMinutes > 0
      ? `${hours} hours ${remMinutes} minutes ago`
      : `${hours} hours ago`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (days < 30) {
    return remHours > 0
      ? `${days} days ${remHours} hours ago`
      : `${days} days ago`;
  }
  const months = Math.floor(days / 30);
  const remDays = days % 30;
  if (months < 12) {
    return remDays > 0
      ? `${months} months ${remDays} days ago`
      : `${months} months ago`;
  }
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths > 0
    ? `${years} years ${remMonths} months ago`
    : `${years} years ago`;
}