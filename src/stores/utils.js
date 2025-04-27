import { defineStore } from 'pinia'

export const useUtilsStore = defineStore('utils', {
  state: () => ({
    timeoutIds: new Map(),
  }),

  actions: {
    debounce(fn, delay = 300, key = fn.toString()) {
      return (...args) => {
        // Clear existing timeout for this function
        if (this.timeoutIds.has(key)) {
          clearTimeout(this.timeoutIds.get(key))
        }

        // Set new timeout
        const timeoutId = setTimeout(() => {
          fn(...args)
          this.timeoutIds.delete(key)
        }, delay)

        // Store the timeout ID
        this.timeoutIds.set(key, timeoutId)
      }
    },

    clearDebounce(key) {
      if (this.timeoutIds.has(key)) {
        clearTimeout(this.timeoutIds.get(key))
        this.timeoutIds.delete(key)
      }
    },
  },
})
