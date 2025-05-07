import axios from 'axios'

// API 基本路徑
const API_URL = 'http://localhost:8080/api'

export const reportService = {
  /**
   * 創建檢舉
   * @param {Object} reportData - 檢舉數據
   * @returns {Promise} - 創建的檢舉
   */
  async createReport(reportData) {
    try {
      const response = await axios.post(`${API_URL}/review-reports`, reportData)
      return response.data
    } catch (error) {
      console.error('創建檢舉失敗:', error)
      throw error
    }
  },
  
  /**
   * 獲取檢舉詳情
   * @param {number} reportId - 檢舉 ID
   * @returns {Promise} - 檢舉詳情
   */
  async getReport(reportId) {
    try {
      const response = await axios.get(`${API_URL}/review-reports/${reportId}`)
      return response.data
    } catch (error) {
      console.error('獲取檢舉詳情失敗:', error)
      throw error
    }
  },
  
  /**
   * 獲取特定評價的所有檢舉
   * @param {number} reviewId - 評價 ID
   * @returns {Promise} - 檢舉列表
   */
  async getReportsByReviewId(reviewId) {
    try {
      const response = await axios.get(`${API_URL}/review-reports/review/${reviewId}`)
      return response.data
    } catch (error) {
      console.error('獲取評價檢舉失敗:', error)
      throw error
    }
  },
  
  /**
   * 獲取用戶提交的所有檢舉
   * @param {number} userId - 用戶 ID
   * @returns {Promise} - 檢舉列表
   */
  async getReportsByUserId(userId) {
    try {
      const response = await axios.get(`${API_URL}/review-reports/user/${userId}`)
      return response.data
    } catch (error) {
      console.error('獲取用戶檢舉失敗:', error)
      throw error
    }
  },
  
  /**
   * 獲取指定狀態的檢舉
   * @param {string} status - 檢舉狀態 (pending, approved, rejected)
   * @param {number} page - 頁碼 (從 1 開始)
   * @param {number} size - 每頁顯示數量
   * @returns {Promise} - 檢舉列表
   */
  async getReportsByStatus(status, page = 1, size = 10) {
    try {
      const response = await axios.get(`${API_URL}/review-reports/status/${status}`, {
        params: {
          page: page - 1, // 後端分頁從 0 開始
          size
        }
      })
      return response.data
    } catch (error) {
      console.error('獲取狀態檢舉失敗:', error)
      throw error
    }
  },
  
  /**
   * 更新檢舉狀態
   * @param {number} reportId - 檢舉 ID
   * @param {string} status - 新狀態 (pending, approved, rejected)
   * @returns {Promise} - 更新後的檢舉
   */
  async updateReportStatus(reportId, status) {
    try {
      const response = await axios.put(`${API_URL}/review-reports/${reportId}/status`, null, {
        params: { status }
      })
      return response.data
    } catch (error) {
      console.error('更新檢舉狀態失敗:', error)
      throw error
    }
  },
  
  /**
   * 管理員處理檢舉
   * @param {number} reportId - 檢舉 ID
   * @param {string} status - 新狀態 (approved, rejected)
   * @param {number} roleId - 管理員角色 ID
   * @returns {Promise} - 處理後的檢舉
   */
  async processReport(reportId, status, roleId) {
    try {
      const response = await axios.put(`${API_URL}/review-reports/${reportId}/process`, null, {
        params: { status, roleId }
      })
      return response.data
    } catch (error) {
      console.error('處理檢舉失敗:', error)
      throw error
    }
  },
  
  /**
   * 刪除檢舉
   * @param {number} reportId - 檢舉 ID
   * @returns {Promise} - 刪除結果
   */
  async deleteReport(reportId) {
    try {
      const response = await axios.delete(`${API_URL}/review-reports/${reportId}`)
      return response.data
    } catch (error) {
      console.error('刪除檢舉失敗:', error)
      throw error
    }
  }
}