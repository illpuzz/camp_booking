// authService.js - 身分驗證服務

/**
 * 身分驗證服務 - 在實際應用中，此服務會與後端 API 交互
 * 目前為了示範，使用 localStorage 模擬身分驗證功能
 */

import axios from 'axios';

const AUTH_KEY = 'camp_review_auth_user';

/**
 * 模擬登入
 * @param {string} username 用戶名
 * @param {string} password 密碼
 * @param {string} role 用戶角色
 * @returns {Object} 用戶資訊
 */
export const login = async (username, password, role) => {
  // 在實際應用中，這裡會發送請求到後端驗證
  // 現在為了示範，我們直接生成模擬數據
  
  try {
    // 模擬 API 呼叫延遲
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 生成隨機用戶 ID
    const userId = Math.floor(Math.random() * 1000) + 1;
    
    const user = {
      id: userId,
      name: username,
      role: role,
      token: `mock-jwt-token-${userId}`, // 模擬 JWT token
      loginTime: new Date().toISOString()
    };
    
    // 保存到 localStorage
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('登入失敗:', error);
    throw new Error('登入失敗，請檢查用戶名和密碼');
  }
};

/**
 * 登出用戶
 */
export const logout = () => {
  // 移除 localStorage 中的用戶資訊
  localStorage.removeItem(AUTH_KEY);
  
  // 清除 axios 的授權 header
  delete axios.defaults.headers.common['Authorization'];
};

/**
 * 獲取當前登入的用戶
 * @returns {Object|null} 用戶資訊或 null
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem(AUTH_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error('解析用戶資訊失敗:', error);
    return null;
  }
};

/**
 * 檢查用戶是否已登入
 * @returns {boolean} 是否已登入
 */
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

/**
 * 檢查用戶是否具有特定角色
 * @param {string} role 需要檢查的角色
 * @returns {boolean} 是否具有該角色
 */
export const hasRole = (role) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.role === role;
};

/**
 * 更新用戶資訊
 * @param {Object} userData 用戶資料
 */
export const updateUser = (userData) => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('用戶未登入');
  
  const updatedUser = {
    ...currentUser,
    ...userData
  };
  
  localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
  
  return updatedUser;
};

// 設置 axios 攔截器，自動在請求中添加授權 token
const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    config => {
      const user = getCurrentUser();
      if (user && user.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
};

// 初始化時設置攔截器
setupAxiosInterceptors();

export default {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  hasRole,
  updateUser
};