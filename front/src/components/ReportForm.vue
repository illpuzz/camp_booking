<template>
  <div class="report-form">
    <div class="card border-danger">
      <div class="card-header bg-danger text-white">
        <h5 class="mb-0">
          <i class="bi bi-flag me-2"></i>檢舉評價
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitReport">
          <div class="mb-3">
            <label for="reportType" class="form-label">檢舉原因</label>
            <select 
              id="reportType" 
              class="form-select" 
              v-model="reportData.reportType"
              required
            >
              <option value="" disabled selected>請選擇檢舉原因</option>
              <option v-for="option in reportOptions" :key="option.id" :value="option.id">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <div class="mb-3">
            <label for="reason" class="form-label">詳細說明</label>
            <textarea 
              id="reason" 
              class="form-control" 
              v-model="reportData.reason" 
              rows="5" 
              placeholder="請提供更詳細的說明..."
              required
            ></textarea>
          </div>
          
          <div class="form-text mb-3">
            <i class="bi bi-info-circle me-1"></i>
            請提供具體詳細的檢舉理由，管理員將在審核後決定是否處理該評價。
          </div>
          
          <div class="d-flex justify-content-between">
            <button 
              type="button" 
              class="btn btn-outline-secondary" 
              @click="$emit('cancel')"
            >
              <i class="bi bi-x-circle me-1"></i>取消
            </button>
            <button 
              type="submit" 
              class="btn btn-danger" 
              :disabled="isSubmitting"
            >
              <i class="bi bi-send me-1"></i>
              {{ isSubmitting ? '提交中...' : '提交檢舉' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { reportService } from '../services/reportService'
import Swal from 'sweetalert2'

export default {
  name: 'ReportForm',
  props: {
    reviewId: {
      type: Number,
      required: true
    }
  },
  emits: ['cancel', 'success'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const isSubmitting = ref(false)
    
    // 檢舉選項
    const reportOptions = [
      { id: 1, label: '不實內容' },
      { id: 2, label: '冒犯性內容或語言' },
      { id: 3, label: '廣告或垃圾訊息' },
      { id: 4, label: '暴力或仇恨言論' },
      { id: 5, label: '侵犯隱私權' },
      { id: 6, label: '其他' }
    ]
    
    // 檢舉表單數據
    const reportData = reactive({
      reviewId: props.reviewId,
      userId: authStore.userId,
      reportType: '',
      reason: '',
      status: 'pending'
    })
    
    // 提交檢舉
    async function submitReport() {
      if (!reportData.reportType || !reportData.reason.trim()) {
        Swal.fire({
          icon: 'error',
          title: '提交失敗',
          text: '請填寫所有必填欄位。'
        })
        return
      }
      
      isSubmitting.value = true
      
      try {
        const response = await reportService.createReport(reportData)
        
        Swal.fire({
          icon: 'success',
          title: '檢舉已提交',
          text: '感謝您的回報，我們將盡快處理。'
        })
        
        emit('success', response)
      } catch (error) {
        console.error('檢舉提交失敗:', error)
        
        let errorMessage = '提交檢舉時發生錯誤，請稍後再試。'
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        }
        
        Swal.fire({
          icon: 'error',
          title: '提交失敗',
          text: errorMessage
        })
      } finally {
        isSubmitting.value = false
      }
    }
    
    return {
      reportData,
      reportOptions,
      isSubmitting,
      submitReport
    }
  }
}
</script>

<style scoped>
.report-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-control:focus, .form-select:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}
</style>