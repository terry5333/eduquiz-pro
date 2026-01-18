
export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  NONE = 'NONE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  role: UserRole;
  // Student specific bound info
  className?: string;
  seatNumber?: string;
  isBound?: boolean;
}

export interface RegisteredStudent {
  id: string;
  className: string;
  seatNumber: string;
  name: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  creatorId: string;
  createdAt: number;
  code: string;
  isActive: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  className: string;
  seatNumber: string;
  score: number;
  totalQuestions: number;
  answers: number[];
  timestamp: number;
}
