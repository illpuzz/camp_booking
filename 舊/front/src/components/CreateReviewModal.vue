<!-- src/components/CreateReviewModal.vue -->
<template>
    <div class="modal">
      <div class="modal-content">
        <h2>新增評價</h2>
        <form @submit.prevent="submitReview">
          <div>
            <label>整體評分</label>
            <StarRating v-model="review.overallRating" />
          </div>
          <textarea 
            v-model="review.reviewText" 
            placeholder="請輸入評價內容" 
            required
          ></textarea>
          <div class="modal-actions">
            <button type="button" @click="$emit('close')">取消</button>
            <button type="submit">送出</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useReviewStore } from '@/stores/reviewStore'
  import StarRating from '@/components/StarRating.vue'
  
  const props = defineProps({
    campSiteId: {
      type: Number,
      required: true
    }
  })
  
  const emit = defineEmits(['close', 'review-created'])
  
  const reviewStore = useReviewStore()
  const review = ref({
    campSiteId: props.campSiteId,
    userId: 1, // 實際應從登入狀態獲取
    reviewText: '',
    overallRating: 0
  })
  
  const submitReview = async () => {
    await reviewStore.createReview(review.value)
    emit('review-created')
  }
  </script>
  
  <style scoped>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 5px;
    width: 400px;
  }
  </style>