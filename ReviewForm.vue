<script setup>
import { ref } from 'vue';
import { reviewApi, reviewImageApi } from '../services/reviewService';

const props = defineProps({
  campSiteId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['reviewCreated']);

// 評價表單數據 - 修改預設評分為0
const form = ref({
  userId: localStorage.getItem('userId') || '1', // 假設已登入用戶
  campSiteId: props.campSiteId,
  reviewText: '',
  overallRating: 0,
  cleanlinessRating: 0,
  convenienceRating: 0,
  friendlinessRating: 0,
  pros: '',
  cons: ''
});

// 評分選項
const ratings = [1, 2, 3, 4, 5];

// 提交狀態
const isSubmitting = ref(false);
const message = ref('');
const messageType = ref('');

// 圖片相關
const selectedFiles = ref([]);
const previewImages = ref([]);
const fileInput = ref(null);

// 觸發文件選擇器
const triggerFileInput = () => {
  fileInput.value.click();
};

// 處理圖片選擇
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  
  if (files.length > 5) {
    message.value = '最多只能上傳5張圖片';
    messageType.value = 'error';
    return;
  }
  
  selectedFiles.value = files;
  
  // 創建預覽
  previewImages.value = [];
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImages.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

// 移除圖片
const removeImage = (index) => {
  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);
  previewImages.value = previewImages.value.filter((_, i) => i !== index);
};

// 提交表單
const submitReview = async () => {
  if (!form.value.reviewText.trim()) {
    message.value = '請填寫評價內容';
    messageType.value = 'error';
    return;
  }
  
  // 檢查是否有選擇評分
  if (form.value.overallRating === 0) {
    message.value = '請為營地提供總體評分';
    messageType.value = 'error';
    return;
  }
  
  try {
    isSubmitting.value = true;
    message.value = '提交中...';
    messageType.value = 'info';
    
    // 發送請求創建評價
    const result = await reviewApi.createReview({
      ...form.value,
      campSiteId: props.campSiteId
    });
    
    // 如果有選擇圖片，則上傳圖片
    if (selectedFiles.value.length > 0) {
      try {
        await reviewImageApi.uploadMultipleImages(selectedFiles.value, result.id);
      } catch (imageError) {
        console.error('圖片上傳失敗:', imageError);
        message.value = '評價已提交，但圖片上傳失敗';
        messageType.value = 'warning';
        // 仍然繼續處理，因為評價已成功創建
      }
    }
    
    // 清空表單
    form.value = {
      userId: localStorage.getItem('userId') || '1',
      campSiteId: props.campSiteId,
      reviewText: '',
      overallRating: 0,
      cleanlinessRating: 0,
      convenienceRating: 0,
      friendlinessRating: 0,
      pros: '',
      cons: ''
    };
    selectedFiles.value = [];
    previewImages.value = [];
    
    message.value = '評價提交成功！';
    messageType.value = 'success';
    
    // 通知父組件評價創建成功
    emit('reviewCreated', result);
  } catch (error) {
    console.error('提交評價失敗:', error);
    message.value = `提交失敗: ${error.message}`;
    messageType.value = 'error';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="review-form-container">
    <h2>發表評價</h2>
    
    <form @submit.prevent="submitReview">
      <div class="rating-section">
        <div class="rating-item">
          <label>總體評分:</label>
          <div class="stars">
            <span 
              v-for="rating in ratings" 
              :key="`overall-${rating}`"
              class="star"
              :class="{ 'filled': rating <= form.overallRating }"
              @click="form.overallRating = rating"
            >
              ★
            </span>
          </div>
        </div>
        
        <div class="rating-item">
          <label>清潔度:</label>
          <div class="stars">
            <span 
              v-for="rating in ratings" 
              :key="`cleanliness-${rating}`"
              class="star"
              :class="{ 'filled': rating <= form.cleanlinessRating }"
              @click="form.cleanlinessRating = rating"
            >
              ★
            </span>
          </div>
        </div>
        
        <div class="rating-item">
          <label>便利性:</label>
          <div class="stars">
            <span 
              v-for="rating in ratings" 
              :key="`convenience-${rating}`"
              class="star"
              :class="{ 'filled': rating <= form.convenienceRating }"
              @click="form.convenienceRating = rating"
            >
              ★
            </span>
          </div>
        </div>
        
        <div class="rating-item">
          <label>友善度:</label>
          <div class="stars">
            <span 
              v-for="rating in ratings" 
              :key="`friendliness-${rating}`"
              class="star"
              :class="{ 'filled': rating <= form.friendlinessRating }"
              @click="form.friendlinessRating = rating"
            >
              ★
            </span>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="reviewText">評價內容:</label>
        <textarea 
          id="reviewText" 
          v-model="form.reviewText"
          rows="5"
          placeholder="請分享您的住宿體驗..."
          required
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="pros">優點:</label>
        <input 
          type="text" 
          id="pros"
          v-model="form.pros"
          placeholder="請分享此營地的優點..."
        />
      </div>
      
      <div class="form-group">
        <label for="cons">缺點:</label>
        <input 
          type="text" 
          id="cons"
          v-model="form.cons"
          placeholder="請分享此營地的缺點..."
        />
      </div>
      
      <!-- 圖片上傳部分 -->
      <div class="form-group">
        <label for="images">上傳圖片 (最多5張):</label>
        <div class="file-upload">
          <input 
            type="file" 
            id="images" 
            multiple 
            accept="image/*" 
            @change="handleFileSelect"
            ref="fileInput"
          />
          <button type="button" class="upload-btn" @click="triggerFileInput">
            選擇圖片
          </button>
          <span class="file-info" v-if="selectedFiles.length > 0">
            已選 {{ selectedFiles.length }} 張圖片
          </span>
        </div>
        
        <!-- 圖片預覽 -->
        <div v-if="previewImages.length > 0" class="image-previews">
          <div v-for="(preview, index) in previewImages" :key="index" class="image-preview-item">
            <img :src="preview" alt="Preview" />
            <button type="button" class="remove-btn" @click="removeImage(index)">×</button>
          </div>
        </div>
      </div>
      
      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>
      
      <div class="form-actions">
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? '提交中...' : '發表評價' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #7FB069; /* 草綠色主色調 */
  --secondary-color: #9BC995; /* 淺草綠色次要色調 */
  --accent-color: #5C913B; /* 深草綠色強調色 */
  --background-color: #F0F7EE; /* 非常淺草綠色背景 */
  --text-color: #2C5530; /* 深綠色文字 */
  --border-color: #B5D6A7; /* 淺綠色邊框 */
}

.review-form-container {
  background-color: var(--background-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  border: 1px solid var(--border-color);
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--accent-color);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 10px;
}

.rating-section {
  margin-bottom: 20px;
}

.rating-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.rating-item label {
  width: 80px;
  text-align: right;
  margin-right: 10px;
  color: var(--text-color);
}

.stars {
  display: flex;
}

.star {
  font-size: 24px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.star.filled {
  color: var(--accent-color);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: var(--text-color);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: inherit;
  font-size: 16px;
  background-color: white;
}

/* 圖片上傳樣式 */
.file-upload {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.file-upload input[type="file"] {
  display: none;
}

.upload-btn {
  background-color: var(--secondary-color);
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.file-info {
  margin-left: 10px;
  color: var(--text-color);
}

.image-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.image-preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.form-actions {
  margin-top: 20px;
}

button[type="submit"] {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.message {
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
}

.info {
  background-color: #e2f3fd;
  color: #0c5460;
}

.success {
  background-color: #d4edda;
  color: #155724;
}

.warning {
  background-color: #fff3cd;
  color: #856404;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}
</style>