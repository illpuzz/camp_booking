// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';

// 懶加載視圖組件
const HomeView = () => import('@/views/HomeView.vue');
const ReviewsView = () => import('@/views/ReviewsView.vue');
const LoginView = () => import('@/views/LoginView.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/reviews/:campSiteId',
    name: 'Reviews',
    component: ReviewsView,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 導航守衛
router.beforeEach((to, from, next) => {
  const isLoggedIn = !!store.state.user.currentUser;
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next({ name: 'Login' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;