<!-- src/components/EditReviewModal.vue -->
<template>
    <div class="modal-backdrop" v-if="show" @click="$emit('close')">
      <div class="edit-modal" @click.stop>
        <div class="modal-header">
          <h2>編輯評價</h2>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submitEdit">
            <!-- 評分區塊 -->
            <div class="rating-section">
              <div class="rating-group">
                <label>總體評分</label>
                <StarRating v-model:rating="editForm.overallRating" :readonly="false" />
              </div>
              
              <div class="rating-group">
                <label>清潔度</label>
                <StarRating v-model:rating="editForm.cleanlinessRating" :readonly="false" />
              </div>
              
              <div class="rating-group">
                <label>便利性</label>
                <StarRating v-model:rating="editForm.convenienceRating" :readonly="false" />
              </div>
              
              <div class="rating-group">
                <label>友善度</label>
                <StarRating v-model:rating="editForm.friendlinessRating" :readonly="false" />
              </div>
            </div>
            
            <!-- 評價內容 -->
            <div class="form-group">
              <label for="reviewText">評價內容</label>
              <textarea 
                id="reviewText" 
                v-model="editForm.reviewText" 
                rows="5" 
                placeholder="請分享您的營地體驗..."
                required
              ></textarea>
            </div>
            
            <!-- 優缺點 -->
            <div class="pros-cons-section">
              <div class="form-group">
                <label for="pros">優點</label>
                <textarea 
                  id="pros" 
                  v-model="editForm.pros" 
                  rows="3" 
                  placeholder="有哪些地方讓您滿意？"
                ></textarea>
              </div>
              
              <div class="form-group">
                <label for="cons">缺點</label>
                <textarea 
                  id="cons" 
                  v-model="editForm.cons" 
                  rows="3" 
                  placeholder="有哪些地方需要改進？"
                ></textarea>
              </div>
            </div>
            
            <!-- 操作按鈕 -->
            <div class="modal-actions">
              <button type="button" class="cancel-button" @click="$emit('close')">取消</button>
              <button 
                type="submit" 
                class="submit-button" 
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
  import { ref, reactive, computed, defineProps, defineEmits, watch } from 'vue';
  import StarRating from './StarRating.vue';
  
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
  
  const submitting = ref(false);
  
  // 編輯表單數據
  const editForm = reactive({
    id: null,
    userId: null,
    campSiteId: null,
    reviewText: '',
    overallRating: 0,
    cleanlinessRating: 0,
    convenienceRating: 0,
    friendlinessRating: 0,
    pros: '',
    cons: ''
  });
  
  // 監聽 review 屬性變化，更新表單數據
  watch(() => props.review, (newReview) => {
    if (newReview && newReview.id) {
      editForm.id = newReview.id;
      editForm.userId = newReview.userId;
      editForm.campSiteId = newReview.campSiteId;
      editForm.reviewText = newReview.reviewText || '';
      editForm.overallRating = newReview.overallRating || 0;
      editForm.cleanlinessRating = newReview.cleanlinessRating || 0;
      editForm.convenienceRating = newReview.convenienceRating || 0;
      editForm.friendlinessRating = newReview.friendlinessRating || 0;
      editForm.pros = newReview.pros || '';
      editForm.cons = newReview.cons || '';
    }
  }, { immediate: true, deep: true });
  
  // 計算總體評分（可以自動計算或保持用戶的設定）
  const calculatedOverallRating = computed(() => {
    // 如果用戶沒有直接修改總體評分，可以使用自動計算的平均值
    const { cleanlinessRating, convenienceRating, friendlinessRating } = editForm;
    if (cleanlinessRating > 0 && convenienceRating > 0 && friendlinessRating > 0) {
      const avg = (cleanlinessRating + convenienceRating + friendlinessRating) / 3;
      return Math.round(avg);
    }
    return editForm.overallRating;
  });
  
  // 提交編輯內容
  const submitEdit = async () => {
    // 表單驗證
    if (!editForm.reviewText || !editForm.reviewText.trim()) {
      alert('請輸入評價內容');
      return;
    }
    
    if (editForm.cleanlinessRating === 0 || 
        editForm.convenienceRating === 0 || 
        editForm.friendlinessRating === 0) {
      alert('請給予所有評分項目評分');
      return;
    }
    
    submitting.value = true;
    
    try {
      // 準備更新的數據
      const updateData = { ...editForm };
      
      // 如果總體評分是自動計算的
      if (updateData.overallRating === 0) {
        updateData.overallRating = calculatedOverallRating.value;
      }
      
      // 向父組件發送更新事件
      emit('update', updateData);
    } catch (error) {
      console.error('更新評價時發生錯誤:', error);
      alert('更新評價失敗，請稍後再試');
    } finally {
      submitting.value = false;
    }
  };
  </script>
  
  <style scoped>
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
  
  .edit-modal {
    width: 90%;
    max-width: 800px;
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
  
  .rating-section {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .rating-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .rating-group label {
    font-weight: 600;
    color: #1E432E;
    font-size: 16px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 10px;
    font-weight: 600;
    color: #1E432E;
    font-size: 16px;
  }
  
  textarea {
    width: 100%;
    padding: 14px;
    border: 1px solid #BFE0C9;
    border-radius: 10px;
    resize: vertical;
    font-family: inherit;
    font-size: 15px;
    background-color: white;
    color: #1E432E;
    transition: all 0.3s ease;
  }
  
  textarea:focus {
    outline: none;
    border-color: #6EAB7F;
    box-shadow: 0 0 0 3px rgba(110, 171, 127, 0.15);
  }
  
  .pros-cons-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .modal-actions {
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
    color: #1E432E;
    border: 1px solid #BFE0C9;
  }
  
  .cancel-button:hover {
    background-color: #D7E9DE;
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
  
  @media (max-width: 768px) {
    .pros-cons-section {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 576px) {
    .modal-actions {
      flex-direction: column-reverse;
    }
    
    .submit-button, .cancel-button {
      width: 100%;
    }
  }
  </style>