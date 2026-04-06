import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getImageUrl(imagePath) {
  if (!imagePath) return '/images/placeholder.png';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/images/')) return imagePath; // Local public assets
  // Ensure we don't have double slashes
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}`;
}
