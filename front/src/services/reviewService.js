import axios from 'axios'

// API 基本路徑
const API_URL = 'http://localhost:8080/api'

export const reviewService = {
  /**
   * 獲取營地的評價列表
   * @param {number} campSiteId - 營地 ID
   * @param {number} page - 頁碼 (從 1 開始)
   * @param {number} size - 每頁顯示數量
   * @returns {Promise} - 評價列表
   */
  async getReviews(campSiteId, page = 1, size = 10) {
    try {
      const response = await axios.get(`${API_URL}/reviews/campsite/${campSiteId}`, {
        params: {
          page: page - 1, // 後端分頁從 0 開始
          size,
          userId: localStorage.getItem('userId') || null
        }
      })
      return response.data
    } catch (error) {
      console.error('獲取評價列表失敗:', error)
      throw error
    }
  },
  
  /**
   * 獲取評價詳情
   * @param {number} reviewId - 評價 ID
   * @returns {Promise} - 評價詳情
   */
  async getReviewById(reviewId) {
    try {
      const response = await axios.get(`${API_URL}/reviews/${reviewId}`, {
        params: {
          userId: localStorage.getItem('userId') || null
        }
      })
      return response.data
    } catch (error) {
      console.error('獲取評價詳情失敗:', error)
      throw error
    }
  },
  
  /**
   * 創建新評價
   * @param {Object} reviewData - 評價數據
   * @returns {Promise} - 創建的評價
   */
  async createReview(reviewData) {
    try {
      const response = await axios.post(`${API_URL}/reviews`, reviewData)
      return response.data
    } catch (error) {
      console.error('創建評價失敗:', error)
      throw error
    }
  },
  
  /**
   * 更新評價
   * @param {number} reviewId - 評價 ID
   * @param {Object} reviewData - 更新的評價數據
   * @returns {Promise} - 更新後的評價
   */
  async updateReview(reviewId, reviewData) {
    try {
      const response = await axios.put(`${API_URL}/reviews/${reviewId}`, reviewData)
      return response.data
    } catch (error) {
      console.error('更新評價失敗:', error)
      throw error
    }
  },
  
  /**
   * 刪除評價
   * @param {number} reviewId - 評價 ID
   * @param {number} userId - 用戶 ID
   * @returns {Promise} - 刪除結果
   */
  async deleteReview(reviewId, userId) {
    try {
      const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, {
        params: { userId }
      })
      return response.data
    } catch (error) {
      console.error('刪除評價失敗:', error)
      throw error
    }
  },
  
  /**
   * 切換評價點讚狀態
   * @param {number} reviewId - 評價 ID
   * @param {number} userId - 用戶 ID
   * @returns {Promise} - 操作結果
   */
  async toggleLike(reviewId, userId) {
    try {
      const response = await axios.post(`${API_URL}/reviews/${reviewId}/like`, null, {
        params: { userId }
      })
      return response.data
    } catch (error) {
      console.error('點讚操作失敗:', error)
      throw error
    }
  },
  
  /**
   * 管理員回覆評價
   * @param {number} reviewId - 評價 ID
   * @param {string} replyText - 回覆內容
   * @returns {Promise} - 更新後的評價
   */
  async replyToReview(reviewId, replyText) {
    try {
      const response = await axios.post(`${API_URL}/reviews/${reviewId}/reply`, null, {
        params: { replyText }
      })
      return response.data
    } catch (error) {
      console.error('回覆評價失敗:', error)
      throw error
    }
  },
  
  /**
   * 搜尋評價
   * @param {Object} params - 搜尋參數
   * @returns {Promise} - 搜尋結果
   */
  async searchReviews(params) {
    try {
      const response = await axios.get(`${API_URL}/reviews/search`, { params })
      return response.data
    } catch (error) {
      console.error('搜尋評價失敗:', error)
      throw error
    }
  },
  
  /**
   * 獲取營地平均評分
   * @param {number} campSiteId - 營地 ID
   * @returns {Promise} - 平均評分
   */
  async getAverageRating(campSiteId) {
    try {
      const response = await axios.get(`${API_URL}/reviews/average-rating/${campSiteId}`)
      return response.data.averageRating
    } catch (error) {
      console.error('獲取平均評分失敗:', error)
      throw error
    }
  },
  
  /**
   * 上傳評價圖片
   * @param {File} file - 圖片文件
   * @param {number} reviewId - 評價 ID (可選)
   * @returns {Promise} - 上傳結果
   */
  async uploadImage(file, reviewId = null) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (reviewId) {
        formData.append('reviewId', reviewId)
      }
      
      const response = await axios.post(`${API_URL}/review-images/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('上傳圖片失敗:', error)
      throw error
    }
  },
  
  /**
   * 批量上傳評價圖片
   * @param {Array<File>} files - 圖片文件數組
   * @param {number} reviewId - 評價 ID (可選)
   * @returns {Promise} - 上傳結果
   */
  async uploadMultipleImages(files, reviewId = null) {
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      if (reviewId) {
        formData.append('reviewId', reviewId)
      }
      
      const response = await axios.post(`${API_URL}/review-images/upload-multiple`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('批量上傳圖片失敗:', error)
      throw error
    }
  }
}