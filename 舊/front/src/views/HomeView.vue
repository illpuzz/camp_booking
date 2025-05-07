<template>
    <div class="home">
      <!-- 頂部封面區 -->
      <div class="hero-section mb-5">
        <div class="container py-5">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <h1 class="display-4 fw-bold text-success">營地評價系統</h1>
              <p class="lead">發現最佳露營體驗，分享您的營地故事</p>
              <p class="mb-4">瀏覽真實用戶的評價，幫助您做出最佳選擇。或者分享您的露營經驗，協助其他露營愛好者。</p>
              <div class="d-flex flex-wrap gap-2">
                <router-link to="/reviews" class="btn btn-success btn-lg">
                  <i class="bi bi-search me-2"></i>查看評價
                </router-link>
                <button class="btn btn-outline-success btn-lg" @click="showNewReviewForm">
                  <i class="bi bi-pencil me-2"></i>撰寫評價
                </button>
              </div>
            </div>
            <div class="col-lg-6 mt-4 mt-lg-0">
              <img src="https://via.placeholder.com/600x400?text=營地風景" alt="營地風景" class="img-fluid rounded shadow">
            </div>
          </div>
        </div>
      </div>
  
      <!-- 熱門營地 -->
      <div class="container mb-5">
        <div class="section-header mb-4">
          <h2 class="text-center">熱門營地</h2>
          <div class="divider mx-auto"></div>
        </div>
        
        <div class="row">
          <div class="col-md-4 mb-4" v-for="campsite in popularCampsites" :key="campsite.id">
            <div class="card h-100 campsite-card">
              <img :src="campsite.image" class="card-img-top" :alt="campsite.name">
              <div class="card-body">
                <h5 class="card-title">{{ campsite.name }}</h5>
                <p class="card-text text-muted">{{ campsite.location }}</p>
                <div class="d-flex align-items-center mb-2">
                  <div class="me-2">
                    <i v-for="i in 5" :key="i" 
                       :class="i <= campsite.rating ? 'bi bi-star-fill rating-star' : 'bi bi-star rating-star-empty'"></i>
                  </div>
                  <span>{{ campsite.rating }} ({{ campsite.reviewCount }}則評價)</span>
                </div>
                <p class="card-text">{{ campsite.description }}</p>
              </div>
              <div class="card-footer bg-white border-top-0">
                <button 
                  class="btn btn-outline-success w-100" 
                  @click="selectCampsite(campsite)"
                >
                  查看評價
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 最新評價 -->
      <div class="bg-light py-5 mb-5">
        <div class="container">
          <div class="section-header mb-4">
            <h2 class="text-center">最新評價</h2>
            <div class="divider mx-auto"></div>
          </div>
          
          <div v-if="loading" class="text-center my-5">
            <div class="spinner-border text-success" role="status">
              <span class="visually-hidden">載入中...</span>
            </div>
            <p class="mt-2">評價載入中...</p>
          </div>
          
          <div v-else>
            <div class="row">
              <div class="col-md-6 mb-4" v-for="review in latestReviews" :key="review.id">
                <div class="card h-100">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                      <div class="d-flex align-items-center">
                        <div class="user-avatar me-2">
                          {{ review.userName ? review.userName.charAt(0) : 'U' }}
                        </div>
                        <div>
                          <h6 class="mb-0">{{ review.userName || '匿名用戶' }}</h6>
                          <small class="text-muted">{{ review.createdAt }}</small>
                        </div>
                      </div>
                      <div>
                        <i v-for="i in 5" :key="i" 
                           :class="i <= review.overallRating ? 'bi bi-star-fill rating-star' : 'bi bi-star rating-star-empty'"></i>
                      </div>
                    </div>
                    
                    <h6 class="text-success mb-2">{{ review.campSiteName }}</h6>
                    <p class="review-text">{{ review.reviewText.length > 100 ? review.reviewText.substring(0, 100) + '...' : review.reviewText }}</p>
                    
                    <router-link :to="`/reviews/${review.id}`" class="btn btn-sm btn-outline-success">
                      查看完整評價
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="text-center mt-4">
              <router-link to="/reviews" class="btn btn-success">
                查看所有評價
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 評價撰寫表單對話框 -->
      <div class="modal fade" id="newReviewModal" tabindex="-1" aria-hidden="true" ref="reviewModal">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">撰寫新評價</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <!-- 這裡將實現評價表單 -->
              <form @submit.prevent="submitReview">
                <div class="mb-3">
                  <label for="campsite" class="form-label">選擇營地</label>
                  <select id="campsite" class="form-select" v-model="newReview.campSiteId" required>
                    <option value="" disabled>請選擇營地</option>
                    <option v-for="camp in allCampsites" :key="camp.id" :value="camp.id">
                      {{ camp.name }}
                    </option>
                  </select>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">整體評分</label>
                  <div class="rating-input">
                    <i 
                      v-for="i in 5" 
                      :key="i" 
                      :class="i <= newReview.overallRating ? 'bi bi-star-fill' : 'bi bi-star'" 
                      @click="newReview.overallRating = i"
                    ></i>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label">清潔程度</label>
                    <div class="rating-input">
                      <i 
                        v-for="i in 5" 
                        :key="i" 
                        :class="i <= newReview.cleanlinessRating ? 'bi bi-star-fill' : 'bi bi-star'" 
                        @click="newReview.cleanlinessRating = i"
                      ></i>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">便利程度</label>
                    <div class="rating-input">
                      <i 
                        v-for="i in 5" 
                        :key="i" 
                        :class="i <= newReview.convenienceRating ? 'bi bi-star-fill' : 'bi bi-star'" 
                        @click="newReview.convenienceRating = i"
                      ></i>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">友善程度</label>
                    <div class="rating-input">
                      <i 
                        v-for="i in 5" 
                        :key="i" 
                        :class="i <= newReview.friendlinessRating ? 'bi bi-star-fill' : 'bi bi-star'" 
                        @click="newReview.friendlinessRating = i"
                      ></i>
                    </div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="reviewText" class="form-label">評價內容</label>
                  <textarea 
                    id="reviewText" 
                    class="form-control" 
                    v-model="newReview.reviewText" 
                    rows="5" 
                    placeholder="分享您的營地體驗..." 
                    required
                  ></textarea>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="pros" class="form-label">優點</label>
                    <textarea 
                      id="pros" 
                      class="form-control" 
                      v-model="newReview.pros" 
                      rows="3" 
                      placeholder="營地的優點..."
                    ></textarea>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="cons" class="form-label">缺點</label>
                    <textarea 
                      id="cons" 
                      class="form-control" 
                      v-model="newReview.cons" 
                      rows="3" 
                      placeholder="營地的缺點..."
                    ></textarea>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">上傳照片</label>
                  <div class="input-group">
                    <input 
                      type="file" 
                      class="form-control" 
                      multiple 
                      accept="image/*" 
                      @change="handleFileUpload"
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button" 
                      @click="uploadImages" 
                      :disabled="!files.length || uploading"
                    >
                      <i class="bi bi-upload"></i> 上傳
                    </button>
                  </div>
                  <div class="form-text">可上傳多張照片 (最大 10MB)</div>
                </div>
                
                <!-- 預覽上傳的照片 -->
                <div v-if="newReview.imageUrls && newReview.imageUrls.length > 0" class="mb-3">
                  <div class="row g-2">
                    <div 
                      v-for="(url, index) in newReview.imageUrls" 
                      :key="index" 
                      class="col-md-3 col-sm-4 col-6"
                    >
                      <div class="position-relative">
                        <img :src="url" class="img-thumbnail" alt="上傳的照片">
                        <button 
                          type="button" 
                          class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" 
                          @click="removeImage(index)"
                        >
                          <i class="bi bi-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="text-end">
                  <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">取消</button>
                  <button type="submit" class="btn btn-success" :disabled="isSubmitting">
                    <span v-if="isSubmitting">
                      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      提交中...
                    </span>
                    <span v-else>提交評價</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useReviewStore } from '../stores/review'
  import { useAuthStore } from '../stores/auth'
  import { reviewService } from '../services/reviewService'
  import Swal from 'sweetalert2'
  import { Modal } from 'bootstrap'
  
  export default {
    name: 'HomeView',
    setup() {
      const router = useRouter()
      const reviewStore = useReviewStore()
      const authStore = useAuthStore()
      
      // 參考到模態窗口
      const reviewModal = ref(null)
      let modalInstance = null
      
      // 狀態
      const loading = ref(false)
      const isSubmitting = ref(false)
      const files = ref([])
      const uploading = ref(false)
      
      // 新評價表單數據
      const newReview = reactive({
        userId: authStore.userId,
        campSiteId: '',
        reviewText: '',
        overallRating: 0,
        cleanlinessRating: 0,
        convenienceRating: 0,
        friendlinessRating: 0,
        pros: '',
        cons: '',
        imageUrls: []
      })
      
      // 模擬數據
      const popularCampsites = [
        {
          id: 1,
          name: '苗栗區 山之間',
          location: '苗栗縣泰安鄉',
          rating: 4.5,
          reviewCount: 32,
          description: '位於群山環繞的秘境營地，提供絕佳的自然環境和完善的露營設施。',
          image: 'https://via.placeholder.com/400x250?text=山之間'
        },
        {
          id: 2,
          name: '花蓮海岸營地',
          location: '花蓮縣豐濱鄉',
          rating: 4.3,
          reviewCount: 24,
          description: '面向太平洋的絕美營地，能欣賞日出和星空，設施完善且環境優美。',
          image: 'https://via.placeholder.com/400x250?text=花蓮海岸'
        },
        {
          id: 3,
          name: '南投森林營區',
          location: '南投縣魚池鄉',
          rating: 4.7,
          reviewCount: 41,
          description: '被森林環繞的寧靜營地，提供完整的露營體驗，空氣清新，環境幽靜。',
          image: 'https://via.placeholder.com/400x250?text=南投森林'
        }
      ]
      
      const allCampsites = [
        ...popularCampsites,
        {
          id: 4,
          name: '宜蘭溪畔營地',
          location: '宜蘭縣大同鄉',
          rating: 4.2,
          reviewCount: 18,
          description: '溪畔優美營地，夏季可戲水，冬季可泡湯，四季皆宜。',
          image: 'https://via.placeholder.com/400x250?text=宜蘭溪畔'
        },
        {
          id: 5,
          name: '台東山海營區',
          location: '台東縣成功鎮',
          rating: 4.6,
          reviewCount: 29,
          description: '一邊是山，一邊是海，絕美景致讓您流連忘返。',
          image: 'https://via.placeholder.com/400x250?text=台東山海'
        }
      ]
      
      // 模擬最新評價數據
      const latestReviews = ref([])
      
      // 載入最新評價
      const loadLatestReviews = async () => {
        loading.value = true
        try {
          // 實際開發中應該調用 API
          setTimeout(() => {
            latestReviews.value = [
              {
                id: 1,
                userId: 101,
                userName: '王小明',
                campSiteId: 1,
                campSiteName: '苗栗區 山之間',
                reviewText: '本屋營地設計好，室內客地新穎的位置，夜靜和幽靜，基本很不錯，人門房另來的親臨優勢，有待樹蔭聲聲，中午請有些聲聲聲聲，聆聽不便。',
                overallRating: 5,
                createdAt: '2024年4月2日'
              },
              {
                id: 2,
                userId: 102,
                userName: '李小華',
                campSiteId: 2,
                campSiteName: '花蓮海岸營地',
                reviewText: '營地環境優美，非常適合家庭出遊。衛生間乾淨，營位寬敞。夜晚可以看到滿天星斗，是個放鬆心情的好地方。',
                overallRating: 4,
                createdAt: '2024年3月15日'
              },
              {
                id: 3,
                userId: 103,
                userName: '張大華',
                campSiteId: 3,
                campSiteName: '南投森林營區',
                reviewText: '這次住宿體驗非常好，工作人員熱情有禮，營地設施完善，營位規劃得當。特別喜歡他們的戶外活動安排，孩子們很喜歡。',
                overallRating: 5,
                createdAt: '2024年4月1日'
              },
              {
                id: 4,
                userId: 104,
                userName: '陳美美',
                campSiteId: 4,
                campSiteName: '宜蘭溪畔營地',
                reviewText: '溪邊環境優美，空氣清新，設施也很完善。唯一缺點是晚上蚊蟲較多，記得帶防蚊液。整體來說很推薦！',
                overallRating: 4,
                createdAt: '2024年3月28日'
              }
            ]
            loading.value = false
          }, 1000)
        } catch (error) {
          console.error('載入最新評價失敗:', error)
          loading.value = false
        }
      }
      
      // 顯示新評價表單
      const showNewReviewForm = () => {
        if (!modalInstance) {
          modalInstance = new Modal(reviewModal.value)
        }
        modalInstance.show()
      }
      
      // 選擇營地
      const selectCampsite = (campsite) => {
        reviewStore.$patch({ campsite: campsite })
        router.push('/reviews')
      }
      
      // 處理檔案上傳
      const handleFileUpload = (event) => {
        files.value = Array.from(event.target.files)
      }
      
      // 上傳圖片
      const uploadImages = async () => {
        if (!files.value.length) return
        
        uploading.value = true
        try {
          // 實際開發中應調用 API 上傳圖片
          // const responses = await reviewService.uploadMultipleImages(files.value)
          // newReview.imageUrls = responses.map(resp => resp.imageUrl)
          
          // 模擬上傳
          setTimeout(() => {
            newReview.imageUrls = files.value.map((_, index) => 
              `https://via.placeholder.com/400x300?text=營地照片${index + 1}`
            )
            files.value = []
            uploading.value = false
          }, 1500)
        } catch (error) {
          console.error('上傳圖片失敗:', error)
          Swal.fire({
            icon: 'error',
            title: '上傳失敗',
            text: '圖片上傳失敗，請稍後再試。'
          })
          uploading.value = false
        }
      }
      
      // 移除已上傳的圖片
      const removeImage = (index) => {
        newReview.imageUrls.splice(index, 1)
      }
      
      // 提交評價
      const submitReview = async () => {
        if (newReview.overallRating === 0) {
          Swal.fire({
            icon: 'warning',
            title: '請填寫評分',
            text: '請為您的體驗提供整體評分。'
          })
          return
        }
        
        isSubmitting.value = true
        
        try {
          // 實際開發中應調用 API 提交評價
          // const response = await reviewStore.createReview(newReview)
          
          // 模擬提交成功
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: '評價提交成功',
              text: '感謝您的評價！'
            })
            
            // 關閉模態窗口
            modalInstance.hide()
            
            // 重置表單
            Object.assign(newReview, {
              userId: authStore.userId,
              campSiteId: '',
              reviewText: '',
              overallRating: 0,
              cleanlinessRating: 0,
              convenienceRating: 0,
              friendlinessRating: 0,
              pros: '',
              cons: '',
              imageUrls: []
            })
            
            isSubmitting.value = false
          }, 1500)
        } catch (error) {
          console.error('提交評價失敗:', error)
          Swal.fire({
            icon: 'error',
            title: '提交失敗',
            text: '評價提交失敗，請稍後再試。'
          })
          isSubmitting.value = false
        }
      }
      
      onMounted(() => {
        loadLatestReviews()
      })
      
      return {
        popularCampsites,
        allCampsites,
        latestReviews,
        loading,
        reviewModal,
        newReview,
        files,
        uploading,
        isSubmitting,
        showNewReviewForm,
        selectCampsite,
        handleFileUpload,
        uploadImages,
        removeImage,
        submitReview
      }
    }
  }
  </script>
  
  <style scoped>
  .hero-section {
    background-color: #f8f9fa;
    padding: 20px 0;
  }
  
  .divider {
    width: 70px;
    height: 3px;
    background-color: #198754;
    margin-top: 10px;
  }
  
  .campsite-card {
    transition: transform 0.3s ease;
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .campsite-card:hover {
    transform: translateY(-5px);
  }
  
  .campsite-card img {
    height: 200px;
    object-fit: cover;
  }
  
  .user-avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background-color: #198754;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }
  
  .review-text {
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .rating-star {
    color: #ffc107;
  }
  
  .rating-star-empty {
    color: #e0e0e0;
  }
  
  .rating-input i {
    font-size: 1.5rem;
    cursor: pointer;
    color: #e0e0e0;
    margin-right: 5px;
  }
  
  .rating-input i.bi-star-fill {
    color: #ffc107;
  }
  
  .rating-input i:hover {
    color: #ffc107;
  }
  </style>