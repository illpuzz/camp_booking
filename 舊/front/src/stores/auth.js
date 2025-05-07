import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 模擬用戶數據，實際開發中應從 API 獲取
    user: {
      id: 101,
      name: '王小明',
      role: 'user' // 'user' 或 'admin'
    },
    isAuthenticated: true // 默認已登入狀態，方便測試
  }),
  
  getters: {
    currentUser: (state) => state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    userId: (state) => state.user?.id
  },
  
  actions: {
    // 模擬登入 (實際實現會與後端 API 交互)
    login(userData) {
      this.user = userData
      this.isAuthenticated = true
    },
    
    logout() {
      this.user = null
      this.isAuthenticated = false
    }
  },
  
  // 持久化存儲
  persist: {
    storage: localStorage
  }
})