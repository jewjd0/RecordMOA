import { Card, CardContent } from "./ui/card";
import { Settings, User } from "lucide-react";

export function MyPage() {
  const menuItems = [
    { icon: User, label: '프로필 설정', description: '닉네임, 프로필 이미지 변경' },
    { icon: Settings, label: '앱 설정', description: '알림, 테마, 백업 설정' }
  ];

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-card">
        <h1 className="text-center">마이</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        
        {/* Profile Section */}
        <Card className="border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User size={32} className="text-gray-400" />
            </div>
            <h3>사용자</h3>
            <p className="text-sm text-gray-500 mt-1">총 리뷰 45개</p>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <Card key={index} className="border-gray-200 cursor-pointer hover:bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <item.icon size={20} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4>{item.label}</h4>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                  <div className="text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6 12l4-4-4-4v8z"/>
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* App Info */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>개인 리뷰 기록 서비스</p>
          <p className="mt-1">버전 1.0.0</p>
        </div>

      </div>
    </div>
  );
}