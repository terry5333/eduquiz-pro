
# EduQuiz Pro - 雲端學生測驗平台

這是一個基於 React + Firebase + Google Gemini AI 的現代化教學系統。

## 部屬說明 (全程雲端操作)

1. **GitHub Codespaces**: 在 GitHub 專案頁面點擊 "Code" -> "Codespaces" -> "Create codespace" 來編輯檔案。
2. **Vercel**:
   - 連結此 GitHub 儲存庫。
   - 在 Environment Variables 設定 `API_KEY` (Gemini API Key)。
3. **Firebase**:
   - 確保 `services/firebase.ts` 中的配置正確。
   - 在 Firebase 控制台將 Vercel 的網址加入 "Authorized domains"。

## 技術棧
- 前端: React 19, Tailwind CSS
- 後端: Firebase Firestore & Auth
- AI: Google Gemini 3 Pro (生成題目與解析)
