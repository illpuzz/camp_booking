// dateFormatter.js - 日期格式化工具

/**
 * 格式化日期為本地字串 (YYYY年MM月DD日)
 * @param {string|Date} dateInput 日期字串或日期物件
 * @returns {string} 格式化後的日期字串
 */
export const formatDate = (dateInput) => {
    if (!dateInput) return '';
    
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      
      // 檢查日期是否有效
      if (isNaN(date.getTime())) {
        return '無效日期';
      }
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      return `${year}年${month}月${day}日`;
    } catch (error) {
      console.error('日期格式化失敗:', error);
      return '日期錯誤';
    }
  };
  
  /**
   * 格式化日期和時間 (YYYY年MM月DD日 HH:MM)
   * @param {string|Date} dateInput 日期字串或日期物件
   * @returns {string} 格式化後的日期和時間字串
   */
  export const formatDateTime = (dateInput) => {
    if (!dateInput) return '';
    
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      
      // 檢查日期是否有效
      if (isNaN(date.getTime())) {
        return '無效日期';
      }
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${year}年${month}月${day}日 ${hours}:${minutes}`;
    } catch (error) {
      console.error('日期時間格式化失敗:', error);
      return '日期錯誤';
    }
  };
  
  /**
   * 格式化為相對時間 (例如: 3天前, 2小時前, 剛剛)
   * @param {string|Date} dateInput 日期字串或日期物件
   * @returns {string} 相對時間字串
   */
  export const formatRelativeTime = (dateInput) => {
    if (!dateInput) return '';
    
    try {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      
      // 檢查日期是否有效
      if (isNaN(date.getTime())) {
        return '無效日期';
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      // 如果是未來時間，返回具體日期
      if (diffInSeconds < 0) {
        return formatDate(date);
      }
      
      // 計算不同時間單位
      const minute = 60;
      const hour = minute * 60;
      const day = hour * 24;
      const week = day * 7;
      const month = day * 30;
      const year = day * 365;
      
      // 根據時間差返回相應的描述
      if (diffInSeconds < 30) {
        return '剛剛';
      } else if (diffInSeconds < minute) {
        return `${diffInSeconds} 秒前`;
      } else if (diffInSeconds < hour) {
        const minutes = Math.floor(diffInSeconds / minute);
        return `${minutes} 分鐘前`;
      } else if (diffInSeconds < day) {
        const hours = Math.floor(diffInSeconds / hour);
        return `${hours} 小時前`;
      } else if (diffInSeconds < week) {
        const days = Math.floor(diffInSeconds / day);
        return `${days} 天前`;
      } else if (diffInSeconds < month) {
        const weeks = Math.floor(diffInSeconds / week);
        return `${weeks} 週前`;
      } else if (diffInSeconds < year) {
        const months = Math.floor(diffInSeconds / month);
        return `${months} 個月前`;
      } else {
        const years = Math.floor(diffInSeconds / year);
        return `${years} 年前`;
      }
    } catch (error) {
      console.error('相對時間格式化失敗:', error);
      return '時間錯誤';
    }
  };
  
  /**
   * 檢查兩個日期是否為同一天
   * @param {Date|string} date1 第一個日期
   * @param {Date|string} date2 第二個日期
   * @returns {boolean} 是否為同一天
   */
  export const isSameDay = (date1, date2) => {
    try {
      const d1 = date1 instanceof Date ? date1 : new Date(date1);
      const d2 = date2 instanceof Date ? date2 : new Date(date2);
      
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    } catch (error) {
      console.error('日期比較失敗:', error);
      return false;
    }
  };
  
  /**
   * 判斷日期是否在過去
   * @param {Date|string} date 日期
   * @returns {boolean} 是否在過去
   */
  export const isPast = (date) => {
    try {
      const d = date instanceof Date ? date : new Date(date);
      return d < new Date();
    } catch (error) {
      console.error('日期判斷失敗:', error);
      return false;
    }
  };
  
  /**
   * 判斷日期是否在未來
   * @param {Date|string} date 日期
   * @returns {boolean} 是否在未來
   */
  export const isFuture = (date) => {
    try {
      const d = date instanceof Date ? date : new Date(date);
      return d > new Date();
    } catch (error) {
      console.error('日期判斷失敗:', error);
      return false;
    }
  };
  
  /**
   * 判斷日期是否已編輯 (更新時間比創建時間晚至少 1 分鐘)
   * @param {Date|string} createdAt 創建時間
   * @param {Date|string} updatedAt 更新時間
   * @returns {boolean} 是否已編輯
   */
  export const isEdited = (createdAt, updatedAt) => {
    if (!createdAt || !updatedAt) return false;
    
    try {
      const created = createdAt instanceof Date ? createdAt : new Date(createdAt);
      const updated = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
      
      // 如果更新時間比創建時間晚 1 分鐘以上，則認為已編輯
      return updated.getTime() > created.getTime() + 60000; // 60000 毫秒 = 1 分鐘
    } catch (error) {
      console.error('編輯判斷失敗:', error);
      return false;
    }
  };
  
  export default {
    formatDate,
    formatDateTime,
    formatRelativeTime,
    isSameDay,
    isPast,
    isFuture,
    isEdited
  };