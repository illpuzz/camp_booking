<!-- ReportDetails.vue - 檢舉詳情組件 -->
<template>
  <div class="report-details">
    <div class="modal fade" id="reportDetailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">檢舉詳情</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="report && review">
              <!-- 檢舉基本信息 -->
              <div class="report-meta">
                <div class="report-badge" :class="report.reportTarget === 'review' ? 'review-badge' : 'reply-badge'">
                  <i :class="report.reportTarget === 'review' ? 'bi bi-chat-text-fill' : 'bi bi-reply-fill'"></i>
                  {{ report.reportTarget === 'review' ? '評論檢舉' : '回覆檢舉' }}
                </div>
                <div class="report-time">
                  <strong>檢舉時間：</strong> {{ formatDate(report.createdAt) }}
                </div>
              </div>

              <!-- 檢舉內容 -->
              <div class="section-card">
                <h6 class="section-title">檢舉資訊</h6>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">檢舉原因：</span>
                    <span class="badge bg-primary">{{ getReportTypeName(report.reportType) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">檢舉說明：</span>
                    <p class="bg-light p-2 rounded mb-0">{{ report.reason }}</p>
                  </div>
                  <div class="info-item">
                    <span class="label">檢舉狀態：</span>
                    <span 
                      class="badge" 
                      :class="{
                        'bg-warning': report.status === 'pending',
                        'bg-success': report.status === 'rejected',
                        'bg-danger': report.status === 'approved'
                      }"
                    >
                      {{ getStatusName(report.status) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 評價完整內容（包括評論和回覆） -->
              <div class="section-card">
                <h6 class="section-title">評價內容</h6>
                <div class="review-preview">
                  <div class="user-info">
                    <i class="bi bi-person-circle user-icon"></i>
                    <div>
                      <span class="user-name">{{ review.userName || '匿名用戶' }}</span>
                      <div class="rating">
                        <i class="bi bi-star-fill text-warning"></i>
                        <span>{{ review.overallRating || 0 }}/5</span>
                      </div>
                    </div>
                    <div class="review-date">
                      <i class="bi bi-calendar-event me-1"></i>
                      {{ formatDate(review.createdAt) }}
                    </div>
                  </div>
                  
                  <!-- 評論內容 - 始終顯示 -->
                  <div class="content-box">
                    <h6 class="content-title">
                      <i class="bi bi-chat-dots me-2"></i>
                      評論內容
                      <span 
                        v-if="report.reportTarget === 'review'"
                        class="reported-badge"
                      >
                        <i class="bi bi-flag-fill me-1"></i>被檢舉
                      </span>
                    </h6>
                    <div class="content-text" :class="{ 'reported-content': report.reportTarget === 'review' }">
                      {{ review.reviewText }}
                    </div>
                    
                    <!-- 評價的詳細評分 -->
                    <div class="detail-ratings">
                      <div class="rating-item">
                        <span class="rating-label">清潔度:</span>
                        <div class="stars">
                          <i 
                            v-for="i in 5" 
                            :key="`clean-${i}`"
                            class="bi" 
                            :class="i <= review.cleanlinessRating ? 'bi-star-fill' : 'bi-star'"
                          ></i>
                        </div>
                      </div>
                      <div class="rating-item">
                        <span class="rating-label">便利度:</span>
                        <div class="stars">
                          <i 
                            v-for="i in 5" 
                            :key="`conv-${i}`"
                            class="bi" 
                            :class="i <= review.convenienceRating ? 'bi-star-fill' : 'bi-star'"
                          ></i>
                        </div>
                      </div>
                      <div class="rating-item">
                        <span class="rating-label">友善度:</span>
                        <div class="stars">
                          <i 
                            v-for="i in 5" 
                            :key="`friend-${i}`"
                            class="bi" 
                            :class="i <= review.friendlinessRating ? 'bi-star-fill' : 'bi-star'"
                          ></i>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 優點和缺點 -->
                    <div v-if="review.pros || review.cons" class="pros-cons">
                      <div v-if="review.pros" class="pro-item">
                        <h6><i class="bi bi-hand-thumbs-up-fill text-success me-2"></i>優點</h6>
                        <p>{{ review.pros }}</p>
                      </div>
                      <div v-if="review.cons" class="con-item">
                        <h6><i class="bi bi-hand-thumbs-down-fill text-danger me-2"></i>缺點</h6>
                        <p>{{ review.cons }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 回覆內容 - 如果有回覆才顯示 -->
                  <div v-if="review.replyText" class="content-box reply-box">
                    <h6 class="content-title">
                      <i class="bi bi-reply-fill me-2"></i>
                      回覆內容
                      <span 
                        v-if="report.reportTarget === 'reply'"
                        class="reported-badge"
                      >
                        <i class="bi bi-flag-fill me-1"></i>被檢舉
                      </span>
                    </h6>
                    <div class="content-text" :class="{ 'reported-content': report.reportTarget === 'reply' }">
                      {{ review.replyText }}
                    </div>
                    <div class="reply-info">
                      <span class="reply-date">回覆時間: {{ formatDate(review.updatedAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 處理備註 -->
              <div v-if="report.status !== 'pending'" class="section-card">
                <h6 class="section-title">處理資訊</h6>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">處理時間：</span>
                    <span>{{ formatDate(report.updatedAt) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">處理備註：</span>
                    <p class="bg-light p-2 rounded mb-0">{{ report.handlerNote || '(無)' }}</p>
                  </div>
                </div>
              </div>

              <!-- 處理按鈕 (待處理狀態) -->
              <div v-if="report.status === 'pending'" class="action-buttons">
                <button class="btn btn-success" @click="handleReject">
                  <i class="bi bi-x-circle me-1"></i>
                  駁回檢舉
                </button>
                <button class="btn btn-danger" @click="handleApprove">
                  <i class="bi bi-trash me-1"></i>
                  核准並刪除
                </button>
              </div>
            </div>
            <!-- 加載狀態 -->
            <div v-else-if="loading" class="loading-state">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">載入中...</span>
              </div>
              <p class="mt-2">載入檢舉詳情...</p>
            </div>
            <!-- 錯誤狀態 -->
            <div v-else class="error-state">
              <i class="bi bi-exclamation-triangle-fill text-danger mb-2"></i>
              <p>無法載入檢舉詳情</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 處理檢舉 Modal -->
    <div class="modal fade" id="processReportModalInDetails" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isApproving ? '核准檢舉並刪除內容' : '駁回檢舉' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="alert" :class="isApproving ? 'alert-danger' : 'alert-success'">
              <p>
                <strong v-if="isApproving">您即將核准此檢舉並刪除被檢舉的內容。</strong>
                <strong v-else>您即將駁回此檢舉並恢復內容可見性。</strong>
              </p>
              <p class="mb-0">檢舉類型：{{ report?.reportTarget === 'review' ? '評論' : '回覆' }}</p>
            </div>

            <div class="form-group mb-3">
              <label for="handlerNote" class="form-label">處理備註：</label>
              <textarea 
                id="handlerNote" 
                class="form-control" 
                v-model="handlerNote" 
                rows="3"
                placeholder="請輸入處理原因 (會記錄於系統中)"
                required
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="cancelProcess">取消</button>
            <button 
              type="button" 
              :class="isApproving ? 'btn btn-danger' : 'btn btn-success'"
              @click="confirmProcess"
            >
              {{ isApproving ? '確認核准並刪除' : '確認駁回檢舉' }}
            </button>
          </div>
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
  name: 'ReportDetails',
  props: {
    reportId: {
      type: [Number, String],
      required: true
    },
    currentUser: {
      type: Object,
      required: true
    }
  },
  emits: ['processed', 'close'],
  setup(props, { emit }) {
    // 檢舉相關數據
    const report = ref(null);
    const review = ref(null);
    const loading = ref(true);
    
    // 處理流程
    const isApproving = ref(false);
    const handlerNote = ref('');
    
    // 模態視窗實例
    const detailsModal = ref(null);
    const processModal = ref(null);
    
    // 取得檢舉詳情
    const fetchReportDetails = async () => {
      loading.value = true;
      
      try {
        // 獲取檢舉資訊
        const reportResponse = await axios.get(`/api/review-reports/${props.reportId}`);
        report.value = reportResponse.data;
        
        // 獲取評價資訊
        const reviewResponse = await axios.get(`/api/reviews/${report.value.reviewId}`, {
          params: { userId: props.currentUser.id }
        });
        review.value = reviewResponse.data;
      } catch (error) {
        console.error('獲取檢舉詳情失敗:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 顯示詳情模態視窗
    const showModal = () => {
      if (detailsModal.value) {
        detailsModal.value.show();
      }
    };
    
    // 關閉詳情模態視窗
    const hideModal = () => {
      if (detailsModal.value) {
        detailsModal.value.hide();
        
        // 手動移除模態窗口背景
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
          backdrop.remove();
        });
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    };
    
    // 處理駁回檢舉
    const handleReject = () => {
      isApproving.value = false;
      handlerNote.value = '';
      if (processModal.value) {
        processModal.value.show();
      }
    };
    
    // 處理核准檢舉
    const handleApprove = () => {
      isApproving.value = true;
      handlerNote.value = '';
      if (processModal.value) {
        processModal.value.show();
      }
    };
    
    // 取消處理
    const cancelProcess = () => {
      if (processModal.value) {
        processModal.value.hide();
      }
    };
    
    // 確認處理
    const confirmProcess = async () => {
      if (!handlerNote.value.trim()) {
        alert('請輸入處理備註');
        return;
      }
      
      try {
        if (isApproving.value) {
          // 核准檢舉並刪除內容
          await axios.put(`/api/review-reports/${props.reportId}/approve-and-remove`, {
            handlerNote: handlerNote.value
          });
          alert('已核准檢舉並刪除內容');
        } else {
          // 駁回檢舉
          await axios.put(`/api/review-reports/${props.reportId}/process`, {
            status: 'rejected',
            handlerNote: handlerNote.value
          });
          alert('已駁回檢舉並恢復內容可見性');
        }
        
        // 關閉處理模態視窗
        if (processModal.value) {
          processModal.value.hide();
        }
        
        // 關閉詳情模態視窗
        hideModal();
        
        // 手動移除模態窗口背景
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
          backdrop.remove();
        });
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // 等待短暫時間確保DOM更新
        setTimeout(() => {
          // 通知父組件處理完成
          emit('processed');
          // 通知關閉
          emit('close');
        }, 100);
        
      } catch (error) {
        console.error('處理檢舉失敗:', error);
        alert(`處理檢舉失敗: ${error.response?.data?.message || error.message}`);
      }
    };
    
    // 獲取檢舉類型名稱
    const getReportTypeName = (reportType) => {
      const types = {
        1: '不實內容',
        2: '冒犯性內容或語言',
        3: '廣告或垃圾訊息',
        4: '暴力或仇恨言論',
        5: '侵犯隱私權',
        6: '其他'
      };
      
      return types[reportType] || '未知類型';
    };
    
    // 獲取檢舉狀態名稱
    const getStatusName = (status) => {
      const statusMap = {
        'pending': '待處理',
        'approved': '已核准',
        'rejected': '已駁回'
      };
      
      return statusMap[status] || status;
    };
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${year}年${month}月${day}日 ${hours}:${minutes}`;
    };
    
    // 初始化
    onMounted(() => {
      // 初始化模態視窗
      const detailsModalElement = document.getElementById('reportDetailsModal');
      if (detailsModalElement) {
        detailsModal.value = new Modal(detailsModalElement);
        // 自動顯示模態視窗
        showModal();
      }
      
      const processModalElement = document.getElementById('processReportModalInDetails');
      if (processModalElement) {
        processModal.value = new Modal(processModalElement);
      }
      
      // 獲取檢舉詳情
      fetchReportDetails();
      
      // 監聽模態視窗關閉事件
      if (detailsModalElement) {
        detailsModalElement.addEventListener('hidden.bs.modal', () => {
          // 確保移除遮罩
          const backdrops = document.querySelectorAll('.modal-backdrop');
          backdrops.forEach(backdrop => {
            backdrop.remove();
          });
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
          
          emit('close');
        });
      }
    });
    
    return {
      report,
      review,
      loading,
      isApproving,
      handlerNote,
      showModal,
      hideModal,
      handleReject,
      handleApprove,
      cancelProcess,
      confirmProcess,
      getReportTypeName,
      getStatusName,
      formatDate
    };
  }
};
</script>

<style scoped>
.report-details {
  font-family: 'Noto Sans TC', sans-serif;
}

.loading-state, .error-state {
  text-align: center;
  padding: 30px 0;
}

.error-state i {
  font-size: 2rem;
  display: block;
}

.report-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.report-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 5px;
  font-weight: 500;
  font-size: 0.9rem;
}

.review-badge {
  background-color: rgba(13, 110, 253, 0.15);
  color: #0d6efd;
}

.reply-badge {
  background-color: rgba(25, 135, 84, 0.15);
  color: #198754;
}

.section-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-title {
  margin-bottom: 12px;
  font-weight: 600;
  color: #495057;
  padding-bottom: 6px;
  border-bottom: 1px solid #dee2e6;
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item .label {
  font-weight: 500;
  color: #495057;
  margin-right: 5px;
  display: block;
  margin-bottom: 4px;
}

.review-preview {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #dee2e6;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.user-icon {
  font-size: 2rem;
  color: #6c757d;
}

.user-name {
  font-weight: 500;
  display: block;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
}

.review-date {
  margin-left: auto;
  font-size: 0.85rem;
  color: #6c757d;
}

.content-box {
  margin-top: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  position: relative;
}

.reply-box {
  background-color: #f0f7ff;
  border-left: 3px solid #0d6efd;
}

.content-title {
  font-size: 1rem;
  margin-bottom: 10px;
  color: #495057;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.reported-badge {
  margin-left: 8px;
  font-size: 0.75rem;
  background-color: #dc3545;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: normal;
}

.content-text {
  background-color: white;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #dee2e6;
}

.reported-content {
  border: 1px solid #dc3545;
  background-color: #fff5f7;
}

.detail-ratings {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
  margin-bottom: 15px;
}

.rating-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-label {
  font-weight: 500;
  font-size: 0.9rem;
  color: #495057;
}

.stars {
  display: flex;
  gap: 2px;
}

.stars i {
  color: #e0e0e0;
  font-size: 0.9rem;
}

.stars i.bi-star-fill {
  color: #ffc107;
}

.pros-cons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 15px;
}

.pro-item, .con-item {
  padding: 10px;
  border-radius: 6px;
}

.pro-item {
  background-color: rgba(25, 135, 84, 0.1);
}

.con-item {
  background-color: rgba(220, 53, 69, 0.1);
}

.pro-item h6, .con-item h6 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.pro-item p, .con-item p {
  margin-bottom: 0;
  font-size: 0.9rem;
}

.reply-info {
  display: flex;
  justify-content: flex-end;
  font-size: 0.85rem;
  color: #6c757d;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .report-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .pros-cons {
    grid-template-columns: 1fr;
  }
  
  .detail-ratings {
    flex-direction: column;
    gap: 8px;
  }
}
</style>