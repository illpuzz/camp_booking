import { defineStore } from 'pinia'
import axios from 'axios'

export const useReviewStore = defineStore('review', {
  state: () => ({
    reviews: [],
    currentPage: 0,
    totalPages: 0,
    loading: false,
    error: null
  }),
  actions: {
    async fetchReviews(campSiteId, page = 0, size = 10) {
      this.loading = true
      try {
        const response = await axios.get(`/api/reviews/campsite/${campSiteId}`, {
          params: { page, size }
        })
        this.reviews = response.data.content
        this.currentPage = response.data.number
        this.totalPages = response.data.totalPages
      } catch (error) {
        this.error = error
        console.error('獲取評價失敗', error)
      } finally {
        this.loading = false
      }
    },
    // ... 其他方法
  }
})