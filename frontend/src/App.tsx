import { useState, useEffect } from 'react';
import { NavigationBar } from './components/NavigationBar';
import { ReviewWritePage } from './components/ReviewWritePage';
import { RecordsListPage } from './components/RecordsListPage';
import { RecordDetailPage } from './components/RecordDetailPage';
import { StatsPage } from './components/StatsPage';
import { StatsDetailPage } from './components/StatsDetailPage';
import { MyPage } from './components/MyPage';
import { ProfileEditPage } from './components/ProfileEditPage';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { onAuthChange } from './lib/auth';
import { User } from 'firebase/auth';
import { Toaster } from 'sonner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const [currentPage, setCurrentPage] = useState('records');
  const [showStatsDetail, setShowStatsDetail] = useState(false);
  const [showWritePage, setShowWritePage] = useState(false);
  const [showRecordDetail, setShowRecordDetail] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [editRecordId, setEditRecordId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderPage = () => {
    if (showProfileEdit) {
      return <ProfileEditPage onBack={() => {
        setShowProfileEdit(false);
        setRefreshKey(prev => prev + 1);
      }} />;
    }

    if (showStatsDetail) {
      return <StatsDetailPage onBack={() => setShowStatsDetail(false)} />;
    }

    if (showRecordDetail && selectedRecordId) {
      return (
        <RecordDetailPage
          recordId={selectedRecordId}
          onBack={() => {
            setShowRecordDetail(false);
            setSelectedRecordId(null);
            setRefreshKey(prev => prev + 1);
          }}
          onEdit={(recordId) => {
            setEditRecordId(recordId);
            setShowRecordDetail(false);
            setShowWritePage(true);
          }}
          onDelete={(recordId) => {
            setShowRecordDetail(false);
            setSelectedRecordId(null);
            setRefreshKey(prev => prev + 1);
          }}
        />
      );
    }

    if (showWritePage) {
      return <ReviewWritePage
        editRecordId={editRecordId || undefined}
        onBack={() => {
          setShowWritePage(false);
          setEditRecordId(null);
          setRefreshKey(prev => prev + 1);
        }}
      />;
    }

    switch (currentPage) {
      case 'records':
        return (
          <RecordsListPage
            key={refreshKey}
            onWriteReview={() => setShowWritePage(true)}
            onViewDetail={(recordId) => {
              setSelectedRecordId(recordId);
              setShowRecordDetail(true);
            }}
          />
        );
      case 'stats':
        return <StatsPage onShowDetail={() => setShowStatsDetail(true)} />;
      case 'my':
        return <MyPage key={refreshKey} onShowProfileEdit={() => setShowProfileEdit(true)} />;
      default:
        return (
          <RecordsListPage
            key={refreshKey}
            onWriteReview={() => setShowWritePage(true)}
            onViewDetail={(recordId) => {
              setSelectedRecordId(recordId);
              setShowRecordDetail(true);
            }}
          />
        );
    }
  };



  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!user) {
    if (showSignUp) {
      return (
        <SignUpPage
          onSignUpSuccess={() => setShowSignUp(false)}
          onSwitchToLogin={() => setShowSignUp(false)}
        />
      );
    }
    return (
      <LoginPage
        onLoginSuccess={() => {}}
        onSwitchToSignUp={() => setShowSignUp(true)}
      />
    );
  }

  // 로그인된 경우
  return (
    <div className="min-h-screen w-full bg-background">
      <Toaster position="top-center" richColors closeButton />
      <div className="max-w-7xl mx-auto bg-card shadow-lg min-h-screen relative flex flex-col">
        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {renderPage()}
        </div>

        {/* Navigation Bar - only show when not in detail or write view */}
        {!showStatsDetail && !showWritePage && !showRecordDetail && !showProfileEdit && (
          <NavigationBar
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}