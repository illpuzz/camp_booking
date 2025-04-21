<!-- src/views/AboutView.vue -->
<template>
    <div class="about">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <h1 class="display-4 mb-4 text-center">關於我們</h1>
            
            <div class="card mb-5">
              <div class="card-body">
                <h4 class="card-title mb-3">營地評價系統的使命</h4>
                <p class="card-text">
                  我們的使命是打造一個透明、真實的營地評價平台，讓露營愛好者能夠分享他們的經驗，
                  幫助更多人找到適合的露營場地。透過真實用戶的回饋，我們希望能夠提升整體露營體驗，
                  同時也鼓勵營地經營者不斷改進設施和服務。
                </p>
              </div>
            </div>
            
            <h2 class="mb-4">我們的特色</h2>
            
            <div class="row mb-5">
              <div class="col-md-6 mb-4">
                <div class="card h-100">
                  <div class="card-body">
                    <h4 class="card-title mb-3">真實評價</h4>
                    <p class="card-text">
                      所有評價均來自真實使用者，我們不接受任何形式的付費評價，確保資訊的真實性和客觀性。
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6 mb-4">
                <div class="card h-100">
                  <div class="card-body">
                    <h4 class="card-title mb-3">詳細分類</h4>
                    <p class="card-text">
                      我們提供多維度的評分系統，從清潔度、便利性到友善度，全方位評價營地品質。
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6 mb-4">
                <div class="card h-100">
                  <div class="card-body">
                    <h4 class="card-title mb-3">豐富圖片</h4>
                    <p class="card-text">
                      用戶可以分享實地拍攝的照片，讓您更直觀地了解營地環境，做出更明智的決定。
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6 mb-4">
                <div class="card h-100">
                  <div class="card-body">
                    <h4 class="card-title mb-3">營主回應</h4>
                    <p class="card-text">
                      營地經營者可以回應評價，形成良性互動和溝通，幫助改善服務質量。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <h2 class="mb-4">如何使用</h2>
            
            <div class="card mb-5">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <h5>瀏覽評價：</h5>
                    <ul>
                      <li>選擇您感興趣的營地</li>
                      <li>查看整體評分和詳細評價</li>
                      <li>利用篩選和排序功能找到最相關的評價</li>
                      <li>查看評價圖片了解實際環境</li>
                    </ul>
                  </div>
                  <div class="col-md-6">
                    <h5>撰寫評價：</h5>
                    <ul>
                      <li>登入您的帳號</li>
                      <li>點擊「撰寫評價」按鈕</li>
                      <li>填寫評分和詳細評價內容</li>
                      <li>上傳您在營地拍攝的照片</li>
                      <li>提交您的評價</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <h2 class="mb-4">聯絡我們</h2>
            
            <div class="card">
              <div class="card-body">
                <p class="card-text">
                  如果您有任何問題、建議或合作意向，請隨時與我們聯繫：<br>
                  <strong>Email:</strong> contact@campreview.com<br>
                  <strong>電話:</strong> (02) 1234-5678<br>
                  <strong>地址:</strong> 台北市信義區信義路五段7號
                </p>
                
                <form class="mt-4">
                  <div class="mb-3">
                    <label for="name" class="form-label">姓名</label>
                    <input type="text" class="form-control" id="name">
                  </div>
                  <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email">
                  </div>
                  <div class="mb-3">
                    <label for="message" class="form-label">訊息</label>
                    <textarea class="form-control" id="message" rows="3"></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary">送出</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AboutView'
  }
  </script>