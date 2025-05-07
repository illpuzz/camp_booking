<!-- src/components/DeleteConfirmModal.vue -->
<template>
    <div class="modal-backdrop" v-if="show" @click.stop="$emit('close')">
      <div class="delete-modal" @click.stop>
        <div class="modal-header">
          <h2 class="text-danger">確認刪除{{ itemType }}</h2>
          <button type="button" class="close-btn" @click.stop="$emit('close')">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="warning-icon">
            <i class="bi bi-exclamation-triangle"></i>
          </div>
          
          <div class="warning-message">
            <h3 class="text-danger">您確定要刪除這則{{ itemType }}嗎？</h3>
            <p class="text-forest">此操作無法復原，{{ itemType }}將永久從系統中移除。</p>
          </div>
          
          <div class="review-preview" v-if="review">
            <p class="review-text text-forest">{{ previewText }}</p>
            <div class="review-rating" v-if="itemType === '評價'">
              <div class="star-rating">
                <span v-for="i in 5" :key="i" class="star" :class="i <= review.overallRating ? 'filled' : 'empty'">★</span>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="cancel-button text-forest" @click.stop="$emit('close')">取消</button>
          
            <button 
              type="button"
              class="delete-button" 
              @click.stop="confirmDelete"
              :disabled="deleting"
            >
              <span v-if="deleting">
                <span class="spinner"></span>
                刪除中...
              </span>
              <span v-else>確認刪除</span>





              
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    show: {
      type: Boolean,
      default: false
    },
    review: {
      type: Object,
      required: true
    },
    itemType: {
      type: String,
      default: '評價'
    }
  });
  
  const emit = defineEmits(['close', 'confirm']);
  
  const deleting = ref(false);
  
  // 根據刪除類型獲取預覽文字
  const previewText = computed(() => {
    if (!props.review) return '';
    
    // 如果是刪除回覆，則顯示回覆內容
    if (props.itemType === '回覆') {
      const text = props.review.replyText || '';
      if (text.length <= 120) return text;
      return text.substring(0, 120) + '...';
    }
    
    // 否則顯示評價內容
    const text = props.review.reviewText || '';
    if (text.length <= 120) return text;
    return text.substring(0, 120) + '...';
  });
  
  // 確認刪除
  const confirmDelete = async () => {
    deleting.value = true;
    
    try {
      // 發送刪除事件到父組件，傳遞評價ID
      emit('confirm', props.review.id);
    } catch (error) {
      console.error(`刪除${props.itemType}時發生錯誤:`, error);
      deleting.value = false;
    }
  };
  </script>
  
  <style scoped>
  /* 墨綠色文字通用樣式 */
  .text-forest {
    color: #1E432E !important;
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
  
  .delete-modal {
    width: 90%;
    max-width: 500px;
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
    border-bottom: 1px solid #f0f0f0;
    background-color: #f8f8f8;
  }
  
  .modal-header h2 {
    margin: 0;
    color: #dc3545;
    font-size: 20px;
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
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .warning-icon {
    color: #dc3545;
    font-size: 3rem;
    margin-bottom: 15px;
  }
  
  .warning-message {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .warning-message h3 {
    color: #dc3545;
    font-size: 18px;
    margin-bottom: 10px;
  }
  
  .warning-message p {
    color: #666;
    margin-bottom: 0;
  }
  
  .review-preview {
    background-color: #f8f8f8;
    padding: 15px;
    border-radius: 10px;
    width: 100%;
    margin-bottom: 20px;
    border: 1px solid #e0e0e0;
  }
  
  .review-text {
    margin-bottom: 10px;
    font-style: italic;
    color: #555;
    font-size: 0.9rem;
  }
  
  .review-rating {
    display: flex;
    justify-content: flex-end;
  }
  
  .star-rating {
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
  
  .modal-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 10px;
    width: 100%;
  }
  
  .delete-button, .cancel-button {
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
  
  .delete-button {
    background-color: #dc3545;
    color: white;
    border: none;
    box-shadow: 0 2px 5px rgba(220, 53, 69, 0.3);
  }
  
  .delete-button:hover:not(:disabled) {
    background-color: #c82333;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(220, 53, 69, 0.4);
  }
  
  .delete-button:disabled {
    background-color: #e68e98;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .cancel-button {
    background-color: white;
    color: #333;
    border: 1px solid #ccc;
  }
  
  .cancel-button:hover {
    background-color: #f0f0f0;
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
    .modal-actions {
      flex-direction: column-reverse;
    }
    
    .delete-button, .cancel-button {
      width: 100%;
    }
  }
  </style>