import React, { useState } from 'react';
import { CloudRain, User, ArrowRight, ShieldAlert, BookOpen, Layers, Sun, TrendingUp, Sprout, Bot, MapPin, Navigation, X, Check, Calendar, RefreshCw, AlertTriangle, ExternalLink, Search } from 'lucide-react';
import { ScreenTab } from './BottomNav';
import { useLiveWeather } from '../hooks/useLiveWeather';
import { toBn, BD_DISTRICTS } from '../services/weatherService';
import { getTodayBengaliDate, getRealDailyUpdates, DailyUpdateItem } from '../services/dailyUpdatesService';

interface Props {
  onNavigate: (tab: ScreenTab) => void;
  onOpenCropDetail: (cropId: string) => void;
  onOpenDisease: (diseaseId: string) => void;
  farmerName?: string;
  farmerPhoto?: string;
}

export const HomeScreen: React.FC<Props> = ({
  onNavigate,
  onOpenCropDetail,
  onOpenDisease,
  farmerName,
  farmerPhoto,
}) => {
  const { weatherData, selectedDistrict, selectDistrictById, detectGpsLocation, isGpsActive, isLoading } = useLiveWeather();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');
  const [selectedDailyUpdate, setSelectedDailyUpdate] = useState<DailyUpdateItem | null>(null);
  const [isRefreshingUpdates, setIsRefreshingUpdates] = useState(false);

  const todayDate = getTodayBengaliDate();
  const districtName = isGpsActive ? 'লাইভ GPS এলাকা' : (weatherData ? weatherData.locationName.split(',')[0] : selectedDistrict.nameBn);
  const dailyUpdates = getRealDailyUpdates(districtName, weatherData?.condition, weatherData?.temp);

  const handleRefreshUpdates = () => {
    setIsRefreshingUpdates(true);
    setTimeout(() => {
      setIsRefreshingUpdates(false);
    }, 600);
  };

  return (
    <div id="home-dashboard-screen" className="space-y-4 pb-8 relative">
      {/* Top Header Profile & Greeting */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-1.5">
            <span>স্বাগতম {farmerName ? farmerName.split(' ')[0] : 'কৃষক বন্ধু'},</span>
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-stone-600 font-medium">আপনার জন্য আজকের পরামর্শ</p>
            <button
              onClick={() => setShowLocationModal(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer shadow-2xs"
              title="অবস্থান পরিবর্তন বা লাইভ GPS নির্বাচন করতে ট্যাপ করুন"
            >
              <MapPin className="w-3 h-3 text-emerald-700" />
              <span>{isGpsActive ? 'লাইভ GPS' : (weatherData ? weatherData.locationName.split(',')[0] : selectedDistrict.nameBn)}</span>
              <span className="text-[9px] text-emerald-600 font-normal">▼</span>
            </button>
          </div>
        </div>
        <button
          id="btn-home-profile-avatar"
          onClick={() => onNavigate('profile')}
          className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow hover:bg-emerald-600 transition-colors overflow-hidden border-2 border-emerald-200"
          title="প্রোফাইল দেখুন বা সম্পাদনা করুন"
        >
          {farmerPhoto ? (
            <img src={farmerPhoto} alt={farmerName || 'কৃষক'} className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Weather Widget Card (Real-time live weather) */}
      <div
        id="home-weather-card"
        onClick={() => onNavigate('weather')}
        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-4 shadow-md transition-all cursor-pointer relative overflow-hidden group"
      >
        <div className="flex items-center justify-between">
          {/* Weather Icon & Temp */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
              <img src="/sec/weather.png" alt="আবহাওয়া" className="w-full h-full object-contain drop-shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight">
                  {weatherData ? `${toBn(weatherData.current.temp)}°C` : '৩২°C'}
                </span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">লাইভ</span>
              </div>
              <div className="text-xs font-semibold opacity-95">
                {weatherData ? weatherData.current.conditionText : 'আকাশ পর্যবেক্ষণ করা হচ্ছে'}
              </div>
              <div className="text-[10px] opacity-85 mt-0.5 flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5" />
                <span>{weatherData ? weatherData.locationName : 'ঢাকা, বাংলাদেশ'}</span>
              </div>
            </div>
          </div>

          {/* Humidity & Rain */}
          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-[10px] opacity-85 block">আর্দ্রতা</span>
              <span className="text-sm font-bold">
                {weatherData ? `${toBn(weatherData.current.humidity)} %` : '৬০ %'}
              </span>
            </div>
            <div>
              <span className="text-[10px] opacity-85 block">বৃষ্টিপাত</span>
              <span className="text-sm font-bold text-amber-200">
                {weatherData ? `${toBn(weatherData.current.precipitation)} মিমি` : '০ মিমি'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Section: দ্রুত ব্যবহার করুন (Screenshot 005726) */}
      <div>
        <h2 className="text-sm font-extrabold text-stone-900 mb-2.5">দ্রুত ব্যবহার করুন</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {/* 1. রোগ শনাক্ত করণ */}
          <button
            id="quick-card-disease"
            onClick={() => onNavigate('disease')}
            className="bg-white border border-stone-200 hover:border-emerald-400 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs hover:shadow transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50/70 p-1 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform overflow-hidden">
              <img src="/sec/disease.png" alt="রোগ শনাক্ত করণ" className="w-full h-full object-contain" />
            </div>
            <span className="text-[11px] font-bold text-stone-800 leading-tight">
              রোগ শনাক্ত করণ
            </span>
          </button>

          {/* 2. ফসল তথ্য */}
          <button
            id="quick-card-crops"
            onClick={() => onNavigate('crop-info')}
            className="bg-white border border-stone-200 hover:border-emerald-400 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs hover:shadow transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50/70 p-1 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform overflow-hidden">
              <img src="/sec/crop.png" alt="ফসল তথ্য" className="w-full h-full object-contain" />
            </div>
            <span className="text-[11px] font-bold text-stone-800 leading-tight">
              ফসল তথ্য
            </span>
          </button>

          {/* 3. মাটি পরীক্ষা */}
          <button
            id="quick-card-soil"
            onClick={() => onNavigate('soil-test')}
            className="bg-white border border-stone-200 hover:border-emerald-400 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs hover:shadow transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50/70 p-1 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform overflow-hidden">
              <img src="/sec/soil.png" alt="মাটি পরীক্ষা" className="w-full h-full object-contain" />
            </div>
            <span className="text-[11px] font-bold text-stone-800 leading-tight">
              মাটি পরীক্ষা
            </span>
          </button>

          {/* 4. আবহাওয়া */}
          <button
            id="quick-card-weather"
            onClick={() => onNavigate('weather')}
            className="bg-white border border-stone-200 hover:border-emerald-400 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs hover:shadow transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50/70 p-1 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform overflow-hidden">
              <img src="/sec/weather.png" alt="আবহাওয়া" className="w-full h-full object-contain" />
            </div>
            <span className="text-[11px] font-bold text-stone-800 leading-tight">
              আবহাওয়া
            </span>
          </button>

          {/* 5. বাজারদর */}
          <button
            id="quick-card-market"
            onClick={() => onNavigate('market')}
            className="bg-white border border-stone-200 hover:border-emerald-400 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs hover:shadow transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50/70 p-1 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform overflow-hidden">
              <img src="/sec/market.png" alt="বাজারদর" className="w-full h-full object-contain" />
            </div>
            <span className="text-[11px] font-bold text-stone-800 leading-tight">
              বাজারদর
            </span>
          </button>

          {/* 6. উৎপাদন বৃদ্ধি */}
          <button
            id="quick-card-yield"
            onClick={() => onNavigate('advisor-wizard')}
            className="bg-white border border-stone-200 hover:border-emerald-400 p-2.5 rounded-xl flex flex-col items-center justify-center text-center shadow-xs hover:shadow transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50/70 p-1 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform overflow-hidden">
              <img src="/sec/yield.png" alt="উৎপাদন বৃদ্ধি" className="w-full h-full object-contain" />
            </div>
            <span className="text-[11px] font-bold text-stone-800 leading-tight">
              উৎপাদন বৃদ্ধি
            </span>
          </button>
        </div>
      </div>

      {/* AI Advisory Banner -> Navigates to Chatbot */}
      <div
        id="home-ai-advisor-banner"
        onClick={() => onNavigate('chatbot')}
        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-4 shadow-md flex items-center justify-between cursor-pointer transition-all group"
      >
        <div className="space-y-1.5 flex-1 pr-2">
          <div className="text-base font-black">
            <span>AI পরামর্শ পান</span>
          </div>
          <p className="text-[11px] opacity-90 leading-tight max-w-[210px]">
            ফসলের রোগ, সঠিক সার ও ফলন বৃদ্ধিতে এআই বিশেষজ্ঞের সাথে সরাসরি কথা বলুন
          </p>
          <button
            id="btn-banner-get-advice"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('chatbot');
            }}
            className="mt-1 px-3 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1 group-hover:scale-105"
          >
            <span>কথা বলুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI Robot Mascot Avatar Picture from public/sec/bot.png */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 p-1 border-2 border-emerald-300/60 flex items-center justify-center shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
          <img src="/sec/bot.png" alt="কৃষি AI বট" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Recent Updates: সাম্প্রতিক আপডেট (Real Dynamic Daily Updates) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-stone-900">সাম্প্রতিক আপডেট</h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              দৈনিক আপডেট
            </span>
          </div>
          <button
            onClick={handleRefreshUpdates}
            disabled={isRefreshingUpdates}
            title="আজকের আপডেট রিফ্রেশ করুন"
            className="text-[11px] text-stone-500 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingUpdates ? 'animate-spin text-emerald-600' : ''}`} />
            <span>হালনাগাদ</span>
          </button>
        </div>

        <p className="text-[11px] text-stone-500 font-medium">
          {todayDate.fullDateBn} • {todayDate.banglaMonth} ({todayDate.season})
        </p>

        {/* Dynamic Daily Update Cards */}
        <div className="space-y-2.5">
          {dailyUpdates.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedDailyUpdate(item)}
              className="bg-white hover:bg-stone-50 border border-stone-200 hover:border-emerald-300 rounded-2xl p-3 flex items-center gap-3 cursor-pointer shadow-xs transition-all hover:shadow-sm group"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.categoryColor}`}>
                    {item.categoryLabel}
                  </span>
                  <span className="text-[10px] text-stone-400">{item.publishedTime}</span>
                </div>
                <h3 className="text-xs font-bold text-stone-900 leading-snug line-clamp-1 group-hover:text-emerald-800 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5 leading-relaxed">
                  {item.summary}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 flex-shrink-0 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick District / GPS Location Selector Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">অবস্থান পরিবর্তন করুন</h3>
                  <p className="text-[10px] text-stone-500">আপনার জেলা বা লাইভ GPS নির্বাচন করুন</p>
                </div>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* GPS Auto Detect Option */}
            <div className="pt-3 pb-2">
              <button
                onClick={() => {
                  detectGpsLocation();
                  setShowLocationModal(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>আমার লাইভ GPS অবস্থান শনাক্ত করুন</span>
                </span>
                {isGpsActive && <Check className="w-4 h-4 text-emerald-700" />}
              </button>
            </div>

            {/* District Search & Grid */}
            <div className="pt-1 pb-1">
              <div className="flex items-center justify-between pb-1.5 px-0.5">
                <span className="text-[11px] font-bold text-stone-700">
                  বাংলাদেশের সকল জেলা ({BD_DISTRICTS.length}টি জেলা):
                </span>
                {districtSearchQuery && (
                  <button
                    onClick={() => setDistrictSearchQuery('')}
                    className="text-[10px] text-emerald-700 font-semibold hover:underline"
                  >
                    রিসেট
                  </button>
                )}
              </div>

              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={districtSearchQuery}
                  onChange={(e) => setDistrictSearchQuery(e.target.value)}
                  placeholder="জেলার নাম দিয়ে খুঁজুন (যেমন: বগুড়া, কুড়িগ্রাম, ফেনী)..."
                  className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1">
              {BD_DISTRICTS.filter((d) =>
                d.nameBn.toLowerCase().includes(districtSearchQuery.toLowerCase().trim()) ||
                d.nameEn.toLowerCase().includes(districtSearchQuery.toLowerCase().trim())
              ).map((district) => {
                const isSelected = !isGpsActive && selectedDistrict.id === district.id;
                return (
                  <button
                    key={district.id}
                    onClick={() => {
                      selectDistrictById(district.id);
                      setShowLocationModal(false);
                      setDistrictSearchQuery('');
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200'
                    }`}
                  >
                    <span>{district.nameBn}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-100 text-center">
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  onNavigate('weather');
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                বিস্তারিত আবহাওয়া পূর্বাভাস দেখুন →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Update Actionable Detail Modal */}
      {selectedDailyUpdate && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${selectedDailyUpdate.categoryColor}`}>
                  {selectedDailyUpdate.categoryLabel}
                </span>
                <p className="text-[11px] text-stone-500 mt-1">
                  প্রকাশিত: {selectedDailyUpdate.publishedTime} • {districtName}
                </p>
              </div>
              <button
                onClick={() => setSelectedDailyUpdate(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-extrabold text-stone-900 leading-snug">
              {selectedDailyUpdate.title}
            </h3>

            <div className="rounded-2xl overflow-hidden h-40 w-full bg-stone-100">
              <img
                src={selectedDailyUpdate.image}
                alt={selectedDailyUpdate.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-800">বিস্তারিত তথ্য ও পরিস্থিতি:</h4>
              <div className="space-y-1.5 text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                {selectedDailyUpdate.fullDetails.map((detail, idx) => (
                  <p key={idx}>• {detail}</p>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>আজকের করণীয় পদক্ষেপ:</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-700 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                {selectedDailyUpdate.actionSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex items-center gap-2">
              {selectedDailyUpdate.relatedAction && (
                <button
                  onClick={() => {
                    const action = selectedDailyUpdate.relatedAction;
                    setSelectedDailyUpdate(null);
                    if (action?.tabTarget) {
                      onNavigate(action.tabTarget);
                    } else if (action?.cropId) {
                      onOpenCropDetail(action.cropId);
                    }
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
                >
                  <span>{selectedDailyUpdate.relatedAction.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setSelectedDailyUpdate(null)}
                className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
