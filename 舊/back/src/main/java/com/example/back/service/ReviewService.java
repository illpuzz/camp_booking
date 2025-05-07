package com.example.back.service;

import com.example.back.exception.ReviewNotFoundException;
import com.example.back.model.Review;
import com.example.back.model.ReviewImage;
import com.example.back.model.ReviewLike;
import com.example.back.repository.ReviewImageRepository;
import com.example.back.repository.ReviewLikeRepository;
import com.example.back.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewImageRepository imageRepository;

    @Autowired
    private ReviewLikeRepository likeRepository;
    
    @Autowired
    private ReviewImageService imageService;
    
    // 創建評價
    @Transactional
    public Review createReview(Review review) {
        // 設置可見性
        if (review.getReviewIsVisible() == null) review.setReviewIsVisible(true);
        if (review.getReplyIsVisible() == null) review.setReplyIsVisible(false);
        
        // 保存評價
        Review savedReview = reviewRepository.save(review);
        
        // 如果有圖片網址，保存圖片
        List<String> imageUrls = review.getImageUrls();
        if (imageUrls != null) {
            for (String imageUrl : imageUrls) {
                if (imageUrl != null && !imageUrl.isEmpty()) {
                    ReviewImage image = new ReviewImage();
                    image.setReviewId(savedReview.getId());
                    image.setImageUrl(imageUrl);
                    imageRepository.save(image);
                }
            }
        }

        return getReview(savedReview.getId(), review.getUserId());
    }
    
    // 獲取評價
    public Review getReview(Integer reviewId, Integer currentUserId) {
        // 獲取評價
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));

        // 獲取評價圖片
        List<ReviewImage> images = imageRepository.findByReviewId(reviewId);
        
        List<String> imageUrls = images.stream()
                .map(ReviewImage::getImageUrl)
                .collect(Collectors.toList());
        review.setImageUrls(imageUrls);

        // 獲取點讚數
        Long likeCount = likeRepository.countLikesByReviewId(reviewId);
        review.setLikeCount(likeCount != null ? likeCount : 0L);

        // 獲取當前用戶的點讚狀態
        if (currentUserId != null) {
            Optional<ReviewLike> like = likeRepository.findByUserIdAndReviewId(currentUserId, reviewId);
            if (like.isPresent()) {
                Integer likeType = like.get().getLikeType();
                review.setUserLikeStatus(likeType != null ? likeType : 0);
            } else {
                review.setUserLikeStatus(0);
            }
        }
        
        return review;
    }
    
    // 更新評價
    @Transactional
    public Review updateReview(Integer reviewId, Review updatedReview) {
        // 獲取評價
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));

        // 更新評價資訊
        if (updatedReview.getReviewText() != null) {
            review.setReviewText(updatedReview.getReviewText());
        }
        if (updatedReview.getOverallRating() != null) {
            review.setOverallRating(updatedReview.getOverallRating());
        }
        if (updatedReview.getCleanlinessRating() != null) {
            review.setCleanlinessRating(updatedReview.getCleanlinessRating());
        }
        if (updatedReview.getConvenienceRating() != null) {
            review.setConvenienceRating(updatedReview.getConvenienceRating());
        }
        if (updatedReview.getFriendlinessRating() != null) {
            review.setFriendlinessRating(updatedReview.getFriendlinessRating());
        }
        if (updatedReview.getPros() != null) {
            review.setPros(updatedReview.getPros());
        }
        if (updatedReview.getCons() != null) {
            review.setCons(updatedReview.getCons());
        }
        if (updatedReview.getReviewIsVisible() != null) {
            review.setReviewIsVisible(updatedReview.getReviewIsVisible());
        }

        // 保存更新後的評價
        Review savedReview = reviewRepository.save(review);

        // 處理圖片
        List<String> newImageUrls = updatedReview.getImageUrls();
        if (newImageUrls != null) {
            // 先刪除舊圖片
            imageRepository.deleteByReviewId(reviewId);
            
            // 添加新圖片
            for (String imageUrl : newImageUrls) {
                if (imageUrl != null && !imageUrl.isEmpty()) {
                    ReviewImage image = new ReviewImage();
                    image.setReviewId(reviewId);
                    image.setImageUrl(imageUrl);
                    imageRepository.save(image);
                }
            }
        }

        // 返回更新後的評價
        return getReview(savedReview.getId(), updatedReview.getUserId());
    }
    
    // 管理員回覆評價
    public Review replyToReview(Integer reviewId, String replyText) {
        // 獲取評價
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));

        // 更新回覆
        review.setReplyText(replyText);
        review.setReplyIsVisible(true);
        Review updatedReview = reviewRepository.save(review);

        return getReview(updatedReview.getId(), null);
    }
    
    // 刪除評價
    @Transactional
    public void deleteReview(Integer reviewId, Integer userId) {
        // 獲取評價
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));

        // 驗證是否是評價的作者
        if (!review.getUserId().equals(userId)) {
            throw new ReviewNotFoundException("無權限刪除此評價");
        }

        // 刪除評價相關資料
        imageRepository.deleteByReviewId(reviewId);
        likeRepository.deleteByReviewId(reviewId);
        reviewRepository.deleteById(reviewId);
    }
    
    // 點讚/取消點讚評價
    @Transactional
    public void toggleLike(Integer reviewId, Integer userId) {
        // 獲取評價
        reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));

        // 查找是否已有點讚記錄
        Optional<ReviewLike> existingLike = likeRepository.findByUserIdAndReviewId(userId, reviewId);

        if (existingLike.isPresent()) {
            // 已點讚，取消點讚
            likeRepository.delete(existingLike.get());
        } else {
            // 未點讚，新增點讚
            ReviewLike newLike = new ReviewLike();
            newLike.setUserId(userId);
            newLike.setReviewId(reviewId);
            newLike.setLikeType(1); // 1表示點讚
            likeRepository.save(newLike);
        }
    }
    
    // 根據條件搜尋評價
    public Page<Review> searchReviews(String keyword, Integer campSiteId, Integer minRating, Integer currentUserId, 
                                    int page, int size, String sortBy, String sortDirection) {
        // 建立排序
        Sort sort = Sort.by(
                sortDirection.equalsIgnoreCase("ASC") ? 
                Sort.Direction.ASC : Sort.Direction.DESC, 
                sortBy);
        
        // 建立分頁
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Review> reviews;

        // 根據搜尋條件查詢
        if (keyword != null && !keyword.isEmpty()) {
            reviews = reviewRepository.findByKeyword(keyword, pageable);
        } else if (campSiteId != null) {
            reviews = reviewRepository.findByCampSiteIdAndReviewIsVisibleTrue(campSiteId, pageable);
        } else if (minRating != null) {
            reviews = reviewRepository.findByOverallRatingGreaterThanEqualAndReviewIsVisibleTrue(minRating, pageable);
        } else {
            // 無特定條件，返回所有評價
            reviews = reviewRepository.findAll(pageable);
        }

        // 為每個評價添加額外信息
        for (Review review : reviews.getContent()) {
            // 獲取評價圖片
            List<ReviewImage> images = imageRepository.findByReviewId(review.getId());
            
            List<String> imageUrls = images.stream()
                    .map(ReviewImage::getImageUrl)
                    .collect(Collectors.toList());
            review.setImageUrls(imageUrls);

            // 獲取點讚數
            Long likeCount = likeRepository.countLikesByReviewId(review.getId());
            review.setLikeCount(likeCount != null ? likeCount : 0L);

            // 獲取當前用戶的點讚狀態
            if (currentUserId != null) {
                Optional<ReviewLike> like = likeRepository.findByUserIdAndReviewId(currentUserId, review.getId());
                if (like.isPresent() && like.get().getLikeType() != null) {
                    review.setUserLikeStatus(like.get().getLikeType());
                } else {
                    review.setUserLikeStatus(0);
                }
            }
        }
        
        return reviews;
    }
    
    // 獲取營地平均評分
    public Double getAverageRatingByCampSite(Integer campSiteId) {
        Double avgRating = reviewRepository.getAverageRatingByCampSiteId(campSiteId);
        return avgRating != null ? avgRating : 0.0;
    }
}