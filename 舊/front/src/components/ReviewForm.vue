<script setup>
import { ref, reactive } from 'vue';
import { reviewService } from '../services/api';
import StarRating from './StarRating.vue';

const props = defineProps({
  campSiteId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['reviewCreated']);

// 表單數據
const form = reactive({
  campSiteId: props.campSiteId,
  userId: 1, // 暫時硬編碼，實際應從登入用戶獲取
  userName: '測試用戶', // 暫時硬編碼
  reviewText: '',
  overallRating: 0,
  cleanlinessRating: 0,
  convenienceRating: 0,
  friendlinessRating: 0,
  pros: '',
  cons: ''
});

// 提交狀態
const submitting = ref(false);
const error = ref('');
const successMessage = ref('');

// 表單驗證規則
const validateForm = () => {
  if (!form.reviewText.trim()) {
    error.value = '請輸入評價內容';
    return false;
  }
  
  if (form.overallRating === 0) {
    error.value = '請給予總體評分';
    return false;
  }
  
  if (form.cleanlinessRating === 0) {
    error.value = '請給予清潔度評分';
    return false;
  }
  
  if (form.convenienceRating === 0) {
    error.value = '請給予便利性評分';
    return false;
  }
  
  if (form.friendlinessRating === 0) {
    error.value = '請給予友善度評分';
    return false;
  }
  
  error.value = '';
  return true;
};

// 提交表單
const submitForm = async () => {
  if (!validateForm()) return;
  
  submitting.value = true;
  error.value = '';
  
  try {
    const response = await reviewService.createReview(form);
    successMessage.value = '評價發布成功！';
    
    // 發送成功事件給父組件
    emit('reviewCreated', response.data);
    
    // 重置表單（如需）
    // resetForm();
    
  } catch (err) {
    console.error('提交評價失敗:', err);
    error.value = '提交評價失敗，請稍後再試';
  } finally {
    submitting.value = false;
  }
};

// 取消評價
const cancelReview = () => {
  emit('reviewCreated', null);
};

// 重置表單
const resetForm = () => {
  form.reviewText = '';
  form.overallRating = 0;
  form.cleanlinessRating = 0;
  form.convenienceRating = 0;
  form.friendlinessRating = 0;
  form.pros = '';
  form.cons = '';
  error.value = '';
  successMessage.value = '';
};
</script>

<template>
  <div class="review-form">
    <h2>發表評價</h2>
    
    <!-- 錯誤訊息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- 成功訊息 -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    
    <form @submit.prevent="submitForm">
      <!-- 評分區塊 -->
      <div class="rating-section">
        <div class="rating-group">
          <label>總體評分:</label>
          <StarRating v-model:rating="form.overallRating" />
        </div>
        
        <div class="rating-group">
          <label>清潔度:</label>
          <StarRating v-model:rating="form.cleanlinessRating" />
        </div>
        
        <div class="rating-group">
          <label>便利性:</label>
          <StarRating v-model:rating="form.convenienceRating" />
        </div>
        
        <div class="rating-group">
          <label>友善度:</label>
          <StarRating v-model:rating="form.friendlinessRating" />
        </div>
      </div>
      
      <!-- 評價內容 -->
      <div class="form-group">
        <label for="reviewText">評價內容:</label>
        <textarea 
          id="reviewText"
          v-model="form.reviewText"
          rows="5"
          placeholder="請分享您的營地體驗..."
        ></textarea>
      </div>
      
      <!-- 優缺點 -->
      <div class="pros-cons-section">
        <div class="form-group">
          <label for="pros">優點:</label>
          <textarea 
            id="pros"
            v-model="form.pros"
            rows="3"
            placeholder="有哪些地方讓您滿意？"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="cons">缺點:</label>
          <textarea 
            id="cons"
            v-model="form.cons"
            rows="3"
            placeholder="有哪些地方需要改進？"
          ></textarea>
        </div>
      </div>
      
      <!-- 表單按鈕 -->
      <div class="form-actions">
        <button 
          type="button" 
          class="cancel-button"
          @click="cancelReview"
        >
          取消
        </button>
        <button 
          type="submit" 
          class="submit-button"
          :disabled="submitting"
        >
          {{ submitting ? '提交中...' : '發表評價' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.review-form {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--primary-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.rating-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.rating-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.rating-group label {
  font-weight: 500;
  color: var(--text-color);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: var(--text-color);
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
}

textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(127, 176, 105, 0.2);
}

.pros-cons-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.submit-button, .cancel-button {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.submit-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.submit-button:hover {
  background-color: #6c9a5b;
}

.submit-button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.cancel-button:hover {
  background-color: #e9ecef;
}

@media (max-width: 600px) {
  .rating-section {
    grid-template-columns: 1fr;
  }
  
  .pros-cons-section {
    grid-template-columns: 1fr;
  }
}
</style>