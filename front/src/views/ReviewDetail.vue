<template>
    <div class="review-detail-view">
      <!-- 返回按鈕 -->
      <div class="mb-4">
        <router-link to="/reviews" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left me-1"></i> 返回評價列表
        </router-link>
      </div>
  
      <!-- 載入中 -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
        <p class="mt-2">評價載入中，請稍候...</p>
      </div>
  
      <!-- 錯誤訊息 -->
      <div v-else-if="error" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i> {{ error }}
      </div>
  
      <!-- 評價詳情 -->
      <div v-else-if="review" class="card border-0 shadow-sm">
        <div class="card-body">
          <!-- 評價頭部 -->
          <div class="d-flex justify-content-between align-items-start mb-4">
            <div class="d-flex">
              <div class="user-avatar me-3">
                {{ review.userName ? review.userName.charAt(0) : 'U' }}
              </div>
              <div>
                <h1 class="h4 mb-1">{{ review.userName || '匿名用戶' }}</h1>
                <p class="text-muted mb-0">{{ formatDate(review.createdAt) }}</p>
                <div class="mt-1">
                  <router-link :to="`/reviews?campSiteId=${review.campSiteId}`" class="text-success">
                    {{ getCampsiteName(review.campSiteId) }}
                  </router-link>
                </div>
              </div>
            </div>
            <div class="overall-rating">
              <div class="stars mb-1">
                <i v-for="i in 5" :key="i" :class="getStarClass(i, review.overallRating)"></i>
              </div>
              <div class="text-end fw-bold">{{ review.overallRating }} / 5</div>
            </div>
          </div>
  
          <!-- 評價內容 -->
          <div class="review-content mb-4">
            <p class="review-text">{{ review.reviewText }}</p>
          </div>
  
          <!-- 詳細評分 -->
          <div class="rating-details row mb-4">
            <div class="col-md-4 mb-3">
              <div class="card border-0 bg-light">
                <div class="card-body">
                  <h6 class="mb-2">清潔程度</h6>
                  <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1 me-2">
                      <div 
                        class="progress-bar bg-success" 
                        :style="{ width: (review.cleanlinessRating / 5 * 100) + '%' }"
                      ></div>
                    </div>
                    <span class="fw-bold">{{ review.cleanlinessRating }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="card border-0 bg-light">
                <div class="card-body">
                  <h6 class="mb-2">便利程度</h6>
                  <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1 me-2">
                      <div 
                        class="progress-bar bg-success" 
                        :style="{ width: (review.convenienceRating / 5 * 100) + '%' }"
                      ></div>
                    </div>
                    <span class="fw-bold">{{ review.convenienceRating }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="card border-0 bg-light">
                <div class="card-body">
                  <h6 class="mb-2">友善程度</h6>
                  <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1 me-2">
                      <div 
                        class="progress-bar bg-success" 
                        :style="{ width: (review.friendlinessRating / 5 * 100) + '%' }"
                      ></div>
                    </div>
                    <span class="fw-bold">{{ review.friendlinessRating }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- 優缺點 -->
          <div class="row mb-4" v-if="review.pros || review.cons">
            <div class="col-md-6 mb-3" v-if="review.pros">
              <div class="card border-success h-100">
                <div class="card-header bg-success text-white">
                  <i class="bi bi-hand-thumbs-up me-1"></i> 優點
                </div>
                <div class="card-body">
                  <p class="card-text">{{ review.pros }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3" v-if="review.cons">
              <div class="card border-danger h-100">
                <div class="card-header bg-danger text-white">
                  <i class="bi bi-hand-thumbs-down me-1"></i> 缺點
                </div>
                <div class="card-body">
                  <p class="card-text">{{ review.cons }}</p>
                </div>
              </div>
            </div>
          </div>
  
          <!-- 評價圖片 -->
          <div v-if="review.imageUrls && review.imageUrls.length" class="review-images mb-4">
            <h5 class="mb-3">照片 ({{ review.imageUrls.length }})</h5>
            <div class="row g-3">
              <div 
                v-for="(url, index) in review.imageUrls" 
                :key="index" 
                class="col-lg-3 col-md-4 col-sm-6 col-12"
              >
                <img 
                  :src="url" 
                  class="img-fluid rounded shadow-sm review-image" 
                  :alt="`評價照片 ${index + 1}`"
                  @click="openImageViewer(url, index)"
                >
              </div>
            </div>
          </div>
  
          <!-- 營地方回覆 -->
          <div v-if="review.replyText" class="reply-section mb-4">
            <div class="card border-0 bg-light">
              <div class="card-body">
                <h5 class="text-success mb-3">
                  <i class="bi bi-chat-left-text me-2"></i> 營地方回覆
                </h5>
                <p>{{ review.replyText }}</p>
              </div>
            </div>
          </div>
  
          <!-- 管理員回覆表單 -->
          <div v-if="isAdmin && !review.replyText" class="admin-reply-form mb-4">
            <div class="card border-0 bg-light">
              <div class="card-body">
                <h5 class="mb-3">回覆評價</h5>
                <form @submit.prevent="submitReply">
                  <div class="mb-3">
                    <textarea 
                      class="form-control" 
                      v-model="replyText" 
                      rows="4" 
                      placeholder="輸入您的回覆..." 
                      required
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    class="btn btn-success" 
                    :disabled="isSubmitting"
                  >
                    <span v-if="isSubmitting">
                      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      提交中...
                    </span>
                    <span v-else>提交回覆</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
  
          <!-- 操作按鈕 -->
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex gap-2">
              <!-- 點讚按鈕 -->
              <button 
                class="btn" 
                :class="likeButtonClass" 
                @click="handleLike"
              >
                <i class="bi" :class="likeIconClass"></i>
                {{ review.likeCount || 0 }} 讚
              </button>
              
              <!-- 編輯按鈕 (僅顯示給評價作者) -->
              <button 
                v-if="isAuthor" 
                class="btn btn-outline-primary" 
                @click="editReview"
              >
                <i class="bi bi-pencil me-1"></i> 編輯
              </button>
              
              <!-- 刪除按鈕 (僅顯示給評價作者) -->
              <button 
                v-if="isAuthor" 
                class="btn btn-outline-danger" 
                @click="confirmDeleteReview"
              >
                <i class="bi bi-trash me-1"></i> 刪除
              </button>
            </div>
            
            <!-- 檢舉按鈕 -->
            <button 
              class="btn btn-outline-danger" 
              @click="showReportModal"
              v-if="!isAuthor"
            >
              <i class="bi bi-flag me-1"></i> 檢舉
            </button>
          </div>
        </div>
      </div>
  
      <!-- 評價不存在提示 -->
      <div v-else class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i> 評價不存在或已被刪除。
      </div>
  
      <!-- 檢舉表單模態視窗 -->
      <div ref="reportModalRef" class="modal fade" id="reportModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="bi bi-flag me-2"></i>檢舉評價
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <report-form 
                :review-id="reviewId" 
                @cancel="closeReportModal" 
                @success="handleReportSuccess"
              />
            </div>
          </div>
        </div>
      </div>
  
      <!-- 照片查看器 -->
      <div class="image-viewer" v-if="isImageViewerOpen" @click="closeImageViewer">
        <div class="image-viewer-content" @click.stop>
          <button class="close-button" @click="closeImageViewer">
            <i class="bi bi-x-lg"></i>
          </button>
          <button class="nav-button prev-button" @click="prevImage" :disabled="currentImageIndex === 0">
            <i class="bi bi-chevron-left"></i>
          </button>
          <img :src="currentImage" alt="大圖" class="viewer-image">
          <button 
            class="nav-button next-button" 
            @click="nextImage" 
            :disabled="currentImageIndex >= (review?.imageUrls?.length || 0) - 1"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
          <div class="image-counter">
            {{ currentImageIndex + 1 }} / {{ review?.imageUrls?.length || 0 }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Modal } from 'bootstrap'
  import { useReviewStore } from '../stores/review'
  import { useAuthStore } from '../stores/auth'
  import { reviewService } from '../services/reviewService'
  import ReportForm from '../components/ReportForm.vue'
  import Swal from 'sweetalert2'
  
  export default {
    name: 'ReviewDetailView',
    components: {
      ReportForm
    },
    props: {
      id: {
        type: [Number, String],
        required: true
      }
    },
    setup(props) {
      const route = useRoute()
      const router = useRouter()
      const reviewStore = useReviewStore()
      const authStore = useAuthStore()
      
      // 基本狀態
      const reviewId = computed(() => Number(props.id))
      const loading = ref(true)
      const error = ref(null)
      const review = ref(null)
      
      // 管理員回覆相關
      const replyText = ref('')
      const isSubmitting = ref(false)
      
      // 照片查看器
      const isImageViewerOpen = ref(false)
      const currentImageIndex = ref(0)
      const currentImage = ref('')
      
      // 檢舉模態視窗
      const reportModalRef = ref(null)
      let reportModal = null
      
      // 計算屬性
      const isAdmin = computed(() => authStore.isAdmin)
      const isAuthor = computed(() => review.value && review.value.userId === authStore.userId)
      
      // 點讚按鈕樣式
      const likeButtonClass = computed(() => {
        return review.value && review.value.userLikeStatus === 1 
          ? 'btn-primary' 
          : 'btn-outline-primary'
      })
      
      // 點讚圖標樣式
      const likeIconClass = computed(() => {
        return review.value && review.value.userLikeStatus === 1 
          ? 'bi-hand-thumbs-up-fill me-1' 
          : 'bi-hand-thumbs-up me-1'
      })
      
      // 初始化
      onMounted(async () => {
        // 初始化模態視窗
        reportModal = new Modal(reportModalRef.value)
        
        // 載入評價
        await loadReview()
      })
      
      // 載入評價
      const loadReview = async () => {
        loading.value = true
        error.value = null
        
        try {
          const data = await reviewStore.fetchReviewById(reviewId.value)
          review.value = data
        } catch (err) {
          console.error('載入評價失敗:', err)
          error.value = '無法載入評價，請稍後再試。'
        } finally {
          loading.value = false
        }
      }
      
      // 處理點讚
      const handleLike = async () => {
        try {
          await reviewStore.toggleLike(reviewId.value, authStore.userId)
          // 重新載入評價以獲取更新後的點讚狀態
          loadReview()
        } catch (err) {
          console.error('點讚操作失敗:', err)
          Swal.fire({
            icon: 'error',
            title: '操作失敗',
            text: '點讚操作失敗，請稍後再試。'
          })
        }
      }
      
      // 編輯評價
      const editReview = () => {
        router.push({
          path: '/reviews',
          query: { edit: reviewId.value }
        })
      }
      
      // 確認刪除評價
      const confirmDeleteReview = () => {
        Swal.fire({
          title: '確定要刪除此評價嗎？',
          text: '此操作無法復原！',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          confirmButtonText: '是，刪除評價',
          cancelButtonText: '取消'
        }).then((result) => {
          if (result.isConfirmed) {
            deleteReview()
          }
        })
      }
      
      // 刪除評價
      const deleteReview = async () => {
        try {
          await reviewStore.deleteReview(reviewId.value, authStore.userId)
          
          Swal.fire({
            icon: 'success',
            title: '評價已刪除',
            text: '您的評價已成功刪除。'
          })
          
          // 導航回評價列表
          router.push('/reviews')
        } catch (err) {
          console.error('刪除評價失敗:', err)
          Swal.fire({
            icon: 'error',
            title: '刪除失敗',
            text: '刪除評價失敗，請稍後再試。'
          })
        }
      }
      
      // 顯示檢舉模態視窗
      const showReportModal = () => {
        reportModal.show()
      }
      
      // 關閉檢舉模態視窗
      const closeReportModal = () => {
        reportModal.hide()
      }
      
      // 處理檢舉成功
      const handleReportSuccess = () => {
        closeReportModal()
        Swal.fire({
          icon: 'success',
          title: '檢舉已提交',
          text: '感謝您的回報，我們將盡快處理。'
        })
      }
      
      // 提交管理員回覆
      const submitReply = async () => {
        if (!replyText.value.trim()) return
        
        isSubmitting.value = true
        
        try {
          await reviewService.replyToReview(reviewId.value, replyText.value)
          
          Swal.fire({
            icon: 'success',
            title: '回覆已提交',
            text: '您的回覆已成功提交。'
          })
          
          // 重新載入評價
          await loadReview()
          
          // 清空回覆文本
          replyText.value = ''
        } catch (err) {
          console.error('提交回覆失敗:', err)
          Swal.fire({
            icon: 'error',
            title: '提交失敗',
            text: '提交回覆失敗，請稍後再試。'
          })
        } finally {
          isSubmitting.value = false
        }
      }
      
      // 打開照片查看器
      const openImageViewer = (url, index) => {
        currentImage.value = url
        currentImageIndex.value = index
        isImageViewerOpen.value = true
        // 阻止背景滾動
        document.body.style.overflow = 'hidden'
      }
      
      // 關閉照片查看器
      const closeImageViewer = () => {
        isImageViewerOpen.value = false
        // 恢復背景滾動
        document.body.style.overflow = 'auto'
      }
      
      // 上一張圖片
      const prevImage = () => {
        if (currentImageIndex.value > 0) {
          currentImageIndex.value--
          currentImage.value = review.value.imageUrls[currentImageIndex.value]
        }
      }
      
      // 下一張圖片
      const nextImage = () => {
        if (currentImageIndex.value < review.value.imageUrls.length - 1) {
          currentImageIndex.value++
          currentImage.value = review.value.imageUrls[currentImageIndex.value]
        }
      }
      
      // 格式化日期
      const formatDate = (dateString) => {
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        } catch (e) {
          console.error('日期格式化錯誤:', e)
          return dateString
        }
      }
      
      // 獲取星級評分的 CSS 類
      const getStarClass = (position, rating) => {
        if (position <= rating) {
          return 'bi bi-star-fill rating-star'
        } else if (position - 0.5 <= rating) {
          return 'bi bi-star-half rating-star'
        } else {
          return 'bi bi-star rating-star-empty'
        }
      }
      
      // 獲取營地名稱
      const getCampsiteName = (campSiteId) => {
        const campsites = {
          1: '苗栗區 山之間',
          2: '花蓮海岸營地',
          3: '南投森林營區',
          4: '宜蘭溪畔營地',
          5: '台東山海營區'
        }
        
        return campsites[campSiteId] || `營地 #${campSiteId}`
      }
      
      return {
        reviewId,
        review,
        loading,
        error,
        replyText,
        isSubmitting,
        isImageViewerOpen,
        currentImageIndex,
        currentImage,
        reportModalRef,
        isAdmin,
        isAuthor,
        likeButtonClass,
        likeIconClass,
        handleLike,
        editReview,
        confirmDeleteReview,
        showReportModal,
        closeReportModal,
        handleReportSuccess,
        submitReply,
        openImageViewer,
        closeImageViewer,
        prevImage,
        nextImage,
        formatDate,
        getStarClass,
        getCampsiteName
      }
    }
  }
  </script>
  
  <style scoped>
  .user-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #198754;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.5rem;
  }
  
  .review-text {
    font-size: 1.1rem;
    line-height: 1.7;
    white-space: pre-line;
  }
  
  .rating-star {
    color: #ffc107;
  }
  
  .rating-star-empty {
    color: #e0e0e0;
  }
  
  .progress {
    height: 10px;
  }
  
  .review-image {
    cursor: pointer;
    transition: transform 0.2s ease;
    height: 200px;
    object-fit: cover;
  }
  
  .review-image:hover {
    transform: scale(1.05);
  }
  
  /* 照片查看器 */
  .image-viewer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  
  .image-viewer-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
  }
  
  .viewer-image {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
  }
  
  .close-button {
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    padding: 5px;
  }
  
  .nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    padding: 10px;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .prev-button {
    left: -60px;
  }
  
  .next-button {
    right: -60px;
  }
  
  .nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .image-counter {
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    background: rgba(0, 0, 0, 0.5);
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.9rem;
  }
  
  @media (max-width: 768px) {
    .nav-button {
      width: 40px;
      height: 40px;
      font-size: 1.5rem;
    }
    
    .prev-button {
      left: -45px;
    }
    
    .next-button {
      right: -45px;
    }
  }
  </style>