<template>
    <div class="home-page bg-white rounded shadow-sm">
      <div class="row">
        <div class="col-12 text-center">
          <h1 class="display-4 mb-4 text-sage-dark">歡迎來到營地評價系統</h1>
          <p class="lead text-sage-medium">探索、分享您的露營體驗</p>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 mb-3">
          <div class="card h-100 border-sage">
            <div class="card-body">
              <h5 class="card-title text-sage-dark">瀏覽評價</h5>
              <p class="card-text">查看其他露營者的評價和體驗</p>
              <router-link to="/reviews" class="btn btn-sage">查看評價</router-link>
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-3">
          <div class="card h-100 border-sage">
            <div class="card-body">
              <h5 class="card-title text-sage-dark">發布評價</h5>
              <p class="card-text">分享您的露營故事和建議</p>
              <button class="btn btn-sage">新增評價</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // 可以在這裡添加頁面邏輯
  </script>
  
  <style scoped>
  .home-page {
    background-color: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .border-sage {
    border: 2px solid var(--sage-medium) !important;
  }
  
  .card {
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }
  
  .card:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 8px rgba(140, 172, 107, 0.2);
  }
  </style>