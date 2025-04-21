<template>
    <div class="star-rating">
      <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= rating }">
        {{ i <= rating ? '★' : '☆' }}
      </span>
    </div>
  </template>
  
  <script>
  export default {
    name: 'StarRating',
    props: {
      rating: {
        type: Number,
        default: 0
      }
    }
  }
  </script>
  
  <style scoped>
  .star-rating {
    display: inline-flex;
  }
  
  .star {
    color: #ddd;
    font-size: 1.2rem;
  }
  
  .star.filled {
    color: #ffc107;
  }
  </style>