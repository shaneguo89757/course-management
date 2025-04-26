import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatDate = {
  yyyyMMdd: (date: Date) => format(date, "yyyyMMdd"),
  yyyyMM: (date: Date) => format(date, "yyyyMM"),
  yyyy: (date: Date) => format(date, "yyyy"),
  MM: (date: Date) => format(date, "MM"),
  dd: (date: Date) => format(date, "dd"),
}

