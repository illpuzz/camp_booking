<!-- Login.vue - 登入組件 (增強版) -->
<template>
  <div class="login-component">
    <h2 class="text-center text-forest mb-4">
      <i class="bi bi-door-open me-2"></i>
      系統登入
    </h2>
    
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="mb-3">
        <label for="username" class="form-label">用戶名稱</label>
        <input 
          type="text" 
          class="form-control" 
          id="username" 
          v-model="username" 
          required
        >
      </div>
      
      <div class="mb-3">
        <label for="password" class="form-label">密碼</label>
        <div class="input-group">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            class="form-control" 
            id="password" 
            v-model="password" 
            required
          >
          <button 
            type="button" 
            class="btn btn-outline-secondary" 
            @click="showPassword = !showPassword"
          >
            <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
          </button>
        </div>
        <div class="form-text text-forest-medium">本系統為模擬登入，可任意輸入</div>
      </div>
      
      <div class="mb-3">
        <label for="role" class="form-label">登入角色</label>
        <select class="form-select" id="role" v-model="role">
          <option value="user">一般用戶</option>
          <option value="owner">營地主人</option>
          <option value="admin">系統管理員</option>
        </select>
      </div>
      
      <div class="mb-3">
        <label for="idOption" class="form-label">用戶 ID 選項</label>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="idOption" id="fixedId" value="fixed" v-model="idOption">
          <label class="form-check-label" for="fixedId">
            使用固定 ID (用戶: 101, 營地主人: 201, 管理員: 301)
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="idOption" id="randomId" value="random" v-model="idOption">
          <label class="form-check-label" for="randomId">
            使用隨機 ID (1-1000)
          </label>
        </div>
      </div>
      
      <div class="mb-3" v-if="idOption === 'custom'">
        <label for="customId" class="form-label">自訂 ID</label>
        <input 
          type="number" 
          class="form-control" 
          id="customId" 
          v-model="customId" 
          min="1" 
          max="1000"
        >
      </div>
      
      <div class="d-grid">
        <button type="submit" class="btn btn-success">
          <i class="bi bi-box-arrow-in-right me-2"></i>
          登入系統
        </button>
      </div>
      
      <div class="mt-3 text-center">
        <p class="text-muted">示範用戶：</p>
        <div class="demo-users">
          <div class="demo-user" @click="selectDemoUser('user')">
            <span class="badge bg-info">一般用戶</span>
            <small>user / password</small>
          </div>
          <div class="demo-user" @click="selectDemoUser('owner')">
            <span class="badge bg-success">營地主人</span>
            <small>owner / password</small>
          </div>
          <div class="demo-user" @click="selectDemoUser('admin')">
            <span class="badge bg-danger">管理員</span>
            <small>admin / password</small>
          </div>
        </div>
      </div>
    </form>
    
    <div v-if="loginError" class="alert alert-danger mt-3">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      {{ loginError }}
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'Login',
  emits: ['login'],
  setup(props, { emit }) {
    const username = ref('');
    const password = ref('');
    const role = ref('user');
    const showPassword = ref(false);
    const loginError = ref('');
    const idOption = ref('fixed'); // 'fixed', 'random', 或 'custom'
    const customId = ref(101);
    
    // 角色對應的固定 userId
    const roleUserIdMap = {
      'user': 101,   // 一般用戶固定 ID 為 101
      'owner': 201,  // 營地主人固定 ID 為 201
      'admin': 301   // 管理員固定 ID 為 301
    };
    
    // 當角色變化時，如果使用自訂 ID，則更新自訂 ID 值為該角色的默認 ID
    watch(role, (newRole) => {
      if (idOption.value === 'custom') {
        customId.value = roleUserIdMap[newRole] || 101;
      }
    });
    
    // 處理登入
    const handleLogin = () => {
      // 重置錯誤訊息
      loginError.value = '';
      
      // 簡單的驗證
      if (!username.value.trim() || !password.value.trim()) {
        loginError.value = '請輸入使用者名稱和密碼';
        return;
      }
      
      // 根據選項確定用戶 ID
      let userId;
      
      if (idOption.value === 'fixed') {
        // 使用固定 ID
        userId = roleUserIdMap[role.value];
      } else if (idOption.value === 'random') {
        // 生成隨機 ID
        userId = Math.floor(Math.random() * 1000) + 1;
      } else if (idOption.value === 'custom') {
        // 使用自訂 ID
        userId = parseInt(customId.value) || roleUserIdMap[role.value];
      }
      
      // 模擬用戶資料
      const user = {
        id: userId,
        name: username.value,
        role: role.value
      };
      
      console.log(`用戶登入: ${username.value}, 角色: ${role.value}, ID: ${userId}`);
      
      // 觸發登入事件並傳遞用戶資料
      emit('login', user);
    };
    
    // 選擇示範用戶
    const selectDemoUser = (userRole) => {
      const demoUsers = {
        user: { username: 'user', password: 'password' },
        owner: { username: 'owner', password: 'password' },
        admin: { username: 'admin', password: 'password' }
      };
      
      const selectedUser = demoUsers[userRole];
      
      if (selectedUser) {
        username.value = selectedUser.username;
        password.value = selectedUser.password;
        role.value = userRole;
      }
    };
    
    return {
      username,
      password,
      role,
      showPassword,
      loginError,
      idOption,
      customId,
      handleLogin,
      selectDemoUser
    };
  }
};
</script>

<style scoped>
.login-component {
  padding: 30px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-form {
  max-width: 400px;
  margin: 0 auto;
}

.demo-users {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
}

.demo-user {
  padding: 10px;
  border-radius: 8px;
  background-color: #f8f9fa;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
}

.demo-user:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
}

.badge {
  font-weight: 500;
  padding: 5px 10px;
}
</style>