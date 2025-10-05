import { BookOpen, BarChart3, User } from "lucide-react";

interface NavigationBarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function NavigationBar({ currentPage, onPageChange }: NavigationBarProps) {
  const navItems = [
    { id: 'records', label: '목록', icon: BookOpen },
    { id: 'stats', label: '통계', icon: BarChart3 },
    { id: 'my', label: '마이', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-gray-300 p-2">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onPageChange(id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentPage === id 
                ? 'text-primary bg-primary/10' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}