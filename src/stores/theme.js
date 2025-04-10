import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: document.documentElement.classList.contains('dark')
  }),

  actions: {
    toggleDarkMode() {
      this.isDark = !this.isDark
      document.documentElement.classList.toggle('dark')
      // Save preference to localStorage
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
    },

    initTheme() {
      // Check localStorage first
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.isDark = savedTheme === 'dark'
        document.documentElement.classList.toggle('dark', this.isDark)
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.isDark = prefersDark
        document.documentElement.classList.toggle('dark', prefersDark)
      }
    }
  }
})