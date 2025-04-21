import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

// 引入 Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'

// 創建 Pinia 實例並使用持久化插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 創建 Vue 應用
const app = createApp(App)

// 使用路由和狀態管理
app.use(router)
app.use(pinia)

// 掛載應用
app.mount('#app')