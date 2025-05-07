<!-- App.vue - 超極簡版 -->
<template>
  <RootLayout />
</template>

<script>
import { defineComponent } from 'vue';
import RootLayout from './layouts/RootLayout.vue';

export default defineComponent({
  name: 'App',
  components: {
    RootLayout
  }
});
</script>