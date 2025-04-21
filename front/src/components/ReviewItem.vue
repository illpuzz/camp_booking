<template>
  <div class="card mb-4 review-card">
    <div class="card-body">
      <!-- 評價者資訊 -->
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div class="d-flex align-items-center">
          <div class="user-avatar me-2">{{ review.userName ? review.userName.charAt(0) : 'U' }}</div>
          <div>
            <h5 class="mb-0">{{ review.userName || '匿名用戶' }}</h5>
            <small class="text-muted">{{ formatDate(review.createdAt) }}</small>
          </div>
        </div>
        <!-- 評分展示 -->
        <div class="rating">
          <span v-for="i in 5" :key="i" class="me-1">
            <i :class="getStarClass(i)"></i>
          </span>
          <span class="ms-1 fw-bold">{{ review.overallRating }}</span>
        </div>
      </div>

      <!-- 評價內容 -->
      <p class="review-text">{{ review.reviewText }}</p>

      <!-- 優缺點 -->
      <div class="row my-3" v-if="review.pros || review.cons">
        <div class="col-md-6 mb-2" v-if="review.pros">
          <div class="pros p-2">
            <strong class="text-success">優點：</strong>
            <p class="mb-0">{{ review.pros }}</p>
          </div>
        </div>
        <div class="col-md-6 mb-2" v-if="review.cons">
          <div class="cons p-2">
            <strong class="text-danger">缺點：</strong>
            <p class="mb-0">{{ review.cons }}</p>
          </div>
        </div>
      </div>

      <!-- 詳細評分 -->
      <div class="row rating-details my-3" v-if="showDetailRatings">
        <div class="col-md-4 mb-2">
          <small>清潔程度：</small>
          <div class="d-flex align-items-center">
            <div class="progress flex-grow-1 me-2" style="height: 8px;">
              <div class="progress-bar bg-success" :style="{ width: (review.cleanlinessRating / 5 * 100) + '%' }"></div>
            </div>
            <span>{{ review.cleanlinessRating }}</span>
          </div>
        </div>
        <div class="col-md-4 mb-2">
          <small>便利程度：</small>
          <div class="d-flex align-items-center">
            <div class="progress flex-grow-1 me-2" style="height: 8px;">
              <div class="progress-bar bg-success" :style="{ width: (review.convenienceRating / 5 * 100) + '%' }"></div>
            </div>
            <span>{{ review.convenienceRating }}</span>
          </div>
        </div>
        <div class="col-md-4 mb-2">
          <small>友善程度：</small>
          <div class="d-flex align-items-center">
            <div class="progress flex-grow-1 me-2" style="height: 8px;">
              <div class="progress-bar bg-success" :style="{ width: (review.friendlinessRating / 5 * 100) + '%' }"></div>
            </div>
            <span>{{ review.friendlinessRating }}</span>
          </div>
        </div>
      </div>

      <!-- 圖片展示 -->
      <div class="review-images row g-2 mb-3" v-if="review.imageUrls && review.imageUrls.length > 0">
        <div v-for="(url, index) in review.imageUrls" :key="index" class="col-md-3 col-sm-4 col-6">
          <img :src="url" :alt="`評價圖片 ${index + 1}`" class="img-thumbnail review-image" @click="viewImage(url)">
        </div>
      </div>

      <!-- 回覆內容 -->
      <div class="reply-section border-start border-success ps-3 my-3" v-if="review.replyText">
        <h6 class="text-success">營地方回覆：</h6>
        <p class="mb-0">{{ review.replyText }}</p>
      </div>

      <!-- 操作按鈕 -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <div class="d-flex align-items-center">
          <!-- 點讚按鈕 -->
          <button class="btn btn-sm me-2" :class="likeButtonClass" @click="toggleLike">
            <i class="bi" :class="likeIconClass"></i> {{ review.likeCount || 0 }}
          </button>
          
          <!-- 查看詳情按鈕 -->
          <button class="btn btn-sm btn-outline-primary me-2" @click="$emit('view', review.id)">
            <i class="bi bi-eye"></i> 查看
          </button>
          
          <!-- 只有評價作者才能看到編輯按鈕 -->
          <button v-if="isAuthor" class="btn btn-sm btn-outline-secondary me-2" @click="$emit('edit', review.id)">
            <i class="bi bi-pencil"></i> 編輯
          </button>
        </div>
        
        <!-- 檢舉按鈕 -->
        <button class="btn btn-sm btn-outline-danger" @click="$emit('report', review.id)">
          <i class="bi bi-flag"></i> 檢舉
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'

export default {
  name: 'ReviewItem',
  props: {
    review: {
      type: Object,
      required: true
    },
    showDetailRatings: {
      type: Boolean,
      default: true
    }
  },
  emits: ['like', 'view', 'edit', 'report'],
  data() {
    return {
      isLiked: false
    }
  },
  computed: {
    // 檢查當前用戶是否是評價作者
    isAuthor() {
      const authStore = useAuthStore()
      return authStore.userId === this.review.userId
    },
    
    // 點讚按鈕樣式
    likeButtonClass() {
      return this.review.userLikeStatus === 1 
        ? 'btn-primary' 
        : 'btn-outline-primary'
    },
    
    // 點讚圖標樣式
    likeIconClass() {
      return this.review.userLikeStatus === 1 
        ? 'bi-hand-thumbs-up-fill' 
        : 'bi-hand-thumbs-up'
    }
  },
  methods: {
    // 切換點讚狀態
    toggleLike() {
      this.$emit('like', this.review.id)
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      
      // 如果已經是格式化的日期字符串（例如 "2024年4月2日"）
      if (typeof dateString === 'string' && dateString.includes('年')) {
        return dateString
      }
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-TW', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch (e) {
        console.error('日期格式化錯誤:', e)
        return dateString
      }
    },
    
    // 獲取星級評分的 CSS 類
    getStarClass(position) {
      const rating = this.review.overallRating || 0
      if (position <= rating) {
        return 'bi bi-star-fill rating-star'
      } else if (position - 0.5 <= rating) {
        return 'bi bi-star-half rating-star'
      } else {
        return 'bi bi-star rating-star-empty'
      }
    },
    
    // 查看大圖
    viewImage(url) {
      // 這裡可以實現圖片查看器功能
      // 簡單實現：新窗口打開圖片
      window.open(url, '_blank')
    }
  }
}
</script>

<style scoped>
.review-card {
  transition: all 0.3s ease;
}

.review-card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #495057;
}

.review-text {
  line-height: 1.6;
}

.pros {
  background-color: rgba(40, 167, 69, 0.1);
  border-radius: 4px;
}

.cons {
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 4px;
}

.review-image {
  height: 120px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
}

.review-image:hover {
  transform: scale(1.05);
}

.rating-star {
  color: #ffc107;
}

.rating-star-empty {
  color: #e0e0e0;
}

.reply-section {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
}
</style>