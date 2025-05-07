// reportService.js - 舉報相關服務

import axios from 'axios';

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
 * 檢查使用者是否已檢舉評價
 * @param {number} userId 用戶ID
 * @param {number} reviewId 評價ID
 * @returns {Promise<boolean>} 是否已檢舉
 */
export const hasUserReportedReview = async (userId, reviewId) => {
  try {
    const response = await axios.get('/api/review-reports/check', {
      params: { userId, reviewId }
    });
    return response.data;
  } catch (error) {
    console.error('檢查檢舉狀態失敗:', error);
    throw error;
  }
};

/**
 * 檢查使用者是否已檢舉回覆
 * @param {number} userId 用戶ID
 * @param {number} reviewId 評價ID
 * @returns {Promise<boolean>} 是否已檢舉
 */
export const hasUserReportedReply = async (userId, reviewId) => {
  try {
    const response = await axios.get('/api/review-reports/check', {
      params: { userId, reviewId, target: 'reply' }
    });
    return response.data;
  } catch (error) {
    console.error('檢查檢舉狀態失敗:', error);
    throw error;
  }
};

/**
 * 獲取待處理的所有檢舉
 * @returns {Promise<Array>} 檢舉列表
 */
export const getPendingReports = async () => {
  try {
    const response = await axios.get('/api/review-reports/pending');
    return response.data;
  } catch (error) {
    console.error('獲取待處理檢舉失敗:', error);
    throw error;
  }
};

/**
 * 獲取待處理的評價檢舉
 * @returns {Promise<Array>} 檢舉列表
 */
export const getPendingReviewReports = async () => {
  try {
    const response = await axios.get('/api/review-reports/pending', {
      params: { target: 'review' }
    });
    return response.data;
  } catch (error) {
    console.error('獲取待處理評價檢舉失敗:', error);
    throw error;
  }
};

/**
 * 獲取待處理的回覆檢舉
 * @returns {Promise<Array>} 檢舉列表
 */
export const getPendingReplyReports = async () => {
  try {
    const response = await axios.get('/api/review-reports/pending', {
      params: { target: 'reply' }
    });
    return response.data;
  } catch (error) {
    console.error('獲取待處理回覆檢舉失敗:', error);
    throw error;
  }
};

/**
 * 處理檢舉 (駁回)
 * @param {number} reportId 檢舉ID
 * @param {string} handlerNote 處理備註
 * @returns {Promise<Object>} 處理結果
 */
export const rejectReport = async (reportId, handlerNote) => {
  try {
    const response = await axios.put(`/api/review-reports/${reportId}/process`, {
      status: 'rejected',
      handlerNote
    });
    return response.data;
  } catch (error) {
    console.error(`駁回檢舉 ${reportId} 失敗:`, error);
    throw error;
  }
};

/**
 * 處理檢舉 (批准並移除內容)
 * @param {number} reportId 檢舉ID
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
    console.error(`批准檢舉 ${reportId} 並移除內容失敗:`, error);
    throw error;
  }
};

/**
 * 獲取評價的所有檢舉
 * @param {number} reviewId 評價ID
 * @returns {Promise<Array>} 檢舉列表
 */
export const getReviewReports = async (reviewId) => {
  try {
    const response = await axios.get(`/api/review-reports/review/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error(`獲取評價 ${reviewId} 的檢舉失敗:`, error);
    throw error;
  }
};

/**
 * 獲取特定檢舉的詳細資訊
 * @param {number} reportId 檢舉ID
 * @returns {Promise<Object>} 檢舉資訊
 */
export const getReport = async (reportId) => {
  try {
    const response = await axios.get(`/api/review-reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error(`獲取檢舉 ${reportId} 失敗:`, error);
    throw error;
  }
};

/**
 * 獲取檢舉類型名稱
 * @param {number} reportType 檢舉類型
 * @returns {string} 檢舉類型名稱
 */
export const getReportTypeName = (reportType) => {
  const types = {
    1: '不實內容',
    2: '冒犯性內容或語言',
    3: '廣告或垃圾訊息',
    4: '暴力或仇恨言論',
    5: '侵犯隱私權',
    6: '其他'
  };
  
  return types[reportType] || '未知';
};

export default {
  reportReview,
  reportReply,
  hasUserReportedReview,
  hasUserReportedReply,
  getPendingReports,
  getPendingReviewReports,
  getPendingReplyReports,
  rejectReport,
  approveAndRemoveReport,
  getReviewReports,
  getReport,
  getReportTypeName
};