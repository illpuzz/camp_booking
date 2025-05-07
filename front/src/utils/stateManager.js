// utils/stateManager.js - 簡易狀態管理工具

/**
 * 從 localStorage 載入用戶狀態
 * @returns {Object} 包含用戶信息和視圖狀態的對象
 */
export const loadUserState = () => {
    try {
      const userJson = localStorage.getItem('currentUser');
      const viewState = localStorage.getItem('currentView');
      
      return {
        user: userJson ? JSON.parse(userJson) : null,
        view: viewState || 'connector'
      };
    } catch (error) {
      console.error('載入狀態失敗:', error);
      return { user: null, view: 'connector' };
    }
  };
  
  /**
   * 保存用戶狀態到 localStorage
   * @param {Object} state 包含用戶信息和視圖狀態的對象
   */
  export const saveUserState = (state) => {
    try {
      if (state.user) {
        localStorage.setItem('currentUser', JSON.stringify(state.user));
      } else {
        localStorage.removeItem('currentUser');
      }
      
      if (state.view) {
        localStorage.setItem('currentView', state.view);
      }
    } catch (error) {
      console.error('保存狀態失敗:', error);
    }
  };
  
  /**
   * 清除所有狀態
   */
  export const clearAllState = () => {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentView');
    } catch (error) {
      console.error('清除狀態失敗:', error);
    }
  };