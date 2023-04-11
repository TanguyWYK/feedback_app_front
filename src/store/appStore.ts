// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('appStore', {
  state: () => ({
    manager:{
      email: '',
      id: 0,
    }
  }),
  getters: {
    managerId(state) {
      return state.manager.id
    },
    managerEmail(state) {
      return state.manager.email
    },
  },
  actions: {
    // any amount of arguments, return a promise or not
    setManager(id: number, email: string) {
      // you can directly mutate the state
      this.manager = {
        email: email,
        id: id,
      }
    },
  },
})
