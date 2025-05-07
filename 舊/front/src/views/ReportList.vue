<!-- src/components/ReviewList.vue -->
<template>
    <div class="review-list-container">
      <!-- 標題區域 -->
      <div class="header-section text-center mb-4">
        <h2 class="fw-bold text-success">露營地評價</h2>
      </div>
  
      <!-- 評價列表 -->
      <div class="reviews" v-if="reviews.length > 0">
        <review-item 
          v-for="review in reviews" 
          :key="review.id" 
          :review="review"
          @like="handleLike"
          @report="handleReport"
        />
      </div>
      
      <!-- 無評價顯示 -->
      <div v-else class="no-reviews p-5 text-center">
        <p class="fs-5 text-muted">目前還沒有評價。</p>
      </div>
  
      <!-- 分頁控制 -->
      <div class="pagination-controls d-flex justify-content-center mt-4" v-if="totalPages > 1">
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
          :active-class="'active'"
        />
      </div>
  
      <!-- 檢舉對話框 -->
      <div class="modal fade" id="reportModal" tabindex="-1" aria-labelledby="reportModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="reportModalLabel">檢舉評價</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitReport">
                <div class="mb-3">
                  <label for="reportReason" class="form-label">檢舉原因</label>
                  <select class="form-select" id="reportReason" v-model="reportData.reportType" required>
                    <option value="" disabled>請選擇檢舉原因</option>
                    <option value="1">含有不適當內容</option>
                    <option value="2">含有虛假資訊</option>
                    <option value="3">含有廣告/垃圾訊息</option>
                    <option value="4">其他原因</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="reportDescription" class="form-label">詳細說明</label>
                  <textarea class="form-control" id="reportDescription" rows="4" v-model="reportData.reason" required></textarea>
                </div>
                <div class="d-flex justify-content-end">
                  <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">取消</button>
                  <button type="submit" class="btn btn-danger">提交檢舉</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import ReviewItem from './ReviewItem.vue';
  import Paginate from 'vuejs-paginate-next';
  import Swal from 'sweetalert2';
  import axios from 'axios';
  import { Modal } from 'bootstrap';
  
  export default {
    name: 'ReviewList',
    components: {
      ReviewItem,
      Paginate
    },
    data() {
      return {
        reviews: [],
        currentPage: 1,
        totalPages: 0,
        pageSize: 5,
        reportData: {
          reviewId: null,
          userId: null, // 需要從使用者狀態或參數獲取
          reportType: '',
          reason: ''
        },
        reportModal: null
      };
    },
    props: {
      campId: {
        type: [Number, String],
        required: true
      },
      userId: {
        type: [Number, String],
        default: null
      }
    },
    created() {
      this.loadReviews();
    },
    mounted() {
      this.reportModal = new Modal(document.getElementById('reportModal'));
    },
    methods: {
      async loadReviews() {
        try {
          const response = await axios.get(`/api/reviews/campsite/${this.campId}`, {
            params: {
              userId: this.userId,
              page: this.currentPage - 1, // API使用0為基礎的頁碼
              size: this.pageSize
            }
          });
          
          this.reviews = response.data.content;
          this.totalPages = response.data.totalPages;
        } catch (error) {
          console.error('無法載入評價:', error);
          Swal.fire({
            title: '錯誤',
            text: '載入評價時發生錯誤',
            icon: 'error',
            confirmButtonText: '關閉'
          });
        }
      },
      
      handlePageChange(pageNum) {
        this.currentPage = pageNum;
        this.loadReviews();
      },
      
      async handleLike(reviewId) {
        if (!this.userId) {
          Swal.fire({
            title: '請先登入',
            text: '您需要登入後才能點讚評價',
            icon: 'info',
            confirmButtonText: '確定'
          });
          return;
        }
        
        try {
          await axios.post(`/api/reviews/${reviewId}/like`, null, {
            params: { userId: this.userId }
          });
          
          // 更新評價列表
          this.loadReviews();
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
      
      handleReport(reviewId) {
        if (!this.userId) {
          Swal.fire({
            title: '請先登入',
            text: '您需要登入後才能檢舉評價',
            icon: 'info',
            confirmButtonText: '確定'
          });
          return;
        }
        
        this.reportData.reviewId = reviewId;
        this.reportData.userId = this.userId;
        this.reportData.reportType = '';
        this.reportData.reason = '';
        
        this.reportModal.show();
      },
      
      async submitReport() {
        try {
          await axios.post('/api/review-reports', this.reportData);
          
          this.reportModal.hide();
          
          Swal.fire({
            title: '成功',
            text: '感謝您的檢舉，我們將進行審核',
            icon: 'success',
            confirmButtonText: '確定'
          });
        } catch (error) {
          console.error('檢舉提交失敗:', error);
          Swal.fire({
            title: '錯誤',
            text: '檢舉提交失敗',
            icon: 'error',
            confirmButtonText: '關閉'
          });
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .review-list-container {
    padding: 20px 0;
  }
  
  .pagination {
    margin-bottom: 0;
  }
  
  .page-link {
    color: #198754; /* Bootstrap success color */
    border-color: #dee2e6;
  }
  
  .page-item.active .page-link {
    background-color: #198754;
    border-color: #198754;
  }
  </style>