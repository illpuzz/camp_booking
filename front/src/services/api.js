// src/services/api.js
import axios from 'axios';

// 設置 API 基礎 URL
const API_URL = 'http://localhost:8080/api';

// 建立 axios 實例
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 超時時間 10 秒
});

// 請求攔截器
apiClient.interceptors.request.use(
  (config) => {
    // 這裡可以添加認證 token 等
    console.log('API 請求:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API 錯誤:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

// 評價相關 API
export const reviewService = {
  // 獲取評價列表
  getReviews: (campSiteId, page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'DESC') => {
    return apiClient.get(`/reviews/campsite/${campSiteId}`, {
      params: { page, size, sortBy, sortDirection }
    });
  },
  
  // 獲取評價詳情
  getReview: (reviewId, userId = null) => {
    return apiClient.get(`/reviews/${reviewId}`, {
      params: { userId }
    });
  },
  
  // 創建評價
  createReview: (review) => {
    return apiClient.post('/reviews', review);
  },
  
  // 更新評價
  updateReview: (reviewId, review) => {
    return apiClient.put(`/reviews/${reviewId}`, review);
  },
  
  // 刪除評價
  deleteReview: (reviewId, userId) => {
    return apiClient.delete(`/reviews/${reviewId}`, {
      params: { userId }
    });
  },
  
  // 搜索評價
  searchReviews: (params) => {
    return apiClient.get('/reviews/search', { params });
  },
  
  // 點讚/取消點讚
  toggleLike: (reviewId, userId) => {
    return apiClient.post(`/reviews/${reviewId}/like`, null, {
      params: { userId }
    });
  },
  
  // 管理員回覆
  replyToReview: (reviewId, replyText) => {
    return apiClient.post(`/reviews/${reviewId}/reply`, null, {
      params: { replyText }
    });
  },
  
  // 獲取營地平均評分
  getAverageRating: (campSiteId) => {
    return apiClient.get(`/reviews/average-rating/${campSiteId}`);
  }
};

// 評價圖片相關 API
export const imageService = {
  // 上傳圖片
  uploadImage: (file, reviewId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (reviewId) {
      formData.append('reviewId', reviewId);
    }
    
    return apiClient.post('/review-images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // 批量上傳圖片
  uploadMultipleImages: (files, reviewId = null) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (reviewId) {
      formData.append('reviewId', reviewId);
    }
    
    return apiClient.post('/review-images/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // 獲取評價圖片
  getReviewImages: (reviewId) => {
    return apiClient.get(`/review-images/review/${reviewId}`);
  },
  
  // 刪除圖片
  deleteImage: (imageId) => {
    return apiClient.delete(`/review-images/${imageId}`);
  }
};

// 檢舉相關 API
export const reportService = {
  // 提交檢舉
  createReport: (report) => {
    return apiClient.post('/review-reports', report);
  },
  
  // 獲取檢舉詳情
  getReport: (reportId) => {
    return apiClient.get(`/review-reports/${reportId}`);
  },
  
  // 獲取評價的所有檢舉
  getReportsByReviewId: (reviewId) => {
    return apiClient.get(`/review-reports/review/${reviewId}`);
  },
  
  // 獲取用戶提交的檢舉
  getReportsByUserId: (userId) => {
    return apiClient.get(`/review-reports/user/${userId}`);
  },
  
  // 獲取特定狀態的檢舉
  getReportsByStatus: (status, page = 0, size = 10) => {
    return apiClient.get(`/review-reports/status/${status}`, {
      params: { page, size }
    });
  },
  
  // 更新檢舉狀態
  updateReportStatus: (reportId, status) => {
    return apiClient.put(`/review-reports/${reportId}/status`, null, {
      params: { status }
    });
  },
  
  // 處理檢舉
  processReport: (reportId, status, roleId) => {
    return apiClient.put(`/review-reports/${reportId}/process`, null, {
      params: { status, roleId }
    });
  },
  
  // 刪除檢舉
  deleteReport: (reportId) => {
    return apiClient.delete(`/review-reports/${reportId}`);
  }
};

export default {
  reviewService,
  imageService,
  reportService
};