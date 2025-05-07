<!-- src/components/ReplyReviewModal.vue -->
<template>
    <div class="modal-backdrop" v-if="show" @click.stop="$emit('close')">
      <div class="reply-modal" @click.stop>
        <div class="modal-header">
          <h2 class="text-forest">回覆評價</h2>
          <button type="button" class="close-btn" @click.stop="$emit('close')">&times;</button>
        </div>
        
        <div class="modal-body">
          <!-- 評價預覽 -->
          <div class="review-preview" v-if="review">
            <div class="user-info">
              <div class="user-avatar">{{ review.userName ? review.userName.charAt(0) : 'U' }}</div>
              <div class="user-details">
                <h3 class="text-forest">{{ review.userName || '匿名用戶' }}</h3>
                <p class="review-date text-forest-light">{{ formatDate(review.createdAt) }}</p>
              </div>
              <div class="review-rating">
                <span v-for="i in 5" :key="i" class="star" :class="i <= review.overallRating ? 'filled' : 'empty'">★</span>
              </div>
            </div>
            
            <p class="review-text text-forest">{{ review.reviewText }}</p>
          </div>
          
          <!-- 回覆表單 -->
          <form @submit.prevent="submitReply" id="replyForm">
            <div class="form-group">
              <label for="replyText" class="text-forest">營地方回覆</label>
              <textarea 
                id="replyText" 
                v-model="replyText" 
                rows="6" 
                placeholder="請輸入您的回覆內容..."
                required
                class="reply-textarea"
              ></textarea>
              <p class="input-hint text-forest-light">作為營地代表，您的回覆將協助其他顧客更好地了解您的服務。請保持專業和禮貌。</p>
            </div>
            
            <div class="form-actions">
              <button type="button" class="cancel-button text-forest" @click.stop="$emit('close')">取消</button>
              <button 
                type="submit" 
                class="submit-button" 
                :disabled="submitting"
              >
                <span v-if="submitting">
                  <span class="spinner"></span>
                  提交中...
                </span>
                <span v-else>提交回覆</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, defineProps, defineEmits, watch } from 'vue';
  import axios from 'axios';
  
  export default {
    name: 'ReplyReviewModal',
    props: {
      show: {
        type: Boolean,
        default: false
      },
      review: {
        type: Object,
        required: true
      }
    },
    emits: ['close', 'submit'],
    setup(props, { emit }) {
      const submitting = ref(false);
      const replyText = ref('');
      
      // 監聽 show 屬性變化，確保每次開啟模態框時重置表單
      watch(() => props.show, (newVal) => {
        if (newVal) {
          // 如果模態框重新開啟，清空表單
          replyText.value = '';
        }
      });
      
      // 格式化日期
      const formatDate = (dateString) => {
        if (!dateString) return '';
        
        try {
          const date = new Date(dateString);
          return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        } catch (e) {
          console.error('日期格式化錯誤:', e);
          return dateString;
        }
      };
      
      // 簡化的回覆提交函數 - 只使用正確的 PUT 方法
      const submitReply = async () => {
        if (!replyText.value.trim()) {
          alert('請輸入回覆內容');
          return;
        }
        
        submitting.value = true;
        
        try {
          // 準備回覆數據
          const replyData = {
            replyText: replyText.value.trim()
          };
          
          // 使用PUT方法提交回覆 - 與後端API匹配
          const response = await axios.put(
            `/api/reviews/${props.review.id}/reply`,
            replyData,
            {
              headers: {
                'Content-Type': 'application/json'
              },
              timeout: 5000
            }
          );
          
          console.log("回覆提交成功:", response.data);
          
          // 發送事件通知父組件更新UI
          emit('submit', {
            reviewId: props.review.id,
            replyText: replyText.value.trim()
          });
          
          // 關閉模態框
          emit('close');
        } catch (error) {
          console.error('回覆評價失敗:', error);
          alert('回覆提交失敗，請稍後再試');
        } finally {
          submitting.value = false;
        }
      };
      
      return {
        formatDate,
        replyText,
        submitting,
        submitReply
      };
    }
  }
  </script>
  
  <style scoped>
  /* 顏色變數 */
  :root {
    --forest-dark: #1E432E;
    --forest-medium: #356648;
    --forest-light: #5B8F6D;
  }
  
  /* 墨綠色文字通用樣式 */
  .text-forest {
    color: var(--forest-dark, #1E432E) !important;
  }
  
  .text-forest-light {
    color: var(--forest-medium, #356648) !important;
  }
  
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(2px);
  }
  
  .reply-modal {
    width: 90%;
    max-width: 700px;
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    animation: modalFadeIn 0.3s ease-out;
  }
  
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 25px;
    border-bottom: 1px solid #BFE0C9;
    background-color: #E8F4EC;
  }
  
  .modal-header h2 {
    margin: 0;
    color: #2A5D3C;
    font-size: 22px;
    font-weight: 600;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .close-btn:hover {
    color: #333;
    transform: scale(1.1);
  }
  
  .modal-body {
    padding: 25px;
  }
  
  .review-preview {
    background-color: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 25px;
    border: 1px solid #dee2e6;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #2A5D3C;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 15px;
  }
  
  .user-details {
    flex-grow: 1;
  }
  
  .user-details h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  
  .review-date {
    margin: 0;
    font-size: 14px;
  }
  
  .review-rating {
    display: flex;
    align-items: center;
  }
  
  .star {
    font-size: 18px;
    color: #e0e0e0;
    margin-left: 2px;
  }
  
  .star.filled {
    color: #FFCB45;
  }
  
  .review-text {
    margin-bottom: 15px;
    line-height: 1.6;
    white-space: pre-line;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 10px;
    font-weight: 600;
    color: #2A5D3C;
    font-size: 16px;
  }
  
  .reply-textarea {
    width: 100%;
    padding: 14px;
    border: 1px solid #BFE0C9;
    border-radius: 10px;
    resize: vertical;
    font-family: inherit;
    font-size: 15px;
    background-color: white;
    color: #333;
    transition: all 0.3s ease;
    min-height: 120px;
  }
  
  .reply-textarea:focus {
    outline: none;
    border-color: #6EAB7F;
    box-shadow: 0 0 0 3px rgba(110, 171, 127, 0.15);
  }
  
  .input-hint {
    margin-top: 8px;
    font-size: 14px;
    font-style: italic;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 20px;
  }
  
  .submit-button, .cancel-button {
    padding: 12px 24px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .submit-button {
    background: linear-gradient(135deg, #2A5D3C, #47845D);
    color: white;
    border: none;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .submit-button:disabled {
    background: #aaa;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .cancel-button {
    background-color: white;
    color: #333;
    border: 1px solid #ddd;
  }
  
  .cancel-button:hover {
    background-color: #f8f9fa;
  }
  
  .spinner {
    display: inline-block;
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spinner 0.75s linear infinite;
    margin-right: 8px;
  }
  
  @keyframes spinner {
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 576px) {
    .form-actions {
      flex-direction: column-reverse;
    }
    
    .submit-button, .cancel-button {
      width: 100%;
    }
  }
  </style>