<!-- layouts/RootLayout.vue - 修正重複接口問題 -->
<template>
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <AppHeader 
            :currentUser="currentUser" 
            @login="handleLogin" 
            @logout="handleLogout" 
          />
          
          <!-- 只有一個視圖區域 -->
          <div v-if="currentUser">
            <MainContent 
              :currentUser="currentUser" 
              :currentView="currentView"
              @view-changed="handleViewChange"
            />
          </div>
          <div v-else class="login-container">
            <Login @login="handleLogin" />
          </div>
        </div>
      </div>
      
      <BackToTop />
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted } from 'vue';
  import AppHeader from '@/components/layout/AppHeader.vue';
  import MainContent from '@/components/layout/MainContent.vue';
  import Login from '@/components/auth/Login.vue';
  import BackToTop from '@/components/common/BackToTop.vue';
  
  export default defineComponent({
    name: 'RootLayout',
    components: {
      AppHeader,
      MainContent,
      Login,
      BackToTop
    },
    setup() {
      // 核心狀態
      const currentUser = ref(null);
      // 強制設置初始視圖為 'connector'（營地接口）
      const currentView = ref('connector');
      
      // 處理登入
      const handleLogin = (user) => {
        currentUser.value = user;
        // 登入後強制將視圖設置為營地接口
        currentView.value = 'connector';
        // 清除並重新設置 localStorage
        localStorage.removeItem('currentView');
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentView', 'connector');
        console.log('登入成功，視圖重置為:', currentView.value);
      };
      
      // 處理登出
      const handleLogout = () => {
        currentUser.value = null;
        // 登出後重置視圖為營地接口
        currentView.value = 'connector';
        // 清除 localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentView');
        console.log('登出成功，視圖重置為:', currentView.value);
      };
      
      // 處理視圖變更
      const handleViewChange = (view) => {
        console.log('視圖變更為:', view);
        currentView.value = view;
        localStorage.setItem('currentView', view);
      };
      
      // 初始化 - 簡化邏輯以避免讀取有問題的狀態
      onMounted(() => {
        console.log('RootLayout 組件掛載完成');
        
        // 先清除 localStorage 中可能有問題的視圖狀態 
        localStorage.removeItem('currentView');
        
        // 只讀取用戶狀態，初始視圖固定為 connector
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            currentUser.value = JSON.parse(savedUser);
            console.log('已載入用戶狀態，使用預設視圖 connector');
          } catch (e) {
            console.error('解析用戶數據失敗:', e);
            localStorage.removeItem('currentUser');
          }
        }
        
        // 重置視圖為 connector 並保存
        currentView.value = 'connector';
        localStorage.setItem('currentView', 'connector');
      });
      
      return {
        currentUser,
        currentView,
        handleLogin,
        handleLogout,
        handleViewChange
      };
    }
  });
  </script>
  
  <style scoped>
  .login-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  </style>