
import React, { useState, useEffect } from 'react';
import { User, Quiz, QuizAttempt } from '../types';
import { db, collection, deleteDoc, doc, onSnapshot, query, where, orderBy } from '../services/firebase';
import QuizCreation from './QuizCreation';
import StudentManagement from './StudentManagement';

interface TeacherDashboardProps {
  user: User;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [viewingQuizResults, setViewingQuizResults] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'students'>('quizzes');

  useEffect(() => {
    // Sync quizzes
    const qQuizzes = query(collection(db, 'quizzes'), where('creatorId', '==', user.id), orderBy('createdAt', 'desc'));
    const unsubscribeQuizzes = onSnapshot(qQuizzes, (snapshot) => {
      setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz)));
    });

    // Sync all attempts (can be filtered further if needed)
    const qAttempts = query(collection(db, 'attempts'), orderBy('timestamp', 'desc'));
    const unsubscribeAttempts = onSnapshot(qAttempts, (snapshot) => {
      setAttempts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt)));
    });

    return () => {
      unsubscribeQuizzes();
      unsubscribeAttempts();
    };
  }, [user.id]);

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此測驗嗎？此動作無法復原。')) return;
    try {
      await deleteDoc(doc(db, 'quizzes', id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (showCreate) {
    return <QuizCreation user={user} onCancel={() => setShowCreate(false)} onSave={() => setShowCreate(false)} />;
  }

  const selectedQuizAttempts = attempts.filter(a => a.quizId === viewingQuizResults);

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">後台中心</h1>
          <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Real-time Dashboard</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCreate(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all flex items-center gap-3 transform active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            建立新測驗
          </button>
        </div>
      </header>

      <div className="flex gap-2 bg-white p-1.5 rounded-[1.5rem] border border-slate-200 w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('quizzes')}
          className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${activeTab === 'quizzes' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          測驗列表
        </button>
        <button 
          onClick={() => setActiveTab('students')}
          className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${activeTab === 'students' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          學生名單
        </button>
      </div>

      {activeTab === 'quizzes' ? (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 italic">
              <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>
              QUizzes
            </h2>
            
            <div className="grid gap-4">
              {quizzes.length === 0 ? (
                <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-20 text-center text-slate-300 font-black italic">
                  NO QUIZZES FOUND
                </div>
              ) : (
                quizzes.map(quiz => (
                  <div key={quiz.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-2xl hover:border-indigo-100 transition-all group relative overflow-hidden">
                    <div className="flex-grow">
                      <h3 className="font-black text-2xl text-slate-900 mb-2 leading-tight">{quiz.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl">
                          {quiz.questions.length} Items
                        </span>
                        <span className="text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 font-mono">
                          CODE: {quiz.code}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3 relative z-10">
                      <button 
                        onClick={() => setViewingQuizResults(quiz.id)}
                        className={`p-4 rounded-2xl transition-all ${viewingQuizResults === quiz.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-indigo-600 hover:bg-indigo-100'}`}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(quiz.id)}
                        className="p-4 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 italic">
              <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
              RESULTS
            </h2>
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
              {viewingQuizResults ? (
                <div className="animate-fadeIn">
                  <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-slate-900">學生成績表</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">LIVE TRACKING</p>
                    </div>
                    <button onClick={() => setViewingQuizResults(null)} className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                    {selectedQuizAttempts.length === 0 ? (
                      <div className="py-20 text-center text-slate-300 font-bold italic">尚無作答數據</div>
                    ) : (
                      selectedQuizAttempts.map(attempt => (
                        <div key={attempt.id} className="p-5 rounded-[2rem] bg-slate-50 border border-transparent hover:border-indigo-200 transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-indigo-600 border border-slate-100">
                              {attempt.seatNumber}
                            </div>
                            <div>
                              <p className="font-black text-slate-900">{attempt.studentName}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{attempt.className}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-black ${attempt.score / attempt.totalQuestions >= 0.8 ? 'text-emerald-500' : 'text-slate-900'}`}>
                              {attempt.score}<span className="text-slate-300 text-sm mx-1">/</span>{attempt.totalQuestions}
                            </div>
                            <p className="text-[10px] font-bold text-slate-300">{new Date(attempt.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-20 text-center">
                  <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-slate-400 font-black text-sm uppercase tracking-widest leading-relaxed">Select a quiz to view<br/>student performance</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <StudentManagement />
      )}
    </div>
  );
};

export default TeacherDashboard;
