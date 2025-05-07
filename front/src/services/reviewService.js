// reviewService.js - 評價相關服務

import axios from 'axios';

/**
 * 獲取評價列表
 * @param {Object} params 查詢參數
 * @returns {Promise<Object>} 評價列表數據
 */
export const getReviews = async (params = {}) => {
  try {
    const response = await axios.get('/api/reviews', { params });
    return response.data;
  } catch (error) {
    console.error('獲取評價失敗:', error);
    throw error;
  }
};

/**
 * 獲取單個評價
 * @param {number} id 評價ID
 * @param {number} userId 當前用戶ID (可選)
 * @returns {Promise<Object>} 評價數據
 */
export const getReview = async (id, userId = null) => {
  try {
    const params = userId ? { userId } : {};
    const response = await axios.get(`/api/reviews/${id}`, { params });
    return response.data;
  } catch (error) {
    console.error(`獲取評價 ${id} 失敗:`, error);
    throw error;
  }
};

/**
 * 創建新評價
 * @param {Object} reviewData 評價數據
 * @returns {Promise<Object>} 創建的評價
 */
export const createReview = async (reviewData) => {
  try {
    const response = await axios.post('/api/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('創建評價失敗:', error);
    throw error;
  }
};

/**
 * 更新評價
 * @param {number} id 評價ID
 * @param {Object} reviewData 更新的評價數據
 * @returns {Promise<Object>} 更新後的評價
 */
export const updateReview = async (id, reviewData) => {
  try {
    const response = await axios.put(`/api/reviews/${id}`, reviewData);
    return response.data;
  } catch (error) {
    console.error(`更新評價 ${id} 失敗:`, error);
    throw error;
  }
};

/**
 * 刪除評價
 * @param {number} id 評價ID
 * @param {number} userId 當前用戶ID
 * @returns {Promise<Object>} 操作結果
 */
export const deleteReview = async (id, userId) => {
  try {
    const response = await axios.delete(`/api/reviews/${id}?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error(`刪除評價 ${id} 失敗:`, error);
    throw error;
  }
};

/**
 * 點讚/取消點讚評價
 * @param {number} id 評價ID
 * @param {number} userId 當前用戶ID
 * @returns {Promise<Object>} 操作結果
 */
export const toggleLike = async (id, userId) => {
  try {
    const response = await axios.post(`/api/reviews/${id}/like?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error(`點讚評價 ${id} 失敗:`, error);
    throw error;
  }
};

/**
 * 回覆評價
 * @param {number} id 評價ID
 * @param {string} replyText 回覆內容
 * @returns {Promise<Object>} 更新後的評價
 */
export const replyToReview = async (id, replyText) => {
  try {
    const response = await axios.put(`/api/reviews/${id}/reply`, { replyText });
    return response.data;
  } catch (error) {
    console.error(`回覆評價 ${id} 失敗:`, error);
    throw error;
  }
};

/**
 * 刪除回覆
 * @param {number} id 評價ID
 * @returns {Promise<Object>} 操作結果
 */
export const deleteReply = async (id) => {
  try {
    const response = await axios.delete(`/api/reviews/${id}/reply`);
    return response.data;
  } catch (error) {
    console.error(`刪除評價 ${id} 的回覆失敗:`, error);
    throw error;
  }
};

/**
 * 上傳評價圖片
 * @param {File} file 圖片文件
 * @param {number} reviewId 評價ID (可選)
 * @returns {Promise<Object>} 上傳結果
 */
export const uploadImage = async (file, reviewId = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (reviewId) {
      formData.append('reviewId', reviewId);
    }
    
    const response = await axios.post('/api/review-images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('上傳圖片失敗:', error);
    throw error;
  }
};

/**
 * 獲取評價的所有圖片
 * @param {number} reviewId 評價ID
 * @returns {Promise<Array>} 圖片列表
 */
export const getReviewImages = async (reviewId) => {
  try {
    const response = await axios.get(`/api/review-images/review/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error(`獲取評價 ${reviewId} 的圖片失敗:`, error);
    throw error;
  }
};

/**
 * 檢舉評價
 * @param {Object} reportData 檢舉數據
 * @returns {Promise<Object>} 檢舉結果
 */
export const reportReview = async (reportData) => {
  try {
    const response = await axios.post('/api/review-reports/review', reportData);
    return response.data;
  } catch (error) {
    console.error('檢舉評價失敗:', error);
    throw error;
  }
};

/**
 * 檢舉回覆
 * @param {Object} reportData 檢舉數據
 * @returns {Promise<Object>} 檢舉結果
 */
export const reportReply = async (reportData) => {
  try {
    const response = await axios.post('/api/review-reports/reply', reportData);
    return response.data;
  } catch (error) {
    console.error('檢舉回覆失敗:', error);
    throw error;
  }
};

/**
 * 處理舉報
 * @param {number} reportId 舉報ID
 * @param {string} status 處理狀態 ('approved' 或 'rejected')
 * @param {string} handlerNote 處理備註
 * @returns {Promise<Object>} 處理結果
 */
export const processReport = async (reportId, status, handlerNote) => {
  try {
    const response = await axios.put(`/api/review-reports/${reportId}/process`, {
      status,
      handlerNote
    });
    return response.data;
  } catch (error) {
    console.error(`處理舉報 ${reportId} 失敗:`, error);
    throw error;
  }
};

/**
 * 批准舉報並移除內容
 * @param {number} reportId 舉報ID
 * @param {string} handlerNote 處理備註
 * @returns {Promise<Object>} 處理結果
 */
export const approveAndRemoveReport = async (reportId, handlerNote) => {
  try {
    const response = await axios.put(`/api/review-reports/${reportId}/approve-and-remove`, {
      handlerNote
    });
    return response.data;
  } catch (error) {
    console.error(`批准舉報 ${reportId} 並移除內容失敗:`, error);
    throw error;
  }
};

/**
 * 獲取待處理的舉報
 * @param {string} target 舉報目標類型 ('review' 或 'reply')
 * @returns {Promise<Array>} 舉報列表
 */
export const getPendingReports = async (target = null) => {
  try {
    const params = target ? { target } : {};
    const response = await axios.get('/api/review-reports/pending', { params });
    return response.data;
  } catch (error) {
    console.error('獲取待處理舉報失敗:', error);
    throw error;
  }
};

export default {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  toggleLike,
  replyToReview,
  deleteReply,
  uploadImage,
  getReviewImages,
  reportReview,
  reportReply,
  processReport,
  approveAndRemoveReport,
  getPendingReports
};