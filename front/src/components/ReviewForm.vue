<!-- src/components/ReviewForm.vue -->
<template>
    <div class="review-form">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h3 class="mb-0">{{ isEditing ? '編輯評價' : '撰寫評價' }}</h3>
        </div>
        <div class="card-body">
          <form @submit.prevent="submitForm">
            <!-- 整體評分 -->
            <div class="mb-4">
              <label class="form-label">整體評分</label>
              <div class="d-flex align-items-center">
                <star-rating
                  v-model:rating="form.overallRating"
                  :interactive="true"
                  :size="32"
                  :readonly="false"
                ></star-rating>
                <span v-if="form.overallRating === 0" class="text-danger ms-3">
                  請選擇評分
                </span>
              </div>
            </div>
  
            <!-- 詳細評分 -->
            <div class="row mb-4">
              <div class="col-md-4">
                <label class="form-label">清潔度</label>
                <star-rating
                  v-model:rating="form.cleanlinessRating"
                  :interactive="true"
                  :size="24"
                  :readonly="false"
                ></star-rating>
              </div>
              <div class="col-md-4">
                <label class="form-label">便利性</label>
                <star-rating
                  v-model:rating="form.convenienceRating"
                  :interactive="true"
                  :size="24"
                  :readonly="false"
                ></star-rating>
              </div>
              <div class="col-md-4">
                <label class="form-label">友善度</label>
                <star-rating
                  v-model:rating="form.friendlinessRating"
                  :interactive="true"
                  :size="24"
                  :readonly="false"
                ></star-rating>
              </div>
            </div>
  
            <!-- 評價內容 -->
            <div class="mb-4">
              <label for="reviewText" class="form-label">評價內容</label>
              <textarea
                id="reviewText"
                class="form-control"
                v-model="form.reviewText"
                rows="4"
                placeholder="請分享您的住宿體驗..."
                required
              ></textarea>
            </div>
  
            <!-- 優點與缺點 -->
            <div class="row mb-4">
              <div class="col-md-6">
                <label for="pros" class="form-label text-success">優點</label>
                <textarea
                  id="pros"
                  class="form-control"
                  v-model="form.pros"
                  rows="3"
                  placeholder="您覺得這個營地有哪些優點？"
                ></textarea>
              </div>
              <div class="col-md-6">
                <label for="cons" class="form-label text-danger">缺點</label>
                <textarea
                  id="cons"
                  class="form-control"
                  v-model="form.cons"
                  rows="3"
                  placeholder="您覺得這個營地有哪些缺點或需要改進的地方？"
                ></textarea>
              </div>
            </div>
  
            <!-- 圖片上傳 -->
            <div class="mb-4">
              <label class="form-label">上傳照片</label>
              <div class="image-upload-container">
                <div class="d-flex flex-wrap">
                  <!-- 已上傳的圖片 -->
                  <div v-for="(image, index) in uploadedImages" :key="index" class="image-preview me-2 mb-2 position-relative">
                    <img :src="image.url" alt="評價照片" class="img-thumbnail" style="width: 100px; height: 100px; object-fit: cover;">
                    <button 
                      type="button" 
                      class="btn-close position-absolute top-0 end-0 bg-danger"
                      @click="removeImage(index)"
                      aria-label="Close"
                    ></button>
                  </div>
                  
                  <!-- 上傳按鈕 -->
                  <div 
                    class="image-upload-btn d-flex justify-content-center align-items-center"
                    @click="$refs.fileInput.click()"
                  >
                    <i class="bi bi-plus fs-1"></i>
                    <input 
                      ref="fileInput" 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      class="d-none"
                      @change="handleFileUpload"
                    >
                  </div>
                </div>
                <small class="text-muted">最多可上傳 5 張照片，每張不超過 5MB</small>
              </div>
            </div>
  
            <!-- 提交按鈕 -->
            <div class="d-flex justify-content-end">
              <button type="button" class="btn btn-secondary me-2" @click="$emit('cancel')">
                取消
              </button>
              <button 
                type="submit" 
                class="btn btn-primary" 
                :disabled="isSubmitting || !isFormValid"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                {{ isEditing ? '更新評價' : '提交評價' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useReviewStore } from '@/stores/reviewStore';
  import StarRating from '@/components/StarRating.vue';
  import Swal from 'sweetalert2';
  
  export default {
    name: 'ReviewForm',
    components: {
      StarRating
    },
    props: {
      campSiteId: {
        type: Number,
        required: true
      },
      userId: {
        type: Number,
        required: true
      },
      review: {
        type: Object,
        default: null
      }
    },
    emits: ['submitted', 'cancel'],
    setup(props, { emit }) {
      const reviewStore = useReviewStore();
      const fileInput = ref(null);
      const isSubmitting = ref(false);
      const uploadedImages = ref([]);
      
      // 判斷是否為編輯模式
      const isEditing = computed(() => !!props.review);
      
      // 表單數據
      const form = reactive({
        userId: props.userId,
        campSiteId: props.campSiteId,
        reviewText: '',
        overallRating: 0,
        cleanlinessRating: 0,
        convenienceRating: 0,
        friendlinessRating: 0,
        pros: '',
        cons: '',
        imageUrls: []
      });
      
      // 表單驗證
      const isFormValid = computed(() => {
        return form.overallRating > 0 && form.reviewText.trim() !== '';
      });
      
      // 初始化表單（編輯模式）
      onMounted(() => {
        if (props.review) {
          Object.keys(form).forEach(key => {
            if (props.review[key] !== undefined) {
              form[key] = props.review[key];
            }
          });
          
          // 初始化已上傳的圖片
          if (props.review.imageUrls && props.review.imageUrls.length > 0) {
            uploadedImages.value = props.review.imageUrls.map(url => ({
              url,
              isExisting: true
            }));
          }
        }
      });
      
      // 處理文件上傳
      const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        
        // 驗證文件數量
        if (uploadedImages.value.length + files.length > 5) {
          Swal.fire('上傳失敗', '最多只能上傳 5 張照片', 'error');
          return;
        }
        
        // 驗證文件大小和類型
        const invalidFiles = files.filter(file => {
          return file.size > 5 * 1024 * 1024 || !file.type.startsWith('image/');
        });
        
        if (invalidFiles.length > 0) {
          Swal.fire('上傳失敗', '請確保每張照片不超過 5MB 且為圖片格式', 'error');
          return;
        }
        
        // 顯示上傳中的預覽
        const newImages = files.map(file => ({
          file,
          url: URL.createObjectURL(file),
          isUploading: true
        }));
        
        uploadedImages.value = [...uploadedImages.value, ...newImages];
        
        // 重置文件輸入框以允許再次選擇相同的文件
        event.target.value = null;
        
        // 上傳文件到服務器（這裡僅為了展示）
        try {
          // 在實際應用中，這裡應該調用 API 上傳圖片
          // 模擬上傳延遲
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 更新上傳狀態
          uploadedImages.value.forEach(image => {
            if (image.isUploading) {
              image.isUploading = false;
            }
          });
        } catch (error) {
          console.error('Error uploading images:', error);
          Swal.fire('上傳失敗', '圖片上傳過程中發生錯誤', 'error');
          
          // 移除上傳失敗的圖片
          uploadedImages.value = uploadedImages.value.filter(image => !image.isUploading);
        }
      };
      
      // 移除圖片
      const removeImage = (index) => {
        uploadedImages.value.splice(index, 1);
      };
      
      // 提交表單
      const submitForm = async () => {
        if (!isFormValid.value) {
          Swal.fire('提交失敗', '請填寫所有必要的欄位', 'error');
          return;
        }
        
        isSubmitting.value = true;
        
        try {
          // 準備評價數據
          const reviewData = { ...form };
          
          // 處理圖片URLs
          reviewData.imageUrls = uploadedImages.value.map(image => image.url);
          
          // 提交評價
          if (isEditing.value) {
            await reviewStore.updateReview(props.review.id, reviewData);
            Swal.fire('成功', '評價已成功更新！', 'success');
          } else {
            await reviewStore.createReview(reviewData);
            Swal.fire('成功', '評價已成功提交！', 'success');
          }
          
          emit('submitted');
        } catch (error) {
          console.error('Error submitting review:', error);
          Swal.fire('錯誤', error.message || '提交評價時出現錯誤', 'error');
        } finally {
          isSubmitting.value = false;
        }
      };
      
      return {
        form,
        isEditing,
        isSubmitting,
        isFormValid,
        uploadedImages,
        fileInput,
        handleFileUpload,
        removeImage,
        submitForm
      };
    }
  };
  </script>
  
  <style scoped>
  .image-upload-container {
    margin-top: 10px;
  }
  
  .image-preview {
    width: 100px;
    height: 100px;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .image-upload-btn {
    width: 100px;
    height: 100px;
    border: 2px dashed #ccc;
    border-radius: 4px;
    cursor: pointer;
    color: #6c757d;
    transition: all 0.2s;
  }
  
  .image-upload-btn:hover {
    border-color: #0d6efd;
    color: #0d6efd;
  }
  
  .btn-close {
    font-size: 0.75rem;
    padding: 0.15rem;
    margin: 0.25rem;
  }
  </style>