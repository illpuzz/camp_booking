<template>
    <div class="review-list-view">
      <!-- 營地信息頭部 -->
      <div class="card mb-4 border-0 shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <div class="campsite-icon bg-success text-white rounded p-3 me-3">
                <i class="bi bi-tree-fill fs-4"></i>
              </div>
              <div>
                <h1 class="h3 mb-1">{{ campsite.name }}</h1>
                <p class="text-muted mb-0">
                  <i class="bi bi-geo-alt"></i> {{ campsite.location || '地址資訊未提供' }}
                </p>
              </div>
            </div>
            <button class="btn btn-success" @click="showNewReviewModal">
              <i class="bi bi-pencil me-1"></i> 撰寫評價
            </button>
          </div>
        </div>
      </div>
  
      <!-- 主要內容區 -->
      <div class="row">
        <!-- 左側過濾選項 -->
        <div class="col-lg-3 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white">
              <h5 class="mb-0">過濾選項</h5>
            </div>
            <div class="card-body">
              <!-- 搜尋框 -->
              <div class="mb-3">
                <label for="search" class="form-label">關鍵字搜尋</label>
                <div class="input-group">
                  <input 
                    type="text" 
                    id="search" 
                    class="form-control" 
                    placeholder="搜尋評價內容" 
                    v-model="searchKeyword"
                    @keyup.enter="applyFilters"
                  >
                  <button class="btn btn-outline-success" type="button" @click="applyFilters">
                    <i class="bi bi-search"></i>
                  </button>
                </div>
              </div>
  
              <!-- 評分過濾 -->
              <div class="mb-3">
                <label class="form-label">最低評分</label>
                <div class="rating-filter">
                  <div 
                    v-for="rating in 5" 
                    :key="rating" 
                    class="form-check"
                  >
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      :id="`rating-${rating}`" 
                      name="rating" 
                      :value="rating" 
                      v-model="minRating"
                    >
                    <label class="form-check-label d-flex align-items-center" :for="`rating-${rating}`">
                      <i 
                        v-for="star in 5" 
                        :key="star" 
                        :class="star <= rating ? 'bi bi-star-fill rating-star' : 'bi bi-star rating-star-empty'"
                      ></i>
                      <span class="ms-2">以上</span>
                    </label>
                  </div>
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      id="rating-all" 
                      name="rating" 
                      value="" 
                      v-model="minRating"
                    >
                    <label class="form-check-label" for="rating-all">所有評分</label>
                  </div>
                </div>
              </div>
  
              <!-- 排序選項 -->
              <div class="mb-3">
                <label for="sort" class="form-label">排序方式</label>
                <select id="sort" class="form-select" v-model="sortOption">
                  <option value="createdAt,DESC">最新評價</option>
                  <option value="createdAt,ASC">最舊評價</option>
                  <option value="overallRating,DESC">最高評分</option>
                  <option value="overallRating,ASC">最低評分</option>
                  <option value="likeCount,DESC">最多讚數</option>
                </select>
              </div>
  
              <!-- 應用過濾按鈕 -->
              <button class="btn btn-success w-100" @click="applyFilters">
                <i class="bi bi-filter me-1"></i> 應用過濾
              </button>
            </div>
          </div>
        </div>
  
        <!-- 右側評價列表 -->
        <div class="col-lg-9">
          <!-- 載入中狀態 -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-success" role="status">
              <span class="visually-hidden">載入中...</span>
            </div>
            <p class="mt-2">評價載入中，請稍候...</p>
          </div>
  
          <!-- 無評價提示 -->
          <div v-else-if="reviews.length === 0" class="card border-0 shadow-sm p-5 text-center">
            <div class="py-4">
              <i class="bi bi-chat-square-text display-4 text-muted"></i>
              <h3 class="mt-3">暫無評價</h3>
              <p class="text-muted">成為第一個評價此營地的人吧！</p>
              <button class="btn btn-success mt-2" @click="showNewReviewModal">
                <i class="bi bi-pencil me-1"></i> 撰寫評價
              </button>
            </div>
          </div>
  
          <!-- 評價列表 -->
          <template v-else>
            <div class="mb-3 d-flex justify-content-between align-items-center">
              <h2 class="h5 mb-0">評價列表 ({{ totalElements || reviews.length }})</h2>
            </div>
  
            <div class="review-items">
              <div v-for="review in reviews" :key="review.id" class="mb-4">
                <review-item 
                  :review="review" 
                  @like="handleLike"
                  @view="viewReview"
                  @edit="editReview"
                  @report="reportReview"
                />
              </div>
            </div>
  
            <!-- 分頁控件 -->
            <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4 mb-3">
              <paginate
                v-model="currentPage"
                :page-count="totalPages"
                :click-handler="handlePageChange"
                :prev-text="'上一頁'"
                :next-text="'下一頁'"
                :container-class="'pagination'"
                :page-class="'page-item'"
                :page-link-class="'page-link'"
                :prev-class="'page-item'"
                :prev-link-class="'page-link'"
                :next-class="'page-item'"
                :next-link-class="'page-link'"
                :active-class="'active bg-success'"
              />
            </div>
          </template>
        </div>
      </div>
  
      <!-- 評價表單模態視窗 -->
      <div ref="reviewModalRef" class="modal fade" id="reviewModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ editMode ? '編輯評價' : '撰寫新評價' }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitReview">
                <div class="mb-3">
                  <label class="form-label">整體評分</label>
                  <div class="rating-input">
                    <i 
                      v-for="i in 5" 
                      :key="i" 
                      :class="i <= reviewForm.overallRating ? 'bi bi-star-fill' : 'bi bi-star'" 
                      @click="reviewForm.overallRating = i"
                    ></i>
                    <span class="ms-2">{{ reviewForm.overallRating }} 顆星</span>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label">清潔程度</label>
                    <div class="rating-input">
                      <i 
                        v-for="i in 5" 
                        :key="i" 
                        :class="i <= reviewForm.cleanlinessRating ? 'bi bi-star-fill' : 'bi bi-star'" 
                        @click="reviewForm.cleanlinessRating = i"
                      ></i>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">便利程度</label>
                    <div class="rating-input">
                      <i 
                        v-for="i in 5" 
                        :key="i" 
                        :class="i <= reviewForm.convenienceRating ? 'bi bi-star-fill' : 'bi bi-star'" 
                        @click="reviewForm.convenienceRating = i"
                      ></i>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">友善程度</label>
                    <div class="rating-input">
                      <i 
                        v-for="i in 5" 
                        :key="i" 
                        :class="i <= reviewForm.friendlinessRating ? 'bi bi-star-fill' : 'bi bi-star'" 
                        @click="reviewForm.friendlinessRating = i"
                      ></i>
                    </div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="reviewText" class="form-label">評價內容</label>
                  <textarea 
                    id="reviewText" 
                    class="form-control" 
                    v-model="reviewForm.reviewText" 
                    rows="5" 
                    placeholder="分享您的營地體驗..." 
                    required
                  ></textarea>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="pros" class="form-label">優點</label>
                    <textarea 
                      id="pros" 
                      class="form-control" 
                      v-model="reviewForm.pros" 
                      rows="3" 
                      placeholder="營地的優點..."
                    ></textarea>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="cons" class="form-label">缺點</label>
                    <textarea 
                      id="cons" 
                      class="form-control" 
                      v-model="reviewForm.cons" 
                      rows="3" 
                      placeholder="營地的缺點..."
                    ></textarea>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">上傳照片</label>
                  <div class="input-group">
                    <input 
                      type="file" 
                      class="form-control" 
                      multiple 
                      accept="image/*" 
                      @change="handleFileUpload"
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button" 
                      @click="uploadImages" 
                      :disabled="!files.length || uploading"
                    >
                      <i class="bi bi-upload"></i> 上傳
                    </button>
                  </div>
                  <div class="form-text">可上傳多張照片 (最大 10MB)</div>
                </div>
                
                <!-- 預覽上傳的照片 -->
                <div v-if="reviewForm.imageUrls && reviewForm.imageUrls.length > 0" class="mb-3">
                  <div class="row g-2">
                    <div 
                      v-for="(url, index) in reviewForm.imageUrls" 
                      :key="index" 
                      class="col-md-3 col-sm-4 col-6"
                    >
                      <div class="position-relative">
                        <img :src="url" class="img-thumbnail" alt="上傳的照片">
                        <button 
                          type="button" 
                          class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" 
                          @click="removeImage(index)"
                        >
                          <i class="bi bi-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="text-end">
                  <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">取消</button>
                  <button type="submit" class="btn btn-success" :disabled="isSubmitting">
                    <span v-if="isSubmitting">
                      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      提交中...
                    </span>
                    <span v-else>{{ editMode ? '更新評價' : '提交評價' }}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
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
                :review-id="selectedReviewId" 
                @cancel="closeReportModal" 
                @success="handleReportSuccess"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive, computed, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { Modal } from 'bootstrap'
  import { useReviewStore } from '../stores/review'
  import { useAuthStore } from '../stores/auth'
  import ReviewItem from '../components/ReviewItem.vue'
  import ReportForm from '../components/ReportForm.vue'
  import Paginate from 'vuejs-paginate-next'
  import { reviewService } from '../services/reviewService'
  import Swal from 'sweetalert2'
  
  export default {
    name: 'ReviewListView',
    components: {
      ReviewItem,
      ReportForm,
      Paginate
    },
    setup() {
      const router = useRouter()
      const reviewStore = useReviewStore()
      const authStore = useAuthStore()
      
      // 模態視窗參考
      const reviewModalRef = ref(null)
      const reportModalRef = ref(null)
      let reviewModal = null
      let reportModal = null
      
      // 評價表單狀態
      const reviewForm = reactive({
        userId: authStore.userId,
        campSiteId: reviewStore.campsite.id,
        reviewText: '',
        overallRating: 0,
        cleanlinessRating: 0,
        convenienceRating: 0,
        friendlinessRating: 0,
        pros: '',
        cons: '',
        imageUrls: []
      })
      
      // 檢舉狀態
      const selectedReviewId = ref(null)
      
      // 表單狀態
      const editMode = ref(false)
      const currentReviewId = ref(null)
      const isSubmitting = ref(false)
      const files = ref([])
      const uploading = ref(false)
      
      // 過濾狀態
      const searchKeyword = ref('')
      const minRating = ref('')
      const sortOption = ref('createdAt,DESC')
      
      // 從 store 獲取數據
      const reviews = computed(() => reviewStore.reviews)
      const loading = computed(() => reviewStore.loading)
      const currentPage = computed({
        get: () => reviewStore.currentPage,
        set: (val) => {
          reviewStore.$patch({ currentPage: val })
        }
      })
      const totalPages = computed(() => reviewStore.totalPages)
      const totalElements = computed(() => reviewStore.totalElements)
      const campsite = computed(() => reviewStore.campsite)
      
      // 初始化
      onMounted(() => {
        // 初始化模態視窗
        reviewModal = new Modal(reviewModalRef.value)
        reportModal = new Modal(reportModalRef.value)
        
        // 載入評價
        loadReviews()
      })
      
      // 監聽營地變化
      watch(() => reviewStore.campsite, (newVal) => {
        if (newVal && newVal.id) {
          loadReviews()
        }
      })
      
      // 載入評價
      function loadReviews() {
        reviewStore.fetchReviews(campsite.value.id, currentPage.value)
      }
      
      // 處理頁碼變化
      function handlePageChange(page) {
        reviewStore.fetchReviews(campsite.value.id, page)
      }
      
      // 處理點讚
      function handleLike(reviewId) {
        reviewStore.toggleLike(reviewId, authStore.userId)
      }
      
      // 查看評價詳情
      function viewReview(reviewId) {
        router.push(`/reviews/${reviewId}`)
      }
      
      // 編輯評價
      async function editReview(reviewId) {
        try {
          const review = await reviewStore.fetchReviewById(reviewId)
          
          // 填充表單數據
          Object.assign(reviewForm, {
            userId: review.userId,
            campSiteId: review.campSiteId,
            reviewText: review.reviewText,
            overallRating: review.overallRating,
            cleanlinessRating: review.cleanlinessRating,
            convenienceRating: review.convenienceRating,
            friendlinessRating: review.friendlinessRating,
            pros: review.pros,
            cons: review.cons,
            imageUrls: review.imageUrls || []
          })
          
          // 設置編輯模式
          editMode.value = true
          currentReviewId.value = reviewId
          
          // 顯示模態視窗
          reviewModal.show()
        } catch (error) {
          console.error('載入評價詳情失敗:', error)
          Swal.fire({
            icon: 'error',
            title: '操作失敗',
            text: '載入評價詳情失敗，請稍後再試。'
          })
        }
      }
      
      // 檢舉評價
      function reportReview(reviewId) {
        selectedReviewId.value = reviewId
        reportModal.show()
      }
      
      // 關閉檢舉模態視窗
      function closeReportModal() {
        reportModal.hide()
      }
      
      // 處理檢舉成功
      function handleReportSuccess(report) {
        closeReportModal()
        Swal.fire({
          icon: 'success',
          title: '檢舉已提交',
          text: '感謝您的回報，我們將盡快處理。'
        })
      }
      
      // 顯示新評價模態視窗
      function showNewReviewModal() {
        // 重置表單
        Object.assign(reviewForm, {
          userId: authStore.userId,
          campSiteId: campsite.value.id,
          reviewText: '',
          overallRating: 0,
          cleanlinessRating: 0,
          convenienceRating: 0,
          friendlinessRating: 0,
          pros: '',
          cons: '',
          imageUrls: []
        })
        
        // 設置模式
        editMode.value = false
        currentReviewId.value = null
        
        // 顯示模態視窗
        reviewModal.show()
      }
      
      // 處理檔案上傳
      function handleFileUpload(event) {
        files.value = Array.from(event.target.files)
      }
      
      // 上傳圖片
      async function uploadImages() {
        if (!files.value.length) return
        
        uploading.value = true
        try {
          // 實際開發中應該調用 API
          // const responses = await reviewService.uploadMultipleImages(files.value)
          // reviewForm.imageUrls = [...reviewForm.imageUrls, ...responses.map(resp => resp.imageUrl)]
          
          // 模擬上傳
          setTimeout(() => {
            const newImages = files.value.map((_, index) => 
              `https://via.placeholder.com/400x300?text=營地照片${reviewForm.imageUrls.length + index + 1}`
            )
            reviewForm.imageUrls = [...reviewForm.imageUrls, ...newImages]
            files.value = []
            uploading.value = false
          }, 1500)
        } catch (error) {
          console.error('上傳圖片失敗:', error)
          Swal.fire({
            icon: 'error',
            title: '上傳失敗',
            text: '圖片上傳失敗，請稍後再試。'
          })
          uploading.value = false
        }
      }
      
      // 移除已上傳的圖片
      function removeImage(index) {
        reviewForm.imageUrls.splice(index, 1)
      }
      
      // 提交評價
      async function submitReview() {
        if (reviewForm.overallRating === 0) {
          Swal.fire({
            icon: 'warning',
            title: '請填寫評分',
            text: '請為您的體驗提供整體評分。'
          })
          return
        }
        
        isSubmitting.value = true
        
        try {
          if (editMode.value) {
            // 更新評價
            await reviewStore.updateReview(currentReviewId.value, reviewForm)
          } else {
            // 創建新評價
            await reviewStore.createReview(reviewForm)
          }
          
          // 關閉模態視窗
          reviewModal.hide()
          
          // 顯示成功訊息
          Swal.fire({
            icon: 'success',
            title: editMode.value ? '評價已更新' : '評價已提交',
            text: editMode.value ? '您的評價已成功更新！' : '感謝您的評價！'
          })
          
          // 重新載入評價
          loadReviews()
        } catch (error) {
          console.error(editMode.value ? '更新評價失敗:' : '提交評價失敗:', error)
          
          Swal.fire({
            icon: 'error',
            title: '操作失敗',
            text: editMode.value ? '更新評價失敗，請稍後再試。' : '提交評價失敗，請稍後再試。'
          })
        } finally {
          isSubmitting.value = false
        }
      }
      
      // 應用過濾
      function applyFilters() {
        const [sortBy, sortDirection] = sortOption.value.split(',')
        
        reviewStore.searchReviews({
          keyword: searchKeyword.value,
          campSiteId: campsite.value.id,
          minRating: minRating.value || null,
          userId: authStore.userId,
          page: 0, // 重置到第一頁
          size: 10,
          sortBy,
          sortDirection
        })
      }
      
      return {
        reviews,
        loading,
        currentPage,
        totalPages,
        totalElements,
        campsite,
        reviewForm,
        editMode,
        isSubmitting,
        files,
        uploading,
        selectedReviewId,
        searchKeyword,
        minRating,
        sortOption,
        reviewModalRef,
        reportModalRef,
        handlePageChange,
        handleLike,
        viewReview,
        editReview,
        reportReview,
        closeReportModal,
        handleReportSuccess,
        showNewReviewModal,
        handleFileUpload,
        uploadImages,
        removeImage,
        submitReview,
        applyFilters
      }
    }
  }
  </script>
  
  <style scoped>
  .campsite-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .rating-star {
    color: #ffc107;
  }
  
  .rating-star-empty {
    color: #e0e0e0;
  }
  
  .rating-input i {
    font-size: 1.5rem;
    cursor: pointer;
    color: #e0e0e0;
    margin-right: 5px;
  }
  
  .rating-input i.bi-star-fill {
    color: #ffc107;
  }
  
  .rating-input i:hover {
    color: #ffc107;
  }
  
  :deep(.pagination) {
    margin-bottom: 0;
  }
  
  :deep(.page-item.active .page-link) {
    background-color: #198754 !important;
    border-color: #198754 !important;
  }
  
  :deep(.page-link) {
    color: #198754;
  }
  
  :deep(.page-link:hover) {
    color: #0e5833;
  }
  </style>