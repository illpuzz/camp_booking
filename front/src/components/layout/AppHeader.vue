<!-- components/layout/AppHeader.vue -->
<template>
    <header class="app-header">
      <h1 class="text-center text-forest mb-4">營地評價系統</h1>
      <LoginBar 
        :currentUser="currentUser" 
        @login="$emit('login', $event)" 
        @logout="$emit('logout')" 
      />
    </header>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  import LoginBar from '@/components/auth/LoginBar.vue';
  
  export default defineComponent({
    name: 'AppHeader',
    components: {
      LoginBar
    },
    props: {
      currentUser: {
        type: Object,
        default: null
      }
    },
    emits: ['login', 'logout']
  });
  </script>
  
  <style scoped>
  .app-header {
    padding: 20px 0;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--forest-light);
  }
  </style>