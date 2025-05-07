<!-- AdminReportManager.vue - 管理員檢舉管理組件 -->
<template>
  <div class="admin-panel">
    <div class="panel-header">
      <h2 class="section-title">
        <i class="bi bi-shield-exclamation me-2"></i>
        檢舉管理面板
      </h2>
      <div class="filter-controls">
        <div class="btn-group" role="group">
          <button 
            type="button" 
            class="btn" 
            :class="activeFilter === 'all' ? 'btn-success' : 'btn-outline-success'"
            @click="setFilter('all')"
          >
            所有檢舉
          </button>
          <button 
            type="button" 
            class="btn" 
            :class="activeFilter === 'review' ? 'btn-success' : 'btn-outline-success'"
            @click="setFilter('review')"
          >
            評論檢舉
          </button>
          <button 
            type="button" 
            class="btn" 
            :class="activeFilter === 'reply' ? 'btn-success' : 'btn-outline-success'"
            @click="setFilter('reply')"
          >
            回覆檢舉
          </button>
        </div>
        <button class="btn btn-outline-primary ms-2" @click="refreshReports">
          <i class="bi bi-arrow-clockwise me-1"></i> 重新整理
        </button>
      </div>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="mt-3">載入檢舉清單中...</p>
    </div>

    <!-- 無檢舉顯示 -->
    <div v-else-if="filteredReports.length === 0" class="empty-state">
      <i class="bi bi-check-circle empty-icon"></i>
      <h4>目前沒有待處理的檢舉</h4>
      <p>所有檢舉已經處理完畢</p>
    </div>

    <!-- 檢舉清單 -->
    <div v-else class="reports-list">
      <div v-for="report in filteredReports" :key="report.id" class="report-card">
        <div class="report-header">
          <div class="report-type" :class="report.reportTarget === 'review' ? 'review-type' : 'reply-type'">
            <i :class="report.reportTarget === 'review' ? 'bi bi-chat-text-fill' : 'bi bi-reply-fill'"></i>
            {{ report.reportTarget === 'review' ? '評論檢舉' : '回覆檢舉' }}
          </div>
          <div class="report-time">
            <i class="bi bi-clock me-1"></i>
            {{ formatDate(report.createdAt) }}
          </div>
        </div>

        <div class="report-content">
          <div class="report-info">
            <div class="info-item">
              <span class="label">檢舉原因：</span>
              <span class="value">{{ getReportTypeName(report.reportType) }}</span>
            </div>
            <div class="info-item">
              <span class="label">檢舉說明：</span>
              <span class="value">{{ report.reason }}</span>
            </div>
          </div>

          <div class="content-preview">
            <h5>
              <i :class="report.reportTarget === 'review' ? 'bi bi-chat-dots me-2' : 'bi bi-reply me-2'"></i>
              {{ report.reportTarget === 'review' ? '被檢舉的評論內容' : '被檢舉的回覆內容' }}
            </h5>
            <div class="preview-box" v-if="reviewMap[report.reviewId]">
              <div v-if="report.reportTarget === 'review'">
                {{ reviewMap[report.reviewId].reviewText }}
              </div>
              <div v-else-if="report.reportTarget === 'reply'">
                {{ reviewMap[report.reviewId].replyText }}
              </div>
              <div v-else class="text-muted">無法顯示內容</div>
            </div>
            <div v-else class="loading-content">
              <div class="spinner-border spinner-border-sm text-secondary me-2" role="status">
                <span class="visually-hidden">載入中...</span>
              </div>
              載入內容中...
            </div>
          </div>
        </div>

        <div class="report-actions">
          <div class="action-links">
            <button class="btn btn-sm btn-outline-primary" @click="openReportDetails(report.id)">
              <i class="bi bi-info-circle me-1"></i>
              檢舉詳情
            </button>
          </div>
          <div class="action-buttons">
            <button class="btn btn-sm btn-success" @click="rejectReport(report)">
              <i class="bi bi-x-circle me-1"></i>
              駁回檢舉
            </button>
            <button class="btn btn-sm btn-danger" @click="approveReport(report)">
              <i class="bi bi-trash me-1"></i>
              核准並刪除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 處理檢舉 Modal -->
    <div class="modal fade" id="processReportModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isApproving ? '核准檢舉並刪除內容' : '駁回檢舉' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedReport">
              <div class="alert" :class="isApproving ? 'alert-danger' : 'alert-success'">
                <p>
                  <strong v-if="isApproving">您即將核准此檢舉並刪除被檢舉的內容。</strong>
                  <strong v-else>您即將駁回此檢舉並恢復內容可見性。</strong>
                </p>
                <p class="mb-0">檢舉類型：{{ selectedReport.reportTarget === 'review' ? '評論' : '回覆' }}</p>
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
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
            <button 
              type="button" 
              :class="isApproving ? 'btn btn-danger' : 'btn btn-success'"
              @click="processSelectedReport"
            >
              {{ isApproving ? '確認核准並刪除' : '確認駁回檢舉' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 檢舉詳情組件 -->
    <ReportDetails
      v-if="showReportDetails"
      :reportId="selectedReportId"
      :currentUser="currentUser"
      @processed="refreshReports"
      @close="showReportDetails = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import { Modal } from 'bootstrap';
import ReportDetails from './ReportDetails.vue';

export default {
  name: 'AdminReportManager',
  components: {
    ReportDetails
  },
  props: {
    currentUser: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    // 確保只有管理員可以使用
    if (props.currentUser.role !== 'admin') {
      console.error('只有管理員可以訪問此組件');
    }

    // 檢舉列表
    const pendingReports = ref([]);
    const loading = ref(true);
    const activeFilter = ref('all'); // 'all', 'review', 'reply'
    
    // 相關評價的快取
    const reviewMap = ref({});
    
    // 處理檢舉相關
    const selectedReport = ref(null);
    const isApproving = ref(false);
    const handlerNote = ref('');
    const processReportModal = ref(null);
    
    // 檢舉詳情相關
    const selectedReportId = ref(null);
    const showReportDetails = ref(false);
    
    // 過濾後的檢舉列表
    const filteredReports = computed(() => {
      if (activeFilter.value === 'all') {
        return pendingReports.value;
      } else {
        return pendingReports.value.filter(report => report.reportTarget === activeFilter.value);
      }
    });
    
    // 獲取待處理的檢舉
    const fetchPendingReports = async () => {
      loading.value = true;
      try {
        const response = await axios.get('/api/review-reports/pending');
        pendingReports.value = response.data;
        
        // 提取所有評價ID用於載入詳情
        const reviewIds = [...new Set(pendingReports.value.map(report => report.reviewId))];
        await fetchReviewDetails(reviewIds);
      } catch (error) {
        console.error('獲取待處理檢舉失敗:', error);
        alert('獲取檢舉失敗，請稍後再試');
      } finally {
        loading.value = false;
      }
    };
    
    // 獲取評價詳情
    const fetchReviewDetails = async (reviewIds) => {
      try {
        const loadPromises = reviewIds.map(async (reviewId) => {
          if (!reviewMap.value[reviewId]) {
            try {
              const response = await axios.get(`/api/reviews/${reviewId}`, {
                params: { userId: props.currentUser.id }
              });
              reviewMap.value[reviewId] = response.data;
            } catch (err) {
              console.error(`獲取評價 ${reviewId} 失敗:`, err);
              reviewMap.value[reviewId] = { error: true };
            }
          }
        });
        
        await Promise.all(loadPromises);
      } catch (error) {
        console.error('獲取評價詳情失敗:', error);
      }
    };
    
    // 設置過濾器
    const setFilter = (filter) => {
      activeFilter.value = filter;
    };
    
    // 重新整理檢舉列表
    const refreshReports = () => {
      fetchPendingReports();
    };
    
    // 開啟檢舉詳情
    const openReportDetails = (reportId) => {
      // 先確保清理之前可能存在的模態遮罩
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => {
        backdrop.remove();
      });
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // 設置 selectedReportId 和顯示狀態
      selectedReportId.value = reportId;
      showReportDetails.value = true;
    };
    
    // 核准檢舉
    const approveReport = (report) => {
      selectedReport.value = report;
      isApproving.value = true;
      handlerNote.value = '';
      
      if (processReportModal.value) {
        processReportModal.value.show();
      } else {
        const modalElement = document.getElementById('processReportModal');
        if (modalElement) {
          processReportModal.value = new Modal(modalElement);
          processReportModal.value.show();
        }
      }
    };
    
    // 駁回檢舉
    const rejectReport = (report) => {
      selectedReport.value = report;
      isApproving.value = false;
      handlerNote.value = '';
      
      if (processReportModal.value) {
        processReportModal.value.show();
      } else {
        const modalElement = document.getElementById('processReportModal');
        if (modalElement) {
          processReportModal.value = new Modal(modalElement);
          processReportModal.value.show();
        }
      }
    };
    
    // 處理選中的檢舉
    const processSelectedReport = async () => {
      if (!selectedReport.value || !handlerNote.value.trim()) {
        alert('請輸入處理備註');
        return;
      }
      
      try {
        if (isApproving.value) {
          // 核准檢舉並刪除內容
          await axios.put(`/api/review-reports/${selectedReport.value.id}/approve-and-remove`, {
            handlerNote: handlerNote.value
          });
          alert('已核准檢舉並刪除內容');
        } else {
          // 駁回檢舉
          await axios.put(`/api/review-reports/${selectedReport.value.id}/process`, {
            status: 'rejected',
            handlerNote: handlerNote.value
          });
          alert('已駁回檢舉並恢復內容可見性');
        }
        
        // 關閉模態視窗
        if (processReportModal.value) {
          processReportModal.value.hide();
        }
        
        // 手動移除模態窗口背景
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
          backdrop.remove();
        });
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // 重新載入檢舉列表
        fetchPendingReports();
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
    
    // 監聽檢舉詳情顯示狀態
    watch(showReportDetails, (newVal, oldVal) => {
      if (!newVal && oldVal) {
        // 從詳情視圖返回列表視圖時，確保清理模態遮罩
        setTimeout(() => {
          const backdrops = document.querySelectorAll('.modal-backdrop');
          backdrops.forEach(backdrop => {
            backdrop.remove();
          });
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
        }, 100);
      }
    });
    
    // 初始化
    onMounted(() => {
      // 確保用戶是管理員
      if (props.currentUser && props.currentUser.role === 'admin') {
        fetchPendingReports();
        
        // 初始化模態視窗
        const modalElement = document.getElementById('processReportModal');
        if (modalElement) {
          processReportModal.value = new Modal(modalElement);
        }
      } else {
        console.warn('非管理員用戶嘗試訪問管理員組件');
      }
    });
    
    return {
      pendingReports,
      loading,
      activeFilter,
      reviewMap,
      selectedReport,
      isApproving,
      handlerNote,
      filteredReports,
      selectedReportId,
      showReportDetails,
      setFilter,
      refreshReports,
      openReportDetails,
      approveReport,
      rejectReport,
      processSelectedReport,
      getReportTypeName,
      formatDate
    };
  }
};
</script>

<style scoped>
.admin-panel {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-title {
  font-size: 1.5rem;
  margin: 0;
  color: var(--forest-dark);
  display: flex;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--forest-medium);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  display: block;
  color: var(--forest-light);
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.report-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.report-type {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  padding: 3px 10px;
  border-radius: 4px;
}

.review-type {
  background-color: rgba(13, 110, 253, 0.15);
  color: #0d6efd;
}

.reply-type {
  background-color: rgba(25, 135, 84, 0.15);
  color: #198754;
}

.report-time {
  font-size: 0.85rem;
  color: #6c757d;
}

.report-content {
  padding: 15px;
}

.report-info {
  margin-bottom: 15px;
}

.info-item {
  margin-bottom: 8px;
}

.info-item .label {
  font-weight: 500;
  color: #495057;
  margin-right: 5px;
}

.content-preview {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
}

.content-preview h5 {
  font-size: 1rem;
  margin-bottom: 10px;
  color: #343a40;
  display: flex;
  align-items: center;
}

.preview-box {
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 10px;
  min-height: 60px;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  color: #6c757d;
}

.report-actions {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e0e0e0;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .report-actions {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: space-between;
  }
}
</style>