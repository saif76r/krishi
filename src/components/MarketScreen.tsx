import React, { useState } from 'react';
import { ArrowLeft, Search, TrendingUp, TrendingDown, Minus, MapPin } from 'lucide-react';
import { INITIAL_MARKET_PRICES } from '../data';
import { MarketPriceItem } from '../types';
import { toBengali } from './CreditScoreGauge';

interface Props {
  onBack: () => void;
}

export const MarketScreen: React.FC<Props> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');
  const [selectedLocation, setSelectedLocation] = useState<string>('ঢাকা');

  const categories = ['সব', 'ধান', 'গম', 'সবজি', 'ফল', 'মসলা'];
  const locations = ['ঢাকা', 'রংপুর', 'বগুড়া', 'রাজশাহী', 'দিনাজপুর', 'চট্টগ্রাম', 'যশোর'];

  const filteredPrices = INITIAL_MARKET_PRICES.filter((item) => {
    const matchesCategory = selectedCategory === 'সব' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="market-prices-screen" className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          id="btn-market-back"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-stone-900">বাজারদর</h1>
        <div className="w-9"></div>
      </div>

      {/* Search & Location Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            id="input-search-market"
            type="text"
            placeholder="ফসলের নাম দিয়ে খুঁজুন (যেমন ধান, আলু)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <div className="flex gap-1.5">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedLocation === loc
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills (Screenshot 005847) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Prices List (Screenshot 005847) */}
      <div className="space-y-2.5">
        {filteredPrices.map((item) => (
          <div
            key={item.id}
            id={`market-item-${item.id}`}
            className="bg-white border border-stone-200 rounded-2xl p-3 flex items-center justify-between shadow-xs hover:shadow transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">{item.name}</h3>
                <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                  <span>{selectedLocation} পাইকারি</span>
                  <span>•</span>
                  <span>{item.updatedAt}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-black text-stone-900">
                ৳ {toBengali(item.price)}
              </div>
              <div className="text-[10px] text-stone-500 font-semibold">{item.unit}</div>
              <div className="mt-1 flex items-center justify-end gap-0.5">
                {item.change === 'up' && (
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    +২.৫%
                  </span>
                )}
                {item.change === 'down' && (
                  <span className="inline-flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-1 rounded">
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                    -১.৮%
                  </span>
                )}
                {item.change === 'stable' && (
                  <span className="inline-flex items-center text-[10px] font-bold text-stone-500 bg-stone-100 px-1 rounded">
                    <Minus className="w-3 h-3 mr-0.5" />
                    স্থিতিশীল
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
