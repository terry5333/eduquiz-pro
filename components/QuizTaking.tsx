
import React, { useState } from 'react';
import { Quiz, User, QuizAttempt } from '../types';
import { db, collection, addDoc } from '../services/firebase';

interface QuizTakingProps {
  quiz: Quiz;
  user: User;
  onComplete: () => void;
}

const QuizTaking: React.FC<QuizTakingProps> = ({ quiz, user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'playing' | 'result'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const startQuiz = () => {
    setCurrentStep('playing');
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    setSubmitting(true);
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (finalAnswers[idx] === q.correctAnswerIndex) {
        score++;
      }
    });

    try {
      const attemptData = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        studentId: user.id,
        studentName: user.name,
        className: user.className || 'Unknown',
        seatNumber: user.seatNumber || '0',
        score,
        totalQuestions: quiz.questions.length,
        answers: finalAnswers,
        timestamp: Date.now()
      };

      await addDoc(collection(db, 'attempts'), attemptData);
      setCurrentStep('result');
    } catch (err) {
      console.error("Submit failed", err);
      alert("提交失敗，請檢查網路連線後再試。");
    } finally {
      setSubmitting(false);
    }
  };

  if (currentStep === 'intro') {
    return (
      <div className="max-w-3xl mx-auto bg-white p-16 rounded-[4rem] shadow-2xl border border-slate-100 animate-fadeIn text-center">
        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-6 italic tracking-tight">{quiz.title}</h1>
        <p className="text-slate-400 text-lg mb-12 max-w-md mx-auto leading-relaxed font-medium">{quiz.description || '請認真思考後作答，祝您好運！'}</p>
        
        <div className="grid grid-cols-2 gap-6 mb-12 max-w-sm mx-auto">
          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="text-4xl font-black text-indigo-600">{quiz.questions.length}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Questions</div>
          </div>
          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="text-4xl font-black text-indigo-600">∞</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Time Limit</div>
          </div>
        </div>

        <button 
          onClick={startQuiz}
          className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-100 transform hover:-translate-y-1 active:scale-95"
        >
          START CHALLENGE
        </button>
      </div>
    );
  }

  if (currentStep === 'playing') {
    const question = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto animate-fadeIn pb-20">
        <div className="mb-12 px-6">
          <div className="flex items-center justify-between text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">
            <span>PROGRESS: {currentQuestionIndex + 1} / {quiz.questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-4 bg-white border-2 border-slate-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-700 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-16 rounded-[4rem] shadow-xl border border-slate-50 mb-10 min-h-[500px] flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-10 left-10 text-[6rem] font-black text-slate-50 select-none -z-0">Q{currentQuestionIndex + 1}</div>
          <h2 className="text-4xl font-black text-slate-900 mb-16 text-center leading-tight relative z-10">{question.text}</h2>
          
          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={submitting}
                onClick={() => handleAnswer(idx)}
                className="group flex items-center p-8 bg-slate-50 border-4 border-transparent rounded-[2.5rem] hover:border-indigo-500 hover:bg-white hover:shadow-2xl transition-all text-left transform active:scale-95 disabled:opacity-50"
              >
                <div className="w-14 h-14 rounded-2xl bg-white text-slate-300 flex items-center justify-center font-black text-xl mr-6 border-2 border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm">
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-2xl font-black text-slate-700 group-hover:text-slate-900 leading-tight">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const finalScore = answers.reduce((acc, ans, idx) => acc + (ans === quiz.questions[idx].correctAnswerIndex ? 1 : 0), 0);
  const percentage = Math.round((finalScore / quiz.questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-20">
      <div className="bg-white p-20 rounded-[5rem] shadow-2xl border border-slate-100 text-center mb-12">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-[2.5rem] bg-emerald-50 text-emerald-500 mb-10 border-4 border-emerald-100 shadow-inner">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 italic tracking-tighter">SUBMITTED!</h1>
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] mb-12">成績已上傳至雲端</p>

        <div className="flex justify-center items-end gap-3 mb-4">
          <div className="text-9xl font-black text-indigo-600 tracking-tighter leading-none">{finalScore}</div>
          <div className="text-3xl font-bold text-slate-200 mb-6">/ {quiz.questions.length}</div>
        </div>
        <div className="inline-block px-10 py-3 bg-indigo-50 text-indigo-600 rounded-full font-black text-xl mb-16 shadow-inner">
          {percentage}% SUCCESS RATE
        </div>

        <div>
          <button 
            onClick={onComplete}
            className="px-16 py-5 bg-slate-900 text-white rounded-[2.5rem] font-black text-lg hover:bg-indigo-600 transition-all shadow-2xl hover:shadow-indigo-200 transform active:scale-95"
          >
            BACK TO PORTAL
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="font-black text-slate-900 text-3xl ml-8 flex items-center gap-4 italic">
          <span className="w-4 h-8 bg-slate-900 rounded-full"></span>
          REVIEW
        </h3>
        {quiz.questions.map((q, idx) => {
          const isCorrect = answers[idx] === q.correctAnswerIndex;
          return (
            <div key={q.id} className={`p-12 rounded-[4rem] border-4 transition-all shadow-sm ${isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex justify-between items-start mb-10">
                <span className="text-2xl font-black text-slate-900 pr-12 leading-tight">Q{idx + 1}: {q.text}</span>
                <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-400 w-24 uppercase tracking-widest">Your Choice:</span>
                  <span className={`text-lg font-black ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>{q.options[answers[idx]]}</span>
                </div>
                {!isCorrect && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-400 w-24 uppercase tracking-widest">Answer:</span>
                    <span className="text-lg font-black text-emerald-700">{q.options[q.correctAnswerIndex]}</span>
                  </div>
                )}
                {q.explanation && (
                  <div className="mt-8 p-10 bg-white/60 rounded-[3rem] text-sm text-slate-600 font-bold border border-white shadow-sm italic leading-relaxed backdrop-blur-sm">
                    <span className="block font-black text-slate-300 not-italic text-[10px] uppercase tracking-widest mb-3">Professional Insight</span>
                    {q.explanation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizTaking;
