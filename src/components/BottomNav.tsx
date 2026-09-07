import React from 'react';
import { Home, LayoutGrid, Plus, Bell, User } from 'lucide-react';

export type ScreenTab =
  | 'home'
  | 'hub'
  | 'advisor-wizard'
  | 'disease'
  | 'crop-info'
  | 'crop-detail'
  | 'soil-test'
  | 'market'
  | 'weather'
  | 'inputs'
  | 'notifications'
  | 'profile'
  | 'auth'
  | 'chatbot';

interface Props {
  activeTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onSelectTab, unreadCount = 2 }) => {
  return (
    <nav
      id="bottom-navigation-bar"
      className="w-full sticky bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1.5 shadow-lg"
    >
      <div className="grid grid-cols-5 items-center w-full max-w-md mx-auto">
        {/* 1. Home */}
        <button
          id="nav-tab-home"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 min-w-0 transition-colors ${
            activeTab === 'home' ? 'text-emerald-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          <span className="text-[11px] mt-1 leading-none truncate w-full text-center">হোম</span>
        </button>

        {/* 2. Hub */}
        <button
          id="nav-tab-hub"
          onClick={() => onSelectTab('hub')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 min-w-0 transition-colors ${
            activeTab === 'hub' ? 'text-emerald-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <LayoutGrid className="w-5 h-5 flex-shrink-0" />
          <span className="text-[11px] mt-1 leading-none truncate w-full text-center">হাব</span>
        </button>

        {/* 3. Center Plus Button (Launch Advisor / Yield Optimization) */}
        <div className="flex flex-col items-center justify-center -mt-6">
          <button
            id="nav-tab-quick-action"
            onClick={() => onSelectTab('advisor-wizard')}
            className="w-13 h-13 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 active:scale-95 transition-transform border-4 border-white"
            title="উৎপাদন বৃদ্ধি ও AI পরামর্শক"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
          <span className="text-[10px] mt-0.5 text-stone-500 font-medium leading-none">পরামর্শ</span>
        </div>

        {/* 4. Notifications */}
        <button
          id="nav-tab-notifications"
          onClick={() => onSelectTab('notifications')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 min-w-0 transition-colors ${
            activeTab === 'notifications' ? 'text-emerald-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Bell className="w-5 h-5 flex-shrink-0" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 leading-none truncate w-full text-center">বার্তা</span>
        </button>

        {/* 5. Profile */}
        <button
          id="nav-tab-profile"
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 min-w-0 transition-colors ${
            activeTab === 'profile' ? 'text-emerald-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <User className="w-5 h-5 flex-shrink-0" />
          <span className="text-[11px] mt-1 leading-none truncate w-full text-center">প্রোফাইল</span>
        </button>
      </div>
    </nav>
  );
};
