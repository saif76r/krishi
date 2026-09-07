import React, { useState } from 'react';
import { ArrowLeft, CloudRain, Droplets, AlertTriangle, TrendingUp, Lightbulb, Check } from 'lucide-react';
import { INITIAL_NOTIFICATIONS } from '../data';

interface Props {
  onBack: () => void;
  onSelectAction: (type: string) => void;
}

export const NotificationsScreen: React.FC<Props> = ({ onBack, onSelectAction }) => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return <CloudRain className="w-5 h-5 text-sky-600" />;
      case 'task':
        return <Droplets className="w-5 h-5 text-emerald-600" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'market':
        return <TrendingUp className="w-5 h-5 text-indigo-600" />;
      default:
        return <Lightbulb className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div id="notifications-screen" className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          id="btn-notif-back"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-stone-900">নোটিফিকেশন</h1>
        <button
          onClick={markAllAsRead}
          className="text-xs text-emerald-700 font-bold hover:underline"
        >
          পড়া হয়েছে
        </button>
      </div>

      {/* Notifications List (Matching Screenshot 010110) */}
      <div className="space-y-2.5">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => onSelectAction(notif.type)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 shadow-xs ${
              notif.unread
                ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200'
                : 'bg-white border-stone-200'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center flex-shrink-0 shadow-xs">
              {getIcon(notif.type)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-stone-900 leading-relaxed">
                {notif.text}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-stone-500 font-medium">
                <span>আজ</span>
                {notif.unread && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">নতুন</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
