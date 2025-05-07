<script setup>
import { computed } from 'vue';

const props = defineProps({
  rating: {
    type: Number,
    default: 0
  },
  maxRating: {
    type: Number,
    default: 5
  },
  readonly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:rating']);

// 計算星星的數組
const stars = computed(() => {
  return Array.from({ length: props.maxRating }, (_, index) => index + 1);
});

// 選擇星星評分
const selectRating = (value) => {
  if (props.readonly) return;
  emit('update:rating', value);
};

// 獲取星星的類名
const getStarClass = (value) => {
  return value <= props.rating ? 'filled' : 'empty';
};
</script>

<template>
  <div class="star-rating" :class="{ 'readonly': readonly }">
    <span
      v-for="star in stars"
      :key="star"
      :class="['star', getStarClass(star)]"
      @click="selectRating(star)"
    >
      ★
    </span>
  </div>
</template>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
}

.star {
  font-size: 16px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.star.filled {
  color: #ff9800;
}

.star:hover {
  transform: scale(1.1);
}

.readonly .star {
  cursor: default;
}

.readonly .star:hover {
  transform: none;
}
</style>