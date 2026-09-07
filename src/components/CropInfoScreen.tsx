import React, { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Search, X, Sparkles, Sprout } from 'lucide-react';
import { CROPS_DATA } from '../data';
import { CropInfo } from '../types';

interface Props {
  onBack: () => void;
  onSelectCrop: (cropId: string) => void;
}

export const CropInfoScreen: React.FC<Props> = ({ onBack, onSelectCrop }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'সবগুলো', count: CROPS_DATA.length },
    { id: 'দানা ফসল', label: '🌾 দানা ফসল' },
    { id: 'সবজি', label: '🥦 সবজি' },
    { id: 'ফল ও অর্থকরী', label: '🍌 ফল ও অর্থকরী' },
    { id: 'তৈলবীজ ও মসলা', label: '🌿 তৈলবীজ ও মসলা' },
  ];

  const filteredCrops = useMemo(() => {
    return CROPS_DATA.filter((crop) => {
      const matchesCategory =
        selectedCategory === 'all' || crop.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        crop.name.toLowerCase().includes(q) ||
        crop.scientificName.toLowerCase().includes(q) ||
        (crop.category && crop.category.toLowerCase().includes(q)) ||
        (crop.seasonTag && crop.seasonTag.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div id="crop-catalog-screen" className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          id="btn-crop-catalog-back"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-stone-900">ফসল তথ্য</h1>
          <p className="text-[11px] text-stone-500 font-medium">
            উন্নত চাষাবাদ, সার ও বালাই ব্যবস্থাপনা গাইড
          </p>
        </div>
        <div className="w-9"></div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ফসলের নাম বা জাত লিখে খুঁজুন (যেমন: টমেটো, বেগুন)..."
          className="w-full pl-9.5 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
              {cat.id === 'all' && (
                <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-200 text-stone-700'}`}>
                  {CROPS_DATA.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Crops Count Info */}
      <div className="flex items-center justify-between text-[11px] text-stone-500 px-1 font-medium">
        <span>প্রদর্শিত হচ্ছে: <strong className="text-stone-800">{filteredCrops.length}টি</strong> ফসল</span>
        {selectedCategory !== 'all' && (
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-emerald-700 hover:underline font-semibold"
          >
            সব দেখুন
          </button>
        )}
      </div>

      {/* Grid of crops */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filteredCrops.map((crop) => (
            <div
              key={crop.id}
              id={`crop-card-${crop.id}`}
              onClick={() => onSelectCrop(crop.id)}
              className="bg-white border border-stone-200 hover:border-emerald-500 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col"
            >
              <div className="h-32 w-full overflow-hidden bg-stone-200 relative">
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/sec/crop.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent"></div>

                {crop.category && (
                  <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-stone-900/70 backdrop-blur-xs text-stone-100 border border-white/20">
                    {crop.category}
                  </span>
                )}

                <span className="absolute bottom-2 left-2 text-white font-extrabold text-base drop-shadow-sm flex items-center gap-1">
                  {crop.name}
                </span>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] text-stone-500 font-medium italic block line-clamp-1">
                    {crop.scientificName}
                  </span>
                  {crop.seasonTag && (
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 font-medium line-clamp-1">
                      {crop.seasonTag}
                    </span>
                  )}
                </div>

                <div className="pt-1 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800 border-t border-stone-100">
                  <span>চাষ তথ্য</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
          <Sprout className="w-10 h-10 text-stone-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-stone-700">কোনো ফসল পাওয়া যায়নি</p>
          <p className="text-xs text-stone-500 mt-1">
            "{searchQuery}" এর সাথে মিল রয়েছে এমন কোনো ফসলের তথ্য নেই
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-3 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      )}
    </div>
  );
};
