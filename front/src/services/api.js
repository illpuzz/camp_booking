// api.js - API 服務配置

import axios from 'axios';

// 基礎 API 配置
const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:8080';
const DEFAULT_TIMEOUT = 10000; // 10 秒

// 創建 axios 實例
const api = axios.create({
  baseURL: API_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    // 在發送請求前做些什麼
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // 對請求錯誤做些什麼
    console.error('API 請求攔截器錯誤:', error);
    return Promise.reject(error);
  }
);

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    // 處理響應數據
    return response;
  },
  (error) => {
    // 處理響應錯誤
    if (error.response) {
      // 伺服器回應了錯誤狀態碼
      console.error('API 錯誤:', error.response.status, error.response.data);
      
      // 處理特定狀態碼
      switch (error.response.status) {
        case 401: // 未授權
          // 可以在這裡處理登出邏輯
          console.error('未授權，請重新登入');
          localStorage.removeItem('token');
          // 如果使用 Vue Router，可以導航到登入頁面
          // window.location.href = '/login';
          break;
        case 403: // 禁止訪問
          console.error('權限不足，無法訪問此資源');
          break;
        case 404: // 資源不存在
          console.error('請求的資源不存在');
          break;
        case 500: // 伺服器錯誤
          console.error('伺服器錯誤，請稍後再試');
          break;
        default:
          // 其他錯誤
          console.error(`API 錯誤: ${error.response.status}`);
      }
    } else if (error.request) {
      // 請求已發送，但沒有收到響應
      console.error('沒有收到伺服器響應，請檢查網絡連接');
    } else {
      // 設置請求時發生錯誤
      console.error('API 請求設置錯誤:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 通用 API 方法
export const get = async (url, params = {}, config = {}) => {
  try {
    const response = await api.get(url, { params, ...config });
    return response.data;
  } catch (error) {
    console.error(`GET 請求失敗 ${url}:`, error);
    throw error;
  }
};

export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    console.error(`POST 請求失敗 ${url}:`, error);
    throw error;
  }
};

export const put = async (url, data = {}, config = {}) => {
  try {
    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    console.error(`PUT 請求失敗 ${url}:`, error);
    throw error;
  }
};

export const del = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config);
    return response.data;
  } catch (error) {
    console.error(`DELETE 請求失敗 ${url}:`, error);
    throw error;
  }
};

// 上傳文件
export const upload = async (url, file, data = {}, config = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // 添加其他表單數據
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    
    const uploadConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    };
    
    const response = await api.post(url, formData, uploadConfig);
    return response.data;
  } catch (error) {
    console.error(`文件上傳失敗 ${url}:`, error);
    throw error;
  }
};

// 導出 API 實例和方法
export default {
  api,
  get,
  post,
  put,
  delete: del, // delete 是關鍵字，使用 del 作為變數名稱
  upload
};