import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileKeysFromMarkdown(markdown: string): string[] {
  const regex = /\/api\/file\/([a-zA-Z0-9_-]+\.[a-zA-Z0-9]+)/g;
  const matches = markdown.match(regex) || [];
  return matches.map((match) => match.split("/").pop()!);
}
