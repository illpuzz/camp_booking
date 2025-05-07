<template>
    <div class="review-system container">
      <div class="review-header">
        <h1 class="title">
          <span class="green-leaf">🍃</span> 營地評價
        </h1>
        <button 
          @click="showCreateReviewModal = true" 
          class="btn btn-primary create-review-btn"
        >
          + 新增評價
        </button>
      </div>
  
      <div class="review-stats card">
        <div class="stats-item">
          <span class="stats-label">平均評分</span>
          <span class="stats-value">4.5</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">總評價數</span>
          <span class="stats-value">{{ reviewStore.reviews.length }}</span>
        </div>
      </div>
  
      <ReviewList
        :reviews="reviewStore.reviews"
        :loading="reviewStore.loading"
        @toggle-like="handleToggleLike"
      />
  
      <div 
        v-if="reviewStore.totalPages > 1" 
        class="pagination card"
      >
        <vuejs-paginate-next
          :total-pages="reviewStore.totalPages"
          :current-page="reviewStore.currentPage + 1"
          @page-changed="handlePageChange"
        />
      </div>
  
      <CreateReviewModal
        v-if="showCreateReviewModal"
        :campSiteId="campSiteId"
        @close="showCreateReviewModal = false"
        @review-created="handleReviewCreated"
      />
    </div>
  </template>
  
  <style scoped>
  .review-system {
    background-color: var(--mint-green);
    min-height: 100vh;
    padding: 30px;
  }
  
  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  .title {
    color: var(--primary-color);
    display: flex;
    align-items: center;
  }
  
  .green-leaf {
    margin-right: 10px;
  }
  
  .create-review-btn {
    background: var(--gradient-background);
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .review-stats {
    display: flex;
    justify-content: space-around;
    padding: 20px;
    margin-bottom: 30px;
    background-color: white;
  }
  
  .stats-item {
    text-align: center;
  }
  
  .stats-label {
    display: block;
    color: var(--primary-color);
    margin-bottom: 5px;
  }
  
  .stats-value {
    font-size: 24px;
    font-weight: bold;
    color: var(--text-color);
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    padding: 20px;
    background-color: white;
    margin-top: 20px;
  }
  </style>