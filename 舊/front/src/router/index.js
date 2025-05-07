import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../App.vue')
  }
  // 可以在這裡添加更多路由
]

// 創建路由實例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 導出路由實例（這是默認導出，解決 "No matching export" 錯誤）
export default router