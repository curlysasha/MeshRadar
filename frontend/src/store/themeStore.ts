import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark' as Theme,
      setTheme: (theme: Theme) => {
        set({ theme })
        applyTheme(theme)
      },
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark'
          applyTheme(newTheme)
          return { theme: newTheme }
        })
      },
    }),
    {
      name: 'meshtastic-theme',
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            applyTheme(state.theme)
          }
        }
      },
    }
  )
)

function applyTheme(theme: Theme) {
  const root = document.documentElement

  // Create overlay for flash effect
  let overlay = document.getElementById('theme-transition-overlay')
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.id = 'theme-transition-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0);
      pointer-events: none;
      z-index: 9999;
    `
    document.body.appendChild(overlay)
  }

  // Flash effect
  overlay.style.transition = 'none'
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.08)'

  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  // Fade overlay away
  setTimeout(() => {
    overlay!.style.transition = 'background-color 0.3s ease'
    overlay!.style.backgroundColor = 'rgba(0, 0, 0, 0)'
  }, 30)

  // Clean up overlay
  setTimeout(() => {
    overlay!.style.transition = 'none'
  }, 330)
}
