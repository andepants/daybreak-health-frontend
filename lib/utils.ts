import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Scrolls to and focuses the first invalid form field
 *
 * Finds the first element with aria-invalid="true" within the given container
 * (or document if none provided), scrolls it into view, and focuses it.
 *
 * @param formElement - Optional container element to search within
 *
 * @example
 * // After form validation fails
 * const isValid = await trigger();
 * if (!isValid) {
 *   scrollToFirstError(formRef.current);
 * }
 */
export function scrollToFirstError(formElement?: HTMLElement | null): void {
  const container = formElement || document;
  const firstError = container.querySelector('[aria-invalid="true"]');

  if (firstError instanceof HTMLElement) {
    firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    // Small delay to allow scroll to complete before focusing
    setTimeout(() => {
      firstError.focus();
    }, 100);
  }
}
