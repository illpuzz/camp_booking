<!-- ReviewReplyModal.vue - 回覆評價的模態窗口組件 -->
<template>
    <div class="modal fade" id="replyReviewModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">回覆評價</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="review" class="review-preview mb-3">
              <div class="alert alert-secondary p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-bold">{{ review.userName }}</span>
                  <div class="rating">
                    <i class="bi bi-star-fill text-warning me-1"></i>
                    <span>{{ review.overallRating }}/5</span>
                  </div>
                </div>
                <p class="mb-0">{{ review.reviewText }}</p>
              </div>
            </div>
            
            <form @submit.prevent="submitReply">
              <div class="mb-3">
                <label for="replyText" class="form-label">回覆內容</label>
                <textarea 
                  id="replyText" 
                  class="form-control" 
                  v-model="replyText" 
                  rows="4" 
                  placeholder="請輸入您的回覆..."
                  required
                ></textarea>
              </div>
              
              <div class="alert alert-info">
                <i class="bi bi-info-circle-fill me-2"></i>
                作為營地主人，您的回覆將以官方身份顯示在評價下方。
              </div>
              
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-outline-secondary me-2" data-bs-dismiss="modal">取消</button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <i class="bi" :class="submitting ? 'bi-hourglass-split' : 'bi-send'"></i>
                  {{ submitting ? '送出中...' : '送出回覆' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { Modal } from 'bootstrap';
  import axios from 'axios';
  
  export default {
    name: 'ReviewReplyModal',
    props: {
      review: {
        type: Object,
        default: null
      }
    },
    emits: ['replied'],
    setup(props, { emit }) {
      const modal = ref(null);
      const replyText = ref('');
      const submitting = ref(false);
      
      // 初始化模態窗口
      onMounted(() => {
        const modalElement = document.getElementById('replyReviewModal');
        if (modalElement) {
          modal.value = new Modal(modalElement);
        }
      });
      
      // 顯示模態窗口
      const show = () => {
        if (modal.value) {
          replyText.value = ''; // 重置回覆文字
          modal.value.show();
        }
      };
      
      // 隱藏模態窗口
      const hide = () => {
        if (modal.value) {
          modal.value.hide();
        }
      };
      
      // 提交回覆
      const submitReply = async () => {
        if (!props.review) {
          alert('找不到要回覆的評價');
          return;
        }
        
        if (!replyText.value.trim()) {
          alert('請輸入回覆內容');
          return;
        }
        
        submitting.value = true;
        
        try {
          console.log(`提交回覆評價 ${props.review.id}...`);
          
          // 呼叫API提交回覆
          const response = await axios.put(`/api/reviews/${props.review.id}/reply`, {
            replyText: replyText.value.trim()
          });
          
          console.log('回覆評價 API 回應:', response.data);
          
          // 關閉Modal
          hide();
          
          // 清空回覆文字
          replyText.value = '';
          
          // 通知父組件回覆成功
          emit('replied', props.review.id);
          
          // 保存當前視圖狀態到 localStorage
          localStorage.setItem('currentView', 'reviews');
          
          // 顯示成功訊息
          alert('回覆已成功送出');
        } catch (error) {
          console.error('回覆評價失敗:', error);
          alert('回覆評價失敗: ' + (error.response?.data?.message || error.message || '請稍後再試'));
        } finally {
          submitting.value = false;
        }
      };
      
      return {
        replyText,
        submitting,
        show,
        hide,
        submitReply
      };
    }
  };
  </script>
  
  <style scoped>
  .review-preview .rating {
    display: flex;
    align-items: center;
  }
  
  .review-preview .fw-bold {
    color: var(--forest-dark);
  }
  </style>