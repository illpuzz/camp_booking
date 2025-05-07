# 營地評價系統

這是一個使用 Vue 3 開發的營地評價系統前端應用，用於連接 Spring Boot 後端 API。

## 功能特點

- 使用者可以查看、發布、編輯和刪除營地評價
- 營地主人可以回覆評價
- 管理員可以管理舉報內容
- 評價支持多種篩選和排序方式
- 支持評價點讚功能
- 支持評價和回覆的舉報功能
- 支持多角色權限控制

## 技術棧

- Vue 3 (Composition API)
- Axios
- Bootstrap 5
- Vite

## 快速開始

### 前提條件

- Node.js (v16+)
- npm 或 yarn
- 後端 API 服務（Spring Boot）

### 安裝

1. 複製專案
```bash
git clone https://github.com/yourusername/camp-review-system.git
cd camp-review-system
```

2. 安裝依賴
```bash
npm install
# 或
yarn install
```

3. 啟動開發伺服器
```bash
npm run dev
# 或
yarn dev
```

4. 構建生產版本
```bash
npm run build
# 或
yarn build
```

## 專案結構

```
/
├── public/                    # 靜態資源目錄
├── src/
│   ├── assets/                # 前端資源目錄
│   ├── components/            # Vue 組件目錄
│   │   ├── LoginBar.vue       # 頂部登入狀態欄
│   │   ├── Login.vue          # 登入表單組件
│   │   ├── ReviewFilter.vue   # 評價篩選組件
│   │   ├── ReviewsList.vue    # 評價列表組件
│   │   ├── ReviewItem.vue     # 單個評價卡片組件
│   │   └── AddReviewForm.vue  # 新增評價表單組件
│   ├── services/              # API 服務目錄
│   │   ├── api.js             # API 請求配置
│   │   ├── authService.js     # 身份驗證服務
│   │   └── reviewService.js   # 評價相關服務
│   ├── utils/                 # 工具函數目錄
│   │   ├── dateFormatter.js   # 日期格式化工具
│   │   └── validators.js      # 表單驗證工具
│   ├── App.vue                # 應用程序主組件
│   └── main.js                # 應用程序入口文件
├── index.html                 # HTML 入口文件
├── vite.config.js             # Vite 配置文件
└── package.json               # NPM 包配置文件
```

## 配置後端 API

在 `vite.config.js` 文件中配置代理到後端 API：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080', // 修改為您的 API 網址
      changeOrigin: true
    }
  }
}
```

## 開發指南

### 角色系統

本系統支持三種角色：
- 一般用戶：可以查看、發布、編輯和刪除自己的評價
- 營地主人：可以回覆評價
- 管理員：可以處理舉報和管理所有內容

### 評價篩選

可以通過以下條件篩選評價：
- 關鍵字搜尋
- 最低評分
- 排序方式（最新、評分高低、讚數高低）

### 舉報系統

- 用戶可以舉報評價或回覆
- 被舉報的內容會暫時隱藏
- 管理員可以批准或駁回舉報

## 貢獻

歡迎貢獻！請閱讀 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何開始。

## 授權

此專案基於 MIT 授權 - 詳見 [LICENSE](LICENSE) 文件。