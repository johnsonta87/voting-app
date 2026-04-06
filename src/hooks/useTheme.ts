import { useCallback, useEffect, useState } from 'react'
import type { Theme } from '~/lib/theme.ts'
import { THEME_STORAGE_KEY, applyTheme, readStoredTheme } from '~/lib/theme.ts'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return readStoredTheme() ?? 'light'
  })

  useEffect(() => {
    applyTheme(theme)

    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return {
    theme,
    setTheme,
    toggleTheme,
  }
}
