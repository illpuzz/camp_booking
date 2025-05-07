<!-- components/views/ReviewsView.vue -->
<template>
    <div class="reviews-view">
      <!-- 管理員檢舉管理面板（僅管理員可見） -->
      <div v-if="currentUser.role === 'admin'" class="admin-controls mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="admin-title"><i class="bi bi-shield-check me-2"></i>管理員專區</h2>
          <div class="control-buttons">
            <button 
              class="btn btn-admin-reviews me-2" 
              @click="adminView = 'reviews'"
              :class="{ active: adminView === 'reviews' }"
            >
              <i class="bi bi-list-stars me-1"></i>
              評價管理
            </button>
            <button 
              class="btn btn-admin-reports" 
              @click="adminView = 'reports'"
              :class="{ active: adminView === 'reports' }"
            >
              <i class="bi bi-flag-fill me-1"></i>
              檢舉管理
            </button>
          </div>
        </div>
      </div>
      
      <!-- 管理員檢舉管理面板 -->
      <AdminReportManager 
        v-if="currentUser.role === 'admin' && adminView === 'reports'"
        :currentUser="currentUser"
      />
      
      <!-- 評價相關功能（所有用戶可見） -->
      <div v-if="(adminView === 'reviews' || currentUser.role !== 'admin')">
        <ReviewFilter 
          @filter-applied="applyFilters"
          @add-review="handleAddReviewClick"
          :canAddReview="currentUser.role === 'user'"
        />
        
        <!-- 固定使用ID 1，不進行特別的綁定 -->
        <ReviewsList 
          :campSiteId="1"
          :filters="filters"
          :currentUser="currentUser"
          @handle-report="handleReport"
          ref="reviewsListRef"
        />
      </div>
      
      <!-- 新增評價 Modal -->
      <div class="modal fade" id="addReviewModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">新增評價</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <!-- 固定使用ID 1，不進行特別的綁定 -->
              <AddReviewForm 
                :campSiteId="1"
                :userId="currentUser ? currentUser.id : null"
                @review-added="handleReviewAdded"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 管理員處理檢舉 Modal -->
      <div class="modal fade" id="handleReportModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">處理檢舉</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div v-if="selectedReport">
                <div class="alert alert-info">
                  <strong>檢舉類型：</strong> {{ selectedReport.target === 'review' ? '評價' : '回覆' }}
                  <hr>
                  <strong>檢舉原因：</strong> {{ getReportTypeName(selectedReport.reportType) }}
                  <hr>
                  <strong>詳細說明：</strong> {{ selectedReport.reason }}
                </div>
                
                <div class="form-group mb-3">
                  <label for="handlerNote" class="form-label">處理備註：</label>
                  <textarea id="handlerNote" class="form-control" v-model="reportHandlerNote" rows="3"></textarea>
                </div>
                
                <div class="d-flex gap-2 justify-content-end">
                  <button class="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
                  <button class="btn btn-danger" @click="approveReport">批准檢舉並移除內容</button>
                  <button class="btn btn-success" @click="rejectReport">駁回檢舉</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive } from 'vue';
  import { Modal } from 'bootstrap';
  import axios from 'axios';
  
  import AdminReportManager from '@/components/admin/AdminReportManager.vue';
  import ReviewFilter from '@/components/reviews/ReviewFilter.vue';
  import ReviewsList from '@/components/reviews/ReviewsList.vue';
  import AddReviewForm from '@/components/forms/AddReviewForm.vue';
  
  export default {
    name: 'ReviewsView',
    components: {
      AdminReportManager,
      ReviewFilter,
      ReviewsList,
      AddReviewForm
    },
    props: {
      currentUser: {
        type: Object,
        required: true
      }
    },
    emits: ['handle-report'],
    setup(props, { emit }) {
      // 管理員視圖狀態
      const adminView = ref('reviews'); // 'reviews' 或 'reports'
      
      // 篩選條件
      const filters = reactive({
        keyword: '',
        sortBy: 'createdAt',
        direction: 'DESC',
        minRating: 0
      });
      
      // 模態視窗引用
      const addReviewModal = ref(null);
      const handleReportModal = ref(null);
      
      // ReviewsList 組件引用
      const reviewsListRef = ref(null);
      
      // 檢舉相關
      const selectedReport = ref(null);
      const reportHandlerNote = ref('');
      
      // 檢舉類型名稱
      const reportTypes = {
        1: '不實內容',
        2: '冒犯性內容或語言',
        3: '廣告或垃圾訊息',
        4: '暴力或仇恨言論',
        5: '侵犯隱私權',
        6: '其他'
      };
      
      const getReportTypeName = (type) => {
        return reportTypes[type] || '未知';
      };
      
      // 應用篩選條件
      const applyFilters = (newFilters) => {
        Object.assign(filters, newFilters);
      };
      
      // 直接操作模態視窗的方法
      const openAddReviewModal = () => {
        // 直接使用 Bootstrap 的 Modal 靜態方法
        const modalElement = document.getElementById('addReviewModal');
        if (modalElement) {
          const modal = new Modal(modalElement);
          modal.show();
          // 保存引用以便稍後關閉
          addReviewModal.value = modal;
        } else {
          console.error('找不到新增評價模態視窗元素');
        }
      };
  
      const closeAddReviewModal = () => {
        const modalElement = document.getElementById('addReviewModal');
        if (modalElement) {
          // 嘗試用兩種方式關閉模態視窗
          if (addReviewModal.value) {
            try {
              addReviewModal.value.hide();
            } catch (e) {
              console.log('使用實例關閉模態視窗失敗', e);
            }
          }
          // 作為備份，嘗試使用 Bootstrap 靜態方法
          try {
            const modalInstance = Modal.getInstance(modalElement);
            if (modalInstance) {
              modalInstance.hide();
            }
          } catch (e) {
            console.log('使用靜態方法關閉模態視窗失敗', e);
          }
        }
      };
      
      // 處理新增評價按鈕點擊
      const handleAddReviewClick = () => {
        openAddReviewModal();
      };
      
      // 處理新增的評價
      const handleReviewAdded = () => {
        console.log('評價已添加，準備關閉模態視窗');
        
        // 關閉模態視窗
        closeAddReviewModal();
        
        // 顯示成功通知
        alert('評價已成功添加！');
        
        // 確保當前視圖為評價系統
        localStorage.setItem('currentView', 'reviews');
        
        // 刷新評價列表
        if (reviewsListRef.value) {
          if (typeof reviewsListRef.value.fetchReviews === 'function') {
            setTimeout(() => {
              reviewsListRef.value.fetchReviews();
            }, 100);
          }
        }
      };
      
      // 處理檢舉 - 使用與新增評價相同的直接操作方式
      const handleReport = (report) => {
        selectedReport.value = report;
        reportHandlerNote.value = '';
        
        const modalElement = document.getElementById('handleReportModal');
        if (modalElement) {
          const modal = new Modal(modalElement);
          modal.show();
          // 保存引用以便稍後關閉
          handleReportModal.value = modal;
        } else {
          console.error('找不到處理檢舉模態視窗元素');
        }
      };
      
      // 關閉檢舉模態視窗
      const closeReportModal = () => {
        const modalElement = document.getElementById('handleReportModal');
        if (modalElement) {
          // 嘗試用兩種方式關閉模態視窗
          if (handleReportModal.value) {
            try {
              handleReportModal.value.hide();
            } catch (e) {
              console.log('使用實例關閉模態視窗失敗', e);
            }
          }
          // 作為備份，嘗試使用 Bootstrap 靜態方法
          try {
            const modalInstance = Modal.getInstance(modalElement);
            if (modalInstance) {
              modalInstance.hide();
            }
          } catch (e) {
            console.log('使用靜態方法關閉模態視窗失敗', e);
          }
        }
      };
      
      // 批准檢舉
      const approveReport = async () => {
        try {
          if (!selectedReport.value) return;
          
          await axios.put(`/api/review-reports/${selectedReport.value.id}/approve-and-remove`, {
            handlerNote: reportHandlerNote.value
          });
          
          // 關閉模態視窗
          closeReportModal();
          selectedReport.value = null;
          
          // 提示成功
          alert('檢舉已批准，內容已移除');
          
          // 確保當前視圖為評價系統
          localStorage.setItem('currentView', 'reviews');
          
          // 刷新評價列表
          if (reviewsListRef.value) {
            if (typeof reviewsListRef.value.fetchReviews === 'function') {
              setTimeout(() => {
                reviewsListRef.value.fetchReviews();
              }, 100);
            }
          }
        } catch (error) {
          console.error('處理檢舉失敗:', error);
          alert('處理失敗，請稍後再試');
        }
      };
      
      // 駁回檢舉
      const rejectReport = async () => {
        try {
          if (!selectedReport.value) return;
          
          await axios.put(`/api/review-reports/${selectedReport.value.id}/process`, {
            status: 'rejected',
            handlerNote: reportHandlerNote.value
          });
          
          // 關閉模態視窗
          closeReportModal();
          selectedReport.value = null;
          
          // 提示成功
          alert('檢舉已駁回，內容已恢復可見');
          
          // 確保當前視圖為評價系統
          localStorage.setItem('currentView', 'reviews');
          
          // 刷新評價列表
          if (reviewsListRef.value) {
            if (typeof reviewsListRef.value.fetchReviews === 'function') {
              setTimeout(() => {
                reviewsListRef.value.fetchReviews();
              }, 100);
            }
          }
        } catch (error) {
          console.error('處理檢舉失敗:', error);
          alert('處理失敗，請稍後再試');
        }
      };
      
      return {
        adminView,
        filters,
        selectedReport,
        reportHandlerNote,
        reviewsListRef,
        getReportTypeName,
        applyFilters,
        handleAddReviewClick,
        handleReviewAdded,
        handleReport,
        approveReport,
        rejectReport
      };
    }
  };
  </script>
  
  <style scoped>
  /* 管理員控制區塊 */
  .admin-controls {
    background-color: white;
    border-radius: 12px;
    padding: 15px 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
  }
  
  .admin-title {
    font-size: 1.3rem;
    margin: 0;
    color: var(--forest-dark);
  }
  
  .control-buttons .btn {
    position: relative;
    padding: 8px 16px;
    border-width: 0;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  /* 評價管理按鈕 - 深藍色主題 */
  .control-buttons .btn-admin-reviews {
    color: #0d6efd;
    background-color: rgba(13, 110, 253, 0.1);
  }
  
  .control-buttons .btn-admin-reviews:hover {
    background-color: rgba(13, 110, 253, 0.2);
  }
  
  .control-buttons .btn-admin-reviews.active {
    color: white;
    background-color: #0d6efd;
  }
  
  /* 檢舉管理按鈕 - 深紅色主題 */
  .control-buttons .btn-admin-reports {
    color: #dc3545;
    background-color: rgba(220, 53, 69, 0.1);
  }
  
  .control-buttons .btn-admin-reports:hover {
    background-color: rgba(220, 53, 69, 0.2);
  }
  
  .control-buttons .btn-admin-reports.active {
    color: white;
    background-color: #dc3545;
  }
  
  @media (max-width: 768px) {
    .admin-controls {
      padding: 12px 15px;
    }
    
    .admin-controls .d-flex {
      flex-direction: column;
      gap: 10px;
    }
    
    .control-buttons {
      display: flex;
      width: 100%;
    }
    
    .control-buttons .btn {
      flex: 1;
    }
  }
  </style>