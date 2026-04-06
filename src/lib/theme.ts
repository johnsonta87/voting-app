export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'

export function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark'
}

export function readStoredTheme(): Theme | null {
  if (import.meta.env.SSR) return null

  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  return isTheme(storedTheme) ? storedTheme : null
}

export function applyTheme(theme: Theme) {
  if (import.meta.env.SSR) return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

function bootstrapTheme(storageKey: string) {
  try {
    const storedTheme = localStorage.getItem(storageKey)
    const theme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light'

    document.documentElement.classList.toggle('dark', theme === 'dark')
  } catch {
    // Ignore storage access failures during initial theme bootstrap.
  }
}

export function getThemeScript() {
  return `(${bootstrapTheme.toString()})(${JSON.stringify(THEME_STORAGE_KEY)});`
}

