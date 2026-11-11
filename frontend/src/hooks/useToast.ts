import { useRef, useState } from 'react';

/** A small, auto-dismissing status message (e.g. "Copied to clipboard"). */
export function useToast(durationMs = 2000) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showToast = (message: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToastMessage(message);
    timeoutRef.current = setTimeout(() => setToastMessage(null), durationMs);
  };

  return { toastMessage, showToast };
}
