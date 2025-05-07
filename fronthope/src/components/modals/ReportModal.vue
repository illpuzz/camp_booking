<!-- ReportModal.vue - 檢舉評價或回覆的模態窗口組件 -->
<template>
    <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">檢舉{{ targetType === 'review' ? '評價' : '回覆' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitReport">
              <div class="mb-3">
                <label for="reportType" class="form-label">檢舉原因</label>
                <select id="reportType" class="form-select" v-model="reportType" required>
                  <option value="" disabled selected>請選擇檢舉原因</option>
                  <option value="1">不實內容</option>
                  <option value="2">冒犯性內容或語言</option>
                  <option value="3">廣告或垃圾訊息</option>
                  <option value="4">暴力或仇恨言論</option>
                  <option value="5">侵犯隱私權</option>
                  <option value="6">其他</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="reportReason" class="form-label">詳細說明</label>
                <textarea 
                  id="reportReason" 
                  class="form-control" 
                  v-model="reportReason" 
                  rows="3" 
                  placeholder="請詳細說明檢舉原因..."
                  required
                ></textarea>
              </div>
              
              <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                提交檢舉後，此{{ targetType === 'review' ? '評價' : '回覆' }}將會被暫時隱藏，直到管理員審核完成。
              </div>
              
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-outline-secondary me-2" data-bs-dismiss="modal">取消</button>
                <button type="submit" class="btn btn-danger" :disabled="submitting">
                  <i class="bi" :class="submitting ? 'bi-hourglass-split' : 'bi-flag-fill'"></i>
                  {{ submitting ? '提交中...' : '提交檢舉' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { Modal } from 'bootstrap';
  import axios from 'axios';
  
  export default {
    name: 'ReportModal',
    props: {
      review: {
        type: Object,
        default: null
      },
      targetType: {
        type: String,
        default: 'review',
        validator: (value) => ['review', 'reply'].includes(value)
      },
      userId: {
        type: [Number, String],
        required: true
      }
    },
    emits: ['reported'],
    setup(props, { emit }) {
      const modal = ref(null);
      const reportType = ref('');
      const reportReason = ref('');
      const submitting = ref(false);
      
      // 計算模態窗口的ID
      const modalId = computed(() => {
        return props.targetType === 'review' ? 'reportReviewModal' : 'reportReplyModal';
      });
      
      // 初始化模態窗口
      onMounted(() => {
        const modalElement = document.getElementById(modalId.value);
        if (modalElement) {
          modal.value = new Modal(modalElement);
        }
      });
      
      // 顯示模態窗口
      const show = () => {
        // 重置表單
        reportType.value = '';
        reportReason.value = '';
        
        if (modal.value) {
          modal.value.show();
        }
      };
      
      // 隱藏模態窗口
      const hide = () => {
        if (modal.value) {
          modal.value.hide();
        }
      };
      
      // 提交檢舉
      const submitReport = async () => {
        if (!props.review) {
          alert('找不到要檢舉的內容');
          return;
        }
        
        if (!reportType.value || !reportReason.value.trim()) {
          alert('請選擇檢舉原因並填寫詳細說明');
          return;
        }
        
        submitting.value = true;
        
        try {
          // 創建檢舉數據
          const reportData = {
            reviewId: props.review.id,
            userId: props.userId,
            reportType: parseInt(reportType.value),
            reason: reportReason.value.trim(),
            reportTarget: props.targetType
          };
          
          console.log(`提交${props.targetType === 'review' ? '評價' : '回覆'}檢舉數據:`, reportData);
          
          // 呼叫 API 提交檢舉
          const endpoint = `/api/review-reports/${props.targetType}`;
          const response = await axios.post(endpoint, reportData);
          
          console.log('檢舉 API 回應:', response.data);
          
          // 關閉 Modal
          hide();
          
          // 重置表單
          reportType.value = '';
          reportReason.value = '';
          
          // 通知父組件檢舉成功
          emit('reported', { 
            reviewId: props.review.id, 
            targetType: props.targetType 
          });
          
          // 顯示成功訊息
          alert(`檢舉已提交，${props.targetType === 'review' ? '評價' : '回覆'}將被暫時隱藏，直到管理員審核完成。`);
        } catch (error) {
          console.error(`提交檢舉${props.targetType === 'review' ? '評價' : '回覆'}失敗:`, error);
          
          if (error.response && error.response.status === 409) {
            alert(`您已經檢舉過這${props.targetType === 'review' ? '篇評價' : '則回覆'}`);
          } else {
            alert('提交檢舉失敗，請稍後再試');
          }
        } finally {
          submitting.value = false;
        }
      };
      
      return {
        modalId,
        reportType,
        reportReason,
        submitting,
        show,
        hide,
        submitReport
      };
    }
  };
  </script>