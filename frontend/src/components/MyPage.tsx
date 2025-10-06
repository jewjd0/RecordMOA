import { Card, CardContent } from "./ui/card";
import { Settings, User, LogOut } from "lucide-react";
import { auth } from "../lib/firebase";
import { logOut } from "../lib/auth";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export function MyPage() {
  const [userName, setUserName] = useState<string>("사용자");
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserEmail(user.email || "");

        // Firestore에서 사용자 이름 가져오기
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name || "사용자");
          }
        } catch (error) {
          console.error("사용자 정보 로드 실패:", error);
        }
      }
      setLoading(false);
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      await logOut();
    }
  };

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
            {loading ? (
              <p className="text-gray-500">로딩 중...</p>
            ) : (
              <>
                <h3>{userName}</h3>
                <p className="text-sm text-gray-500 mt-1">{userEmail}</p>
              </>
            )}
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

        {/* Logout Button */}
        <Card
          className="border-red-200 cursor-pointer hover:bg-red-50"
          onClick={handleLogout}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <LogOut size={20} className="text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-red-600">로그아웃</h4>
                <p className="text-sm text-gray-500 mt-1">계정에서 로그아웃합니다</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>개인 리뷰 기록 서비스</p>
          <p className="mt-1">버전 1.0.0</p>
        </div>

      </div>
    </div>
  );
}