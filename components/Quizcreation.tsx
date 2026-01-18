
import React, { useState } from 'react';
import { User, Question, Quiz } from '../types';
import { db, collection, addDoc } from '../services/firebase';
import { generateQuizQuestions } from '../services/gemini';

interface QuizCreationProps {
  user: User;
  onCancel: () => void;
  onSave: () => void;
}

const QuizCreation: React.FC<QuizCreationProps> = ({ user, onCancel, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  const handleSave = async () => {
    if (!title || questions.length === 0) {
      alert('請輸入標題並新增至少一題題目');
      return;
    }
    
    const isValid = questions.every(q => q.text && q.options.every(opt => opt) && q.correctAnswerIndex !== -1);
    if (!isValid) {
      alert('請確保所有題目內容與選項都已填寫');
      return;
    }

    setSaving(true);
    try {
      const newQuizData = {
        title,
        description,
        questions,
        creatorId: user.id,
        createdAt: Date.now(),
        code: Math.random().toString(36).substr(2, 6).toUpperCase(),
        isActive: true
      };
      
      await addDoc(collection(db, 'quizzes'), newQuizData);
      onSave();
    } catch (err) {
      console.error("Save failed", err);
      alert("儲存失敗，請再試一次。");
    } finally {
      setSaving(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiTopic) {
      alert('請輸入想要生成的主題');
      return;
    }
    setGenerating(true);
    try {
      const aiQuestions = await generateQuizQuestions(aiTopic);
      if (aiQuestions && aiQuestions.length > 0) {
        setQuestions([...questions, ...aiQuestions]);
        if (!title) setTitle(aiTopic);
      } else {
        alert('AI 生成題目失敗，請嘗試更換主題或稍後再試。');
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
      alert('生成時發生錯誤。');
    } finally {
      setGenerating(false);
    }
  };

  const addEmptyQuestion = () => {
    const newQ: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: ''
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (qId: string, optIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options];
        newOptions[optIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn pb-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter">NEW QUIZ</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Creation Mode</p>
        </div>
        <div className="flex gap-4">
          <button onClick={onCancel} className="px-8 py-3 text-slate-400 hover:text-slate-900 font-black uppercase text-xs tracking-widest">Discard</button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className={`px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all ${saving ? 'opacity-50' : ''}`}
          >
            {saving ? 'SAVING...' : 'PUBLISH'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* AI Generator Panel */}
        <section className="bg-indigo-900 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black italic mb-2 flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              AI 智能題庫生成
            </h2>
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-6">Powered by Gemini AI 3 Flash</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                placeholder="輸入題目主題（例如：國中數學一元一次方程式、地理名勝...）"
                className="flex-grow px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl placeholder:text-white/30 focus:bg-white focus:text-slate-900 transition-all outline-none font-bold"
              />
              <button 
                onClick={handleAIGenerate}
                disabled={generating}
                className={`px-10 py-4 bg-white text-indigo-900 rounded-2xl font-black shadow-xl hover:bg-indigo-50 transition-all transform active:scale-95 flex items-center justify-center gap-3 ${generating ? 'opacity-50' : ''}`}
              >
                {generating ? (
                  <div className="w-5 h-5 border-4 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
                ) : '立即生成'}
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-6">General Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">測驗標題</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="例如：期末模擬考"
                className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">描述敘述</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="輸入一些測驗說明..."
                className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl h-32 focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none font-medium"
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-900 italic">Questions ({questions.length})</h2>
            <button 
              onClick={addEmptyQuestion}
              className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all tracking-widest uppercase"
            >
              Add Item +
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-24 text-center">
              <p className="text-slate-300 font-black italic mb-6">THE QUIZ IS EMPTY</p>
              <button 
                onClick={addEmptyQuestion}
                className="px-12 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-indigo-600 transition-all transform active:scale-95"
              >
                CREATE FIRST QUESTION
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((q, index) => (
                <div key={q.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 relative group transition-all hover:shadow-xl hover:border-indigo-100">
                  <button 
                    onClick={() => deleteQuestion(q.id)}
                    className="absolute top-8 right-8 text-slate-200 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  
                  <div className="mb-8 pr-12">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">Item #{index + 1}</span>
                    <input 
                      type="text"
                      value={q.text}
                      onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                      placeholder="請輸入題目描述..."
                      className="w-full text-2xl font-black border-0 bg-transparent focus:ring-0 outline-none pb-2 text-slate-900 placeholder:text-slate-200"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="relative group/opt">
                        <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all ${q.correctAnswerIndex === optIndex ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                          <input 
                            type="radio" 
                            name={`correct-${q.id}`} 
                            checked={q.correctAnswerIndex === optIndex}
                            onChange={() => updateQuestion(q.id, 'correctAnswerIndex', optIndex)}
                            className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                          />
                          <input 
                            type="text" 
                            value={opt}
                            onChange={e => updateOption(q.id, optIndex, e.target.value)}
                            placeholder={`選項 ${String.fromCharCode(65 + optIndex)}`}
                            className="bg-transparent border-0 flex-grow font-bold text-slate-700 outline-none focus:ring-0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Answer Explanation</label>
                    <textarea 
                      value={q.explanation}
                      onChange={e => updateQuestion(q.id, 'explanation', e.target.value)}
                      placeholder="為什麼這個答案是正確的？"
                      className="w-full px-6 py-4 bg-slate-50/50 border-0 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all resize-none h-24"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default QuizCreation;
