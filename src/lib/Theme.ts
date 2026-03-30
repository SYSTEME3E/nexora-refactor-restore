// ─────────────────────────────────────────────────────────────────────────────
// lib/theme.ts — Système de thème global NEXORA
// Persiste dans localStorage, s'applique à TOUTES les pages automatiquement
// ─────────────────────────────────────────────────────────────────────────────

export const THEME_KEY = "nexora-theme";

export type NexoraTheme = "light" | "dark";

/** Lit le thème actuel depuis localStorage */
export function getTheme(): NexoraTheme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
    // Fallback : préférence système
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  } catch {}
  return "light";
}

/** Applique le thème sur <html> et le stocke */
export function applyTheme(theme: NexoraTheme) {
  const html = document.documentElement;
  if (theme === "dark") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}

/** Toggle le thème et retourne le nouveau */
export function toggleTheme(): NexoraTheme {
  const next: NexoraTheme = getTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

/** À appeler au démarrage de chaque page/layout pour appliquer le thème sauvegardé */
export function initTheme() {
  applyTheme(getTheme());
}
