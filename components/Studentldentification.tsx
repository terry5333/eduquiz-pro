
import React, { useState, useEffect } from 'react';
import { RegisteredStudent } from '../types';
import { db, collection, getDocs, query, orderBy } from '../services/firebase';

interface StudentIdentificationProps {
  onIdentify: (data: { className: string; seatNumber: string; name: string }) => void;
  onLogout: () => void;
}

const StudentIdentification: React.FC<StudentIdentificationProps> = ({ onIdentify, onLogout }) => {
  const [students, setStudents] = useState<RegisteredStudent[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSeat, setSelectedSeat] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, 'students'), orderBy('className'), orderBy('seatNumber'));
        const querySnapshot = await getDocs(q);
        const studentList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as RegisteredStudent));
        setStudents(studentList);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const classes = Array.from(new Set(students.map(s => s.className))).sort();
  const seatsInClass = students
    .filter(s => s.className === selectedClass)
    .sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedSeat || !name) {
      alert('請填寫完整資訊');
      return;
    }
    onIdentify({ className: selectedClass, seatNumber: selectedSeat, name });
  };

  const handleSeatChange = (seat: string) => {
    setSelectedSeat(seat);
    const student = seatsInClass.find(s => s.seatNumber === seat);
    if (student) setName(student.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-indigo-600 animate-pulse">
        讀取名單中...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
             </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 italic tracking-tight">身分綁定</h1>
          <p className="text-slate-500 font-medium">請選擇您的班級與座號以繼續使用系統</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">班級 Class</label>
            <select 
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setSelectedSeat(''); setName(''); }}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold"
              required
            >
              <option value="">請選擇班級</option>
              {classes.length > 0 ? (
                classes.map(c => <option key={c} value={c}>{c}</option>)
              ) : (
                <option value="" disabled>目前無班級名單，請聯繫老師</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">座號 No.</label>
              <select 
                value={selectedSeat}
                onChange={(e) => handleSeatChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold"
                required
              >
                <option value="">座號</option>
                {selectedClass && seatsInClass.map(s => (
                  <option key={s.id} value={s.seatNumber}>{s.seatNumber} 號</option>
                ))}
                {!selectedClass && <option disabled>先選班級</option>}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">姓名 Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="載入中..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-50 transition-all outline-none font-bold"
                required
                readOnly={!!selectedSeat && !!seatsInClass.find(s => s.seatNumber === selectedSeat)}
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transform hover:-translate-y-1 transition-all active:scale-95"
            >
              確認綁定 Identity Confirmed
            </button>
            <button 
              type="button"
              onClick={onLogout}
              className="w-full mt-4 py-2 text-slate-400 text-xs font-bold hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              Logout 登出帳號
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentIdentification;
