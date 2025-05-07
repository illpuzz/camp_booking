// imageService.js - 圖片處理相關服務

import axios from 'axios';

/**
 * 上傳單個圖片
 * @param {File} file 圖片文件
 * @param {number} reviewId 評價ID (可選)
 * @returns {Promise<Object>} 上傳結果
 */
export const uploadImage = async (file, reviewId = null) => {
  try {
    // 檢查文件類型
    if (!file.type.startsWith('image/')) {
      throw new Error('只能上傳圖片檔案');
    }
    
    // 檢查檔案大小 (限制 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('圖片大小不能超過 5MB');
    }
    
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
 * 批量上傳多個圖片
 * @param {Array<File>} files 圖片文件數組
 * @param {number} reviewId 評價ID (可選)
 * @returns {Promise<Array<Object>>} 上傳結果數組
 */
export const uploadMultipleImages = async (files, reviewId = null) => {
  try {
    // 驗證文件數量不超過限制
    const maxCount = 5;
    if (files.length > maxCount) {
      throw new Error(`最多只能上傳 ${maxCount} 張圖片`);
    }
    
    // 創建上傳任務數組
    const uploadTasks = Array.from(files).map(file => uploadImage(file, reviewId));
    
    // 並行上傳所有圖片
    const results = await Promise.all(uploadTasks);
    return results;
  } catch (error) {
    console.error('批量上傳圖片失敗:', error);
    throw error;
  }
};

/**
 * 獲取評價的所有圖片
 * @param {number} reviewId 評價ID
 * @returns {Promise<Array<Object>>} 圖片數據數組
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
 * 刪除圖片
 * @param {number} imageId 圖片ID
 * @returns {Promise<void>}
 */
export const deleteImage = async (imageId) => {
  try {
    await axios.delete(`/api/review-images/${imageId}`);
  } catch (error) {
    console.error(`刪除圖片 ${imageId} 失敗:`, error);
    throw error;
  }
};

/**
 * 刪除評價的所有圖片
 * @param {number} reviewId 評價ID
 * @returns {Promise<void>}
 */
export const deleteReviewImages = async (reviewId) => {
  try {
    await axios.delete(`/api/review-images/review/${reviewId}`);
  } catch (error) {
    console.error(`刪除評價 ${reviewId} 的所有圖片失敗:`, error);
    throw error;
  }
};

/**
 * 處理圖片 URL，確保可以正確顯示
 * @param {string} url 圖片 URL
 * @returns {string} 處理後的 URL
 */
export const processImageUrl = (url) => {
  if (!url) return '';
  
  // 如果已經是完整 URL
  if (url.startsWith('http')) {
    return url;
  }
  
  // 如果是相對路徑，確保路徑正確
  return url.startsWith('/') ? url : `/${url}`;
};

/**
 * 檢查文件是否為有效的圖片類型
 * @param {File} file 文件
 * @returns {boolean} 是否為有效圖片
 */
export const isValidImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * 將文件轉換為數據 URL (Base64)
 * @param {File} file 文件
 * @returns {Promise<string>} 數據 URL
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export default {
  uploadImage,
  uploadMultipleImages,
  getReviewImages,
  deleteImage,
  deleteReviewImages,
  processImageUrl,
  isValidImageFile,
  fileToDataUrl
};