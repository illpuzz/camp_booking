<template>
  <div class="image-viewer" v-if="isVisible" @click="close">
    <div class="image-viewer-content" @click.stop>
      <button class="close-button" @click="close">
        <i class="bi bi-x-lg"></i>
      </button>
      <button class="nav-button prev-button" @click="prevImage" :disabled="currentIndex === 0">
        <i class="bi bi-chevron-left"></i>
      </button>
      
      <!-- 圖片載入狀態 -->
      <div class="image-container">
        <!-- 載入中狀態 -->
        <div v-if="isLoading" class="loading-indicator">
          <div class="spinner"></div>
          <p>圖片載入中...</p>
        </div>
        
        <!-- 圖片顯示 -->
        <img 
          v-show="!isLoading && !loadError" 
          :src="currentImageUrl" 
          alt="大圖" 
          class="viewer-image"
          @load="handleImageLoaded"
          @error="handleImageError"
          referrerpolicy="no-referrer"
          crossorigin="anonymous"
        >
        
        <!-- 錯誤狀態 -->
        <div v-if="loadError" class="error-message">
          <i class="bi bi-exclamation-triangle"></i>
          <p>圖片載入失敗</p>
        </div>
      </div>
      
      <button 
        class="nav-button next-button" 
        @click="nextImage" 
        :disabled="currentIndex >= (images.length || 0) - 1"
      >
        <i class="bi bi-chevron-right"></i>
      </button>
      
      <div class="image-counter">
        {{ currentIndex + 1 }} / {{ images.length || 0 }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ImageViewer',
  props: {
    images: {
      type: Array,
      required: true
    },
    startIndex: {
      type: Number,
      default: 0
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    // 基本狀態
    const isVisible = computed(() => props.visible)
    const currentIndex = ref(props.startIndex || 0)
    const isLoading = ref(true)
    const loadError = ref(false)
    
    
// 當前圖片URL - 更簡潔版本
const currentImageUrl = computed(() => {
  if (!props.images || props.images.length === 0) return '';
  if (currentIndex.value < 0 || currentIndex.value >= props.images.length) return '';
  return window.getImageUrl(props.images[currentIndex.value]);
})
    // 處理圖片載入完成
    const handleImageLoaded = () => {
      console.log('圖片載入成功:', currentImageUrl.value);
      isLoading.value = false;
      loadError.value = false;
    }
    
    // 處理圖片載入錯誤 - 不再嘗試修復，僅顯示錯誤
    const handleImageError = (e) => {
      console.error('圖片載入失敗:', currentImageUrl.value);
      isLoading.value = false;
      loadError.value = true;
    }
    
    // 監聽 visible 變化
    watch(() => props.visible, (newValue) => {
      if (newValue) {
        // 顯示時鎖定背景滾動
        document.body.style.overflow = 'hidden';
        // 重置加載狀態
        isLoading.value = true;
        loadError.value = false;
      } else {
        // 隱藏時恢復背景滾動
        document.body.style.overflow = '';
      }
    })
    
    // 監聽 startIndex 變化
    watch(() => props.startIndex, (newValue) => {
      currentIndex.value = newValue || 0;
      isLoading.value = true;
      loadError.value = false;
    })
    
    // 監聽當前索引變化
    watch(currentIndex, () => {
      isLoading.value = true;
      loadError.value = false;
    })
    
    // 上一張圖片
    const prevImage = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--;
      }
    }
    
    // 下一張圖片
    const nextImage = () => {
      if (currentIndex.value < props.images.length - 1) {
        currentIndex.value++;
      }
    }
    
    // 關閉查看器
    const close = () => {
      emit('close');
    }
    
    // 處理鍵盤事件
    const handleKeyDown = (e) => {
      if (!isVisible.value) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'Escape':
          close();
          break;
      }
    }
    
    // 添加和移除鍵盤事件監聽器
    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown);
    })
    
    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown);
      // 確保在組件卸載時恢復背景滾動
      document.body.style.overflow = '';
    })
    
    return {
      isVisible,
      currentIndex,
      currentImageUrl,
      isLoading,
      loadError,
      prevImage,
      nextImage,
      close,
      handleImageLoaded,
      handleImageError,
    }
  }
}
</script>

<style scoped>
.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.image-viewer-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 300px;
  max-height: 80vh;
}

.viewer-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 30px;
}

.spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 3px solid white;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 30px;
  background-color: rgba(255, 0, 0, 0.1);
  border-radius: 8px;
}

.error-message i {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #ff6b6b;
}

.close-button {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.nav-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.prev-button {
  left: -60px;
}

.next-button {
  right: -60px;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-counter {
  position: absolute;
  bottom: -30px;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .nav-button {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
  
  .prev-button {
    left: -45px;
  }
  
  .next-button {
    right: -45px;
  }
  
  .image-container {
    min-height: 200px;
  }
}
</style>