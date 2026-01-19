import React, { useState } from 'react';
import { UserRole } from '../types';
import { auth, googleProvider, signInWithPopup } from '../services/firebase';

interface LoginViewProps {
  onLogin: (role: UserRole) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async (role: UserRole) => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin(role);
    } catch (error: any) {
      console.error("Login failed", error);
      
      const currentDomain = window.location.hostname;

      if (error.code === 'auth/unauthorized-domain') {
        setErrorMsg(
          `【 權限錯誤：網域未授權 】\n\n` +
          `請依照以下步驟修正：\n` +
          `1. 前往 Firebase 控制台\n` +
          `2. 進入「Authentication」>「Settings」>「Authorized domains」\n` +
          `3. 點擊「Add domain」並加入：\n   ${currentDomain}\n` +
          `4. 儲存後等待 30 秒並重新整理此頁面。`
        );
      } else if (error.code === 'auth/popup-closed-by-user') {
        setErrorMsg("登入視窗已被關閉，請再試一次。");
      } else {
        setErrorMsg(`登入失敗：${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 px-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center border-4 border-white/20 animate-fadeIn">
        <div className="mb-8">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-indigo-100">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">EduQuiz <span className="text-indigo-600">Pro</span></h1>
          <p className="text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-widest">Cloud Powered Learning</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-sm font-medium animate-fadeIn whitespace-pre-line text-left leading-relaxed">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleGoogleLogin(UserRole.TEACHER)}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-800 transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6 p-1 bg-white rounded-full" alt="Google" />
            <span className="font-black text-lg">教師身分登入</span>
          </button>
          
          <button
            onClick={() => handleGoogleLogin(UserRole.STUDENT)}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl flex items-center justify-center gap-4 hover:border-indigo-500 transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-slate-100 disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6 p-1 bg-slate-50 rounded-full" alt="Google" />
            <span className="font-black text-lg">學生身分登入</span>
          </button>
        </div>

        {isLoading && (
          <div className="mt-6 text-indigo-600 font-black animate-pulse text-xs uppercase tracking-widest">
            正在啟動安全驗證...
          </div>
        )}

        <p className="mt-10 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Secure Login System
        </p>
      </div>
    </div>
  );
};

export default LoginView;
