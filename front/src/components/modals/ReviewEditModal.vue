<!-- ReviewEditModal.vue - 編輯評價的模態窗口組件 -->
<template>
    <div class="modal fade" id="editReviewModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">編輯評價</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="review">
              <form @submit.prevent="saveReviewEdit">
                <div class="mb-3">
                  <label for="reviewText" class="form-label">評價內容</label>
                  <textarea 
                    id="reviewText" 
                    class="form-control" 
                    v-model="editData.reviewText" 
                    rows="4" 
                    required
                  ></textarea>
                </div>
                
                <!-- 整體評分顯示 (僅顯示，不可手動更改) -->
                <div class="mb-3">
                  <label class="form-label">整體評分 (根據以下三項自動計算)</label>
                  <div class="calculated-rating">
                    <div class="stars">
                      <span 
                        v-for="n in 5" 
                        :key="`overall-${n}`"
                        :class="['star', { active: n <= calculatedOverallRating }]"
                      >
                        <i class="bi bi-star-fill"></i>
                      </span>
                    </div>
                    <span class="rating-value">{{ calculatedOverallRating }} / 5</span>
                  </div>
                </div>
                
                <div class="row mb-3">
                  <div class="col-md-4">
                    <label class="form-label">清潔程度</label>
                    <div class="rating-input">
                      <div class="stars">
                        <span 
                          v-for="n in 5" 
                          :key="`cleanliness-${n}`"
                          :class="['star', { active: n <= editData.cleanlinessRating }]"
                          @click="editData.cleanlinessRating = n"
                        >
                          <i class="bi bi-star-fill"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-4">
                    <label class="form-label">便利程度</label>
                    <div class="rating-input">
                      <div class="stars">
                        <span 
                          v-for="n in 5" 
                          :key="`convenience-${n}`"
                          :class="['star', { active: n <= editData.convenienceRating }]"
                          @click="editData.convenienceRating = n"
                        >
                          <i class="bi bi-star-fill"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-4">
                    <label class="form-label">友善程度</label>
                    <div class="rating-input">
                      <div class="stars">
                        <span 
                          v-for="n in 5" 
                          :key="`friendliness-${n}`"
                          :class="['star', { active: n <= editData.friendlinessRating }]"
                          @click="editData.friendlinessRating = n"
                        >
                          <i class="bi bi-star-fill"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="pros" class="form-label">優點</label>
                    <textarea 
                      id="pros" 
                      class="form-control" 
                      v-model="editData.pros" 
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label for="cons" class="form-label">缺點</label>
                    <textarea 
                      id="cons" 
                      class="form-control" 
                      v-model="editData.cons" 
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                
                <!-- 圖片管理部分 -->
                <div class="mb-4">
                  <label class="form-label d-block">評價圖片</label>
                  <div class="image-upload">
                    <div class="image-preview-container">
                      <!-- 顯示現有圖片 -->
                      <div 
                        v-for="(image, index) in reviewImages" 
                        :key="image.id || index" 
                        class="image-preview"
                      >
                        <img :src="processImageUrl(image.imageUrl)" :alt="`評價圖片 ${index + 1}`">
                        <button 
                          type="button" 
                          class="remove-image" 
                          @click="removeReviewImage(index)"
                        >
                          <i class="bi bi-x-circle-fill"></i>
                        </button>
                      </div>
                      
                      <!-- 顯示新上傳的預覽圖片 -->
                      <div 
                        v-for="(file, index) in newPreviewImages" 
                        :key="`new-${index}`" 
                        class="image-preview"
                      >
                        <img :src="file.url" :alt="`新圖片 ${index + 1}`">
                        <button 
                          type="button" 
                          class="remove-image" 
                          @click="removeNewImage(index)"
                        >
                          <i class="bi bi-x-circle-fill"></i>
                        </button>
                      </div>
                      
                      <!-- 上傳按鈕 -->
                      <label v-if="reviewImages.length + newPreviewImages.length < 5" class="upload-new">
                        <input 
                          type="file" 
                          accept="image/*" 
                          @change="onImageSelected" 
                          multiple
                          ref="fileInput"
                        >
                        <div class="upload-icon">
                          <i class="bi bi-plus-lg"></i>
                        </div>
                        <span>新增圖片</span>
                      </label>
                    </div>
                    <small class="form-text text-muted">最多可上傳 5 張圖片，每張大小不超過 5MB</small>
                  </div>
                </div>
                
                <div class="d-flex justify-content-end">
                  <button type="button" class="btn btn-outline-secondary me-2" data-bs-dismiss="modal">取消</button>
                  <button type="submit" class="btn btn-success" :disabled="saving">
                    <i class="bi" :class="saving ? 'bi-hourglass-split' : 'bi-check-circle'"></i>
                    {{ saving ? '儲存中...' : '儲存變更' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue';
  import { Modal } from 'bootstrap';
  import axios from 'axios';
  
  export default {
    name: 'ReviewEditModal',
    props: {
      review: {
        type: Object,
        default: null
      },
      campSiteId: {
        type: [Number, String],
        required: true
      }
    },
    emits: ['edited'],
    setup(props, { emit }) {
      const modal = ref(null);
      const fileInput = ref(null);
      const reviewImages = ref([]);
      const newPreviewImages = ref([]);
      const imagesToDelete = ref([]);
      const saving = ref(false);
      
      // 編輯表單數據
      const editData = ref({
        reviewText: '',
        overallRating: 0,
        cleanlinessRating: 0,
        convenienceRating: 0,
        friendlinessRating: 0,
        pros: '',
        cons: ''
      });
      
      // 監聽 review 變化，更新編輯表單
      watch(() => props.review, async (newReview) => {
        if (!newReview) return;
        
        // 複製評價的基本資訊
        editData.value = {
          reviewText: newReview.reviewText || '',
          overallRating: newReview.overallRating || 0,
          cleanlinessRating: newReview.cleanlinessRating || 0,
          convenienceRating: newReview.convenienceRating || 0,
          friendlinessRating: newReview.friendlinessRating || 0,
          pros: newReview.pros || '',
          cons: newReview.cons || ''
        };
        
        // 重置圖片相關變數
        reviewImages.value = [];
        newPreviewImages.value = [];
        imagesToDelete.value = [];
        
        // 獲取圖片資訊
        try {
          // 從後端獲取評價的圖片列表
          const response = await axios.get(`/api/review-images/review/${newReview.id}`);
          console.log('獲取評價圖片列表成功:', response.data);
          
          if (response.data && Array.isArray(response.data)) {
            // 使用後端返回的圖片數據
            reviewImages.value = response.data.map(img => ({
              id: img.id,
              imageUrl: img.url || img.imageUrl || img.path || ''
            }));
            
            console.log('後端返回的圖片資料:', reviewImages.value);
          } else if (newReview.images && Array.isArray(newReview.images)) {
            // 若直接獲取圖片失敗，但評價對象中有 images 數組
            reviewImages.value = newReview.images.map(img => ({
              id: img.id,
              imageUrl: img.url || img.imageUrl || img.path || ''
            }));
            
            console.log('評價對象中的圖片資料:', reviewImages.value);
          } else if (newReview.imageUrls && Array.isArray(newReview.imageUrls)) {
            // 使用評價對象中的 imageUrls 數組
            reviewImages.value = newReview.imageUrls.map((url, index) => ({
              tempId: `temp-${index}`, // 使用tempId字段標記臨時ID
              imageUrl: url
            }));
            
            console.log('從 imageUrls 創建的圖片資料:', reviewImages.value);
          }
        } catch (error) {
          console.error('獲取評價圖片失敗:', error);
          
          // 錯誤處理：使用評價對象中的圖片資料
          if (newReview.images && Array.isArray(newReview.images)) {
            reviewImages.value = newReview.images.map(img => ({
              id: img.id,
              imageUrl: img.url || img.imageUrl || img.path || ''
            }));
          } else if (newReview.imageUrls && Array.isArray(newReview.imageUrls)) {
            reviewImages.value = newReview.imageUrls.map((url, index) => ({
              tempId: `temp-${index}`,
              imageUrl: url
            }));
          }
        }
      }, { immediate: true });
      
      // 計算整體評分 (三個分類的平均值，四捨五入到最接近的整數)
      const calculatedOverallRating = computed(() => {
        const cleanlinessRating = editData.value.cleanlinessRating || 0;
        const convenienceRating = editData.value.convenienceRating || 0;
        const friendlinessRating = editData.value.friendlinessRating || 0;
        
        if (cleanlinessRating === 0 || convenienceRating === 0 || friendlinessRating === 0) {
          return 0; // 如果有任何一項為零，則整體評分也為零
        }
        
        const average = (cleanlinessRating + convenienceRating + friendlinessRating) / 3;
        return Math.round(average);
      });
    
      // 監聽計算的整體評分變化，自動更新 editData.overallRating
      watch(calculatedOverallRating, (newValue) => {
        editData.value.overallRating = newValue;
      });
      
      // 初始化模態窗口
      onMounted(() => {
        const modalElement = document.getElementById('editReviewModal');
        if (modalElement) {
          modal.value = new Modal(modalElement);
        }
      });
      
      // 處理圖片URL
      const processImageUrl = (url) => {
        if (!url) return '';
        
        // 如果已經是完整 URL，直接返回
        if (url.startsWith('http')) {
          return url;
        }
        
        // 檢查 URL 是否包含檔案名稱部分 (UUID.jpg)
        const hasFileName = /[a-f0-9-]{36}\.jpg$/i.test(url);
        
        // 如果只有檔案名稱，加上前綴路徑
        if (hasFileName && !url.includes('/')) {
          return `/api/images/reviews/${url}`;
        }
        
        // 如果路徑中已包含 'reviews/' 但沒有前綴，添加 API 前綴
        if (url.includes('reviews/') && !url.startsWith('/api/')) {
          return `/api/images/${url}`;
        }
        
        // 如果是相對路徑但不符合上述模式，確保路徑正確
        return url.startsWith('/') ? url : `/${url}`;
      };
      
      // 上傳圖片
      const onImageSelected = (event) => {
        const files = event.target.files;
        if (!files || !files.length) return;
        
        // 更嚴格的檢查 - 檢查現有圖片數量和新圖片總量
        const currentImageCount = reviewImages.value.length + newPreviewImages.value.length;
        const newFilesCount = files.length;
        
        if (currentImageCount + newFilesCount > 5) {
          alert(`最多只能上傳 5 張圖片，目前已有 ${currentImageCount} 張，還可以上傳 ${5 - currentImageCount} 張`);
          // 清空文件輸入框
          if (fileInput.value) {
            fileInput.value.value = '';
          }
          return;
        }
        
        // 處理每個選擇的檔案
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          // 檢查檔案大小
          if (file.size > 5 * 1024 * 1024) {
            alert('圖片大小不能超過 5MB');
            continue;
          }
          
          // 檢查檔案類型
          if (!file.type.startsWith('image/')) {
            alert('只能上傳圖片檔案');
            continue;
          }
          
          // 建立預覽
          const reader = new FileReader();
          reader.onload = (e) => {
            newPreviewImages.value.push({
              file: file,
              url: e.target.result
            });
          };
          reader.readAsDataURL(file);
        }
        
        // 重置檔案輸入欄位
        if (fileInput.value) {
          fileInput.value.value = '';
        }
      };
      
      // 移除評價圖片
      const removeReviewImage = (index) => {
        const imageToRemove = reviewImages.value[index];
        
        console.log('要刪除的圖片:', imageToRemove);
        
        // 只有當圖片有真正的ID時（非臨時ID）才添加到待刪除列表
        if (imageToRemove.id) {
          console.log(`添加圖片 ID ${imageToRemove.id} 到刪除列表`);
          imagesToDelete.value.push(imageToRemove.id);
        } else {
          console.log('此圖片沒有ID或使用臨時ID，僅從界面移除');
        }
        
        // 從本地列表中移除
        reviewImages.value.splice(index, 1);
        console.log('移除後的圖片列表:', reviewImages.value);
      };
      
      // 移除新上傳圖片
      const removeNewImage = (index) => {
        newPreviewImages.value.splice(index, 1);
      };
      
      // 顯示模態窗口
      const show = (review) => {
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
      
      // 儲存評價編輯
      const saveReviewEdit = async () => {
        if (!props.review) return;
        
        // 基本驗證
        if (!editData.value.reviewText.trim()) {
          alert('評價內容不能為空');
          return;
        }
        
        if (!editData.value.cleanlinessRating || 
            !editData.value.convenienceRating || 
            !editData.value.friendlinessRating) {
          alert('請給予所有評分項目評分');
          return;
        }
        
        const totalImages = reviewImages.value.length + newPreviewImages.value.length;
        if (totalImages > 5) {
          alert(`圖片總數不能超過5張，目前有 ${totalImages} 張`);
          return;
        }
        
        saving.value = true;
        let success = false;
        
        try {
          console.log('準備儲存評價編輯:', editData.value);
          console.log('待刪除圖片ID列表:', imagesToDelete.value);
          
          // 1. 首先處理圖片刪除
          if (imagesToDelete.value.length > 0) {
            console.log(`準備刪除 ${imagesToDelete.value.length} 張圖片...`);
            
            for (const imageId of imagesToDelete.value) {
              try {
                console.log(`發送請求刪除圖片 ${imageId}`);
                const response = await axios.delete(`/api/review-images/${imageId}`);
                console.log(`圖片 ${imageId} 刪除結果:`, response.data);
              } catch (err) {
                console.error(`刪除圖片 ${imageId} 失敗:`, err);
                // 繼續刪除其他圖片，不中斷流程
              }
            }
          }
          
          // 2. 更新評價基本資料
          console.log('發送請求更新評價基本資料...');
          const updateData = {
            ...editData.value,
            id: props.review.id,
            campSiteId: props.campSiteId,
            userId: props.review.userId
          };
          
          const response = await axios.put(`/api/reviews/${props.review.id}`, updateData);
          console.log('更新評價 API 回應:', response.data);
          
          // 3. 上傳新增的圖片
          if (newPreviewImages.value.length > 0) {
            console.log(`準備上傳 ${newPreviewImages.value.length} 張新圖片...`);
            
            for (const image of newPreviewImages.value) {
              try {
                const formData = new FormData();
                formData.append('file', image.file);
                formData.append('reviewId', props.review.id);
                
                console.log('上傳圖片，formData:', {
                  file: image.file.name,
                  reviewId: props.review.id
                });
                
                const uploadResponse = await axios.post('/api/review-images/upload', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                console.log('圖片上傳成功:', uploadResponse.data);
              } catch (err) {
                console.error('上傳圖片失敗:', err);
                // 繼續上傳其他圖片，不中斷流程
              }
            }
          }
          
          success = true;
          
          // 保存當前視圖狀態到 localStorage
          localStorage.setItem('currentView', 'reviews');
        } catch (error) {
          console.error('儲存評價編輯失敗:', error);
          alert('儲存評價失敗: ' + (error.response?.data?.message || error.message || '請稍後再試'));
        } finally {
          saving.value = false;
          
          if (success) {
            // 關閉 Modal
            hide();
            
            // 顯示成功訊息
            alert('評價已成功更新');
            
            // 通知父組件編輯成功
            emit('edited', props.review.id);
          }
        }
      };
      
      return {
        editData,
        reviewImages,
        newPreviewImages,
        calculatedOverallRating,
        saving,
        fileInput,
        show,
        hide,
        processImageUrl,
        onImageSelected,
        removeReviewImage,
        removeNewImage,
        saveReviewEdit
      };
    }
  };
  </script>
  
  <style scoped>
  /* Modal 內的評分樣式 */
  .rating-input {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .stars {
    display: flex;
  }
  
  .star {
    font-size: 24px;
    color: #e0e0e0;
    cursor: pointer;
    margin-right: 5px;
    transition: transform 0.1s ease;
  }
  
  .star:hover {
    transform: scale(1.2);
  }
  
  .star i {
    color: #e0e0e0;
  }
  
  .star.active i {
    color: #ffc107;
  }
  
  .rating-value {
    font-weight: 500;
    color: var(--forest-dark);
  }
  
  /* 自動計算評分顯示 */
  .calculated-rating {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px dashed #ced4da;
  }
  
  /* 圖片上傳區域樣式 */
  .image-upload {
    border: 2px dashed #ced4da;
    border-radius: 10px;
    padding: 20px;
    background-color: #f8f9fa;
  }
  
  .image-preview-container {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 10px;
  }
  
  .image-preview {
    width: 100px;
    height: 100px;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid #e0e0e0;
  }
  
  .image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .remove-image {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    padding: 0;
  }
  
  .remove-image:hover {
    background: rgba(220, 53, 69, 0.8);
  }
  
  .upload-new {
    width: 100px;
    height: 100px;
    border: 2px dashed #ced4da;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #6c757d;
    transition: all 0.2s ease;
  }
  
  .upload-new:hover {
    border-color: var(--forest-medium);
    background-color: rgba(53, 102, 72, 0.05);
    color: var(--forest-dark);
  }
  
  .upload-icon {
    font-size: 24px;
    margin-bottom: 5px;
  }
  
  .upload-new input[type="file"] {
    display: none;
  }
  </style>