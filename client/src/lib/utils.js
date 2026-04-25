import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const isBrowser = typeof window !== 'undefined';

export function readCachedJSON(key, maxAgeMs, storage = isBrowser ? window.localStorage : null) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.timestamp !== 'number') return null;
    if (Date.now() - parsed.timestamp > maxAgeMs) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

export function writeCachedJSON(key, value, storage = isBrowser ? window.localStorage : null) {
  if (!storage) return;
  try {
    storage.setItem(
      key,
      JSON.stringify({
        timestamp: Date.now(),
        value,
      })
    );
  } catch {
    // Ignore storage quota errors.
  }
}

export function getImageUrl(imagePath) {
  if (!imagePath) return '/images/placeholder.png';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/images/')) return imagePath; // Local public assets
  // Ensure we don't have double slashes
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}`;
}
