<!-- src/components/EditReplyModal.vue -->
<template>
    <div class="modal-backdrop" v-if="show" @click.stop="$emit('close')">
      <div class="edit-reply-modal" @click.stop>
        <div class="modal-header">
          <h2 class="text-forest">編輯營地回覆</h2>
          <button type="button" class="close-btn" @click.stop="$emit('close')">&times;</button>
        </div>
        
        <div class="modal-body">
          <!-- 原評價預覽 -->
          <div class="original-review-section">
            <h3 class="section-title text-forest">原始評價</h3>
            <div class="user-info">
              <span class="user-name text-forest">{{ review.userName || '匿名用戶' }}</span>
              <span class="review-date text-forest-light">{{ formatDate(review.createdAt) }}</span>
            </div>
            <p class="truncated-review text-forest">{{ truncatedReviewText }}</p>
            <div class="star-rating-container">
              <span v-for="i in 5" :key="i" class="star" :class="i <= review.overallRating ? 'filled' : 'empty'">★</span>
            </div>
          </div>
          
          <!-- 回覆編輯表單 -->
          <form @submit.prevent="submitEdit">
            <div class="form-group">
              <label for="replyText" class="text-forest">營地方回覆</label>
              <textarea 
                id="replyText" 
                v-model="editedReplyText" 
                rows="6" 
                placeholder="請輸入營地回覆內容..."
                required
                class="reply-textarea"
              ></textarea>
              <p class="input-hint text-forest-light">作為營地代表，您的回覆將協助其他顧客更好地了解您的服務。請保持專業和禮貌。</p>
            </div>
            
            <div class="form-actions">
              <button type="button" class="cancel-button text-forest" @click.stop="$emit('close')">取消</button>
              <button 
                type="submit" 
                class="save-button" 
                :disabled="submitting"
              >
                <span v-if="submitting">
                  <span class="spinner"></span>
                  儲存中...
                </span>
                <span v-else>儲存修改</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, defineProps, defineEmits, onMounted, watch } from 'vue';
  import axios from 'axios';
  
  const props = defineProps({
    show: {
      type: Boolean,
      default: false
    },
    review: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['close', 'update']);
  
  const editedReplyText = ref('');
  const submitting = ref(false);
  
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
  
  // 截斷評價內容以供預覽
  const truncatedReviewText = computed(() => {
    if (!props.review || !props.review.reviewText) return '';
    
    const text = props.review.reviewText;
    if (text.length <= 100) return text;
    
    return text.substring(0, 100) + '...';
  });
  
  // 初始化編輯內容 - 從props中獲取
  const initializeForm = () => {
    if (props.review && props.review.replyText) {
      editedReplyText.value = props.review.replyText;
    } else {
      editedReplyText.value = '';
    }
  };
  
  // 監聽 show 屬性變化，當模態框開啟時初始化編輯內容
  watch(() => props.show, (newValue) => {
    if (newValue) {
      initializeForm();
    }
  });
  
  // 監聽 review 屬性變化，當review變更時更新表單
  watch(() => props.review, (newValue) => {
    if (newValue && props.show) {
      initializeForm();
    }
  }, { deep: true });
  
  // 當組件掛載時初始化
  onMounted(() => {
    if (props.show) {
      initializeForm();
    }
  });
  
  // 簡化的編輯回覆提交函數 - 只使用正確的 PUT 方法
  const submitEdit = async () => {
    if (!editedReplyText.value.trim()) {
      alert('請輸入回覆內容');
      return;
    }
    
    submitting.value = true;
    
    try {
      // 準備回覆數據 - 與後端API格式完全一致
      const replyData = {
        replyText: editedReplyText.value.trim()
      };
      
      // 使用PUT方法提交更新後的回覆
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
      
      console.log('回覆更新成功:', response.data);
      
      // 通知父組件更新UI
      emit('update', {
        reviewId: props.review.id,
        replyText: editedReplyText.value.trim()
      });
      
      // 關閉模態框
      emit('close');
    } catch (error) {
      console.error('更新回覆失敗:', error);
      alert('更新回覆失敗，請稍後再試');
    } finally {
      submitting.value = false;
    }
  };
  </script>
  
  <style scoped>
  /* 定義顏色變數 */
  :root {
    --forest-dark: #1E432E;
    --forest-medium: #356648;
    --forest-light: #5B8F6D;
    --border-color: #BFE0C9;
    --hover-color: #D7E9DE;
    --shadow-sm: 0 2px 6px rgba(40, 80, 60, 0.08);
    --shadow-md: 0 4px 12px rgba(40, 80, 60, 0.12);
  }
  
  /* 墨綠色文字通用樣式 */
  .text-forest {
    color: #1E432E !important;
  }
  
  .text-forest-light {
    color: #356648 !important;
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
  
  .edit-reply-modal {
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
  
  .original-review-section {
    background-color: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #e0e0e0;
  }
  
  .section-title {
    font-size: 18px;
    margin-top: 0;
    margin-bottom: 15px;
    font-weight: 600;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .user-name {
    font-weight: 600;
    margin-right: 10px;
  }
  
  .review-date {
    font-size: 0.9rem;
  }
  
  .truncated-review {
    margin-bottom: 10px;
    line-height: 1.5;
  }
  
  .star-rating-container {
    display: flex;
  }
  
  .star {
    font-size: 18px;
    margin-right: 2px;
  }
  
  .star.filled {
    color: #FFCB45;
  }
  
  .star.empty {
    color: #e0e0e0;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 10px;
    font-weight: 600;
    font-size: 16px;
  }
  
  .reply-textarea {
    width: 100%;
    padding: 15px;
    border: 1px solid #BFE0C9;
    border-radius: 10px;
    resize: vertical;
    font-family: inherit;
    font-size: 15px;
    color: #1E432E;
    min-height: 150px;
    transition: all 0.3s ease;
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
  
  .save-button, .cancel-button {
    padding: 12px 24px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .save-button {
    background: linear-gradient(135deg, #2A5D3C, #47845D);
    color: white;
    border: none;
    box-shadow: 0 2px 5px rgba(42, 93, 60, 0.2);
  }
  
  .save-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(42, 93, 60, 0.3);
  }
  
  .save-button:disabled {
    background: #aaa;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .cancel-button {
    background-color: white;
    color: #1E432E;
    border: 1px solid #BFE0C9;
  }
  
  .cancel-button:hover {
    background-color: #D7E9DE;
    transform: translateY(-2px);
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
    
    .save-button, .cancel-button {
      width: 100%;
    }
  }
  </style>