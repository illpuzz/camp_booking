// src/services/api.js
import axios from 'axios';

// 獲取當前API基礎路徑
const getApiBasePath = () => {
  return sessionStorage.getItem('API_BASE_PATH') || '/api/reviews';
};

// 創建axios實例
const createApiClient = (timeout = 15000) => {
  return axios.create({
    baseURL: '', 
    headers: {
      'Content-Type': 'application/json'
    },
    timeout
  });
};

// 評價相關 API
export const reviewService = {
  // 獲取評價列表 - 使用查詢參數
  getReviews: async (campSiteId, page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'DESC') => {
    const apiPath = getApiBasePath();
    const client = createApiClient();
    
    try {
      console.log('發送請求，路徑:', apiPath, '參數:', { page, size, sortBy, sortDirection, campSiteId });
      const response = await client.get(`${apiPath}`, {
        params: { 
          page, 
          size, 
          sortBy, 
          sortDirection,
          campSiteId
        }
      });
      console.log('請求成功，返回數據:', response.data);
      return response;
    } catch (error) {
      console.error('獲取評價列表失敗:', error);
      throw error;
    }
  },
  
  // 獲取評價詳情
  getReview: async (reviewId, userId = null) => {
    const apiPath = getApiBasePath();
    const client = createApiClient();
    
    return client.get(`${apiPath}/${reviewId}`, {
      params: { userId }
    });
  },
  
  // 創建評價
  createReview: async (review) => {
    const apiPath = getApiBasePath();
    const client = createApiClient();
    
    console.log('發送評價數據:', review);
    try {
      const response = await client.post(`${apiPath}`, review);
      console.log('創建評價成功:', response.data);
      return response;
    } catch (error) {
      console.error('創建評價失敗:', error.response ? error.response.data : error.message);
      throw error;
    }
  },
  
  // 更新評價
  updateReview: async (reviewId, review) => {
    const apiPath = getApiBasePath();
    const client = createApiClient();
    
    return client.put(`${apiPath}/${reviewId}`, review);
  },
  
  // 刪除評價
  deleteReview: async (reviewId, userId) => {
    const apiPath = getApiBasePath();
    const client = createApiClient();
    
    return client.delete(`${apiPath}/${reviewId}`, {
      params: { userId }
    });
  },
  
  // 搜索評價
  searchReviews: async (params) => {
    const apiPath = getApiBasePath();
    const client = createApiClient();
    
    return client.get(`${apiPath}`, { params });
  },
  
  // 點讚/取消點讚
  toggleLike: async (reviewId, userId) => {
    const apiPath = getApiBasePath();
    const client = createApiClient();
    
    return client.post(`${apiPath}/${reviewId}/like`, null, {
      params: { userId }
    });
  },
  
  // 管理員回覆
  replyToReview: async (reviewId, replyText) => {
    const apiPath = getApiBasePath();
    const client = createApiClient();
    
    const payload = { replyText };
    return client.put(`${apiPath}/${reviewId}/reply`, payload);
  },
  
  // 獲取營地平均評分
  getAverageRating: async (campSiteId) => {
    const apiPath = getApiBasePath();
    const client = createApiClient();
    
    return client.get(`${apiPath}/average-rating/${campSiteId}`);
  }
};

// 評價圖片相關 API
export const imageService = {
  // 上傳圖片
  uploadImage: async (file, reviewId = null) => {
    const apiPath = getApiBasePath().replace('reviews', 'review-images');
    const client = createApiClient();
    
    const formData = new FormData();
    formData.append('file', file);
    if (reviewId) {
      formData.append('reviewId', reviewId);
    }
    
    return client.post(`${apiPath}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // 批量上傳圖片
  uploadMultipleImages: async (files, reviewId = null) => {
    const apiPath = getApiBasePath().replace('reviews', 'review-images');
    const client = createApiClient();
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (reviewId) {
      formData.append('reviewId', reviewId);
    }
    
    return client.post(`${apiPath}/upload-multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // 獲取評價圖片
  getReviewImages: async (reviewId) => {
    const apiPath = getApiBasePath().replace('reviews', 'review-images');
    const client = createApiClient();
    
    return client.get(`${apiPath}/review/${reviewId}`);
  },
  
  // 刪除圖片
  deleteImage: async (imageId) => {
    const apiPath = getApiBasePath().replace('reviews', 'review-images');
    const client = createApiClient();
    
    return client.delete(`${apiPath}/${imageId}`);
  }
};

// 檢舉相關 API
export const reportService = {
  // 提交檢舉
  createReport: async (report) => {
    const apiPath = getApiBasePath().replace('reviews', 'review-reports');
    const client = createApiClient();
    
    return client.post(`${apiPath}`, report);
  },
  
  // 獲取檢舉詳情
  getReport: async (reportId) => {
    const apiPath = getApiBasePath().replace('reviews', 'review-reports');
    const client = createApiClient();
    
    return client.get(`${apiPath}/${reportId}`);
  },
  
  // 獲取評價的所有檢舉
  getReportsByReviewId: async (reviewId) => {
    const apiPath = getApiBasePath().replace('reviews', 'review-reports');
    const client = createApiClient();
    
    return client.get(`${apiPath}/review/${reviewId}`);
  },
  
  // 更新檢舉狀態
  updateReportStatus: async (reportId, status) => {
    const apiPath = getApiBasePath().replace('reviews', 'review-reports');
    const client = createApiClient();
    
    return client.put(`${apiPath}/${reportId}/status`, null, {
      params: { status }
    });
  }
};

export default {
  reviewService,
  imageService,
  reportService
};