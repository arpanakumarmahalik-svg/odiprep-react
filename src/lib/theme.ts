const THEME_KEY = 'odiprep_theme'

export function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
}

export function isDarkTheme(): boolean {
  return localStorage.getItem(THEME_KEY) === 'dark'
}

export function initTheme() {
  applyTheme(isDarkTheme())
}