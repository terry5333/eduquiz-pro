import React, { useState, useEffect } from 'react';
import { User, UserRole, Quiz } from './types';
import { auth, db, doc, getDoc, setDoc, onAuthStateChanged, signOut } from './services/firebase';
import LoginView from './components/LoginView.tsx';
import TeacherDashboard from './components/TeacherDashboard.tsx';
import StudentPortal from './components/StudentPortal.tsx';
import StudentIdentification from './components/StudentIdentification.tsx';
import QuizTaking from './components/QuizTaking.tsx';
import Navbar from './components/Navbar.tsx';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUser(userSnap.data() as User);
        } else {
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || '未登錄同學',
            email: firebaseUser.email || '',
            picture: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
            role: UserRole.NONE,
            isBound: false
          };
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRoleSelection = async (role: UserRole) => {
    if (!user) return;
    const updatedUser: User = { 
      ...user, 
      role, 
      isBound: role === UserRole.TEACHER 
    };
    setUser(updatedUser);
    await setDoc(doc(db, 'users', user.id), updatedUser);
  };

  const handleIdentify = async (data: { className: string; seatNumber: string; name: string }) => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      ...data,
      isBound: true
    };
    setUser(updatedUser);
    await setDoc(doc(db, 'users', user.id), updatedUser);
  };

  const handleLogout = () => {
    signOut(auth);
    setActiveQuiz(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-indigo-600 animate-pulse">
        EduQuiz Pro 載入中...
      </div>
    );
  }

  if (!user || user.role === UserRole.NONE) {
    return <LoginView onLogin={handleRoleSelection} />;
  }

  if (user.role === UserRole.STUDENT && !user.isBound) {
    return <StudentIdentification onIdentify={handleIdentify} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={user} onLogout={handleLogout} onHome={() => setActiveQuiz(null)} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {activeQuiz ? (
          <QuizTaking 
            quiz={activeQuiz} 
            user={user} 
            onComplete={() => setActiveQuiz(null)} 
          />
        ) : user.role === UserRole.TEACHER ? (
          <TeacherDashboard user={user} />
        ) : (
          <StudentPortal user={user} onStartQuiz={(q) => setActiveQuiz(q)} />
        )}
      </main>
      
      <footer className="bg-white border-t py-8 text-center text-slate-400 text-sm">
        <p>&copy; 2024 EduQuiz Pro. 基於 Firebase 的即時教學系統</p>
      </footer>
    </div>
  );
};

export default App;
