import { defineStore } from 'pinia'
import { reviewService } from '../services/reviewService'

export const useReviewStore = defineStore('review', {
  state: () => ({
    reviews: [],
    currentReview: null,
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
    campsite: { id: 1, name: '苗栗區 山之間' } // 預設營地
  }),
  
  getters: {
    getReviewById: (state) => (id) => {
      return state.reviews.find(review => review.id === id)
    },
    
    averageRating: (state) => {
      if (state.reviews.length === 0) return 0
      const sum = state.reviews.reduce((acc, review) => acc + review.overallRating, 0)
      return (sum / state.reviews.length).toFixed(1)
    },
    
    averageCleanlinessRating: (state) => {
      if (state.reviews.length === 0) return 0
      const sum = state.reviews.reduce((acc, review) => acc + review.cleanlinessRating, 0)
      return (sum / state.reviews.length).toFixed(1)
    },
    
    averageConvenienceRating: (state) => {
      if (state.reviews.length === 0) return 0
      const sum = state.reviews.reduce((acc, review) => acc + review.convenienceRating, 0)
      return (sum / state.reviews.length).toFixed(1)
    },
    
    averageFriendlinessRating: (state) => {
      if (state.reviews.length === 0) return 0
      const sum = state.reviews.reduce((acc, review) => acc + review.friendlinessRating, 0)
      return (sum / state.reviews.length).toFixed(1)
    }
  },
  
  actions: {
    async fetchReviews(campSiteId = null, page = 1, size = 10) {
      this.loading = true
      try {
        const response = await reviewService.getReviews(campSiteId || this.campsite.id, page, size)
        this.reviews = response.content
        this.totalPages = response.totalPages
        this.currentPage = response.number + 1
        this.error = null
      } catch (error) {
        console.error('獲取評價失敗:', error)
        this.error = '獲取評價失敗，請稍後再試'
      } finally {
        this.loading = false
      }
    },
    
    async fetchReviewById(id) {
      this.loading = true
      try {
        const data = await reviewService.getReviewById(id)
        this.currentReview = data
        this.error = null
        return data
      } catch (error) {
        console.error('獲取評價詳情失敗:', error)
        this.error = '獲取評價詳情失敗，請稍後再試'
        return null
      } finally {
        this.loading = false
      }
    },
    
    async createReview(reviewData) {
      this.loading = true
      try {
        const data = await reviewService.createReview({
          ...reviewData,
          campSiteId: this.campsite.id
        })
        this.reviews.unshift(data)
        this.error = null
        return data
      } catch (error) {
        console.error('創建評價失敗:', error)
        this.error = '創建評價失敗，請稍後再試'
        return null
      } finally {
        this.loading = false
      }
    },
    
    async updateReview(id, reviewData) {
      this.loading = true
      try {
        const data = await reviewService.updateReview(id, reviewData)
        const index = this.reviews.findIndex(r => r.id === id)
        if (index !== -1) {
          this.reviews[index] = data
        }
        this.error = null
        return data
      } catch (error) {
        console.error('更新評價失敗:', error)
        this.error = '更新評價失敗，請稍後再試'
        return null
      } finally {
        this.loading = false
      }
    },
    
    async deleteReview(id, userId) {
      this.loading = true
      try {
        await reviewService.deleteReview(id, userId)
        this.reviews = this.reviews.filter(r => r.id !== id)
        this.error = null
        return true
      } catch (error) {
        console.error('刪除評價失敗:', error)
        this.error = '刪除評價失敗，請稍後再試'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async toggleLike(reviewId, userId) {
      try {
        await reviewService.toggleLike(reviewId, userId)
        
        // 更新本地評價數據
        const index = this.reviews.findIndex(r => r.id === reviewId)
        if (index !== -1) {
          const review = this.reviews[index]
          const newStatus = review.userLikeStatus === 1 ? 0 : 1
          const likeDelta = newStatus === 1 ? 1 : -1
          
          this.reviews[index] = {
            ...review,
            userLikeStatus: newStatus,
            likeCount: review.likeCount + likeDelta
          }
        }
        
        // 如果當前查看的是該評價，也更新 currentReview
        if (this.currentReview && this.currentReview.id === reviewId) {
          const newStatus = this.currentReview.userLikeStatus === 1 ? 0 : 1
          const likeDelta = newStatus === 1 ? 1 : -1
          
          this.currentReview = {
            ...this.currentReview,
            userLikeStatus: newStatus,
            likeCount: this.currentReview.likeCount + likeDelta
          }
        }
        
        return true
      } catch (error) {
        console.error('點讚失敗:', error)
        return false
      }
    },
    
    async searchReviews(params) {
      this.loading = true
      try {
        const response = await reviewService.searchReviews(params)
        this.reviews = response.content
        this.totalPages = response.totalPages
        this.currentPage = response.number + 1
        this.error = null
      } catch (error) {
        console.error('搜尋評價失敗:', error)
        this.error = '搜尋評價失敗，請稍後再試'
      } finally {
        this.loading = false
      }
    }
  },
  
  // 啟用持久化
  persist: {
    storage: localStorage,
    paths: ['currentPage', 'campsite'] // 只持久化特定狀態
  }
})