// store/index.js - 狀態管理
// 這是一個簡單的狀態管理實現，不使用 Vuex 或 Pinia

import { reactive, readonly } from 'vue';
import authService from '../services/authService';

// 全局狀態
const state = reactive({
  // 用戶相關
  user: null,
  isAuthenticated: false,
  
  // 評價相關
  reviews: [],
  currentReview: null,
  totalReviews: 0,
  
  // 系統相關
  loading: false,
  error: null,
  notification: null,
  
  // 篩選條件
  filters: {
    keyword: '',
    minRating: 0,
    sortBy: 'createdAt',
    direction: 'DESC'
  }
});

// 初始化
const initialize = async () => {
  // 從 localStorage 獲取用戶信息
  const savedUser = authService.getCurrentUser();
  if (savedUser) {
    state.user = savedUser;
    state.isAuthenticated = true;
  }
};

// 用戶相關操作
const userActions = {
  // 設置用戶
  setUser(user) {
    state.user = user;
    state.isAuthenticated = !!user;
  },
  
  // 登出
  logout() {
    authService.logout();
    state.user = null;
    state.isAuthenticated = false;
  },
  
  // 更新用戶資料
  updateUserInfo(userData) {
    if (state.user) {
      state.user = { ...state.user, ...userData };
    }
  }
};

// 評價相關操作
const reviewActions = {
  // 設置評價列表
  setReviews(reviews, total = null) {
    state.reviews = reviews;
    if (total !== null) {
      state.totalReviews = total;
    }
  },
  
  // 添加評價
  addReview(review) {
    state.reviews = [review, ...state.reviews];
    state.totalReviews++;
  },
  
  // 更新評價
  updateReview(updatedReview) {
    const index = state.reviews.findIndex(r => r.id === updatedReview.id);
    if (index !== -1) {
      state.reviews[index] = updatedReview;
    }
  },
  
  // 刪除評價
  deleteReview(reviewId) {
    state.reviews = state.reviews.filter(r => r.id !== reviewId);
    state.totalReviews--;
  },
  
  // 設置當前評價
  setCurrentReview(review) {
    state.currentReview = review;
  },
  
  // 切換評價點讚狀態
  toggleLike(reviewId) {
    const review = state.reviews.find(r => r.id === reviewId);
    if (review) {
      const wasLiked = review.userLikeStatus === 1;
      review.userLikeStatus = wasLiked ? 0 : 1;
      review.likeCount = wasLiked ? 
        Math.max(0, (review.likeCount || 0) - 1) : 
        (review.likeCount || 0) + 1;
    }
  }
};

// 篩選條件操作
const filterActions = {
  // 設置篩選條件
  setFilters(filters) {
    state.filters = { ...state.filters, ...filters };
  },
  
  // 重置篩選條件
  resetFilters() {
    state.filters = {
      keyword: '',
      minRating: 0,
      sortBy: 'createdAt',
      direction: 'DESC'
    };
  }
};

// 系統相關操作
const systemActions = {
  // 設置載入狀態
  setLoading(isLoading) {
    state.loading = isLoading;
  },
  
  // 設置錯誤
  setError(error) {
    state.error = error;
  },
  
  // 清除錯誤
  clearError() {
    state.error = null;
  },
  
  // 設置通知
  setNotification(message, type = 'info', timeout = 3000) {
    state.notification = { message, type, id: Date.now() };
    
    if (timeout > 0) {
      setTimeout(() => {
        // 只清除當前通知，避免清除新通知
        if (state.notification && state.notification.id === notification.id) {
          state.notification = null;
        }
      }, timeout);
    }
  },
  
  // 清除通知
  clearNotification() {
    state.notification = null;
  }
};

// 合併所有操作
const actions = {
  ...userActions,
  ...reviewActions,
  ...filterActions,
  ...systemActions,
  initialize
};

// 導出只讀的狀態和所有操作
export default {
  state: readonly(state),
  ...actions
};