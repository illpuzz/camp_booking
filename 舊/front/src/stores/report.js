// src/stores/report.js
import { defineStore } from 'pinia';
import { reportService } from '../services/api';

export const useReportStore = defineStore('report', {
  state: () => ({
    reports: [],
    currentReport: null,
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 0
  }),
  
  actions: {
    // 創建檢舉
    async createReport(report) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await reportService.createReport(report);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
        console.error('創建檢舉失敗:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // 獲取特定狀態的檢舉列表
    async fetchReportsByStatus(status = 'pending', page = 0, size = 10) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await reportService.getReportsByStatus(status, page, size);
        this.reports = response.data.content;
        this.totalPages = response.data.totalPages;
        this.currentPage = response.data.number;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
        console.error('獲取檢舉列表失敗:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // 處理檢舉
    async processReport(reportId, status, roleId) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await reportService.processReport(reportId, status, roleId);
        
        // 更新列表中對應的報告
        const index = this.reports.findIndex(r => r.id === reportId);
        if (index !== -1) {
          this.reports[index] = response.data;
        }
        
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
        console.error('處理檢舉失敗:', error);
        return null;
      } finally {
        this.loading = false;
      }
    }
  }
});