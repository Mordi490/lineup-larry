import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// yoinked from: https://ui.shadcn.com/docs/installation
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
