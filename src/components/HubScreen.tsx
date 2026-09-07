import React from 'react';
import { ShieldAlert, BookOpen, Sun, Layers, Package, Sprout, TrendingUp, Bell } from 'lucide-react';
import { ScreenTab } from './BottomNav';

interface Props {
  onNavigate: (tab: ScreenTab) => void;
}

export const HubScreen: React.FC<Props> = ({ onNavigate }) => {
  const hubItems = [
    {
      id: 'chatbot',
      title: 'AI কৃষি বন্ধু (চ্যাটবট)',
      desc: 'কৃষি এআই বিশেষজ্ঞের সাথে সরাসরি কথা বলুন',
      tab: 'chatbot' as ScreenTab,
      imgSrc: '/sec/bot.png',
      bg: 'bg-emerald-500/10',
      highlight: true,
    },
    {
      id: 'disease',
      title: 'রোগ শনাক্ত করণ',
      desc: 'ক্যামেরা স্ক্যানে ফসলের রোগ নির্ণয়',
      tab: 'disease' as ScreenTab,
      imgSrc: '/sec/disease.png',
      bg: 'bg-emerald-50',
    },
    {
      id: 'crop-info',
      title: 'ফসল তথ্য',
      desc: 'ধান, গম, ভুট্টা, আলু ইত্যাদির তথ্যভাণ্ডার',
      tab: 'crop-info' as ScreenTab,
      imgSrc: '/sec/crop.png',
      bg: 'bg-emerald-50',
    },
    {
      id: 'weather',
      title: 'আবহাওয়া',
      desc: '৭ দিনের পূর্বাভাস ও কৃষি সতর্কতা',
      tab: 'weather' as ScreenTab,
      imgSrc: '/sec/weather.png',
      bg: 'bg-sky-50',
    },
    {
      id: 'soil-test',
      title: 'মাটি পরীক্ষা',
      desc: 'নমুনা পরীক্ষা ও মাটির ধরন যাচাই',
      tab: 'soil-test' as ScreenTab,
      imgSrc: '/sec/soil.png',
      bg: 'bg-amber-50',
    },
    {
      id: 'inputs',
      title: 'ইনপুট ব্যবস্থাপনা',
      desc: 'বীজ, সার, কীটনাশক স্টক ও হিসাব',
      tab: 'inputs' as ScreenTab,
      imgSrc: '/sec/inputs.png',
      bg: 'bg-indigo-50',
    },
    {
      id: 'advisor-wizard',
      title: 'উৎপাদন বৃদ্ধি',
      desc: 'AI ফলন পূর্বাভাস ও লাভজনক মডেল',
      tab: 'advisor-wizard' as ScreenTab,
      imgSrc: '/sec/yield.png',
      bg: 'bg-emerald-100',
    },
    {
      id: 'market',
      title: 'বাজারদর',
      desc: 'সারা দেশের পাইকারি ও খুচরা মূল্য',
      tab: 'market' as ScreenTab,
      imgSrc: '/sec/market.png',
      bg: 'bg-emerald-50',
    },
    {
      id: 'notifications',
      title: 'নোটিফিকেশন',
      desc: 'জরুরি আবহাওয়া ও কৃষি পরামর্শ বার্তা',
      tab: 'notifications' as ScreenTab,
      imgSrc: '/sec/img.png',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div id="hub-screen" className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">হাব</h1>
        <span className="text-xs font-semibold text-stone-500">সকল সেবা সমূহ</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {hubItems.map((item) => (
          <button
            key={item.id}
            id={`hub-card-${item.id}`}
            onClick={() => onNavigate(item.tab)}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] shadow-xs hover:shadow ${
              item.highlight
                ? 'bg-emerald-50/95 border-emerald-400 ring-2 ring-emerald-400/30'
                : 'bg-white border-stone-200 hover:border-emerald-300'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-stone-100 p-1.5 flex items-center justify-center mb-3 shadow-xs overflow-hidden">
              <img src={item.imgSrc} alt={item.title} className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-stone-900 leading-snug">{item.title}</h3>
              <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
