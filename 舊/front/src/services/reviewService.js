// src/services/reviewService.js
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

// 獲取評價列表 - 修改為使用查詢參數
export const getReviews = async (campSiteId, page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'DESC') => {
  const apiPath = getApiBasePath();
  const client = createApiClient();
  
  try {
    console.log('發送請求，路徑:', apiPath, '參數:', { page, size, sortBy, sortDirection, campSiteId });
    // 使用查詢參數而非路徑參數
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
};

// 獲取評價詳情
export const getReview = async (reviewId, userId = null) => {
  const apiPath = getApiBasePath();
  const client = createApiClient();
  
  return client.get(`${apiPath}/${reviewId}`, {
    params: { userId }
  });
};

// 創建評價
export const createReview = async (review) => {
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
};

// 更新評價
export const updateReview = async (reviewId, review) => {
  const apiPath = getApiBasePath();
  const client = createApiClient();
  
  return client.put(`${apiPath}/${reviewId}`, review);
};

// 刪除評價
export const deleteReview = async (reviewId, userId) => {
  const apiPath = getApiBasePath();
  const client = createApiClient();
  
  return client.delete(`${apiPath}/${reviewId}`, {
    params: { userId }
  });
};

// 搜索評價
export const searchReviews = async (params) => {
  const apiPath = getApiBasePath();
  const client = createApiClient();
  
  return client.get(`${apiPath}`, { params });
};

// 點讚/取消點讚
export const toggleLike = async (reviewId, userId) => {
  const apiPath = getApiBasePath();
  const client = createApiClient();
  
  return client.post(`${apiPath}/${reviewId}/like`, null, {
    params: { userId }
  });
};

// 管理員回覆
export const replyToReview = async (reviewId, replyText) => {
  const apiPath = getApiBasePath();
  const client = createApiClient();
  
  const payload = { replyText };
  return client.put(`${apiPath}/${reviewId}/reply`, payload);
};

// 獲取營地平均評分
export const getAverageRating = async (campSiteId) => {
  const apiPath = getApiBasePath();
  const client = createApiClient();
  
  return client.get(`${apiPath}/average-rating/${campSiteId}`);
};

export default {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  searchReviews,
  toggleLike,
  replyToReview,
  getAverageRating
};