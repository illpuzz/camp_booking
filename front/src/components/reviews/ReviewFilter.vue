<!-- ReviewFilter.vue - 評價過濾器組件 -->
<template>
  <div class="review-filter">
    <div class="filter-header d-flex justify-content-between align-items-center mb-3">
      <h2 class="section-title">
        <i class="bi bi-funnel me-2"></i>
        評價搜尋與篩選
      </h2>
      
      <button 
        v-if="canAddReview" 
        class="btn btn-primary add-review-btn"
        @click="$emit('add-review')"
      >
        <i class="bi bi-plus-circle me-2"></i>
        新增評價
      </button>
    </div>
    
    <div class="filter-content">
      <div class="card shadow-sm">
        <div class="card-body">
          <form @submit.prevent="applyFilters">
            <div class="row g-3">
              <!-- 關鍵字搜尋 -->
              <div class="col-md-4">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="輸入關鍵字搜尋評價..." 
                    v-model="filters.keyword"
                  >
                </div>
              </div>
              
              <!-- 評分過濾 -->
              <div class="col-md-3">
                <div class="input-group">
                  <span class="input-group-text">最低評分</span>
                  <select class="form-select" v-model="filters.minRating">
                    <option value="0">所有評分</option>
                    <option value="5">★★★★★ (5星)</option>
                    <option value="4">★★★★☆ (4星及以上)</option>
                    <option value="3">★★★☆☆ (3星及以上)</option>
                    <option value="2">★★☆☆☆ (2星及以上)</option>
                    <option value="1">★☆☆☆☆ (1星及以上)</option>
                  </select>
                </div>
              </div>
              
              <!-- 排序方式 -->
              <div class="col-md-3">
                <div class="input-group">
                  <span class="input-group-text">排序方式</span>
                  <select class="form-select" v-model="filters.sortBy">
                    <option value="createdAt">最新評價</option>
                    <option value="overallRating">評分高低</option>
                    <option value="likeCount">讚數高低</option>
                  </select>
                </div>
              </div>
              
              <!-- 排序方向 -->
              <div class="col-md-2">
                <div class="input-group">
                  <span class="input-group-text">方向</span>
                  <select class="form-select" v-model="filters.direction">
                    <option value="DESC">由高至低</option>
                    <option value="ASC">由低至高</option>
                  </select>
                </div>
              </div>
              
              <!-- 篩選按鈕 -->
              <div class="col-12 text-center mt-3">
                <button type="submit" class="btn btn-success me-2">
                  <i class="bi bi-filter-circle me-1"></i>
                  套用篩選
                </button>
                <button type="button" class="btn btn-outline-secondary" @click="resetFilters">
                  <i class="bi bi-arrow-counterclockwise me-1"></i>
                  重置篩選
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue';

export default {
  name: 'ReviewFilter',
  props: {
    canAddReview: {
      type: Boolean,
      default: false
    }
  },
  emits: ['filter-applied', 'add-review'],
  setup(props, { emit }) {
    // 篩選條件
    const state = reactive({
      filters: {
        keyword: '',
        minRating: 0,
        sortBy: 'createdAt',
        direction: 'DESC'
      }
    });
    
    // 套用篩選
    const applyFilters = () => {
      emit('filter-applied', { ...state.filters });
    };
    
    // 重置篩選
    const resetFilters = () => {
      state.filters = {
        keyword: '',
        minRating: 0,
        sortBy: 'createdAt',
        direction: 'DESC'
      };
      
      // 重置後自動套用
      applyFilters();
    };
    
    return {
      ...toRefs(state),
      applyFilters,
      resetFilters
    };
  }
};
</script>

<style scoped>
.review-filter {
  margin-bottom: 25px;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--forest-dark);
  margin: 0;
}

.add-review-btn {
  background-color: var(--forest-dark);
  border-color: var(--forest-dark);
}

.add-review-btn:hover {
  background-color: var(--forest-medium);
  border-color: var(--forest-medium);
}

.card {
  border: none;
  border-radius: 10px;
  overflow: hidden;
}

.input-group-text {
  background-color: var(--forest-ultralight);
  color: var(--forest-dark);
  border-color: #ced4da;
}

.form-control:focus, .form-select:focus {
  border-color: var(--forest-medium);
  box-shadow: 0 0 0 0.25rem rgba(53, 102, 72, 0.25);
}
</style>