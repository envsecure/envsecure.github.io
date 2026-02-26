export const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
export const GITHUB_URL = "https://github.com/yourusername/envshare";

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

export function downloadEnv(text) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = ".env";
  a.click();
  URL.revokeObjectURL(url);
}
