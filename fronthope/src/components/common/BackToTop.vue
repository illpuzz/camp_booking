<!-- components/common/BackToTop.vue -->
<template>
    <div id="back-to-top-button" class="back-to-top" :class="{ 'visible': showBackToTop }" @click="scrollToTop">
      <i class="bi bi-arrow-up"></i>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
  
  export default defineComponent({
    name: 'BackToTop',
    setup() {
      const showBackToTop = ref(false);
      
      // 監聽滾動事件，控制返回頂部按鈕的顯示與隱藏
      const handleScroll = () => {
        // 當頁面滾動超過300px時顯示按鈕
        showBackToTop.value = window.pageYOffset > 300;
      };
      
      // 滾動到頂部
      const scrollToTop = () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      };
      
      // 檢查頁面上是否存在多個返回頂部按鈕
      const checkDuplicateButtons = () => {
        console.log('BackToTop 組件已掛載');
        const buttons = document.querySelectorAll('#back-to-top-button');
        if (buttons.length > 1) {
          console.warn(`檢測到 ${buttons.length} 個 BackToTop 按鈕，可能導致重複顯示問題`);
        }
      };
      
      // 註冊和移除滾動事件監聽器
      onMounted(() => {
        window.addEventListener('scroll', handleScroll);
        checkDuplicateButtons();
      });
      
      onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll);
      });
      
      return {
        showBackToTop,
        scrollToTop
      };
    }
  });
  </script>
  
  <style scoped>
  .back-to-top {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background-color: var(--forest-medium, #356648);
    color: white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 10000; /* 使用高 z-index 確保始終在最上層 */
  }
  
  .back-to-top.visible {
    opacity: 1;
    visibility: visible;
  }
  
  .back-to-top:hover {
    background-color: var(--forest-dark, #1E432E);
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }
  
  .back-to-top i {
    font-size: 1.5rem;
  }
  
  @media (max-width: 768px) {
    .back-to-top {
      bottom: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
    }
    
    .back-to-top i {
      font-size: 1.2rem;
    }
  }
  </style>