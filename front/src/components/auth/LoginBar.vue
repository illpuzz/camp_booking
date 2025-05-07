<!-- LoginBar.vue - 頂部登入狀態欄 -->
<template>
  <div class="login-bar">
    <div v-if="currentUser" class="user-info">
      <span class="user-welcome">
        <i class="bi bi-person-circle me-2"></i>
        您好，{{ currentUser.name }}
        <span class="badge rounded-pill" :class="getRoleBadgeClass(currentUser.role)">
          {{ getRoleName(currentUser.role) }}
        </span>
      </span>
      
      <div class="actions">
        <div class="dropdown d-inline-block me-2">
         
          <ul class="dropdown-menu" aria-labelledby="switchRoleMenu">
            <li><button class="dropdown-item" @click="switchRole('user')">一般用戶</button></li>
            <li><button class="dropdown-item" @click="switchRole('owner')">營地主人</button></li>
            <li><button class="dropdown-item" @click="switchRole('admin')">管理員</button></li>
          </ul>
        </div>
        
        <button class="btn btn-outline-danger" @click="logout">
          <i class="bi bi-box-arrow-right me-1"></i>登出
        </button>
      </div>
    </div>
    
    <div v-else class="guest-info">
      <span>遊客您好，請登入系統</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginBar',
  props: {
    currentUser: {
      type: Object,
      default: null
    }
  },
  emits: ['login', 'logout'],
  setup(props, { emit }) {
    // 取得角色名稱
    const getRoleName = (role) => {
      const roleMap = {
        'user': '一般用戶',
        'owner': '營地主人',
        'admin': '系統管理員'
      };
      return roleMap[role] || '未知角色';
    };
    
    // 取得角色徽章的CSS類
    const getRoleBadgeClass = (role) => {
      const roleClassMap = {
        'user': 'bg-info',
        'owner': 'bg-success',
        'admin': 'bg-danger'
      };
      return roleClassMap[role] || 'bg-secondary';
    };
    
    // 切換角色 - 簡易模擬
    const switchRole = (role) => {
      if (!props.currentUser) return;
      
      const newUser = {
        ...props.currentUser,
        role: role
      };
      
      emit('login', newUser);
    };
    
    // 登出
    const logout = () => {
      emit('logout');
    };
    
    return {
      getRoleName,
      getRoleBadgeClass,
      switchRole,
      logout
    };
  }
};
</script>

<style scoped>
.login-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.user-info, .guest-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.user-welcome {
  font-weight: 500;
  color: var(--forest-dark);
}

.badge {
  margin-left: 8px;
  font-weight: 500;
  padding: 5px 10px;
}

.actions {
  display: flex;
  align-items: center;
}
</style>