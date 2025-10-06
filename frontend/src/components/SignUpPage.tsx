import React, { useState } from 'react';
import { signUp, signInWithGoogle } from '../lib/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SignUpPageProps {
  onSignUpSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUpSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    setLoading(true);

    const { user, error: authError } = await signUp(email, password);

    if (authError) {
      setLoading(false);
      setError(getErrorMessage(authError));
      return;
    }

    if (user) {
      // Firestore에 사용자 정보 저장
      try {
        await setDoc(doc(db, 'users', user.uid), {
          user_id: user.uid,
          email: user.email,
          name: name.trim(),
          created_at: new Date(),
        });
        setLoading(false);
        onSignUpSuccess();
      } catch (firestoreError: any) {
        setLoading(false);
        setError('회원 정보 저장 중 오류가 발생했습니다.');
      }
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);

    const { user, error: authError } = await signInWithGoogle();

    if (authError) {
      setLoading(false);
      setError(getErrorMessage(authError));
      return;
    }

    if (user) {
      // Google 계정의 displayName 또는 email을 이름으로 사용
      const userName = user.displayName || user.email?.split('@')[0] || '사용자';

      try {
        await setDoc(doc(db, 'users', user.uid), {
          user_id: user.uid,
          email: user.email,
          name: userName,
          created_at: new Date(),
        });
        setLoading(false);
        onSignUpSuccess();
      } catch (firestoreError: any) {
        setLoading(false);
        setError('회원 정보 저장 중 오류가 발생했습니다.');
      }
    }
  };

  const getErrorMessage = (error: string): string => {
    if (error.includes('email-already-in-use')) {
      return '이미 사용 중인 이메일입니다.';
    }
    if (error.includes('invalid-email')) {
      return '유효하지 않은 이메일 형식입니다.';
    }
    if (error.includes('weak-password')) {
      return '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.';
    }
    if (error.includes('popup-closed')) {
      return '로그인이 취소되었습니다.';
    }
    return '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h1>
          <p className="text-gray-600">RecordMOA에 오신 것을 환영합니다</p>
        </div>

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="이름을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="6자 이상 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">또는</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 가입
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
