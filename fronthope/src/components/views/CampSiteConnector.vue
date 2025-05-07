<!-- CampSiteConnector.vue - 簡單的營地評價跳轉接口 (添加模擬營地) -->
<template>
  <div class="camp-connector">
    <div class="alert alert-info">
      <h4 class="alert-heading">營地評價系統測試接口</h4>
      <p>這是一個簡單的接口頁面，模擬從營地詳情頁跳轉到評價系統。點擊營地卡片下方的按鈕進入評價系統。</p>
    </div>
    
    <!-- 模擬營地卡片 -->
    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">青山綠水營地</h5>
          </div>
          <div class="card-body">
            <div class="card-info">
              <p><i class="bi bi-geo-alt-fill me-2"></i>新北市烏來區</p>
              <p><i class="bi bi-star-fill me-2 text-warning"></i>4.7 (58則評價)</p>
              <p class="mb-4">位於山區的寧靜營地，提供完善的露營設施和美麗的自然環境。適合家庭露營和團體活動。</p>
            </div>
            <button class="btn btn-primary w-100" @click="viewReviews">
              <i class="bi bi-chat-square-text me-1"></i>
              查看營地評價
            </button>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">海濱陽光營地</h5>
          </div>
          <div class="card-body">
            <div class="card-info">
              <p><i class="bi bi-geo-alt-fill me-2"></i>宜蘭縣頭城鎮</p>
              <p><i class="bi bi-star-fill me-2 text-warning"></i>4.5 (42則評價)</p>
              <p class="mb-4">鄰近海邊的營地，可以享受海景並參與各種水上活動。提供衝浪板和獨木舟租借服務。</p>
            </div>
            <button class="btn btn-success w-100" @click="viewReviews">
              <i class="bi bi-chat-square-text me-1"></i>
              查看營地評價
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CampSiteConnector',
  emits: ['view-reviews'],
  setup(props, { emit }) {
    // 簡單的跳轉函數，不傳遞任何ID
    const viewReviews = () => {
      emit('view-reviews');
    };
    
    return {
      viewReviews
    };
  }
};
</script>

<style scoped>
.camp-connector {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.card-header {
  border-radius: 8px 8px 0 0 !important;
  padding: 15px;
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-info {
  flex-grow: 1;
}

.card-info p {
  margin-bottom: 8px;
}
</style>