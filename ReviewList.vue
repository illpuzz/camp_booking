<script setup>
import { ref, onMounted, watch } from 'vue';
import { reviewApi, reviewImageApi } from '../services/reviewService';

const props = defineProps({
  campSiteId: {
    type: Number,
    required: true
  },
  searchParams: {
    type: Object,
    required: true
  }
});

// 狀態管理
const reviews = ref([]);
const loading = ref(true);
const error = ref(null);
const page = ref(0);
const totalPages = ref(0);
const debugInfo = ref('');

// 圖片燈箱
const selectedImage = ref('');
const showLightbox = ref(false);

const openImage = (url) => {
  selectedImage.value = url;
  showLightbox.value = true;
};

const closeLightbox = () => {
  showLightbox.value = false;
};

// 建立篩選參數
const buildFilterParams = () => {
  const params = {
    page: page.value,
    size: 5,
    sortBy: props.searchParams.sortBy,
    direction: props.searchParams.sortDirection,
    campSiteId: props.campSiteId,
    userId: localStorage.getItem('userId') || '1',
    keyword: props.searchParams.keyword
  };

  // 添加評分篩選
  if (props.searchParams.ratingFilters.overallRating > 0) {
    params.minOverallRating = props.searchParams.ratingFilters.overallRating;
  }
  
  if (props.searchParams.ratingFilters.cleanlinessRating > 0) {
    params.minCleanlinessRating = props.searchParams.ratingFilters.cleanlinessRating;
  }
  
  if (props.searchParams.ratingFilters.convenienceRating > 0) {
    params.minConvenienceRating = props.searchParams.ratingFilters.convenienceRating;
  }
  
  if (props.searchParams.ratingFilters.friendlinessRating > 0) {
    params.minFriendlinessRating = props.searchParams.ratingFilters.friendlinessRating;
  }
  
  return params;
};

// 獲取評價的函數
const fetchReviews = async () => {
  try {
    loading.value = true;
    error.value = null;
    debugInfo.value = '開始獲取評價...';
    
    // 構建請求參數
    const params = buildFilterParams();
    
    debugInfo.value = '發送請求中...';
    console.log('請求參數:', params);
    
    // API請求
    const result = await reviewApi.getReviews(params);
    
    debugInfo.value = '收到響應:' + JSON.stringify(result).substring(0, 100) + '...';
    console.log('完整響應:', result);
    
    // 處理響應
    if (result && typeof result === 'object') {
      if (Array.isArray(result.content)) {
        reviews.value = result.content;
        
        // 為每個評價獲取圖片
        for (const review of reviews.value) {
          try {
            const images = await reviewImageApi.getImagesByReviewId(review.id);
            review.images = images;
          } catch (err) {
            console.error(`獲取評價 ${review.id} 的圖片失敗:`, err);
            review.images = [];
          }
        }
        
        totalPages.value = result.totalPages || 0;
        debugInfo.value = `成功加載 ${result.content.length} 條評價`;
      } else if (Array.isArray(result)) {
        // 可能直接返回陣列
        reviews.value = result;
        
        // 為每個評價獲取圖片
        for (const review of reviews.value) {
          try {
            const images = await reviewImageApi.getImagesByReviewId(review.id);
            review.images = images;
          } catch (err) {
            console.error(`獲取評價 ${review.id} 的圖片失敗:`, err);
            review.images = [];
          }
        }
        
        totalPages.value = 1;
        debugInfo.value = `成功加載 ${result.length} 條評價 (陣列格式)`;
      } else {
        debugInfo.value = '響應格式不符合預期';
        error.value = '數據格式錯誤，請聯繫管理員';
      }
    } else {
      debugInfo.value = '響應為空或無效';
      error.value = '獲取評價失敗，返回數據無效';
    }
  } catch (err) {
    console.error('獲取評價錯誤:', err);
    debugInfo.value = `發生錯誤: ${err.message}`;
    error.value = `獲取評價失敗: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

// 處理點讚
const handleLike = async (reviewId) => {
  try {
    const userId = localStorage.getItem('userId') || '1';
    await reviewApi.toggleLike(reviewId, userId);
    
    // 重新獲取評價以更新點讚狀態
    fetchReviews();
  } catch (err) {
    console.error('點讚失敗:', err);
    alert('點讚失敗，請稍後再試');
  }
};

// 當組件掛載時獲取評價
onMounted(fetchReviews);

// 監聽頁碼變更
watch(() => page.value, fetchReviews);

// 提供刷新方法給父組件
defineExpose({
  refreshReviews: fetchReviews
});
</script>

<template>
  <div class="review-list-container">
    <div class="review-header-section">
      <h2>顧客評價</h2>
      
      <!-- 篩選摘要 -->
      <div v-if="searchParams.keyword || searchParams.ratingFilters.overallRating > 0 || 
                 searchParams.ratingFilters.cleanlinessRating > 0 || 
                 searchParams.ratingFilters.convenienceRating > 0 || 
                 searchParams.ratingFilters.friendlinessRating > 0" 
           class="filter-summary">
        <span class="summary-label">搜尋條件:</span>
        <div class="applied-filters">
          <span v-if="searchParams.keyword" class="filter-tag">
            關鍵字: {{ searchParams.keyword }}
          </span>
          <span v-if="searchParams.ratingFilters.overallRating > 0" class="filter-tag">
            總體評分 ≥ {{ searchParams.ratingFilters.overallRating }}
          </span>
          <span v-if="searchParams.ratingFilters.cleanlinessRating > 0" class="filter-tag">
            清潔度 ≥ {{ searchParams.ratingFilters.cleanlinessRating }}
          </span>
          <span v-if="searchParams.ratingFilters.convenienceRating > 0" class="filter-tag">
            便利性 ≥ {{ searchParams.ratingFilters.convenienceRating }}
          </span>
          <span v-if="searchParams.ratingFilters.friendlinessRating > 0" class="filter-tag">
            友善度 ≥ {{ searchParams.ratingFilters.friendlinessRating }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- DEBUG信息 (開發環境顯示) -->
    <div v-if="debugInfo" class="debug-info">
      調試信息: {{ debugInfo }}
    </div>
    
    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="reviews.length === 0" class="no-reviews">暫無符合條件的評價</div>
    <div v-else class="reviews">
      <!-- 評價列表內容 -->
      <div v-for="review in reviews" :key="review.id" class="review-item">
        <div class="review-header">
          <div class="review-rating">
            <span class="overall-rating">總體評分: {{ review.overallRating }}/5</span>
            <div class="detailed-ratings">
              <span>清潔度: {{ review.cleanlinessRating }}/5</span>
              <span>便利性: {{ review.convenienceRating }}/5</span>
              <span>友善度: {{ review.friendlinessRating }}/5</span>
            </div>
          </div>
        </div>
        
        <div class="review-content">
          <p>{{ review.reviewText }}</p>
          
          <div class="review-details">
            <div v-if="review.pros" class="pros">優點: {{ review.pros }}</div>
            <div v-if="review.cons" class="cons">缺點: {{ review.cons }}</div>
          </div>
          
          <!-- 添加評價圖片顯示 -->
          <div v-if="review.images && review.images.length > 0" class="review-images">
            <h4>圖片集:</h4>
            <div class="images-container">
              <div v-for="(image, index) in review.images" :key="index" class="image-item">
                <img :src="image.imageUrl" :alt="`評價圖片 ${index + 1}`" @click="openImage(image.imageUrl)" />
              </div>
            </div>
          </div>
          
          <!-- 管理員回覆，如果有的話 -->
          <div v-if="review.replyIsVisible && review.replyText" class="admin-reply">
            <h4>管理員回覆:</h4>
            <p>{{ review.replyText }}</p>
          </div>
          
          <!-- 評價動作（點讚、舉報） -->
          <div class="review-actions">
            <button 
              :class="['like-button', { 'liked': review.userLikeStatus === 1 }]"
              @click="handleLike(review.id)"
            >
              {{ review.userLikeStatus === 1 ? '已讚' : '讚' }} ({{ review.likeCount || 0 }})
            </button>
          </div>
        </div>
      </div>
      
      <!-- 分頁控制 -->
      <div v-if="totalPages > 0" class="pagination">
        <button 
          :disabled="page === 0" 
          @click="page--"
        >
          上一頁
        </button>
        <span>第 {{ page + 1 }} 頁，共 {{ totalPages }} 頁</span>
        <button 
          :disabled="page >= totalPages - 1" 
          @click="page++"
        >
          下一頁
        </button>
      </div>
    </div>
    
    <!-- 圖片燈箱 -->
    <div v-if="showLightbox" class="lightbox" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <span class="close-lightbox" @click="closeLightbox">&times;</span>
        <img :src="selectedImage" alt="放大圖片" />
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #7FB069; /* 草綠色主色調 */
  --secondary-color: #9BC995; /* 淺草綠色次要色調 */
  --accent-color: #5C913B; /* 深草綠色強調色 */
  --background-color: #F0F7EE; /* 非常淺草綠色背景 */
  --text-color: #2C5530; /* 深綠色文字 */
  --border-color: #B5D6A7; /* 淺綠色邊框 */
  --selected-color: #2C5530; /* 深綠色選取色 */
}

.review-list-container {
  color: var(--text-color);
}

.review-header-section {
  margin-bottom: 20px;
}

h2 {
  color: var(--accent-color);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 10px;
  margin-bottom: 15px;
  font-size: 20px;
}

/* 篩選摘要樣式 */
.filter-summary {
  background-color: var(--background-color);
  border-radius: 6px;
  padding: 12px;
}

.summary-label {
  font-weight: bold;
  margin-right: 10px;
  font-size: 14px;
}

.applied-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.filter-tag {
  background-color: var(--selected-color);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.review-item {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.review-header {
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}

.overall-rating {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--primary-color);
}

.detailed-ratings {
  display: flex;
  gap: 15px;
  margin-top: 5px;
  font-size: 0.9rem;
  color: var(--text-color);
}

.review-content p {
  margin: 10px 0;
  line-height: 1.5;
}

.review-details {
  margin: 10px 0;
  font-size: 0.9rem;
}

.pros {
  color: var(--accent-color);
  margin-bottom: 5px;
}

.cons {
  color: #dc3545;
}

/* 評價圖片樣式 */
.review-images {
  margin: 15px 0;
}

.review-images h4 {
  color: var(--accent-color);
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.images-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
}

.image-item {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  cursor: pointer;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.image-item img:hover {
  transform: scale(1.05);
}

/* 圖片燈箱 */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.close-lightbox {
  position: absolute;
  top: -40px;
  right: 0;
  color: white;
  font-size: 30px;
  cursor: pointer;
}

.admin-reply {
  background-color: var(--background-color);
  border-left: 3px solid var(--primary-color);
  padding: 10px;
  margin: 10px 0;
}

.admin-reply h4 {
  margin: 0 0 5px 0;
  color: var(--primary-color);
  font-size: 0.95rem;
}

.review-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.like-button {
  background-color: var(--background-color);
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-color);
}

.like-button.liked {
  background-color: var(--primary-color);
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 5px 10px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading, .error, .no-reviews {
  text-align: center;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.error {
  color: #dc3545;
}

.debug-info {
  background-color: #f0f8ff;
  border: 1px solid #d1e0ff;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 10px;
  font-family: monospace;
  font-size: 12px;
  color: #0066cc;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .detailed-ratings {
    flex-direction: column;
    gap: 5px;
  }
}
</style>