<!-- ReportView.vue -->
<template>
    <div class="report-view">
      <div class="container py-4">
        <!-- 頁面標題 -->
        <div class="mb-4">
          <router-link to="/reviews" class="btn btn-outline-secondary mb-3">
            <i class="bi bi-arrow-left me-1"></i> 返回評價列表
          </router-link>
          <h1 class="h3">檢舉評價</h1>
        </div>
  
        <!-- 載入中 -->
        <div v-if="loading && !review" class="text-center py-5">
          <div class="spinner-border text-danger" role="status">
            <span class="visually-hidden">載入中...</span>
          </div>
          <p class="mt-2">正在載入評價資訊...</p>
        </div>
  
        <!-- 評價不存在 -->
        <div v-else-if="!review && !loading" class="alert alert-warning">
          <i class="bi bi-exclamation-triangle me-2"></i> 找不到指定的評價，可能已被刪除。
          <div class="mt-3">
            <router-link to="/reviews" class="btn btn-primary">
              返回評價列表
            </router-link>
          </div>
        </div>
  
        <!-- 評價資訊與檢舉表單 -->
        <div v-else class="row">
          <!-- 左側：評價內容 -->
          <div class="col-lg-5 mb-4">
            <div class="card shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0">評價詳情</h5>
              </div>
              <div class="card-body">
                <!-- 評價者資訊 -->
                <div class="d-flex align-items-center mb-3">
                  <div class="user-avatar me-2">
                    {{ review.userName ? review.userName.charAt(0) : 'U' }}
                  </div>
                  <div>
                    <h6 class="mb-0">{{ review.userName || '匿名用戶' }}</h6>
                    <small class="text-muted">{{ formatDate(review.createdAt) }}</small>
                  </div>
                  <div class="ms-auto">
                    <i v-for="i in 5" :key="i" 
                       :class="i <= review.overallRating ? 'bi bi-star-fill rating-star' : 'bi bi-star rating-star-empty'"
                    ></i>
                  </div>
                </div>
  
                <!-- 評價內容 -->
                <p class="review-text">{{ review.reviewText }}</p>
  
                <!-- 優缺點 -->
                <div class="row mb-3" v-if="review.pros || review.cons">
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
  
                <!-- 圖片預覽 -->
                <div v-if="review.imageUrls && review.imageUrls.length > 0" class="mb-3">
                  <h6>評價圖片：</h6>
                  <div class="row g-2">
                    <div v-for="(url, index) in review.imageUrls" :key="index" class="col-4">
                      <img :src="url" :alt="`評價圖片 ${index + 1}`" class="img-thumbnail review-image">
                    </div>
                  </div>
                </div>
  
                <!-- 查看完整評價按鈕 -->
                <div class="mt-3">
                  <router-link :to="`/reviews/${review.id}`" class="btn btn-outline-primary">
                    <i class="bi bi-eye me-1"></i> 查看完整評價
                  </router-link>
                </div>
              </div>
            </div>
          </div>
  
          <!-- 右側：檢舉表單 -->
          <div class="col-lg-7">
            <div class="card border-danger shadow-sm">
              <div class="card-header bg-danger text-white">
                <h5 class="mb-0">
                  <i class="bi bi-flag me-2"></i>檢舉此評價
                </h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="submitReport">
                  <div class="mb-3">
                    <label for="reportType" class="form-label">檢舉原因</label>
                    <select 
                      id="reportType" 
                      class="form-select" 
                      v-model="reportData.reportType"
                      required
                    >
                      <option value="" disabled selected>請選擇檢舉原因</option>
                      <option v-for="option in reportOptions" :key="option.id" :value="option.id">
                        {{ option.label }}
                      </option>
                    </select>
                  </div>
                  
                  <div class="mb-3">
                    <label for="reason" class="form-label">詳細說明</label>
                    <textarea 
                      id="reason" 
                      class="form-control" 
                      v-model="reportData.reason" 
                      rows="6" 
                      placeholder="請提供更詳細的說明，例如為什麼這條評價違反規定，或者內容如何不實等..."
                      required
                    ></textarea>
                  </div>
                  
                  <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    所有檢舉都會經過管理員審核，若情況屬實，此評價可能會被移除或修改。惡意檢舉可能導致帳號被限制功能。
                  </div>
                  
                  <div class="d-flex justify-content-between">
                    <router-link 
                      :to="`/reviews/${reviewId}`" 
                      class="btn btn-outline-secondary"
                    >
                      <i class="bi bi-x-circle me-1"></i>取消
                    </router-link>
                    <button 
                      type="submit" 
                      class="btn btn-danger" 
                      :disabled="isSubmitting"
                    >
                      <i class="bi bi-send me-1"></i>
                      {{ isSubmitting ? '提交中...' : '提交檢舉' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAuthStore } from '../stores/auth'
  import { useReviewStore } from '../stores/review'
  import { reportService } from '../services/reportService'
  import Swal from 'sweetalert2'
  
  export default {
    name: 'ReportView',
    props: {
      reviewId: {
        type: [Number, String],
        required: true
      }
    },
    setup(props) {
      const route = useRoute()
      const router = useRouter()
      const authStore = useAuthStore()
      const reviewStore = useReviewStore()
      
      // 狀態
      const loading = ref(true)
      const review = ref(null)
      const isSubmitting = ref(false)
      
      // 檢舉選項
      const reportOptions = [
        { id: 1, label: '不實內容' },
        { id: 2, label: '冒犯性內容或語言' },
        { id: 3, label: '廣告或垃圾訊息' },
        { id: 4, label: '暴力或仇恨言論' },
        { id: 5, label: '侵犯隱私權' },
        { id: 6, label: '其他' }
      ]
      
      // 檢舉表單數據
      const reportData = reactive({
        reviewId: Number(props.reviewId),
        userId: authStore.userId,
        reportType: '',
        reason: '',
        status: 'pending'
      })
      
      // 載入評價
      const loadReview = async () => {
        loading.value = true
        try {
          const data = await reviewStore.fetchReviewById(Number(props.reviewId))
          review.value = data
        } catch (error) {
          console.error('載入評價失敗:', error)
          Swal.fire({
            icon: 'error',
            title: '載入失敗',
            text: '無法載入評價資訊，請稍後再試。'
          })
        } finally {
          loading.value = false
        }
      }
      
      // 提交檢舉
      const submitReport = async () => {
        if (!reportData.reportType || !reportData.reason.trim()) {
          Swal.fire({
            icon: 'error',
            title: '提交失敗',
            text: '請填寫所有必填欄位。'
          })
          return
        }
        
        isSubmitting.value = true
        
        try {
          await reportService.createReport(reportData)
          
          Swal.fire({
            icon: 'success',
            title: '檢舉已提交',
            text: '感謝您的回報，我們將盡快處理。',
            confirmButtonText: '返回評價'
          }).then(() => {
            router.push(`/reviews/${props.reviewId}`)
          })
        } catch (error) {
          console.error('檢舉提交失敗:', error)
          
          let errorMessage = '提交檢舉時發生錯誤，請稍後再試。'
          if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message
          }
          
          Swal.fire({
            icon: 'error',
            title: '提交失敗',
            text: errorMessage
          })
        } finally {
          isSubmitting.value = false
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
            day: 'numeric'
          })
        } catch (e) {
          console.error('日期格式化錯誤:', e)
          return dateString
        }
      }
      
      onMounted(() => {
        loadReview()
      })
      
      return {
        reviewId: Number(props.reviewId),
        loading,
        review,
        reportOptions,
        reportData,
        isSubmitting,
        submitReport,
        formatDate
      }
    }
  }
  </script>
  
  <style scoped>
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #198754;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }
  
  .review-text {
    white-space: pre-line;
    max-height: 200px;
    overflow-y: auto;
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
    height: 80px;
    object-fit: cover;
  }
  
  .rating-star {
    color: #ffc107;
  }
  
  .rating-star-empty {
    color: #e0e0e0;
  }
  
  .form-control:focus, .form-select:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
  }
  </style>