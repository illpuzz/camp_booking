<!-- components/layout/MainContent.vue -->
<template>
    <div class="main-content">
      <!-- 切換視圖按鈕 (只在查看評價時顯示) -->
      <div v-if="currentView === 'reviews'" class="back-button mb-3">
        <button class="btn btn-outline-secondary" @click="changeView('connector')">
          <i class="bi bi-arrow-left me-1"></i>
          返回營地頁面
        </button>
      </div>
      
      <!-- 使用v-if和v-else-if確保只有一個視圖會顯示 -->
      <CampSiteConnector 
        v-if="currentView === 'connector'"
        @view-reviews="changeView('reviews')"
      />
      
      <ReviewsView 
        v-else-if="currentView === 'reviews'"
        :currentUser="currentUser"
        @handle-report="$emit('handle-report', $event)"
      />
    </div>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  import CampSiteConnector from '@/components/views/CampSiteConnector.vue';
  import ReviewsView from '@/components/views/ReviewsView.vue';
  
  export default defineComponent({
    name: 'MainContent',
    components: {
      CampSiteConnector,
      ReviewsView
    },
    props: {
      currentUser: {
        type: Object,
        required: true
      },
      currentView: {
        type: String,
        default: 'connector'
      }
    },
    emits: ['view-changed', 'handle-report'],
    setup(props, { emit }) {
      console.log('MainContent 初始化，當前視圖：', props.currentView);
      
      // 切換視圖
      const changeView = (view) => {
        console.log('MainContent: 切換視圖為', view);
        emit('view-changed', view);
      };
      
      return {
        changeView
      };
    }
  });
  </script>
  
  <style scoped>
  .main-content {
    margin-bottom: 30px;
  }
  
  .back-button {
    max-width: 1200px;
    margin: 0 auto 15px;
    padding: 0 20px;
  }
  </style>