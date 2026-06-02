import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ResumeData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Flatten ResumeData into plain text for embedding into the talent pool.
export function resumeToText(data: ResumeData): string {
  const lines: string[] = [];

  if (data.name) lines.push(data.name);
  if (data.title) lines.push(data.title);

  const contact = [
    data.contact?.email,
    data.contact?.phone,
    data.contact?.location,
    data.contact?.linkedin,
    data.contact?.github,
    data.contact?.blogs,
  ].filter(Boolean);
  if (contact.length) lines.push(contact.join(" | "));

  if (data.summary) lines.push("\nSummary\n" + data.summary);

  if (data.experience?.length) {
    lines.push("\nExperience");
    for (const e of data.experience) {
      lines.push(
        [e.title, e.company, e.location, e.period].filter(Boolean).join(" — "),
      );
      if (e.description) lines.push(e.description);
    }
  }

  if (data.projects?.length) {
    lines.push("\nProjects");
    for (const p of data.projects) {
      lines.push(p.name);
      if (p.description) lines.push(p.description);
      if (p.techStack?.length) lines.push("Tech: " + p.techStack.join(", "));
    }
  }

  if (data.skills?.length) lines.push("\nSkills\n" + data.skills.join(", "));

  if (data.education?.length) {
    lines.push("\nEducation");
    for (const ed of data.education) {
      lines.push(
        [ed.degree, ed.institution, ed.year].filter(Boolean).join(" — "),
      );
    }
  }

  if (data.achievements?.length)
    lines.push("\nAchievements\n" + data.achievements.join("\n"));

  return lines.join("\n").trim();
}

/**
 * Normalize text before hashing for dedup.
 * Both client (UploadZone) and server (talent action) must use this same function
 * or hashes won't match across the boundary.
 */
export function normalizeForHash(text: string): string {
  return text.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
}

export const deepMerge = (
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> => {
  if (
    !target ||
    !source ||
    typeof target !== "object" ||
    typeof source !== "object"
  )
    return source;

  const result = { ...target };
  Object.entries(source).forEach(([key, value]) => {
    result[key] = Array.isArray(value)
      ? value
      : value && typeof value === "object"
        ? deepMerge(
            (result[key] as Record<string, unknown>) ?? {},
            value as Record<string, unknown>,
          )
        : value;
  });
  return result;
};
