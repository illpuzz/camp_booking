// src/services/permissionService.js
import { useAuthStore } from '../stores/auth';

// 用戶角色列表
export const UserRoles = {
  VISITOR: 'visitor',     // 訪客
  USER: 'user',           // 一般用戶
  OWNER: 'owner',         // 營地主人
  ADMIN: 'admin'          // 系統管理員
};

// 營地主人列表 - 這裡是示範用，實際應從後端 API 獲取
const CAMP_OWNERS = {
  1: [2, 3],      // 營地ID 1 的主人用戶ID為 2 和 3
  2: [3],         // 營地ID 2 的主人用戶ID為 3
  3: [2, 4],      // 營地ID 3 的主人用戶ID為 2 和 4
  4: [5],         // 營地ID 4 的主人用戶ID為 5
  5: [6]          // 營地ID 5 的主人用戶ID為 6
};

// 管理員用戶 ID 列表 - 這裡是示範用，實際應從後端 API 獲取
const ADMIN_USERS = [1, 999];

export const permissionService = {
  // 獲取當前用戶角色
  getCurrentUserRole: () => {
    const authStore = useAuthStore();
    const userId = authStore.userId || null;
    
    if (!userId) return UserRoles.VISITOR;
    
    if (ADMIN_USERS.includes(Number(userId))) {
      return UserRoles.ADMIN;
    }
    
    // 檢查是否為任意營地的主人
    for (const campId in CAMP_OWNERS) {
      if (CAMP_OWNERS[campId].includes(Number(userId))) {
        return UserRoles.OWNER;
      }
    }
    
    return UserRoles.USER;
  },
  
  // 檢查用戶是否為指定營地的主人
  isOwnerOfCamp: (userId, campSiteId) => {
    if (!userId || !campSiteId) return false;
    
    const owners = CAMP_OWNERS[campSiteId] || [];
    return owners.includes(Number(userId));
  },
  
  // 檢查用戶是否為管理員
  isAdmin: (userId) => {
    if (!userId) return false;
    return ADMIN_USERS.includes(Number(userId));
  },
  
  // 檢查用戶是否有回覆評價的權限
  canReplyToReview: (userId, campSiteId) => {
    if (!userId || !campSiteId) return false;
    
    // 管理員可以回覆任何評價
    if (permissionService.isAdmin(userId)) return true;
    
    // 營地主人可以回覆自己營地的評價
    return permissionService.isOwnerOfCamp(userId, campSiteId);
  },
  
  // 取得用戶可以管理的營地列表
  getUserManagedCamps: (userId) => {
    if (!userId) return [];
    
    const managedCamps = [];
    
    // 如果是管理員，可以管理所有營地
    if (permissionService.isAdmin(userId)) {
      return Object.keys(CAMP_OWNERS).map(id => Number(id));
    }
    
    // 檢查用戶是否為各營地的主人
    for (const campId in CAMP_OWNERS) {
      if (CAMP_OWNERS[campId].includes(Number(userId))) {
        managedCamps.push(Number(campId));
      }
    }
    
    return managedCamps;
  }
};

export default permissionService;