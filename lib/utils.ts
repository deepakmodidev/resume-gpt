import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const deepMerge = (
  target: Record<string, unknown>,
  source: Record<string, unknown>
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
            value as Record<string, unknown>
          )
        : value;
  });
  return result;
};
