<!-- src/views/ReviewPage.vue -->
<template>
    <div class="review-page container py-4">
      <h1 class="mb-4">營地評價系統</h1>
      
      <!-- 評價統計 -->
      <div class="review-stats card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-4 d-flex align-items-center">
              <div>
                <h3 class="mb-0">{{ averageRating.toFixed(1) }}</h3>
                <div class="d-flex align-items-center mb-2">
                  <star-rating :rating="averageRating" :size="24"></star-rating>
                </div>
                <p class="text-muted mb-0">總評價數: {{ totalReviews }}</p>
              </div>
            </div>
            <div class="col-md-8">
              <div class="rating-bars">
                <div v-for="i in 5" :key="i" class="rating-bar-item d-flex align-items-center mb-2">
                  <div class="rating-label me-2">{{ 6 - i }} 星</div>
                  <div class="progress flex-grow-1" style="height: 12px;">
                    <div 
                      class="progress-bar bg-success" 
                      :style="{ width: ratingPercentage(6 - i) + '%' }"
                    ></div>
                  </div>
                  <div class="ms-2" style="min-width: 36px;">{{ ratingCounts[6 - i] || 0 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 顯示模式切換 -->
      <div v-if="!showForm && !selectedReview">
        <review-list 
          :camp-site-id="campSiteId"
          :current-user-id="currentUserId"
          @add-review="showForm = true"
          @edit-review="editReview"
          @view-review="viewReview"
          @view-image="viewImage"
        />
      </div>
      
      <!-- 評價表單 -->
      <div v-else-if="showForm">
        <review-form 
          :camp-site-id="campSiteId"
          :user-id="currentUserId"
          :review="editingReview"
          @submitted="handleFormSubmit"
          @cancel="cancelForm"
        />
      </div>
      
      <!-- 評價詳情 -->
      <review-detail 
        v-if="selectedReview"
        :review-id="selectedReview.id"
        :current-user-id="currentUserId"
        @close="selectedReview = null"
        @edit="editCurrentReview"
        @deleted="handleReviewDeleted"
      />
      
      <!-- 圖片瀏覽器 -->
      <div v-if="galleryImages.length > 0" class="image-gallery">
        <div class="gallery-backdrop" @click="galleryImages = []"></div>
        <div class="gallery-content">
          <button class="gallery-close" @click="galleryImages = []">&times;</button>
          <div class="gallery-main-image">
            <img :src="galleryImages[galleryIndex] || ''" alt="評價照片" class="img-fluid">
          </div>
          <div class="gallery-controls">
            <button 
              class="gallery-prev" 
              @click="galleryIndex = Math.max(0, galleryIndex - 1)"
              :disabled="galleryIndex === 0"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
            <div class="gallery-counter">{{ galleryIndex + 1 }} / {{ galleryImages.length }}</div>
            <button 
              class="gallery-next" 
              @click="galleryIndex = Math.min(galleryImages.length - 1, galleryIndex + 1)"
              :disabled="galleryIndex === galleryImages.length - 1"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { useReviewStore } from '@/stores/reviewStore';
  import StarRating from '@/components/StarRating.vue';
  import ReviewList from '@/components/ReviewList.vue';
  import ReviewForm from '@/components/ReviewForm.vue';
  import ReviewDetail from '@/components/ReviewDetail.vue';
  
  export default {
    name: 'ReviewPage',
    components: {
      StarRating,
      ReviewList,
      ReviewForm,
      ReviewDetail
    },
    setup() {
      const reviewStore = useReviewStore();
      
      // 當前用戶和營地ID，實際應用中這些應該從認證系統和路由參數中獲取
      const currentUserId = ref(101); // 模擬當前用戶ID
      const campSiteId = ref(201); // 模擬營地ID
      
      // 狀態控制
      const showForm = ref(false);
      const editingReview = ref(null);
      const selectedReview = ref(null);
      
      // 圖片畫廊
      const galleryImages = ref([]);
      const galleryIndex = ref(0);
      
      // 評分統計
      const averageRating = computed(() => reviewStore.averageRating || 0);
      const totalReviews = computed(() => reviewStore.totalElements || 0);
      const ratingCounts = ref({
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      });
      
      // 計算每個評分等級的百分比
      const ratingPercentage = (rating) => {
        if (totalReviews.value === 0) return 0;
        return ((ratingCounts.value[rating] || 0) / totalReviews.value) * 100;
      };
      
      // 從評價列表計算評分分佈
      const calculateRatingDistribution = () => {
        // 重置計數
        ratingCounts.value = {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        };
        
        // 計算各星級數量
        reviewStore.reviews.forEach(review => {
          const rating = Math.round(review.overallRating);
          if (rating >= 1 && rating <= 5) {
            ratingCounts.value[rating] = (ratingCounts.value[rating] || 0) + 1;
          }
        });
      };
      
      // 獲取評價數據
      const fetchData = async () => {
        try {
          // 獲取平均評分
          await reviewStore.fetchAverageRating(campSiteId.value);
          
          // 獲取評價列表
          await reviewStore.fetchReviews(
            campSiteId.value,
            0,
            10,
            'createdAt',
            'DESC',
            currentUserId.value
          );
          
          // 計算評分分佈
          calculateRatingDistribution();
        } catch (error) {
          console.error('Error fetching review data:', error);
        }
      };
      
      // 查看評價詳情
      const viewReview = (review) => {
        selectedReview.value = review;
      };
      
      // 編輯評價
      const editReview = (review) => {
        editingReview.value = review;
        showForm.value = true;
      };
      
      // 編輯當前查看的評價
      const editCurrentReview = () => {
        if (selectedReview.value) {
          editingReview.value = selectedReview.value;
          selectedReview.value = null;
          showForm.value = true;
        }
      };
      
      // 取消表單
      const cancelForm = () => {
        showForm.value = false;
        editingReview.value = null;
      };
      
      // 處理表單提交
      const handleFormSubmit = () => {
        showForm.value = false;
        editingReview.value = null;
        // 重新獲取數據以更新列表
        fetchData();
      };
      
      // 處理評價刪除
      const handleReviewDeleted = () => {
        // 重新獲取數據以更新列表
        fetchData();
      };
      
      // 查看圖片
      const viewImage = ({ images, index }) => {
        galleryImages.value = images;
        galleryIndex.value = index || 0;
      };
      
      onMounted(() => {
        fetchData();
      });
      
      return {
        currentUserId,
        campSiteId,
        showForm,
        editingReview,
        selectedReview,
        galleryImages,
        galleryIndex,
        averageRating,
        totalReviews,
        ratingCounts,
        ratingPercentage,
        viewReview,
        editReview,
        editCurrentReview,
        cancelForm,
        handleFormSubmit,
        handleReviewDeleted,
        viewImage
      };
    }
  };
  </script>
  
  <style scoped>
  .review-page {
    padding-bottom: 2rem;
  }
  
  .rating-label {
    width: 40px;
  }
  
  /* 圖片畫廊樣式 */
  .image-gallery {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .gallery-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
  }
  
  .gallery-content {
    position: relative;
    z-index: 2001;
    width: 90%;
    max-width: 1000px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .gallery-close {
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
  }
  
  .gallery-main-image {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .gallery-main-image img {
    max-height: 70vh;
    max-width: 100%;
    object-fit: contain;
  }
  
  .gallery-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 1rem;
  }
  
  .gallery-prev,
  .gallery-next {
    background: rgba(255, 255, 255, 0.3);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .gallery-prev:hover,
  .gallery-next:hover {
    background: rgba(255, 255, 255, 0.5);
  }
  
  .gallery-prev:disabled,
  .gallery-next:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
  }
  
  .gallery-counter {
    color: white;
    font-size: 1rem;
  }
  </style>