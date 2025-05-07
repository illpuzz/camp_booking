<!-- components/reviews/ReviewsList.vue - 主要評價列表組件 -->
<template>
  <div class="reviews-list-container" ref="reviewsContainer">
    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-state text-center">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="mt-3 text-forest">正在載入評價，請稍候...</p>
    </div>
    
    <!-- 錯誤訊息 -->
    <div v-else-if="error" class="error-state">
      <div class="alert alert-danger d-flex align-items-center">
        <i class="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
        <div>
          <h5>載入評價時發生錯誤</h5>
          <p>{{ error }}</p>
          <button class="btn btn-outline-danger" @click="fetchReviews">
            <i class="bi bi-arrow-clockwise me-1"></i>
            重新嘗試
          </button>
        </div>
      </div>
    </div>
    
    <!-- 無評價時顯示 -->
    <div v-else-if="filteredReviews.length === 0" class="empty-state text-center">
      <i class="bi bi-chat-square-text empty-icon"></i>
      <h3 class="text-forest">目前尚無符合條件的評價</h3>
      <p class="text-forest-medium">請嘗試調整篩選條件或成為第一個評價此營地的用戶！</p>
    </div>
    
    <!-- 評價列表 -->
    <div v-else class="reviews-list">
      <h2 class="section-title mb-4">
        <i class="bi bi-star-fill me-2 text-warning"></i>
        營地評價
        <span class="review-count">({{ totalReviews }})</span>
      </h2>
      
      <div class="review-items">
        <ReviewItem 
          v-for="review in paginatedReviews" 
          :key="review.id"
          :review="review"
          :currentUser="currentUser"
          @toggle-like="handleToggleLike"
          @delete-review="handleDeleteReview"
          @edit-review="handleEditReview"
          @reply-review="handleReplyReview"
          @edit-reply="handleEditReply"
          @delete-reply="handleDeleteReply"
          @report-review="handleReportReview"
          @report-reply="handleReportReply"
        />
      </div>
      
      <!-- 分頁控制 (只有當有多頁時才顯示) -->
      <div v-if="totalPages > 1" class="pagination-container">
        <nav aria-label="評價分頁">
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 0 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                <i class="bi bi-chevron-left"></i>
              </a>
            </li>
            
            <li 
              v-for="page in displayedPages" 
              :key="page" 
              class="page-item" 
              :class="{ active: currentPage === page }"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">
                {{ page + 1 }}
              </a>
            </li>
            
            <li class="page-item" :class="{ disabled: currentPage >= totalPages - 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                <i class="bi bi-chevron-right"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    
    <!-- 引入各種功能模態框組件 -->
    <ReviewReplyModal 
      ref="replyModal"
      :review="selectedReplyReview"
      @replied="onReplySuccess"
    />
    
    <ReplyEditModal
      ref="editReplyModal"
      :review="selectedEditReply"
      @edited="onReplyEditSuccess"
    />
    
    <ReviewEditModal
      ref="editReviewModal"
      :review="selectedReview"
      :campSiteId="campSiteId"
      @edited="onReviewEditSuccess"
    />
    
    <ReportModal
      ref="reportReviewModal"
      :review="selectedReportReview"
      target-type="review"
      :userId="currentUser.id"
      @reported="onReportSuccess"
    />
    
    <ReportModal
      ref="reportReplyModal"
      :review="selectedReportReview"
      target-type="reply"
      :userId="currentUser.id"
      @reported="onReportSuccess"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

// 引入組件 - 修正引用路徑
import ReviewItem from './ReviewItem.vue';
import ReviewReplyModal from '../modals/ReviewReplyModal.vue';
import ReplyEditModal from '../modals/ReplyEditModal.vue';
import ReviewEditModal from '../modals/ReviewEditModal.vue';
import ReportModal from '../modals/ReportModal.vue';

export default {
  name: 'ReviewsList',
  components: {
    ReviewItem,
    ReviewReplyModal,
    ReplyEditModal,
    ReviewEditModal,
    ReportModal
  },
  props: {
    campSiteId: {
      type: [Number, String],
      required: true
    },
    filters: {
      type: Object,
      default: () => ({
        keyword: '',
        minRating: 0,
        sortBy: 'createdAt',
        direction: 'DESC'
      })
    },
    currentUser: {
      type: Object,
      required: true
    }
  },
  emits: ['handle-report', 'total-updated', 'toggle-like'],
  setup(props, { emit }) {
    // 評價列表容器的引用
    const reviewsContainer = ref(null);
    
    // 評價列表相關狀態
    const reviews = ref([]);
    const loading = ref(true);
    const error = ref('');
    
    // 保存 API 返回的總數
    const rawTotalElements = ref(0);
    
    // 分頁相關狀態
    const currentPage = ref(0);
    const pageSize = ref(5);
    
    // 模態框組件引用
    const replyModal = ref(null);
    const editReplyModal = ref(null);
    const editReviewModal = ref(null);
    const reportReviewModal = ref(null);
    const reportReplyModal = ref(null);
    
    // 儲存選中的物件
    const selectedReview = ref(null);
    const selectedReplyReview = ref(null);
    const selectedEditReply = ref(null);
    const selectedReportReview = ref(null);
    
    // 篩選後的評論列表
    const filteredReviews = computed(() => {
      if (!reviews.value || reviews.value.length === 0) return [];
      
      let result = [...reviews.value];
      
      // 應用關鍵字篩選
      if (props.filters.keyword && props.filters.keyword.trim() !== '') {
        const keyword = props.filters.keyword.trim().toLowerCase();
        result = result.filter(review => {
          return (
            (review.reviewText && review.reviewText.toLowerCase().includes(keyword)) ||
            (review.pros && review.pros.toLowerCase().includes(keyword)) ||
            (review.cons && review.cons.toLowerCase().includes(keyword)) ||
            (review.replyText && review.replyText.toLowerCase().includes(keyword))
          );
        });
      }
      
      // 應用最低評分篩選
      if (props.filters.minRating && parseInt(props.filters.minRating) > 0) {
        const minRating = parseInt(props.filters.minRating);
        result = result.filter(review => review.overallRating >= minRating);
      }
      
      // 應用排序
      const sortBy = props.filters.sortBy || 'createdAt';
      const direction = props.filters.direction || 'DESC';
      
      result.sort((a, b) => {
        let valA, valB;
        
        // 提取要比較的值
        if (sortBy === 'createdAt') {
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
        } else if (sortBy === 'overallRating') {
          valA = a.overallRating;
          valB = b.overallRating;
        } else if (sortBy === 'likeCount') {
          valA = a.likeCount || 0;
          valB = b.likeCount || 0;
        } else {
          valA = a[sortBy];
          valB = b[sortBy];
        }
        
        // 排序方向
        if (direction === 'ASC') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
      
      return result;
    });
    
    // 當前頁的評論
    const paginatedReviews = computed(() => {
      const start = currentPage.value * pageSize.value;
      const end = start + pageSize.value;
      return filteredReviews.value.slice(start, end);
    });
    
    // 計算總頁數
    const totalPages = computed(() => {
      if (!filteredReviews.value.length) return 1;
      return Math.ceil(filteredReviews.value.length / pageSize.value);
    });
    
    // 評價總數 - 篩選條件下顯示過濾後的數量，無篩選時顯示總數
    const totalReviews = computed(() => {
      // 如果沒有篩選條件，顯示原始總數
      if (!props.filters.keyword && 
          (!props.filters.minRating || parseInt(props.filters.minRating) <= 0) &&
          props.filters.sortBy === 'createdAt' && props.filters.direction === 'DESC') {
        return rawTotalElements.value;
      }
      
      // 有篩選條件時，顯示過濾後的數量
      return filteredReviews.value.length;
    });
    
    // 計算應該顯示的頁碼
    const displayedPages = computed(() => {
      const pages = [];
      const maxDisplay = 5;
      
      if (totalPages.value <= maxDisplay) {
        for (let i = 0; i < totalPages.value; i++) {
          pages.push(i);
        }
      } else {
        let start, end;
        
        if (currentPage.value < Math.floor(maxDisplay / 2)) {
          start = 0;
          end = maxDisplay - 1;
        } else if (currentPage.value >= totalPages.value - Math.floor(maxDisplay / 2)) {
          start = totalPages.value - maxDisplay;
          end = totalPages.value - 1;
        } else {
          start = currentPage.value - Math.floor(maxDisplay / 2);
          end = currentPage.value + Math.floor(maxDisplay / 2);
        }
        
        for (let i = Math.max(0, start); i <= Math.min(end, totalPages.value - 1); i++) {
          pages.push(i);
        }
      }
      
      return pages;
    });
    
    // 監聽篩選變化
    watch(() => props.filters, () => {
      currentPage.value = 0; // 重置為第一頁
      
      // 通知父組件總數變化
      emit('total-updated', totalReviews.value);
      
      // 當篩選條件變化時，滾動到頂部
      scrollToTop();
    }, { deep: true });
    
    // 滾動到頂部的方法
    const scrollToTop = () => {
      // 方法一：使用 ref 引用的元素滾動到頂部
      if (reviewsContainer.value) {
        reviewsContainer.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // 方法二：作為備用，使用 window 滾動到頂部
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };
    
    // 載入評價列表
    const fetchReviews = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const params = {
          campSiteId: props.campSiteId,
          userId: props.currentUser.id,
          includeReported: true,  // 確保包含被檢舉的評論
          includeImages: true,    // 添加此參數，確保獲取圖片ID信息
          size: 100  // 設置一個較大的值，確保獲取所有評價
        };
        
        console.log('開始獲取評價列表，參數:', params);
        
        const response = await axios.get('/api/reviews', { params });
        console.log('API 返回數據:', response.data);
        
        if (response.data && response.data.content) {
          // 後端分頁格式
          reviews.value = response.data.content;
          rawTotalElements.value = response.data.totalElements || reviews.value.length;
        } else {
          // 簡單數組格式
          reviews.value = Array.isArray(response.data) ? response.data : [];
          rawTotalElements.value = reviews.value.length;
        }
        
        console.log(`成功載入 ${reviews.value.length} 個評價，總數: ${rawTotalElements.value}`);
        
        // 通知父組件更新總數
        emit('total-updated', totalReviews.value);
      } catch (err) {
        console.error('獲取評價失敗:', err);
        error.value = err.response?.data?.message || '載入評價時發生錯誤，請稍後再試';
      } finally {
        loading.value = false;
      }
    };
    
    // 處理點讚/取消點讚
    const handleToggleLike = async (reviewId) => {
      try {
        console.log(`嘗試切換評價 ${reviewId} 的點讚狀態，用戶 ID: ${props.currentUser.id}`);
        
        // 調用後端 API
        const response = await axios.post(`/api/reviews/${reviewId}/like`, null, {
          params: { userId: props.currentUser.id }
        });
        
        console.log('點讚 API 回應:', response.data);
        
        // API 調用成功後，更新本地評價數據
        const updatedReviews = reviews.value.map(review => {
          if (review.id === reviewId) {
            // 切換點讚狀態
            const newLikeStatus = review.userLikeStatus === 1 ? 0 : 1;
            
            // 更新點讚計數
            let newLikeCount = review.likeCount || 0;
            if (newLikeStatus === 1) {
              newLikeCount += 1;
            } else {
              newLikeCount = Math.max(0, newLikeCount - 1);
            }
            
            console.log(`更新評價 ${reviewId} 的點讚狀態: ${review.userLikeStatus} -> ${newLikeStatus}, 點讚數: ${review.likeCount} -> ${newLikeCount}`);
            
            return {
              ...review,
              userLikeStatus: newLikeStatus,
              likeCount: newLikeCount
            };
          }
          return review;
        });
        
        reviews.value = updatedReviews;
      } catch (error) {
        console.error('點讚/取消點讚失敗:', error);
        alert('點讚操作失敗，請稍後再試');
      }
    };
    
    // 處理刪除評價
    const handleDeleteReview = async (reviewId) => {
      try {
        // 顯示確認對話框
        if (!confirm('確定要刪除這個評價嗎？此操作無法撤銷。')) {
          return; // 用戶取消刪除
        }
        
        console.log(`嘗試刪除評價 ${reviewId}，用戶 ID: ${props.currentUser.id}`);
        
        // 調用後端 API 刪除評價
        const response = await axios.delete(`/api/reviews/${reviewId}`, {
          params: { userId: props.currentUser.id }
        });
        
        console.log('刪除評價 API 回應:', response.data);
        
        if (response.data && response.data.deleted) {
          // 從本地評價列表中移除已刪除的評價
          reviews.value = reviews.value.filter(review => review.id !== reviewId);
          
          // 更新 rawTotalElements 以反映評價總數的變化
          rawTotalElements.value = Math.max(0, rawTotalElements.value - 1);
          
          // 通知父組件更新總數
          emit('total-updated', totalReviews.value);
          
          // 顯示成功訊息
          alert('評價已成功刪除');
          
          // 保存當前視圖狀態到 localStorage
          localStorage.setItem('currentView', 'reviews');
        }
      } catch (error) {
        console.error('刪除評價失敗:', error);
        
        if (error.response && error.response.status === 403) {
          alert('您沒有權限刪除此評價');
        } else {
          alert('刪除評價失敗，請稍後再試');
        }
      }
    };
    
    // 處理編輯評價
    const handleEditReview = (review) => {
      console.log('準備編輯評價:', review.id);
      selectedReview.value = review;
      editReviewModal.value.show(review);
    };
    
    // 處理回覆評價
    const handleReplyReview = (review) => {
      console.log('準備回覆評價:', review.id);
      selectedReplyReview.value = review;
      replyModal.value.show();
    };
    
    // 處理編輯回覆
    const handleEditReply = (review) => {
      console.log('準備編輯回覆:', review.id);
      selectedEditReply.value = review;
      editReplyModal.value.show();
    };
    
    // 處理刪除回覆 - 修復版本
    const handleDeleteReply = async (reviewId) => {
      // 顯示確認對話框
      if (!confirm('確定要刪除這個回覆嗎？此操作無法撤銷。')) {
        return; // 用戶取消刪除
      }
      
      try {
        console.log(`嘗試刪除評價 ${reviewId} 的回覆`);
        
        // 調用後端 API 刪除回覆 - 不傳遞 userId 參數
        const response = await axios.delete(`/api/reviews/${reviewId}/reply`);
        
        console.log('刪除回覆 API 回應:', response.data);
        
        if (response.data && (response.data.success || response.data.deleted)) {
          // 顯示成功訊息
          alert('回覆已成功刪除');
          
          // 重新載入評價列表
          fetchReviews();
          
          // 保存當前視圖狀態到 localStorage
          localStorage.setItem('currentView', 'reviews');
        } else {
          alert('刪除失敗: ' + (response.data?.message || '未知錯誤'));
        }
      } catch (error) {
        console.error('刪除回覆失敗:', error);
        
        if (error.response && error.response.status === 403) {
          alert('您沒有權限刪除此回覆');
        } else {
          alert('刪除回覆失敗: ' + (error.response?.data?.message || error.message || '請稍後再試'));
        }
      }
    };
    
    // 處理檢舉評價
    const handleReportReview = (review) => {
      console.log('準備檢舉評價:', review.id);
      selectedReportReview.value = review;
      reportReviewModal.value.show();
    };
    
    // 處理檢舉回覆
    const handleReportReply = (review) => {
      console.log('準備檢舉回覆:', review.id);
      selectedReportReview.value = review;
      reportReplyModal.value.show();
    };
    
    // 分頁處理
    const changePage = (page) => {
      if (page >= 0 && page < totalPages.value) {
        currentPage.value = page;
        
        // 分頁切換時滾動到頂部
        scrollToTop();
      }
    };
    
    // 回覆成功的回調
    const onReplySuccess = () => {
      fetchReviews();
      // 保存當前視圖狀態到 localStorage
      localStorage.setItem('currentView', 'reviews');
    };
    
    // 編輯回覆成功的回調
    const onReplyEditSuccess = () => {
      fetchReviews();
      // 保存當前視圖狀態到 localStorage
      localStorage.setItem('currentView', 'reviews');
    };
    
    // 編輯評價成功的回調
    const onReviewEditSuccess = () => {
      fetchReviews();
      // 保存當前視圖狀態到 localStorage
      localStorage.setItem('currentView', 'reviews');
    };
    
    // 檢舉成功的回調
    const onReportSuccess = () => {
      fetchReviews();
      // 保存當前視圖狀態到 localStorage
      localStorage.setItem('currentView', 'reviews');
    };
    
    // 初始化
    onMounted(() => {
      fetchReviews();
    });
    
    return {
      reviewsContainer,
      reviews,
      loading,
      error,
      currentPage,
      filteredReviews,
      paginatedReviews,
      totalPages,
      displayedPages,
      totalReviews,
      selectedReview,
      selectedReplyReview,
      selectedEditReply,
      selectedReportReview,
      fetchReviews,
      changePage,
      scrollToTop,
      handleToggleLike,
      handleDeleteReview,
      handleEditReview,
      handleReplyReview,
      handleEditReply,
      handleDeleteReply,
      handleReportReview,
      handleReportReply,
      onReplySuccess,
      onReplyEditSuccess,
      onReviewEditSuccess,
      onReportSuccess,
      // 模態框引用
      replyModal,
      editReplyModal,
      editReviewModal,
      reportReviewModal,
      reportReplyModal
    };
  }
};
</script>

<style scoped>
.reviews-list-container {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  scroll-margin-top: 20px; /* 確保滾動到頂部時有一些邊距 */
}

.loading-state {
  padding: 40px 0;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  color: var(--forest-medium);
}

.empty-state {
  padding: 40px 0;
}

.empty-icon {
  font-size: 3rem;
  color: var(--forest-light);
  opacity: 0.7;
  margin-bottom: 15px;
  display: block;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--forest-dark);
  position: relative;
  padding-bottom: 10px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background-color: var(--forest-medium);
  border-radius: 2px;
}

.review-count {
  font-size: 1rem;
  font-weight: 400;
  color: var(--forest-medium);
  margin-left: 5px;
}

.review-items {
  margin-top: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 25px;
}

.pagination {
  --bs-pagination-active-bg: var(--forest-medium);
  --bs-pagination-active-border-color: var(--forest-medium);
}

/* 響應式調整 */
@media (max-width: 768px) {
  .reviews-list-container {
    padding: 15px;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .pagination .page-link {
    padding: 0.375rem 0.5rem;
  }
}
</style>