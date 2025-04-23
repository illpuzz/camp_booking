import axios from 'axios';

// 設置 API 的基礎 URL
const API_BASE_URL = 'http://localhost:8080/api';

// 評價相關 API
const reviewApi = {
  // 獲取評價列表
  getReviews: async (params) => {
    try {
      console.log('正在請求評價列表，參數:', params);
      const response = await axios.get(`${API_BASE_URL}/reviews`, { params });
      console.log('評價列表請求響應:', response);
      return response.data;
    } catch (error) {
      console.error('獲取評價列表失敗:', error);
      throw error; // 確保錯誤被正確傳播
    }
  },
  
  // 獲取單個評價
  getReview: async (id, userId) => {
    const response = await axios.get(`${API_BASE_URL}/reviews/${id}`, {
      params: { userId }
    });
    return response.data;
  },
  
  // 創建評價
  createReview: async (reviewData) => {
    const response = await axios.post(`${API_BASE_URL}/reviews`, reviewData);
    return response.data;
  },
  
  // 更新評價
  updateReview: async (id, reviewData) => {
    const response = await axios.put(`${API_BASE_URL}/reviews/${id}`, reviewData);
    return response.data;
  },
  
  // 刪除評價
  deleteReview: async (id, userId) => {
    const response = await axios.delete(`${API_BASE_URL}/reviews/${id}`, {
      params: { userId }
    });
    return response.data;
  },
  
  // 點讚/取消點讚評價
  toggleLike: async (id, userId) => {
    const response = await axios.post(`${API_BASE_URL}/reviews/${id}/like`, null, {
      params: { userId }
    });
    return response.data;
  },
  
  // 管理員回覆評價
  replyToReview: async (id, replyText) => {
    const response = await axios.put(`${API_BASE_URL}/reviews/${id}/reply`, { replyText });
    return response.data;
  }
};

// 評價圖片相關 API
const reviewImageApi = {
  // 上傳單張圖片
  uploadImage: async (file, reviewId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reviewId', reviewId);
    
    const response = await axios.post(`${API_BASE_URL}/review-images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // 批次上傳多張圖片
  uploadMultipleImages: async (files, reviewId) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('reviewId', reviewId);
    
    const response = await axios.post(`${API_BASE_URL}/review-images/upload-multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // 獲取評價的所有圖片
  getImagesByReviewId: async (reviewId) => {
    const response = await axios.get(`${API_BASE_URL}/review-images/review/${reviewId}`);
    return response.data;
  },
  
  // 刪除圖片
  deleteImage: async (id) => {
    await axios.delete(`${API_BASE_URL}/review-images/${id}`);
  }
};

// 評價舉報相關 API
const reviewReportApi = {
  // 舉報評價
  reportReview: async (reportData) => {
    const response = await axios.post(`${API_BASE_URL}/review-reports`, reportData);
    return response.data;
  },
  
  // 檢查使用者是否已舉報評價
  hasUserReportedReview: async (userId, reviewId) => {
    const response = await axios.get(`${API_BASE_URL}/review-reports/check`, {
      params: { userId, reviewId }
    });
    return response.data;
  }
};

export { reviewApi, reviewImageApi, reviewReportApi };