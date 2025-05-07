// main.js - 應用程序入口
import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'


// 設置 axios 默認值
axios.defaults.baseURL = 'http://localhost:8080'; // 根據實際 API 地址調整
axios.defaults.headers.common['Content-Type'] = 'application/json';

// 創建 axios 攔截器用於處理請求和響應
axios.interceptors.request.use(
  config => {
    // 在請求發送前可以進行一些處理，例如添加 token
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 處理 API 錯誤
    console.error('API 請求失敗:', error);
    
    if (error.response) {
      // 伺服器回應了錯誤狀態碼
      console.error('錯誤狀態碼:', error.response.status);
      console.error('錯誤數據:', error.response.data);
    } else if (error.request) {
      // 請求已發送，但沒有收到響應
      console.error('沒有收到響應:', error.request);
    } else {
      // 請求設置時出現錯誤
      console.error('請求錯誤:', error.message);
    }
    
    return Promise.reject(error);
  }
);

const app = createApp(App);

// 將 axios 添加為全局屬性
app.config.globalProperties.$axios = axios;

// 全局錯誤處理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局錯誤:', err);
  console.error('錯誤組件:', vm);
  console.error('錯誤信息:', info);
};

// 掛載應用
app.mount('#app');