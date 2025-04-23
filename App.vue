<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';
import ReviewList from './components/ReviewList.vue';
import ReviewForm from './components/ReviewForm.vue';

const campSiteId = ref(1);
const connectionStatus = ref('');
const showReviewForm = ref(false);
const reviewListRef = ref(null);

// 搜尋和排序相關
const searchKeyword = ref('');
const searchParams = reactive({
  keyword: '',
  sortBy: 'overallRating', // 預設排序欄位
  sortDirection: 'DESC', // 預設由高至低排序
  ratingFilters: {
    overallRating: 0,     // 0表示不篩選
    cleanlinessRating: 0,
    convenienceRating: 0,
    friendlinessRating: 0
  }
});

// 更新臨時關鍵字
const updateKeyword = (e) => {
  searchKeyword.value = e.target.value;
};

// 處理排序欄位變更
const handleSortFieldChange = (field) => {
  searchParams.sortBy = field;
};

// 處理排序方向變更
const handleSortDirectionChange = (direction) => {
  searchParams.sortDirection = direction;
};

// 處理星星數篩選變更
const handleRatingFilterChange = (field, rating) => {
  // 如果點擊當前選中的星星數，則清除篩選
  if (searchParams.ratingFilters[field] === rating) {
    searchParams.ratingFilters[field] = 0;
  } else {
    searchParams.ratingFilters[field] = rating;
  }
};

// 執行搜尋
const executeSearch = () => {
  searchParams.keyword = searchKeyword.value;
  if (reviewListRef.value) {
    reviewListRef.value.refreshReviews();
  }
};

// 清除所有篩選
const clearAllFilters = () => {
  searchKeyword.value = '';
  searchParams.keyword = '';
  searchParams.ratingFilters = {
    overallRating: 0,
    cleanlinessRating: 0,
    convenienceRating: 0,
    friendlinessRating: 0
  };
  
  // 重新搜索以反映清除的篩選
  if (reviewListRef.value) {
    reviewListRef.value.refreshReviews();
  }
};

// 簡單的測試連接函數
const testBackendConnection = async () => {
  connectionStatus.value = '測試中...';
  
  try {
    // 發送一個簡單的 GET 請求到後端
    const response = await axios.get('http://localhost:8080/api/reviews', {
      params: { page: 0, size: 1 }
    });
    
    // 檢查回應狀態
    if (response.status === 200) {
      connectionStatus.value = '✅ 連接成功！';
    } else {
      connectionStatus.value = '❌ 連接失敗！狀態碼: ' + response.status;
    }
  } catch (error) {
    connectionStatus.value = '❌ 連接失敗！錯誤: ' + error.message;
  }
};

// 處理評價創建成功
const handleReviewCreated = () => {
  // 隱藏表單
  showReviewForm.value = false;
  
  // 刷新評價列表
  if (reviewListRef.value) {
    reviewListRef.value.refreshReviews();
  }
};
</script>

<template>
  <header>
    <div class="wrapper">
      <h1>營地評價系統</h1>
      
      <!-- 簡單的測試連接按鈕 -->
      <div class="test-connection">
        <button @click="testBackendConnection">測試後端連接</button>
        <span v-if="connectionStatus" 
              :class="{ 'success': connectionStatus.includes('成功'), 'error': connectionStatus.includes('失敗') }">
          {{ connectionStatus }}
        </span>
      </div>
    </div>
  </header>

  <main>
    <div class="app-layout">
      <!-- 左側篩選面板 -->
      <aside class="filter-sidebar">
        <!-- 搜尋框 -->
        <div class="search-box">
          <h3>關鍵字搜尋</h3>
          <div class="input-group">
            <input 
              type="text" 
              :value="searchKeyword"
              @input="updateKeyword"
              placeholder="請輸入關鍵字..."
            />
          </div>
        </div>
        
        <!-- 評分篩選卡片 -->
        <div class="filter-section">
          <h3>依評分篩選</h3>
          <div class="rating-filters">
            <!-- 總體評分篩選 -->
            <div class="filter-group">
              <label>總體評分至少:</label>
              <div class="star-buttons">
                <button 
                  v-for="rating in 5" 
                  :key="`overall-${rating}`"
                  :class="['star-button', { 'active': searchParams.ratingFilters.overallRating === rating }]"
                  @click="handleRatingFilterChange('overallRating', rating)"
                >
                  {{ rating }}★
                </button>
              </div>
            </div>
            
            <!-- 清潔度評分篩選 -->
            <div class="filter-group">
              <label>清潔度至少:</label>
              <div class="star-buttons">
                <button 
                  v-for="rating in 5" 
                  :key="`cleanliness-${rating}`"
                  :class="['star-button', { 'active': searchParams.ratingFilters.cleanlinessRating === rating }]"
                  @click="handleRatingFilterChange('cleanlinessRating', rating)"
                >
                  {{ rating }}★
                </button>
              </div>
            </div>
            
            <!-- 便利性評分篩選 -->
            <div class="filter-group">
              <label>便利性至少:</label>
              <div class="star-buttons">
                <button 
                  v-for="rating in 5" 
                  :key="`convenience-${rating}`"
                  :class="['star-button', { 'active': searchParams.ratingFilters.convenienceRating === rating }]"
                  @click="handleRatingFilterChange('convenienceRating', rating)"
                >
                  {{ rating }}★
                </button>
              </div>
            </div>
            
            <!-- 友善度評分篩選 -->
            <div class="filter-group">
              <label>友善度至少:</label>
              <div class="star-buttons">
                <button 
                  v-for="rating in 5" 
                  :key="`friendliness-${rating}`"
                  :class="['star-button', { 'active': searchParams.ratingFilters.friendlinessRating === rating }]"
                  @click="handleRatingFilterChange('friendlinessRating', rating)"
                >
                  {{ rating }}★
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 排序設定 -->
        <div class="filter-section">
          <h3>排序設定</h3>
          <div class="sort-options">
            <!-- 排序欄位 -->
            <div class="sort-group">
              <label>排序依據:</label>
              <div class="option-buttons">
                <button 
                  type="button"
                  @click="handleSortFieldChange('overallRating')" 
                  :class="{ 'active': searchParams.sortBy === 'overallRating' }"
                >
                  總體評分
                </button>
                <button 
                  type="button"
                  @click="handleSortFieldChange('cleanlinessRating')" 
                  :class="{ 'active': searchParams.sortBy === 'cleanlinessRating' }"
                >
                  清潔度
                </button>
                <button 
                  type="button"
                  @click="handleSortFieldChange('convenienceRating')" 
                  :class="{ 'active': searchParams.sortBy === 'convenienceRating' }"
                >
                  便利性
                </button>
                <button 
                  type="button"
                  @click="handleSortFieldChange('friendlinessRating')" 
                  :class="{ 'active': searchParams.sortBy === 'friendlinessRating' }"
                >
                  友善度
                </button>
              </div>
            </div>
            
            <!-- 排序方向 -->
            <div class="sort-group">
              <label>排序方式:</label>
              <div class="option-buttons direction-buttons">
                <button 
                  type="button"
                  @click="handleSortDirectionChange('DESC')" 
                  :class="{ 'active': searchParams.sortDirection === 'DESC' }"
                >
                  由高至低
                </button>
                <button 
                  type="button"
                  @click="handleSortDirectionChange('ASC')" 
                  :class="{ 'active': searchParams.sortDirection === 'ASC' }"
                >
                  由低至高
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按鈕 -->
        <div class="filter-actions">
          <button type="button" class="search-button" @click="executeSearch">執行搜尋</button>
          <button type="button" class="clear-button" @click="clearAllFilters">清除條件</button>
        </div>
      </aside>
      
      <!-- 右側內容區域 -->
      <div class="content-area">
        <!-- 新增評價按鈕 -->
        <div class="add-review-section">
          <button 
            v-if="!showReviewForm" 
            @click="showReviewForm = true"
            class="add-review-btn"
          >
            發表新評價
          </button>
        </div>
        
        <!-- 評價表單 -->
        <ReviewForm 
          v-if="showReviewForm" 
          :campSiteId="campSiteId"
          @reviewCreated="handleReviewCreated"
        />
        
        <!-- 評價列表 -->
        <ReviewList 
          ref="reviewListRef"
          :campSiteId="campSiteId"
          :searchParams="searchParams"
        />
      </div>
    </div>
  </main>
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

/* 應用通用樣式 */
html {
  background-color: var(--background-color);
  color: var(--text-color);
}

header {
  line-height: 1.5;
  background-color: var(--primary-color);
  color: white;
  margin-bottom: 20px;
}

.wrapper {
  text-align: center;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  margin-top: 20px;
  color: white;
}

.test-connection {
  margin: 20px 0;
}

.test-connection button {
  padding: 8px 16px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.test-connection span {
  margin-left: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  display: inline-block;
}

.test-connection .success {
  background-color: #d4edda;
  color: #155724;
}

.test-connection .error {
  background-color: #f8d7da;
  color: #721c24;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 兩欄式佈局 */
.app-layout {
  display: flex;
  gap: 25px;
}

/* 左側篩選面板 */
.filter-sidebar {
  width: 280px;
  flex-shrink: 0;
}

/* 右側內容區域 */
.content-area {
  flex-grow: 1;
  min-width: 0; /* 防止 flex 項目溢出 */
}

/* 搜尋框 */
.search-box {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid var(--border-color);
}

.search-box h3 {
  color: var(--accent-color);
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.input-group {
  position: relative;
}

.input-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

.input-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(127, 176, 105, 0.2);
}

/* 篩選區塊 */
.filter-section {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid var(--border-color);
}

.filter-section h3 {
  color: var(--accent-color);
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.rating-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-group, .sort-group {
  margin-bottom: 12px;
}

.filter-group label, .sort-group label {
  display: block;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 6px;
  font-size: 14px;
}

.star-buttons {
  display: flex;
  gap: 4px;
}

.star-button {
  flex: 1;
  padding: 6px 0;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-color);
  transition: all 0.2s;
  font-size: 14px;
}

.star-button.active {
  background-color: var(--selected-color);
  color: white;
  border-color: var(--selected-color);
}

/* 排序選項 */
.sort-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.direction-buttons {
  grid-template-columns: repeat(2, 1fr);
}

.option-buttons button {
  padding: 6px 10px;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-color);
  transition: all 0.2s;
  font-size: 13px;
  white-space: nowrap;
}

.option-buttons button.active {
  background-color: var(--selected-color);
  color: white;
  border-color: var(--selected-color);
}

/* 操作按鈕 */
.filter-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-button {
  padding: 10px 0;
  width: 100%;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #4a7330;
}

.clear-button {
  padding: 8px 0;
  width: 100%;
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background-color: #e9ecef;
}

/* 新增評價區域 */
.add-review-section {
  margin-bottom: 20px;
  text-align: right;
}

.add-review-btn {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: background-color 0.2s;
}

.add-review-btn:hover {
  background-color: #6c9a5b;
}

/* 響應式設計 */
@media (max-width: 900px) {
  .app-layout {
    flex-direction: column;
  }
  
  .filter-sidebar {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .option-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .option-buttons {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>