package com.example.back.service;

import com.example.back.model.ReviewReport;
import com.example.back.repository.ReviewReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewReportService {

    @Autowired
    private ReviewReportRepository reportRepository;
    
    // 創建舉報
    public ReviewReport createReport(ReviewReport report) {
        return reportRepository.save(report);
    }
    
    // 根據ID獲取舉報 (添加這個方法)
    public ReviewReport getReport(Integer reportId) {
        return reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("舉報不存在: " + reportId));
    }
    
    // 根據ID獲取舉報 (保留原有方法)
    public Optional<ReviewReport> getReportById(Integer id) {
        return reportRepository.findById(id);
    }
    
    // 根據評價ID獲取所有舉報
    public List<ReviewReport> getReportsByReviewId(Integer reviewId) {
        return reportRepository.findByReviewId(reviewId);
    }
    
    // 查詢使用者是否已舉報評價
    public boolean hasUserReportedReview(Integer userId, Integer reviewId) {
        return reportRepository.findByUserIdAndReviewId(userId, reviewId).isPresent();
    }
    
    // 獲取所有待處理的舉報
    public List<ReviewReport> getPendingReports() {
        return reportRepository.findByStatus("pending");
    }
    
    // 處理舉報
    public ReviewReport processReport(Integer reportId, String status, String handlerNote) {
        ReviewReport report = getReport(reportId);
        report.setStatus(status);
        // 如果您的實體類有 handlerNote 欄位，可以設置處理備註
        // report.setHandlerNote(handlerNote);
        return reportRepository.save(report);
    }
}