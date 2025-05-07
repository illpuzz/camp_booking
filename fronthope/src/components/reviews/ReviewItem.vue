<!-- ReviewItem.vue - 單個評價卡片組件 (修改版) -->
<template>
  <!-- 整個評價卡片容器，無需改變類名 -->
  <div class="review-item" :class="{ 'reported-review': isReviewReported }">
    <!-- 被檢舉評價顯示：修改此處的條件判斷，使得評價被檢舉後仍然顯示在列表中 -->
    <div v-if="isReviewReported && !isAdmin" class="reported-notice" style="padding: 40px;">
      <i class="bi bi-shield-exclamation me-2"></i>
      此評價正在審核中，暫時隱藏
      
    </div>
    
    <!-- 只有管理員可看到被檢舉的評價內容 -->
    <div v-else-if="isReviewReported && isAdmin" class="reported-admin-view">
      <div class="review-header">
        <div class="admin-review-alert">
          <i class="bi bi-shield-exclamation me-1"></i>
          <small><strong>此評價已被檢舉</strong> - 僅管理員可見</small>
        </div>
        
        <div class="d-flex justify-content-between align-items-start">
          <h3 class="user-name">
            <i class="bi bi-person-circle me-2"></i>
            {{ review.userName || '匿名用戶' }}
          </h3>
          
          <div class="rating-display">
            <div class="stars">
              <span v-for="n in 5" :key="`overall-${n}`" class="star">
                <i class="bi" :class="n <= review.overallRating ? 'bi-star-fill' : 'bi-star'"></i>
              </span>
            </div>
          </div>
        </div>
        
        <div class="review-meta text-muted">
          <small>{{ formatDate(review.createdAt) }}</small>
          <small v-if="isEdited" class="ms-2">(已編輯)</small>
        </div>
      </div>
      
      <div class="review-body">
        <p class="review-text">{{ review.reviewText }}</p>
        
        <!-- 評價圖片 (如果有) -->
        <div v-if="hasImages" class="review-images">
          <!-- 前三張圖片直接顯示 -->
          <div 
            v-for="(url, index) in visibleImages" 
            :key="index" 
            class="image-wrapper"
            @click="openImageViewer(url)"
          >
            <img :src="processImageUrl(url)" :alt="`評價圖片 ${index + 1}`" class="img-thumbnail">
          </div>
          
          <!-- 剩餘圖片計數器，點擊時顯示所有圖片 -->
          <div 
            v-if="hasMoreImages" 
            class="more-images"
            @click="showAllImages()"
          >
            +{{ review.imageUrls.length - visibleImageCount }}
          </div>
        </div>
        
        <!-- 優點與缺點 -->
        <div v-if="review.pros || review.cons" class="pros-cons">
          <div v-if="review.pros" class="pro">
            <h5>
              <i class="bi bi-hand-thumbs-up-fill me-2 text-success"></i>
              優點
            </h5>
            <p>{{ review.pros }}</p>
          </div>
          
          <div v-if="review.cons" class="con">
            <h5>
              <i class="bi bi-hand-thumbs-down-fill me-2 text-danger"></i>
              缺點
            </h5>
            <p>{{ review.cons }}</p>
          </div>
        </div>
        
        <!-- 評分詳情 -->
        <div class="rating-details">
          <div class="rating-item">
            <span class="rating-label">清潔度</span>
            <div class="stars small">
              <span v-for="n in 5" :key="`clean-${n}`" class="star">
                <i class="bi" :class="n <= review.cleanlinessRating ? 'bi-star-fill' : 'bi-star'"></i>
              </span>
            </div>
          </div>
          
          <div class="rating-item">
            <span class="rating-label">便利性</span>
            <div class="stars small">
              <span v-for="n in 5" :key="`conv-${n}`" class="star">
                <i class="bi" :class="n <= review.convenienceRating ? 'bi-star-fill' : 'bi-star'"></i>
              </span>
            </div>
          </div>
          
          <div class="rating-item">
            <span class="rating-label">友善度</span>
            <div class="stars small">
              <span v-for="n in 5" :key="`friend-${n}`" class="star">
                <i class="bi" :class="n <= review.friendlinessRating ? 'bi-star-fill' : 'bi-star'"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 回覆區域 - 管理員檢視被檢舉評價時也顯示回覆 -->
      <div v-if="review.replyText" class="reply-section" :class="{ 'reported-reply': isReplyReported }">
        <!-- 如果回覆也被檢舉，顯示檢舉提示 -->
        <div v-if="isReplyReported" class="admin-review-alert mb-2">
          <i class="bi bi-shield-exclamation me-1"></i>
          <small><strong>此回覆已被檢舉</strong> - 僅管理員可見</small>
        </div>
        
        <div class="reply-header">
          <h5>
            <i class="bi bi-chat-left-text-fill me-2 text-success"></i>
            營地主人回覆
          </h5>
          <small class="text-muted">{{ formatDate(review.updatedAt) }}</small>
        </div>
        
        <div class="reply-content">
          <p>{{ review.replyText }}</p>
        </div>
      </div>
    </div>
    
    <!-- 一般評價顯示：保持原有邏輯，但確保評價被檢舉後不會消失 -->
    <div v-else class="review-content">
      <!-- 評價頭部 -->
      <div class="review-header">
        <div class="d-flex justify-content-between align-items-start">
          <h3 class="user-name">
            <i class="bi bi-person-circle me-2"></i>
            {{ review.userName || '匿名用戶' }}
          </h3>
          
          <div class="rating-display">
            <div class="stars">
              <span v-for="n in 5" :key="`overall-${n}`" class="star">
                <i class="bi" :class="n <= review.overallRating ? 'bi-star-fill' : 'bi-star'"></i>
              </span>
            </div>
          </div>
        </div>
        
        <div class="review-meta text-muted">
          <small>{{ formatDate(review.createdAt) }}</small>
          <small v-if="isEdited" class="ms-2">(已編輯)</small>
        </div>
      </div>
      
      <!-- 評價內容 -->
      <div class="review-body">
        <p class="review-text">{{ review.reviewText }}</p>
        
        <!-- 評價圖片 (如果有) -->
        <div v-if="hasImages" class="review-images">
          <!-- 前三張圖片直接顯示 -->
          <div 
            v-for="(url, index) in visibleImages" 
            :key="index" 
            class="image-wrapper"
            @click="openImageViewer(url)"
          >
            <img :src="processImageUrl(url)" :alt="`評價圖片 ${index + 1}`" class="img-thumbnail">
          </div>
          
          <!-- 剩餘圖片計數器，點擊時顯示所有圖片 -->
          <div 
            v-if="hasMoreImages" 
            class="more-images"
            @click="showAllImages()"
          >
            +{{ review.imageUrls.length - visibleImageCount }}
          </div>
        </div>
        
        <!-- 優點與缺點 -->
        <div v-if="review.pros || review.cons" class="pros-cons">
          <div v-if="review.pros" class="pro">
            <h5>
              <i class="bi bi-hand-thumbs-up-fill me-2 text-success"></i>
              優點
            </h5>
            <p>{{ review.pros }}</p>
          </div>
          
          <div v-if="review.cons" class="con">
            <h5>
              <i class="bi bi-hand-thumbs-down-fill me-2 text-danger"></i>
              缺點
            </h5>
            <p>{{ review.cons }}</p>
          </div>
        </div>
        
        <!-- 評分詳情 -->
        <div class="rating-details">
          <div class="rating-item">
            <span class="rating-label">清潔度</span>
            <div class="stars small">
              <span v-for="n in 5" :key="`clean-${n}`" class="star">
                <i class="bi" :class="n <= review.cleanlinessRating ? 'bi-star-fill' : 'bi-star'"></i>
              </span>
            </div>
          </div>
          
          <div class="rating-item">
            <span class="rating-label">便利性</span>
            <div class="stars small">
              <span v-for="n in 5" :key="`conv-${n}`" class="star">
                <i class="bi" :class="n <= review.convenienceRating ? 'bi-star-fill' : 'bi-star'"></i>
              </span>
            </div>
          </div>
          
          <div class="rating-item">
            <span class="rating-label">友善度</span>
            <div class="stars small">
              <span v-for="n in 5" :key="`friend-${n}`" class="star">
                <i class="bi" :class="n <= review.friendlinessRating ? 'bi-star-fill' : 'bi-star'"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 回覆區域 -->
      <div v-if="review.replyText" class="reply-section" :class="{ 'reported-reply': isReplyReported }">
        <!-- 非管理員看到被檢舉的回覆 - 保持原版 -->
        <div v-if="isReplyReported && !isAdmin" class="reported-notice">
          <i class="bi bi-shield-exclamation me-2"></i>
          此回覆正在審核中，暫時隱藏
        </div>
        
        <!-- 管理員看到被檢舉的回覆：調整後的精簡版 -->
        <div v-else-if="isReplyReported && isAdmin" class="reported-admin-view">
          <div class="admin-review-alert">
            <i class="bi bi-shield-exclamation me-1"></i>
            <small><strong>此回覆已被檢舉</strong> - 僅管理員可見</small>
          </div>
          
          <div class="reply-header">
            <h5>
              <i class="bi bi-chat-left-text-fill me-2 text-success"></i>
              營地主人回覆
            </h5>
            <small class="text-muted">{{ formatDate(review.updatedAt) }}</small>
          </div>
          
          <div class="reply-content">
            <p>{{ review.replyText }}</p>
          </div>
        </div>
        
        <!-- 一般顯示回覆 - 保持原版 -->
        <div v-else>
          <div class="reply-header">
            <h5>
              <i class="bi bi-chat-left-text-fill me-2 text-success"></i>
              營地主人回覆
            </h5>
            <small class="text-muted">{{ formatDate(review.updatedAt) }}</small>
          </div>
          
          <div class="reply-content">
            <p>{{ review.replyText }}</p>
          </div>
          
          <!-- 檢舉回覆按鈕 - 保持原版 -->
          <div v-if="canReportReply" class="reply-actions text-end">
            <button 
              class="btn btn-sm btn-outline-secondary" 
              @click="$emit('report-reply', review)"
            >
              <i class="bi bi-flag me-1"></i>
              檢舉回覆
            </button>
          </div>
          
          <div v-if="isReplyOwner" class="reply-actions text-end">
            <button 
              class="btn btn-sm btn-outline-success me-2" 
              @click="$emit('edit-reply', review)"
            >
              <i class="bi bi-pencil-fill me-1"></i>
              編輯回覆
            </button>
            
            <button 
              class="btn btn-sm btn-outline-danger" 
              @click="$emit('delete-reply', review.id)"
            >
              <i class="bi bi-trash-fill me-1"></i>
              刪除回覆
            </button>
          </div>
        </div>
      </div>
      
      <!-- 評價操作按鈕 -->
      <div class="review-actions">
        <!-- 左側操作 -->
        <div class="left-actions">
          <!-- 點讚按鈕 -->
          <button 
            class="btn btn-sm" 
            :class="[review.userLikeStatus === 1 ? 'btn-success' : 'btn-outline-success']"
            @click="$emit('toggle-like', review.id)"
          >
            <i 
              class="bi" 
              :class="[review.userLikeStatus === 1 ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up']"
            ></i>
            <span class="ms-1">{{ review.likeCount || 0 }}</span>
          </button>
          
          <!-- 回覆按鈕 (只對營地主人顯示) -->
          <button 
            v-if="isOwner && !review.replyText" 
            class="btn btn-sm btn-outline-primary ms-2" 
            @click="$emit('reply-review', review)"
          >
            <i class="bi bi-chat-text me-1"></i>
            回覆
          </button>
          
          <!-- 修改此處：允許營地主人也可以檢舉評價，但不顯示給評價擁有者和管理員 -->
          <button 
            v-if="canReportReview" 
            class="btn btn-sm btn-outline-secondary ms-2" 
            @click="$emit('report-review', review)"
          >
            <i class="bi bi-flag me-1"></i>
            檢舉
          </button>
        </div>
        
        <!-- 右側操作 (只對評價擁有者顯示) -->
        <div v-if="isReviewOwner" class="right-actions">
          <button 
            class="btn btn-sm btn-outline-primary me-2" 
            @click="$emit('edit-review', review)"
          >
            <i class="bi bi-pencil me-1"></i>
            編輯
          </button>
          
          <button 
            class="btn btn-sm btn-outline-danger" 
            @click="$emit('delete-review', review.id)"
          >
            <i class="bi bi-trash me-1"></i>
            刪除
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 圖片查看器模態視窗 - 使用動態ID -->
  <div class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">評價圖片瀏覽</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="image-viewer">
            <!-- 主要圖片顯示 -->
            <div class="main-image-container mb-3">
              <img 
                :src="processImageUrl(currentViewingImage)" 
                alt="大圖預覽" 
                class="main-image"
              >
            </div>
            
            <!-- 圖片導航縮略圖 -->
            <div class="image-thumbnails" v-if="allImages.length > 1">
              <div 
                v-for="(url, idx) in allImages" 
                :key="idx"
                :class="['thumbnail-item', { active: url === currentViewingImage }]"
                @click="currentViewingImage = url"
              >
                <img :src="processImageUrl(url)" :alt="`圖片 ${idx + 1}`">
              </div>
            </div>
            
            <!-- 圖片導航按鈕 -->
            <div class="navigation-buttons mt-3" v-if="allImages.length > 1">
              <button 
                class="btn btn-outline-secondary" 
                @click="navigateImage(-1)" 
                :disabled="currentImageIndex === 0"
              >
                <i class="bi bi-chevron-left"></i> 上一張
              </button>
              <div class="image-counter">
                {{ currentImageIndex + 1 }} / {{ allImages.length }}
              </div>
              <button 
                class="btn btn-outline-secondary" 
                @click="navigateImage(1)" 
                :disabled="currentImageIndex === allImages.length - 1"
              >
                下一張 <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';

export default {
  name: 'ReviewItem',
  props: {
    review: {
      type: Object,
      required: true
    },
    currentUser: {
      type: Object,
      required: true
    }
  },
  emits: [
    'toggle-like', 
    'delete-review', 
    'edit-review',
    'reply-review',
    'edit-reply',
    'delete-reply',
    'report-review',
    'report-reply'
  ],
  setup(props) {
    // 為每個評論創建唯一的模態視窗ID
    const modalId = `imageViewer-${props.review.id}`;
    
    // 判斷當前用戶角色
    const isAdmin = props.currentUser.role === 'admin';
    const isOwner = props.currentUser.role === 'owner';
    const isUser = props.currentUser.role === 'user';
    
    // 判斷是否為評價的擁有者
    const isReviewOwner = props.currentUser.id === props.review.userId;
    
    // 判斷是否為回覆的擁有者 (只有營地主人會是回覆的擁有者)
    const isReplyOwner = isOwner;
    
    // 判斷評價是否已被檢舉
    const isReviewReported = props.review.reviewHasActiveReport;
    
    // 判斷回覆是否已被檢舉
    const isReplyReported = props.review.replyHasActiveReport;
    
    // 判斷評價是否被編輯過
    const isEdited = props.review.updatedAt && new Date(props.review.updatedAt).getTime() > new Date(props.review.createdAt).getTime() + 60000;
    
    // 判斷是否有圖片
    const hasImages = props.review.imageUrls && props.review.imageUrls.length > 0;
    
    // 新增：判斷是否可以檢舉評價
    // 一般用戶和營地主人都可以檢舉評價，但不能檢舉自己的評價
    const canReportReview = (isUser || isOwner) && !isReviewOwner && !isAdmin;
    
    // 新增：判斷是否可以檢舉回覆
    // 一般用戶和營地主人都可以檢舉回覆，但不能檢舉自己的回覆
    // 營地主人的用戶ID是否與回覆者ID相同需要額外判斷
    const canReportReply = (isUser || isOwner) && !isAdmin && !isReplyOwner;
    
    // 圖片查看相關變數
    const imageViewerModal = ref(null);
    const currentViewingImage = ref('');
    const visibleImageCount = 3; // 默認顯示的圖片數量
    const allImages = ref([]);
    
    // 計算可見圖片
    const visibleImages = computed(() => {
      if (!props.review.imageUrls || props.review.imageUrls.length === 0) {
        return [];
      }
      return props.review.imageUrls.slice(0, visibleImageCount);
    });
    
    // 是否有更多圖片
    const hasMoreImages = computed(() => {
      return props.review.imageUrls && props.review.imageUrls.length > visibleImageCount;
    });
    
    // 當前查看圖片的索引
    const currentImageIndex = computed(() => {
      return allImages.value.indexOf(currentViewingImage.value);
    });
    
    // 初始化模態視窗
    onMounted(() => {
      // 使用動態ID選擇模態視窗
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        imageViewerModal.value = new Modal(modalElement);
      }
    });
    
    // 打開圖片查看器
    const openImageViewer = (imageUrl) => {
      // 設置所有圖片
      allImages.value = props.review.imageUrls || [];
      
      // 設置當前查看的圖片
      if (imageUrl && allImages.value.includes(imageUrl)) {
        currentViewingImage.value = imageUrl;
      } else if (allImages.value.length > 0) {
        // 如果沒有指定圖片或指定的圖片不在列表中，默認顯示第一張
        currentViewingImage.value = allImages.value[0];
      }
      
      // 打開模態視窗
      if (imageViewerModal.value && allImages.value.length > 0) {
        imageViewerModal.value.show();
      } else {
        // 如果模態視窗尚未初始化，嘗試重新初始化並打開
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
          imageViewerModal.value = new Modal(modalElement);
          imageViewerModal.value.show();
        }
      }
    };
    
    // 顯示所有圖片
    const showAllImages = () => {
      // 如果有隱藏的圖片，顯示第一張隱藏的圖片
      if (props.review.imageUrls && props.review.imageUrls.length > visibleImageCount) {
        openImageViewer(props.review.imageUrls[visibleImageCount]);
      } else {
        // 如果沒有隱藏的圖片，則顯示第一張
        openImageViewer(props.review.imageUrls ? props.review.imageUrls[0] : null);
      }
    };
    
    // 切換到上一張/下一張圖片
    const navigateImage = (direction) => {
      const currentIndex = currentImageIndex.value;
      const newIndex = currentIndex + direction;
      
      if (newIndex >= 0 && newIndex < allImages.value.length) {
        currentViewingImage.value = allImages.value[newIndex];
      }
    };
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      return `${year}年${month}月${day}日`;
    };
    
    // 處理圖片 URL，確保可以正確顯示
    const processImageUrl = (url) => {
      if (!url) return '';
      
      if (url.startsWith('http')) {
        return url;
      }
      
      return url.startsWith('/') ? url : `/${url}`;
    };
    
    // 渲染評價內容 (管理員查看被檢舉的評價)
    const renderReviewContent = () => {
      return (
        `【用戶】${props.review.userName || '匿名用戶'}\n` +
        `【評分】${props.review.overallRating} 星\n` +
        `【內容】${props.review.reviewText}\n` +
        (props.review.pros ? `【優點】${props.review.pros}\n` : '') +
        (props.review.cons ? `【缺點】${props.review.cons}` : '')
      );
    };
    
    return {
      isAdmin,
      isOwner,
      isUser,
      isReviewOwner,
      isReplyOwner,
      isReviewReported,
      isReplyReported,
      isEdited,
      hasImages,
      canReportReview, // 新增：是否可以檢舉評價
      canReportReply, // 新增：是否可以檢舉回覆
      formatDate,
      processImageUrl,
      renderReviewContent,
      
      // 圖片查看相關
      modalId,
      imageViewerModal,
      currentViewingImage,
      visibleImages,
      hasMoreImages,
      visibleImageCount,
      allImages,
      currentImageIndex,
      openImageViewer,
      showAllImages,
      navigateImage,
    };
  }
};
</script>

<style scoped>
.review-item {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 25px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.review-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.reported-review {
  background-color: #f8f9fa;
  border: 1px dashed #6c757d;
}

.reported-notice {
  padding: 20px;
  text-align: center;
  color: #6c757d;
  font-weight: 500;
}

.reported-admin-view {
  padding: 20px;
}

.admin-review-alert {
  font-size: 0.85rem;
  color: #856404;
  background-color: #fff3cd;
  border-radius: 4px;
  padding: 5px 8px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.review-content {
  padding: 20px;
}

.review-header {
  margin-bottom: 15px;
}

.user-name {
  font-size: 1.2rem;
  margin: 0;
  color: var(--forest-dark);
}

.rating-display .stars {
  display: flex;
}

.rating-display .star {
  color: #ffc107;
  font-size: 1.2rem;
  margin-right: 2px;
}

.review-meta {
  margin-top: 5px;
  font-size: 0.9rem;
}

.review-body {
  margin-bottom: 15px;
}

.review-text {
  margin-bottom: 15px;
  line-height: 1.6;
  color: var(--forest-dark);
}

/* 圖片預覽區域樣式 */
.review-images {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.image-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.image-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.more-images {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  color: var(--forest-dark);
  font-weight: 600;
  font-size: 1.2rem;
  flex-shrink: 0;
  border: 1px dashed #ced4da;
  cursor: pointer;
  transition: all 0.2s ease;
}

.more-images:hover {
  background-color: rgba(var(--forest-medium-rgb, 53, 102, 72), 0.1);
  transform: scale(1.05);
}

/* 圖片查看器模態視窗樣式 */
.image-viewer .main-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  min-height: 300px;
  max-height: 500px;
  overflow: hidden;
}

.image-viewer .main-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.image-thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0;
}

.thumbnail-item {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.7;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.thumbnail-item:hover {
  opacity: 1;
}

.thumbnail-item.active {
  opacity: 1;
  border-color: var(--forest-medium, #356648);
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-counter {
  font-weight: 500;
  color: var(--forest-dark);
}

.pros-cons {
  margin-bottom: 15px;
}

.pro, .con {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.pro {
  background-color: rgba(40, 167, 69, 0.1);
}

.con {
  background-color: rgba(220, 53, 69, 0.1);
}

.pro h5, .con h5 {
  font-size: 1rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.pro p, .con p {
  margin-bottom: 0;
  color: var(--forest-dark);
}

.rating-details {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.rating-item {
  display: flex;
  align-items: center;
  min-width: 150px;
}

.rating-label {
  margin-right: 10px;
  font-weight: 500;
  color: var(--forest-dark);
}

.stars.small .star {
  font-size: 0.9rem;
  color: #ffc107;
}

.reply-section {
  margin-top: 20px;
  padding: 12px;
  background-color: rgba(40, 167, 69, 0.05);
  border-radius: 8px;
  border-left: 3px solid #28a745;
}

.reported-reply {
  background-color: #f8f9fa;
  border-left: 3px dashed #6c757d;
  padding: 10px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.reply-header h5 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--forest-dark);
  font-weight: 600;
}

.reply-content p {
  margin-bottom: 0;
  color: var(--forest-dark);
}

.reply-actions {
  margin-top: 10px;
}

.review-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .rating-details {
    flex-direction: column;
    gap: 10px;
  }
  
  .review-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .right-actions {
    align-self: flex-end;
  }
}
</style>