// ---------------------------------------------------------------
// Detects when a page is being viewed inside a social app's built-in
// "in-app browser" (Instagram, Snapchat, TikTok, Facebook, etc.)
// rather than a real browser like Safari or Chrome.
//
// This matters because in-app browsers commonly block the kind of
// file-download action "Save Contact" relies on to open the native
// Add Contact sheet — a limitation of those apps, not this site.
// ---------------------------------------------------------------

export type InAppBrowserInfo = {
  isInApp: boolean;
  appName: string | null;
};

const PATTERNS: { match: RegExp; name: string }[] = [
  { match: /Snapchat/i, name: "Snapchat" },
  { match: /Instagram/i, name: "Instagram" },
  { match: /FBAN|FBAV|FB_IAB/i, name: "Facebook" },
  { match: /Messenger/i, name: "Messenger" },
  { match: /\bTikTok\b|musical_ly|BytedanceWebview/i, name: "TikTok" },
  { match: /Twitter/i, name: "X (Twitter)" },
  { match: /LinkedInApp/i, name: "LinkedIn" },
  { match: /Line\//i, name: "LINE" },
  { match: /\bPinterest\b/i, name: "Pinterest" },
];

export function detectInAppBrowser(userAgent: string | null | undefined): InAppBrowserInfo {
  if (!userAgent) return { isInApp: false, appName: null };
  for (const { match, name } of PATTERNS) {
    if (match.test(userAgent)) return { isInApp: true, appName: name };
  }
  return { isInApp: false, appName: null };
}
