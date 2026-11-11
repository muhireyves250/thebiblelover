export type ShareResult = 'shared' | 'copied' | 'failed';

/**
 * The one share mechanism used wherever a "Share" action needs the
 * device's native share sheet with a clipboard fallback (as opposed to
 * ShareModal's social-platform-buttons sheet, used elsewhere in the app).
 * Tries navigator.share first; falls back to copying "text url" to the
 * clipboard when it's unavailable or the user's device can't complete it
 * for a reason other than the user themselves cancelling.
 */
export async function shareOrCopy(data: { title?: string; text: string; url: string }): Promise<ShareResult> {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return 'shared'; // user cancelled - not a failure
    }
  }
  try {
    await navigator.clipboard.writeText(`${data.text} ${data.url}`);
    return 'copied';
  } catch {
    return 'failed';
  }
}
