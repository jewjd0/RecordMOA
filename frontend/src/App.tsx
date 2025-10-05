import React, { useState } from 'react';
import { NavigationBar } from './components/NavigationBar';
import { ReviewWritePage } from './components/ReviewWritePage';
import { RecordsListPage } from './components/RecordsListPage';
import { StatsPage } from './components/StatsPage';
import { StatsDetailPage } from './components/StatsDetailPage';
import { MyPage } from './components/MyPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('records');
  const [showStatsDetail, setShowStatsDetail] = useState(false);
  const [showWritePage, setShowWritePage] = useState(false);

  const renderPage = () => {
    if (showStatsDetail) {
      return <StatsDetailPage onBack={() => setShowStatsDetail(false)} />;
    }

    if (showWritePage) {
      return <ReviewWritePage onBack={() => setShowWritePage(false)} />;
    }

    switch (currentPage) {
      case 'records':
        return <RecordsListPage onWriteReview={() => setShowWritePage(true)} />;
      case 'stats':
        return <StatsPage onShowDetail={() => setShowStatsDetail(true)} />;
      case 'my':
        return <MyPage />;
      default:
        return <RecordsListPage onWriteReview={() => setShowWritePage(true)} />;
    }
  };



  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-6xl mx-auto bg-card shadow-lg min-h-screen relative flex flex-col">
        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {renderPage()}
        </div>
        
        {/* Navigation Bar - only show when not in detail or write view */}
        {!showStatsDetail && !showWritePage && (
          <NavigationBar 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
          />
        )}
      </div>
    </div>
  );
}