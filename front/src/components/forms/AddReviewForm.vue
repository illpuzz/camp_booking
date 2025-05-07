<!-- AddReviewForm.vue - 新增評價表單組件 (修改版：整體評分自動計算) -->
<template>
  <div class="add-review-form">
    <form @submit.prevent="submitReview">
      <!-- 評價文本 -->
      <div class="mb-3">
        <label for="reviewText" class="form-label required">評價內容</label>
        <textarea 
          id="reviewText" 
          v-model="review.reviewText" 
          class="form-control" 
          rows="4"
          placeholder="分享您對營地的體驗和看法..."
          required
        ></textarea>
      </div>
      
      <!-- 各項評分 - 使用計算整體評分 -->
      <div class="row mb-4">
        <div class="col-md-4 mb-3">
          <label class="form-label required">清潔程度</label>
          <div class="rating-input">
            <div class="stars">
              <span 
                v-for="n in 5" 
                :key="`cleanliness-${n}`"
                :class="['star', { active: n <= review.cleanlinessRating }]"
                @click="review.cleanlinessRating = n"
              >
                <i class="bi bi-star-fill"></i>
              </span>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-3">
          <label class="form-label required">便利程度</label>
          <div class="rating-input">
            <div class="stars">
              <span 
                v-for="n in 5" 
                :key="`convenience-${n}`"
                :class="['star', { active: n <= review.convenienceRating }]"
                @click="review.convenienceRating = n"
              >
                <i class="bi bi-star-fill"></i>
              </span>
            </div>
          </div>
        </div>
        
        <div class="col-md-4 mb-3">
          <label class="form-label required">友善程度</label>
          <div class="rating-input">
            <div class="stars">
              <span 
                v-for="n in 5" 
                :key="`friendliness-${n}`"
                :class="['star', { active: n <= review.friendlinessRating }]"
                @click="review.friendlinessRating = n"
              >
                <i class="bi bi-star-fill"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 整體評分顯示 (僅顯示，不可手動更改) -->
      <div class="mb-4">
        <label class="form-label">整體評分 (根據以上三項自動計算)</label>
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
      
      <!-- 優點與缺點 -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="mb-3">
            <label for="pros" class="form-label">營地優點</label>
            <textarea 
              id="pros" 
              v-model="review.pros" 
              class="form-control" 
              rows="3"
              placeholder="您喜歡這個營地的哪些方面？"
            ></textarea>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="mb-3">
            <label for="cons" class="form-label">營地缺點</label>
            <textarea 
              id="cons" 
              v-model="review.cons" 
              class="form-control" 
              rows="3"
              placeholder="還有哪些地方需要改進？"
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- 上傳圖片 -->
      <div class="mb-4">
        <label class="form-label d-block">上傳圖片 (可選)</label>
        <div class="image-upload">
          <div class="image-preview-container">
            <div 
              v-for="(file, index) in previewImages" 
              :key="index" 
              class="image-preview"
            >
              <img :src="file.url" :alt="`預覽圖片 ${index + 1}`">
              <button 
                type="button" 
                class="remove-image" 
                @click="removeImage(index)"
              >
                <i class="bi bi-x-circle-fill"></i>
              </button>
            </div>
            
            <label v-if="previewImages.length < 5" class="upload-new">
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
      
      <!-- 提交按鈕 -->
      <div class="text-center">
        <button type="submit" class="btn btn-success btn-lg" :disabled="submitting || !isFormValid">
          <i class="bi" :class="submitting ? 'bi-hourglass-split' : 'bi-check-circle'"></i>
          {{ submitting ? '提交中...' : '發佈評價' }}
        </button>
      </div>
    </form>
    
    <!-- 錯誤提示 -->
    <div v-if="error" class="alert alert-danger mt-3">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import axios from 'axios';

export default {
  name: 'AddReviewForm',
  props: {
    campSiteId: {
      type: [Number, String],
      required: true
    },
    userId: {
      type: [Number, String],
      required: true
    }
  },
  emits: ['review-added'],
  setup(props, { emit }) {
    // 評價表單資料
    const review = reactive({
      campSiteId: props.campSiteId,
      userId: props.userId,
      userName: '用戶' + props.userId, // 實際應用中應從用戶資料獲取
      reviewText: '',
      overallRating: 0, // 整體評分將由三個細項評分計算得出
      cleanlinessRating: 0,
      convenienceRating: 0,
      friendlinessRating: 0,
      pros: '',
      cons: ''
    });
    
    // 計算整體評分 (三個分類的平均值，四捨五入到最接近的整數)
    const calculatedOverallRating = computed(() => {
      if (review.cleanlinessRating === 0 || review.convenienceRating === 0 || review.friendlinessRating === 0) {
        return 0; // 如果有任何一項為零，則整體評分也為零
      }
      
      const average = (review.cleanlinessRating + review.convenienceRating + review.friendlinessRating) / 3;
      return Math.round(average);
    });
    
    // 表單驗證
    const isFormValid = computed(() => {
      return review.reviewText.trim() !== '' && 
             review.cleanlinessRating > 0 &&
             review.convenienceRating > 0 &&
             review.friendlinessRating > 0;
    });
    
    // 監聽計算的整體評分變化，自動更新 review.overallRating
    watch(calculatedOverallRating, (newValue) => {
      review.overallRating = newValue;
    });
    
    // 圖片相關
    const fileInput = ref(null);
    const previewImages = ref([]);
    const uploadedImages = ref([]);
    
    // 錯誤訊息
    const error = ref('');
    
    // 提交狀態
    const submitting = ref(false);
    
    // 選擇圖片
    const onImageSelected = (event) => {
      const files = event.target.files;
      
      if (!files || files.length === 0) return;
      
      // 檢查是否超過最大數量
      if (previewImages.value.length + files.length > 5) {
        error.value = '最多只能上傳 5 張圖片';
        return;
      }
      
      // 處理每個選擇的檔案
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 檢查文件大小
        if (file.size > 5 * 1024 * 1024) {
          error.value = '圖片大小不能超過 5MB';
          continue;
        }
        
        // 檢查文件類型
        if (!file.type.startsWith('image/')) {
          error.value = '只能上傳圖片檔案';
          continue;
        }
        
        // 建立預覽
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImages.value.push({
            file: file,
            url: e.target.result
          });
        };
        reader.readAsDataURL(file);
      }
      
      // 重置文件輸入欄位
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };
    
    // 移除預覽圖片
    const removeImage = (index) => {
      previewImages.value.splice(index, 1);
    };
    
    // 上傳圖片
    const uploadImages = async (reviewId) => {
      try {
        const uploadPromises = [];
        
        for (const image of previewImages.value) {
          const formData = new FormData();
          formData.append('file', image.file);
          formData.append('reviewId', reviewId);
          
          const promise = axios.post('/api/review-images/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          uploadPromises.push(promise);
        }
        
        const results = await Promise.all(uploadPromises);
        uploadedImages.value = results.map(res => res.data);
        
        return true;
      } catch (err) {
        console.error('上傳圖片失敗:', err);
        error.value = '上傳圖片失敗: ' + (err.response?.data?.message || err.message);
        return false;
      }
    };
    
    // 提交評價
    const submitReview = async () => {
      // 清除先前的錯誤
      error.value = '';
      
      // 表單驗證
      if (!review.reviewText.trim()) {
        error.value = '請填寫評價內容';
        return;
      }
      
      if (review.cleanlinessRating === 0 || review.convenienceRating === 0 || review.friendlinessRating === 0) {
        error.value = '請給予所有評分項目評分';
        return;
      }
      
      // 確保 userId 是數字類型
      review.userId = Number(props.userId);
      
      // 檢查 userId 是否存在且有效
      if (!review.userId) {
        error.value = '用戶未登入或用戶ID無效';
        return;
      }
      
      // 確保整體評分是計算後的結果
      review.overallRating = calculatedOverallRating.value;
      
      // 開始提交
      submitting.value = true;
      
      try {
        console.log('提交評價數據:', JSON.stringify(review)); // 調試用
        
        // 先創建評價
        const response = await axios.post('/api/reviews', review);
        const newReview = response.data;
        
        // 如果有圖片，上傳圖片
        if (previewImages.value.length > 0) {
          const uploadSuccess = await uploadImages(newReview.id);
          
          if (!uploadSuccess) {
            // 圖片上傳失敗，但評價已創建
            error.value += ' (評價已創建，但圖片上傳失敗)';
          }
        }
        
        // 清空表單
        resetForm();
        
        // 通知父組件
        emit('review-added', newReview);

        
      } catch (err) {
        console.error('提交評價失敗:', err);
        error.value = '提交評價失敗: ' + (err.response?.data?.message || err.message);
      } finally {
        submitting.value = false;
      }
    };
    
    // 重置表單
    const resetForm = () => {
      review.reviewText = '';
      review.overallRating = 0; // 自動計算的整體評分也重置
      review.cleanlinessRating = 0;
      review.convenienceRating = 0;
      review.friendlinessRating = 0;
      review.pros = '';
      review.cons = '';
      previewImages.value = [];
      uploadedImages.value = [];
      error.value = '';
    };
    
    return {
      review,
      fileInput,
      previewImages,
      error,
      submitting,
      calculatedOverallRating,
      isFormValid,
      onImageSelected,
      removeImage,
      submitReview
    };
  }
};
</script>

<style scoped>
.add-review-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-label.required::after {
  content: "*";
  color: #dc3545;
  margin-left: 4px;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.calculated-rating {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ced4da;
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