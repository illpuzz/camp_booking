<template>
    <div class="review-list">
      <!-- 評價摘要 -->
      <div class="card mb-4" v-if="showSummary">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="card-title mb-0">評價摘要</h5>
            <div class="overall-rating d-flex align-items-center">
              <div class="stars me-2">
                <i v-for="i in 5" :key="i" :class="getStarClass(i, averageRating)"></i>
              </div>
              <span class="average-rating">{{ averageRating }} / 5</span>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-4 mb-3">
              <small>清潔程度</small>
              <div class="d-flex align-items-center">
                <div class="progress flex-grow-1 me-2">
                  <div class="progress-bar bg-success" 
                       :style="{ width: (averageCleanlinessRating / 5 * 100) + '%' }"></div>
                </div>
                <span>{{ averageCleanlinessRating }}</span>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <small>便利程度</small>
              <div class="d-flex align-items-center">
                <div class="progress flex-grow-1 me-2">
                  <div class="progress-bar bg-success" 
                       :style="{ width: (averageConvenienceRating / 5 * 100) + '%' }"></div>
                </div>
                <span>{{ averageConvenienceRating }}</span>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <small>友善程度</small>
              <div class="d-flex align-items-center">
                <div class="progress flex-grow-1 me-2">
                  <div class="progress-bar bg-success" 
                       :style="{ width: (averageFriendlinessRating / 5 * 100) + '%' }"></div>
                </div>
                <span>{{ averageFriendlinessRating }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 搜尋過濾選項 -->
      <div class="card mb-4" v-if="showFilters">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="搜尋評價內容" 
                  v-model="searchKeyword"
                  @keyup.enter="search"
                >
                <button class="btn btn-success" type="button" @click="search">
                  <i class="bi bi-search"></i> 搜尋
                </button>
              </div>
            </div>
            <div class="col-md-3">
              <select class="form-select" v-model="minRating">
                <option value="">評分 (全部)</option>
                <option value="5">5 星</option>
                <option value="4">4 星或以上</option>
                <option value="3">3 星或以上</option>
                <option value="2">2 星或以上</option>
                <option value="1">1 星或以上</option>
              </select>
            </div>
            <div class="col-md-3">
              <select class="form-select" v-model="sortBy">
                <option value="createdAt">最新評價</option>
                <option value="overallRating">最高評分</option>
                <option value="likeCount">最多讚數</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 載入中狀態 -->
      <div v-if="loading" class="text-center my-5">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">載入中...</span>
        </div>
        <p class="mt-2">評價載入中，請稍候...</p>
      </div>
      
      <!-- 無評價提示 -->
      <div v-else-if="reviews.length === 0" class="text-center my-5 py-5 bg-light rounded">
        <i class="bi bi-chat-square-text display-4 text-muted"></i>
        <h5 class="mt-3 text-muted">暫無評價</h5>
        <button class="btn btn-success mt-3" @click="$emit('new-review')">
          撰寫第一則評價
        </button>
      </div>
      
      <!-- 評價列表 -->
      <template v-else>
        <review-item
          v-for="review in reviews"
          :key="review.id"
          :review="review"
          :show-detail-ratings="false"
          @like="handleLike"
          @view="$emit('view', $event)"
          @edit="$emit('edit', $event)"
          @report="$emit('report', $event)"
        />
        
        <!-- 分頁控件 -->
        <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
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
  </template>
  
  <script>
  import { toRefs, computed, ref, watch } from 'vue'
  import { useReviewStore } from '../stores/review'
  import { useAuthStore } from '../stores/auth'
  import ReviewItem from './ReviewItem.vue'
  import Paginate from 'vuejs-paginate-next'
  
  export default {
    name: 'ReviewList',
    components: {
      ReviewItem,
      Paginate
    },
    props: {
      campSiteId: {
        type: Number,
        required: true
      },
      showSummary: {
        type: Boolean,
        default: true
      },
      showFilters: {
        type: Boolean,
        default: true
      }
    },
    emits: ['view', 'edit', 'report', 'new-review', 'page-change'],
    setup(props, { emit }) {
      const reviewStore = useReviewStore()
      const authStore = useAuthStore()
      
      // 本地狀態
      const searchKeyword = ref('')
      const minRating = ref('')
      const sortBy = ref('createdAt')
      const sortDirection = ref('DESC')
      
      // 從 store 中提取屬性
      const { reviews, loading, totalPages, currentPage } = toRefs(reviewStore)
      
      // 計算屬性
      const averageRating = computed(() => reviewStore.averageRating)
      const averageCleanlinessRating = computed(() => reviewStore.averageCleanlinessRating)
      const averageConvenienceRating = computed(() => reviewStore.averageConvenienceRating)
      const averageFriendlinessRating = computed(() => reviewStore.averageFriendlinessRating)
      
      // 監聽 props 變化，重新加載評價
      watch(() => props.campSiteId, (newValue) => {
        loadReviews()
      }, { immediate: true })
      
      // 方法
      function loadReviews() {
        reviewStore.fetchReviews(props.campSiteId, currentPage.value)
      }
      
      function handlePageChange(page) {
        reviewStore.fetchReviews(props.campSiteId, page)
        emit('page-change', page)
      }
      
      function handleLike(reviewId) {
        reviewStore.toggleLike(reviewId, authStore.userId)
      }
      
      function search() {
        reviewStore.searchReviews({
          keyword: searchKeyword.value,
          campSiteId: props.campSiteId,
          minRating: minRating.value || null,
          userId: authStore.userId,
          page: 0,
          size: 10,
          sortBy: sortBy.value,
          sortDirection: sortDirection.value
        })
      }
      
      function getStarClass(position, rating) {
        if (position <= rating) {
          return 'bi bi-star-fill rating-star'
        } else if (position - 0.5 <= rating) {
          return 'bi bi-star-half rating-star'
        } else {
          return 'bi bi-star rating-star-empty'
        }
      }
      
      return {
        reviews,
        loading,
        totalPages,
        currentPage,
        averageRating,
        averageCleanlinessRating,
        averageConvenienceRating,
        averageFriendlinessRating,
        searchKeyword,
        minRating,
        sortBy,
        sortDirection,
        loadReviews,
        handlePageChange,
        handleLike,
        search,
        getStarClass
      }
    }
  }
  </script>
  
  <style scoped>
  .progress {
    height: 8px;
  }
  
  .average-rating {
    font-weight: bold;
    font-size: 1.1rem;
  }
  
  :deep(.pagination) {
    margin-bottom: 0;
  }
  
  :deep(.page-item.active .page-link) {
    background-color: #198754;
    border-color: #198754;
  }
  
  :deep(.page-link) {
    color: #198754;
  }
  
  :deep(.page-link:hover) {
    color: #0e5833;
  }
  </style>