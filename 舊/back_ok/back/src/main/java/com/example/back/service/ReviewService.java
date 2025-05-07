package com.example.back.service;

import com.example.back.exception.ReviewNotFoundException;
import com.example.back.model.Review;
import com.example.back.model.ReviewLike;
import com.example.back.repository.ReviewLikeRepository;
import com.example.back.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewLikeRepository reviewLikeRepository;

    /**
     * 創建評價
     */
    public Review createReview(Review review) {
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());
        review.setReviewIsVisible(true); // 确保新评价是可见的
        return reviewRepository.save(review);
    }

    /**
     * 獲取評價 (包括用戶點讚狀態)
     */
    public Review getReview(Integer id, Integer userId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ReviewNotFoundException("找不到評價 ID: " + id));

        // 如果提供了用戶ID，加載該用戶的點讚狀態
        if (userId != null) {
            Optional<ReviewLike> like = reviewLikeRepository.findByUserIdAndReviewId(userId, id);
            review.setUserLikeStatus(like.isPresent() ? 1 : 0);
        }

        return review;
    }

    /**
     * 更新評價
     */
    public Review updateReview(Integer id, Review reviewDetails) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ReviewNotFoundException("找不到評價 ID: " + id));

        review.setReviewText(reviewDetails.getReviewText());
        review.setOverallRating(reviewDetails.getOverallRating());
        review.setCleanlinessRating(reviewDetails.getCleanlinessRating());
        review.setConvenienceRating(reviewDetails.getConvenienceRating());
        review.setFriendlinessRating(reviewDetails.getFriendlinessRating());
        review.setPros(reviewDetails.getPros());
        review.setCons(reviewDetails.getCons());
        review.setUpdatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    /**
     * 刪除評價
     */
    public void deleteReview(Integer id, Integer userId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ReviewNotFoundException("找不到評價 ID: " + id));

        // 檢查用戶是否有權限刪除該評價
        if (!review.getUserId().equals(userId)) {
            throw new RuntimeException("無權刪除此評價");
        }

        // 刪除該評價的所有點讚記錄
        reviewLikeRepository.deleteByReviewId(id);

        // 標記評價為不可見（邏輯刪除）
        review.setReviewIsVisible(false);
        review.setUpdatedAt(LocalDateTime.now());
        reviewRepository.save(review);
    }

    /**
     * 營地方回覆評價
     */
    public Review replyToReview(Integer id, String replyText) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ReviewNotFoundException("找不到評價 ID: " + id));

        review.setReplyText(replyText);
        review.setUpdatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    /**
     * 刪除評價回覆
     * 
     * @param reviewId 評價ID
     */
    public void deleteReply(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException("找不到評價 ID: " + reviewId));
        
        // 清除回覆文字
        review.setReplyText(null);
        review.setUpdatedAt(LocalDateTime.now());
        
        // 保存更新後的評價
        reviewRepository.save(review);
    }

    /**
     * 點讚/取消點讚評價
     */
    @Transactional
    public void toggleLike(Integer reviewId, Integer userId) {
        try {
            // 檢查評價是否存在
            Review review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new ReviewNotFoundException("找不到評價 ID: " + reviewId));

            // 檢查用戶是否已點讚
            Optional<ReviewLike> existingLike = reviewLikeRepository.findByUserIdAndReviewId(userId, reviewId);

            if (existingLike.isPresent()) {
                // 已點讚，取消點讚
                reviewLikeRepository.delete(existingLike.get());
                
                // 更新點讚計數
                Long currentLikes = review.getLikeCount() != null ? review.getLikeCount() : 0L;
                review.setLikeCount(Math.max(0L, currentLikes - 1));
            } else {
                // 未點讚，添加點讚
                ReviewLike newLike = new ReviewLike();
                newLike.setReviewId(reviewId);
                newLike.setUserId(userId);
                newLike.setLikeType(1); // 設置點讚類型，1 表示讚
                newLike.setCreatedAt(LocalDateTime.now());
                reviewLikeRepository.save(newLike);
                
                // 更新點讚計數
                Long currentLikes = review.getLikeCount() != null ? review.getLikeCount() : 0L;
                review.setLikeCount(currentLikes + 1L);
            }
            
            // 保存更新的評價
            reviewRepository.save(review);
        } catch (Exception e) {
            // 記錄錯誤
            System.err.println("點讚操作失敗: " + e.getMessage());
            e.printStackTrace();
            // 重新拋出以保持原有行為
            throw e;
        }
    }

    /**
     * 搜索評價
     */
    public Page<Review> searchReviews(String keyword, Integer campSiteId, Integer minRating, Integer userId, 
                                      int page, int size, String sortBy, String direction) {
        
        // 創建分頁和排序
        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<Review> reviews;
        
        // 根據不同參數使用不同的查詢方法
        if (keyword != null && !keyword.trim().isEmpty()) {
            // 關鍵字搜索
            reviews = reviewRepository.findByKeyword(keyword.trim(), pageable);
        } else if (campSiteId != null) {
            // 營地ID搜索
            reviews = reviewRepository.findByCampSiteIdAndReviewIsVisibleTrue(campSiteId, pageable);
        } else if (minRating != null && minRating > 0) {
            // 最低評分搜索
            reviews = reviewRepository.findByOverallRatingGreaterThanEqualAndReviewIsVisibleTrue(minRating, pageable);
        } else {
            // 使用 JPA 內建方法
            reviews = reviewRepository.findAll(pageable);
        }
        
        // 如果提供了userId，則附加點讚狀態
        if (userId != null && reviews.hasContent()) {
            for (Review review : reviews.getContent()) {
                Optional<ReviewLike> like = reviewLikeRepository.findByUserIdAndReviewId(userId, review.getId());
                review.setUserLikeStatus(like.isPresent() ? 1 : 0);
            }
        }
        
        return reviews;
    }

    /**
     * 獲取營地平均評分
     */
    public Double getAverageRatingByCampSite(Integer campSiteId) {
        return reviewRepository.getAverageRatingByCampSiteId(campSiteId);
    }
}