<!-- src/views/ReviewDetailView.vue -->
<template>
    <div class="review-detail-view container py-4">
      <div class="row">
        <div class="col-12">
          <!-- 返回按鈕 -->
          <button class="btn btn-outline-secondary mb-4" @click="goBack">
            <i class="bi bi-arrow-left"></i> 返回評價列表
          </button>
          
          <!-- 評價詳情卡片 -->
          <div class="card shadow-sm" v-if="review">
            <div class="card-header bg-success bg-opacity-10 d-flex justify-content-between align-items-center">
              <div>
                <h4 class="mb-0">
                  <span class="emoji-icon me-2">🏕️</span>
                  <span class="text-success">{{ campType }}</span>
                  <span class="ms-2">{{ review.campName || '山之間' }}</span>
                </h4>
              </div>
              <div class="star-rating">
                <i v-for="i in 5" :key="i" class="bi" :class="i <= review.overallRating ? 'bi-star-fill text-warning' : 'bi-star'"></i>
              </div>
            </div>
            
            <div class="card-body">
              <!-- 用戶信息和日期 -->
              <div class="user-info d-flex justify-content-between mb-4">
                <div>
                  <span class="fw-bold">{{ review.userName || '王小明' }}</span>
                  <span class="text-muted ms-2">{{ formatDate(review.createdAt) }}</span>
                  <span class="text-muted ms-2">(已於 {{ formatDate(review.updatedAt) }} 編輯)</span>
                </div>
              </div>
              
              <!-- 評分詳情 -->
              <div class="ratings-details mb-4">
                <div class="row g-3">
                  <div class="col-md-4">
                    <div class="p-3 bg-light rounded">
                      <div class="rating-label mb-2">清潔程度</div>
                      <div class="rating-stars">
                        <i v-for="i in 5" :key="i" class="bi" :class="i <= review.cleanlinessRating ? 'bi-star-fill text-warning' : 'bi-star'"></i>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="p-3 bg-light rounded">
                      <div class="rating-label mb-2">便利程度</div>
                      <div class="rating-stars">
                        <i v-for="i in 5" :key="i" class="bi" :class="i <= review.convenienceRating ? 'bi-star-fill text-warning' : 'bi-star'"></i>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="p-3 bg-light rounded">
                      <div class="rating-label mb-2">友善程度</div>
                      <div class="rating-stars">
                        <i v-for="i in 5" :key="i" class="bi" :class="i <= review.friendlinessRating ? 'bi-star-fill text-warning' : 'bi-star'"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 優點缺點總結 -->
              <div class="summary mb-4">
                <div class="pros-cons mb-3 p-3 bg-success bg-opacity-10 rounded">
                  <h5 class="mb-2 text-success">優點</h5>
                  <p class="mb-0">{{ review.pros }}</p>
                </div>
                <div class="pros-cons mb-3 p-3 bg-danger bg-opacity-10 rounded">
                  <h5 class="mb-2 text-danger">缺點</h5>
                  <p class="mb-0">{{ review.cons }}</p>
                </div>
              </div>
              
              <!-- 評價內容 -->
              <div class="review-content mb-4">
                <h5 class="mb-3">評價詳情</h5>
                <p>{{ review.reviewText }}</p>
              </div>
              
              <!-- 評價圖片 -->
              <div class="review-images mb-4" v-if="review.imageUrls && review.imageUrls.length > 0">
                <h5 class="mb-3">圖片</h5>
                <div class="row g-3">
                  <div class="col-md-6 col-lg-4" v-for="(imageUrl, index) in review.imageUrls" :key="index">
                    <div class="image-container">
                      <img :src="imageUrl" class="img-fluid rounded" alt="營地照片">
                      <div class="image-overlay" @click="openImageModal(imageUrl)">
                        <i class="bi bi-zoom-in"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 按鈕區域 -->
              <div class="review-actions d-flex gap-2 mb-4">
                <button class="btn btn-outline-primary" @click="likeReview">
                  <i class="bi" :class="review.userLikeStatus ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'"></i>
                  讚 {{ review.likeCount || 0 }}
                </button>
                <button class="btn btn-outline-warning" @click="showReportForm = true" v-if="!showReportForm">
                  <i class="bi bi-flag"></i> 檢舉
                </button>
              </div>
              
              <!-- 檢舉表單 -->
              <report-form 
                v-if="showReportForm"
                :review-id="reviewId"
                :user-id="userId"
                @cancel="showReportForm = false"
                @submitted="handleReportSubmitted"
              />
              
              <!-- 回覆區域 -->
              <div class="reply-area p-3 mt-4 border-top" v-if="review.replyText && review.replyIsVisible">
                <h5 class="mb-3">管理者回覆</h5>
                <div class="reply-content p-3 bg-light rounded">
                  {{ review.replyText }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- 載入中狀態 -->
          <div class="text-center p-5" v-else-if="loading">
            <div class="spinner-border text-success" role="status">
              <span class="visually-hidden">載入中...</span>
            </div>
            <p class="mt-3">載入評價中...</p>
          </div>
          
          <!-- 錯誤狀態 -->
          <div class="alert alert-danger" v-else-if="error">
            {{ error }}
          </div>
        </div>
      </div>
      
      <!-- 圖片檢視模態框 -->
      <div class="modal fade" id="imageModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
              <img :src="selectedImage" class="img-fluid w-100" alt="營地照片">
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import Swal from 'sweetalert2';
  import { Modal } from 'bootstrap';
  import ReportForm from '@/components/ReportForm.vue';
  
  export default {
    name: 'ReviewDetailView',
    components: {
      ReportForm
    },
    data() {
      return {
        review: null,
        loading: true,
        error: null,
        showReportForm: false,
        selectedImage: '',
        imageModal: null,
        campType: '苗栗區'
      };
    },
    computed: {
      reviewId() {
        return this.$route.params.id;
      },
      userId() {
        // 從使用者狀態或路由參數獲取使用者ID
        // 這裡假設使用者ID通過查詢參數傳遞
        return this.$route.query.userId || 1;
      }
    },
    mounted() {
      this.fetchReview();
      this.imageModal = new Modal(document.getElementById('imageModal'));
    },
    methods: {
      async fetchReview() {
        this.loading = true;
        this.error = null;
        
        try {
          const response = await axios.get(`/api/reviews/${this.reviewId}`, {
            params: { userId: this.userId }
          });
          
          this.review = response.data;
        } catch (error) {
          console.error('獲取評價失敗:', error);
          this.error = error.response?.data?.message || '獲取評價失敗，請稍後再試';
        } finally {
          this.loading = false;
        }
      },
      
      formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
      },
      
      async likeReview() {
        try {
          await axios.post(`/api/reviews/${this.reviewId}/like`, null, {
            params: { userId: this.userId }
          });
          
          // 重新加載評價以更新點讚狀態
          this.fetchReview();
        } catch (error) {
          console.error('點讚失敗:', error);
          Swal.fire({
            title: '錯誤',
            text: '點讚操作失敗',
            icon: 'error',
            confirmButtonText: '關閉'
          });
        }
      },
      
      handleReportSubmitted() {
        this.showReportForm = false;
      },
      
      openImageModal(imageUrl) {
        this.selectedImage = imageUrl;
        this.imageModal.show();
      },
      
      goBack() {
        this.$router.back();
      }
    }
  };
  </script>
  
  <style scoped>
  .emoji-icon {
    font-size: 24px;
  }
  
  .star-rating i {
    font-size: 1.2rem;
  }
  
  .image-container {
    position: relative;
    cursor: pointer;
    overflow: hidden;
  }
  
  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .image-overlay i {
    color: white;
    font-size: 2rem;
  }
  
  .image-container:hover .image-overlay {
    opacity: 1;
  }
  </style>