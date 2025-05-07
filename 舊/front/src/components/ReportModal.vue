<template>
  <div class="report-modal" v-if="show">
    <div class="modal-overlay" @click="$emit('cancel')"></div>
    <div class="modal-container">
      <div class="modal-header">
        <h3>檢舉評價</h3>
        <button class="close-btn" @click="$emit('cancel')">&times;</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="reportType">檢舉原因</label>
            <select 
              id="reportType" 
              v-model="reportData.reportType"
              class="form-control"
              required
            >
              <option value="" disabled selected>請選擇檢舉原因</option>
              <option v-for="option in reportOptions" :key="option.id" :value="option.id">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="reason">詳細說明</label>
            <textarea 
              id="reason" 
              v-model="reportData.reason" 
              class="form-control"
              rows="6" 
              placeholder="請提供更詳細的說明，例如為什麼這條評價違反規定，或者內容如何不實等..."
              required
            ></textarea>
          </div>
          
          <div class="notice-box">
            <i class="bi bi-info-circle me-2"></i>
            所有檢舉都會經過管理員審核，若情況屬實，此評價可能會被移除或修改。惡意檢舉可能導致帳號被限制功能。
          </div>
          
          <!-- 提交狀態顯示 -->
          <div v-if="submitStatus" class="submit-status" :class="{'success': submitStatus.success, 'error': !submitStatus.success}">
            {{ submitStatus.message }}
          </div>
          
          <div class="form-actions">
            <button 
              type="button" 
              class="cancel-button"
              @click="$emit('cancel')"
            >
              <i class="bi bi-x-circle me-1"></i>取消
            </button>
            <button 
              type="submit" 
              class="submit-button" 
              :disabled="submitting"
            >
              <i class="bi bi-send me-1"></i>
              <span v-if="submitting">
                <span class="spinner me-1" role="status" aria-hidden="true"></span>
                提交中...
              </span>
              <span v-else>提交檢舉</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  reviewId: {
    type: [Number, String],
    required: true
  },
  userId: {
    type: [Number, String],
    default: null
  }
});

const emit = defineEmits(['submit', 'cancel']);

const submitting = ref(false);
const submitStatus = ref(null);

// 檢舉選項
const reportOptions = [
  { id: 1, label: '不實內容' },
  { id: 2, label: '冒犯性內容或語言' },
  { id: 3, label: '廣告或垃圾訊息' },
  { id: 4, label: '暴力或仇恨言論' },
  { id: 5, label: '侵犯隱私權' },
  { id: 6, label: '其他' }
];

// 檢舉表單數據
const reportData = reactive({
  reviewId: Number(props.reviewId),
  userId: props.userId,
  reportType: '',
  reason: '',
  status: 'pending'
});

// 監聽 show 屬性變化，確保每次開啟模態框時重置表單
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 如果模態框重新開啟，清空表單和狀態
    reportData.reportType = '';
    reportData.reason = '';
    submitStatus.value = null;
  }
});

// 監聽 reviewId 屬性變化
watch(() => props.reviewId, (newVal) => {
  reportData.reviewId = Number(newVal);
});

// 監聽 userId 屬性變化
watch(() => props.userId, (newVal) => {
  reportData.userId = newVal;
});

// 提交表單
const submitForm = async () => {
  if (!reportData.reportType || !reportData.reason.trim()) {
    submitStatus.value = {
      success: false,
      message: '請填寫所有必填欄位'
    };
    return;
  }
  
  submitting.value = true;
  submitStatus.value = null;
  
  try {
    // 構建提交數據
    const submitData = { 
      ...reportData,
      reason: reportData.reason.trim()
    };
    
    // 將數據傳給父組件處理
    emit('submit', submitData);
    
    // 嘗試直接提交到API
    try {
      // 方法1: 標準POST請求
      const response = await axios.post(
        `/api/reports`,
        submitData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
      
      console.log('檢舉提交成功:', response.data);
      
      // 顯示成功狀態
      submitStatus.value = {
        success: true,
        message: '檢舉已提交！'
      };
      
      // 延遲關閉模態框
      setTimeout(() => {
        emit('cancel');
      }, 1500);
      
    } catch (apiError) {
      console.warn('API提交失敗:', apiError);
      
      // 即使API失敗，UI已更新，顯示部分成功消息
      submitStatus.value = {
        success: true,
        message: '檢舉已提交，但可能尚未保存到伺服器。'
      };
      
      // 延遲關閉模態框
      setTimeout(() => {
        emit('cancel');
      }, 2000);
    }
    
  } catch (error) {
    console.error('檢舉提交過程中發生錯誤:', error);
    
    submitStatus.value = {
      success: false,
      message: '檢舉提交失敗，請稍後再試'
    };
    
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.report-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.modal-container {
  width: 90%;
  max-width: 550px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  position: relative;
  border: 1px solid var(--border-color, #BFE0C9);
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
  border-bottom: 1px solid var(--border-color, #BFE0C9);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-color, #1E432E);
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
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-color, #1E432E);
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color, #BFE0C9);
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
}

select.form-control {
  background-color: white;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-color, #6EAB7F);
  box-shadow: 0 0 0 3px rgba(110, 171, 127, 0.15);
}

textarea.form-control {
  resize: vertical;
  min-height: 120px;
}

.notice-box {
  background-color: rgba(23, 162, 184, 0.1);
  border-left: 4px solid #17a2b8;
  color: #0c5460;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
  font-size: 14px;
  line-height: 1.5;
}

/* 提交狀態顯示 */
.submit-status {
  margin-bottom: 15px;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.submit-status.success {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.submit-status.error {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.submit-button, .cancel-button {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s;
}

.submit-button {
  background: var(--gradient-primary, linear-gradient(135deg, #2A5D3C, #47845D));
  color: white;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.submit-button:hover {
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
  color: var(--text-color, #1E432E);
  border: 1px solid var(--border-color, #BFE0C9);
}

.cancel-button:hover {
  background-color: var(--hover-color, #D7E9DE);
}

.spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner 0.75s linear infinite;
}

@keyframes spinner {
  to { transform: rotate(360deg); }
}

@media (max-width: 576px) {
  .modal-container {
    width: 95%;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .submit-button, .cancel-button {
    width: 100%;
    justify-content: center;
  }
}
</style>