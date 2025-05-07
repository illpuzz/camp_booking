<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { reviewService } from '../services/api';
import StarRating from './StarRating.vue';

const props = defineProps({
  campSiteId: {
    type: Number,
    required: true
  },
  searchParams: {
    type: Object,
    default: () => ({
      keyword: '',
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      ratingFilters: {
        overallRating: 0,
        cleanlinessRating: 0,
        convenienceRating: 0,
        friendlinessRating: 0
      }
    })
  }
});

// 狀態變數
const reviews = ref([]);
const loading = ref(false);
const error = ref(null);
const page = ref(0);
const pageSize = ref(10);
const pagination = ref({
  page: 0,
  size: 10,
  totalPages: 0,
  totalElements: 0
});

// 頁面變更處理
const handlePageChange = (newPage) => {
  page.value = newPage;
  loadReviews();
};

// 載入評價列表
const loadReviews = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // 構建搜索參數
    const params = {
      page: page.value,
      size: pageSize.value,
      sortBy: props.searchParams.sortBy,
      sortDirection: props.searchParams.sortDirection
    };
    
    // 添加關鍵字搜索
    if (props.searchParams.keyword) {
      params.keyword = props.searchParams.keyword;
    }
    
    // 添加評分過濾
    const { ratingFilters } = props.searchParams;
    if (ratingFilters.overallRating > 0) {
      params.minRating = ratingFilters.overallRating;
    }
    
    console.log('發送評價請求，參數:', params, '營地ID:', props.campSiteId);
    
    // 直接使用 reviewService.getReviews
    const response = await reviewService.getReviews(
      props.campSiteId, 
      params.page, 
      params.size, 
      params.sortBy, 
      params.sortDirection
    );
    
    console.log('獲取評價成功，數據:', response.data);
    
    // 設置評價列表
    reviews.value = response.data.content;
    
    // 設置分頁信息
    pagination.value = {
      page: response.data.pageable.pageNumber,
      size: response.data.pageable.pageSize,
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements
    };
    
  } catch (err) {
    console.error('加載評價失敗:', err);
    error.value = err.message || '獲取評價失敗';
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 刷新評價列表
const refreshReviews = () => {
  page.value = 0;
  loadReviews();
};

// 暴露 refreshReviews 方法給父組件
defineExpose({ refreshReviews });

// 監聽搜索參數變化
watch(() => props.searchParams, () => {
  refreshReviews();
}, { deep: true, immediate: true });

// 監聽營地ID變化
watch(() => props.campSiteId, () => {
  refreshReviews();
});

// 組件掛載時加載評價
onMounted(() => {
  refreshReviews();
});
</script>

<template>
  <div class="review-list-container">
    <div class="debug-info">
      <p>當前參數: 營地ID {{ campSiteId }}, 頁數 {{ page }}, 每頁 {{ pageSize }} 條</p>
      <p>排序: {{ searchParams.sortBy }} {{ searchParams.sortDirection }}</p>
      <p>關鍵字: {{ searchParams.keyword || '無' }}</p>
    </div>
    
    <!-- 載入中或錯誤提示 -->
    <div v-if="loading" class="loading-message">載入評價中...</div>
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="refreshReviews" class="retry-button">重試</button>
    </div>
    
    <!-- 評價列表 -->
    <div v-else-if="reviews && reviews.length > 0" class="reviews">
      <!-- 評價卡片 -->
      <div v-for="review in reviews" :key="review.id" class="review-card">
        <div class="review-header">
          <div class="user-info">
            <div class="user-name">{{ review.userName || '匿名用戶' }}</div>
            <div class="review-date">{{ formatDate(review.createdAt) }}</div>
          </div>
          <div class="rating-summary">
            <span class="overall-rating">{{ review.overallRating }}★</span>
          </div>
        </div>
        
        <div class="review-body">
          <p class="review-text">{{ review.reviewText }}</p>
          
          <div class="detailed-ratings">
            <div class="rating-item">
              <span class="rating-label">清潔度:</span>
              <StarRating :rating="review.cleanlinessRating" :readonly="true" />
            </div>
            <div class="rating-item">
              <span class="rating-label">便利性:</span>
              <StarRating :rating="review.convenienceRating" :readonly="true" />
            </div>
            <div class="rating-item">
              <span class="rating-label">友善度:</span>
              <StarRating :rating="review.friendlinessRating" :readonly="true" />
            </div>
          </div>
          
          <div class="pros-cons">
            <div v-if="review.pros" class="pros">
              <h4>優點:</h4>
              <p>{{ review.pros }}</p>
            </div>
            <div v-if="review.cons" class="cons">
              <h4>缺點:</h4>
              <p>{{ review.cons }}</p>
            </div>
          </div>
        </div>
        
        <div class="review-footer">
          <div class="likes">
            <button class="like-button" :class="{ 'liked': review.userLikeStatus === 1 }">
              {{ review.likeCount || 0 }} 讚
            </button>
          </div>
        </div>
        
        <!-- 管理員回覆 -->
        <div v-if="review.replyText" class="admin-reply">
          <h4>管理員回覆:</h4>
          <p>{{ review.replyText }}</p>
          <div class="reply-time" v-if="review.replyTime">
            {{ formatDate(review.replyTime) }}
          </div>
        </div>
      </div>
      
      <!-- 分頁 -->
      <div v-if="pagination.totalPages > 1" class="pagination">
        <button 
          :disabled="pagination.page === 0"
          @click="handlePageChange(pagination.page - 1)"
          class="page-button prev"
        >
          上一頁
        </button>
        
        <span class="page-info">
          第 {{ pagination.page + 1 }} 頁，共 {{ pagination.totalPages }} 頁
        </span>
        
        <button 
          :disabled="pagination.page >= pagination.totalPages - 1"
          @click="handlePageChange(pagination.page + 1)"
          class="page-button next"
        >
          下一頁
        </button>
      </div>
    </div>
    
    <!-- 無評價提示 -->
    <div v-else class="no-reviews">
      <p>尚無評價，成為第一個評價此營地的人吧！</p>
    </div>
  </div>
</template>

<style scoped>
.review-list-container {
  width: 100%;
}

.debug-info {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
  font-size: 12px;
  color: #666;
}

.debug-info p {
  margin: 5px 0;
}

.loading-message, .error-message, .no-reviews {
  text-align: center;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.error-message {
  color: #721c24;
  background-color: #f8d7da;
}

.retry-button {
  margin-top: 10px;
  padding: 6px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reviews {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  padding: 20px;
  transition: transform 0.2s;
}

.review-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: bold;
  font-size: 16px;
  color: var(--text-color);
}

.review-date {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.overall-rating {
  font-size: 20px;
  font-weight: bold;
  color: #ff9800;
}

.review-body {
  margin-bottom: 15px;
}

.review-text {
  margin-bottom: 15px;
  line-height: 1.6;
}

.detailed-ratings {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.rating-item {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.rating-label {
  margin-right: 8px;
  font-weight: 500;
}

.pros-cons {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
}

.pros, .cons {
  flex: 1;
  min-width: 200px;
}

.pros h4, .cons h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 14px;
}

.pros h4 {
  color: #28a745;
}

.cons h4 {
  color: #dc3545;
}

.pros p, .cons p {
  margin: 0;
  font-size: 14px;
}

.review-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

.like-button {
  background: none;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.like-button:hover, .like-button.liked {
  background-color: #f8f9fa;
  border-color: #aaa;
}

.like-button.liked {
  color: #dc3545;
}

.admin-reply {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid var(--primary-color);
}

.admin-reply h4 {
  margin-top: 0;
  margin-bottom: 8px;
  color: var(--primary-color);
  font-size: 14px;
}

.admin-reply p {
  margin: 0;
  font-size: 14px;
}

.reply-time {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  text-align: right;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.page-button {
  padding: 6px 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.page-button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.page-info {
  margin: 0 15px;
  font-size: 14px;
}

@media (max-width: 600px) {
  .pros-cons {
    flex-direction: column;
  }
  
  .detailed-ratings {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .rating-item {
    margin-bottom: 5px;
  }
}
</style>