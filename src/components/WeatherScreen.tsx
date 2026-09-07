import React, { useState } from 'react';
import {
  ArrowLeft,
  CloudRain,
  Sun,
  Cloud,
  AlertTriangle,
  Droplets,
  Wind,
  MapPin,
  RefreshCw,
  Navigation,
  CheckCircle2,
} from 'lucide-react';
import { useLiveWeather } from '../hooks/useLiveWeather';
import { BD_DISTRICTS, toBn } from '../services/weatherService';

interface Props {
  onBack: () => void;
}

export const WeatherScreen: React.FC<Props> = ({ onBack }) => {
  const {
    weatherData,
    isLoading,
    error,
    selectedDistrict,
    isGpsActive,
    selectDistrictById,
    detectGpsLocation,
    refresh,
  } = useLiveWeather();

  const [showDistrictPicker, setShowDistrictPicker] = useState(false);

  // Weather icon helper
  const renderWeatherIcon = (code: number, className = 'w-10 h-10') => {
    if (code >= 80 || (code >= 51 && code <= 65) || code >= 95) {
      return <CloudRain className={className} />;
    }
    if (code === 1 || code === 2 || code === 3) {
      return <Cloud className={className} />;
    }
    return <Sun className={className} />;
  };

  return (
    <div id="weather-forecast-screen" className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          id="btn-weather-back"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-stone-900">লাইভ আবহাওয়া</h1>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
          title="রিফ্রেশ করুন"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* District Selector Bar & GPS Button */}
      <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <select
              value={isGpsActive ? 'gps' : selectedDistrict.id}
              onChange={(e) => {
                if (e.target.value === 'gps') {
                  detectGpsLocation();
                } else {
                  selectDistrictById(e.target.value);
                }
              }}
              className="bg-stone-50 border border-stone-200 text-stone-900 text-xs font-bold rounded-xl px-2.5 py-2 w-full focus:outline-emerald-500"
            >
              {isGpsActive && <option value="gps">📍 বর্তমান অবস্থান (GPS)</option>}
              {BD_DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameBn} ({d.nameEn})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={detectGpsLocation}
            className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex-shrink-0"
            title="লাইভ GPS লোকেশন"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span>লাইভ GPS</span>
          </button>
        </div>

        {weatherData && (
          <div className="flex items-center justify-between text-[11px] text-stone-500 px-1 pt-1 border-t border-stone-100">
            <span>অবস্থান: <b className="text-stone-800">{weatherData.locationName}</b></span>
            <span>আপডেট: <b>{weatherData.lastUpdated}</b></span>
          </div>
        )}
      </div>

      {/* Main Today's Weather Card */}
      {weatherData && (
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <span className="text-xs text-emerald-100 font-semibold block">আজকের বাস্তব আবহাওয়া</span>
              <div className="flex items-baseline gap-1 mt-1">
                <h2 className="text-4xl font-black tracking-tight">{toBn(weatherData.current.temp)}°C</h2>
                <span className="text-xs text-emerald-200 font-medium">
                  (অনুভূত {toBn(weatherData.current.apparentTemp)}°C)
                </span>
              </div>
              <span className="text-sm font-bold text-white mt-1 block">
                {weatherData.current.conditionText}
              </span>
              <div className="text-[11px] text-emerald-100/90 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{weatherData.locationName}</span>
              </div>
            </div>

            <div className="w-18 h-18 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
              {renderWeatherIcon(weatherData.current.weatherCode, 'w-12 h-12')}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/20 text-center relative z-10">
            <div>
              <span className="text-[10px] text-emerald-100 block">বাতাসের আর্দ্রতা</span>
              <span className="text-sm font-extrabold">{toBn(weatherData.current.humidity)}%</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-100 block">বৃষ্টিপাত / সম্ভাবনা</span>
              <span className="text-sm font-extrabold text-amber-200">
                {toBn(weatherData.current.precipitation)} মিমি
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-100 block">বাতাসের গতিবেগ</span>
              <span className="text-sm font-extrabold">{toBn(weatherData.current.windSpeed)} কিমি/ঘণ্টা</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading state skeleton */}
      {isLoading && !weatherData && (
        <div className="bg-stone-100 rounded-2xl p-6 text-center animate-pulse space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-stone-600 font-bold">লাইভ আবহাওয়া কেন্দ্রের সাথে সংযোগ করা হচ্ছে...</p>
        </div>
      )}

      {/* Agricultural Advice Banner dynamically derived from live weather */}
      {weatherData && (
        <div
          className={`border rounded-2xl p-4 shadow-xs flex items-start gap-3 ${
            weatherData.agriculturalAdvice.sprayWarning
              ? 'bg-amber-50 border-amber-300'
              : 'bg-emerald-50 border-emerald-300'
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              weatherData.agriculturalAdvice.sprayWarning ? 'text-amber-600' : 'text-emerald-600'
            }`}
          />
          <div className="space-y-1">
            <h3
              className={`text-xs font-bold ${
                weatherData.agriculturalAdvice.sprayWarning ? 'text-amber-900' : 'text-emerald-900'
              }`}
            >
              {weatherData.agriculturalAdvice.title}
            </h3>
            <p
              className={`text-[11px] leading-relaxed ${
                weatherData.agriculturalAdvice.sprayWarning ? 'text-amber-800' : 'text-emerald-800'
              }`}
            >
              {weatherData.agriculturalAdvice.message}
            </p>
          </div>
        </div>
      )}

      {/* 7-Day Forecast Cards from real Open-Meteo */}
      {weatherData && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">আগামী ৭ দিনের পূর্বাভাস</h3>
            <span className="text-[10px] text-stone-500">প্রতিদিনের সর্বোচ্চ ও সর্বনিম্ন</span>
          </div>

          <div className="space-y-2">
            {weatherData.daily.map((day, idx) => (
              <div
                key={idx}
                className="bg-white border border-stone-200 rounded-xl p-3 flex items-center justify-between shadow-xs hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    {renderWeatherIcon(day.weatherCode, 'w-5 h-5 text-emerald-700')}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">{day.dayName}</span>
                    <span className="text-[10px] text-stone-500">{day.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="text-right">
                    <span className="text-xs text-stone-700 font-medium block truncate max-w-[130px]">
                      {day.conditionText}
                    </span>
                    {day.precipitationProb > 0 && (
                      <span className="text-[10px] text-sky-600 font-semibold">
                        বৃষ্টি: {toBn(day.precipitationProb)}%
                      </span>
                    )}
                  </div>
                  <div className="text-right min-w-[50px]">
                    <span className="text-xs font-black text-stone-900">{toBn(day.maxTemp)}°</span>
                    <span className="text-[11px] text-stone-400 ml-1">{toBn(day.minTemp)}°</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
