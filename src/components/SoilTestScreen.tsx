import React, { useState } from 'react';
import { ArrowLeft, Layers, CheckCircle2, AlertCircle, FileText, TrendingUp, Upload } from 'lucide-react';
import { toBengali } from './CreditScoreGauge';

interface Props {
  onBack: () => void;
  onOpenAdvisorWithSoil: (soilType: string) => void;
}

export const SoilTestScreen: React.FC<Props> = ({ onBack, onOpenAdvisorWithSoil }) => {
  const [selectedSoil, setSelectedSoil] = useState<string>('দোআঁশ');
  const [activeTab, setActiveTab] = useState<'field-test' | 'lab-report'>('field-test');

  const soilTypes = [
    {
      id: 'দোআঁশ',
      name: 'দোআঁশ মাটি (Loamy)',
      desc: 'ভেজা অবস্থায় নরম বল তৈরি হয় এবং সহজে ভেঙে যায় না। সকল ফসলের জন্য আদর্শ।',
      ph: '৬.৫ - ৭.২',
      organic: '২.২%',
      suitable: 'ধান, গম, আলু, সরিষা, ভুট্টা',
      status: 'সর্বোত্তম',
    },
    {
      id: 'বেলে-দোআঁশ',
      name: 'বেলে-দোআঁশ মাটি (Sandy Loam)',
      desc: 'হাতে নিলে কিছুটা খসখসে লাগে, দ্রুত পানি নিষ্কাশন হয়।',
      ph: '৬.০ - ৬.৮',
      organic: '১.৫%',
      suitable: 'আলু, চিনাবাদাম, তরমুজ, গম',
      status: 'ভালো',
    },
    {
      id: 'এঁটেল-দোআঁশ',
      name: 'এঁটেল-দোআঁশ মাটি (Clay Loam)',
      desc: 'আঠালো ভাব থাকে এবং পানি ধরে রাখার ক্ষমতা অনেক বেশি।',
      ph: '৬.৮ - ৭.৫',
      organic: '২.৫%',
      suitable: 'আমন ও বোরো ধান, পাট',
      status: 'ভালো',
    },
    {
      id: 'বেলে',
      name: 'বেলে মাটি (Sandy)',
      desc: 'হাতে চাপলে কোনো বল তৈরি হয় না, সম্পূর্ণ ঝুরঝুরে হয়ে পড়ে যায়।',
      ph: '৫.৫ - ৬.২',
      organic: '০.৮%',
      suitable: 'চিনাবাদাম, মিষ্টি আলু, তরমুজ',
      status: 'উন্নতি প্রয়োজন',
    },
  ];

  return (
    <div id="soil-test-screen" className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          id="btn-soil-test-back"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-stone-900">মাটি পরীক্ষা</h1>
        <div className="w-9"></div>
      </div>

      {/* Tabs */}
      <div className="flex bg-stone-200/70 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('field-test')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'field-test'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          মাঠ পর্যায়ের পরীক্ষা
        </button>
        <button
          onClick={() => setActiveTab('lab-report')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'lab-report'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-stone-700 hover:text-stone-900'
          }`}
        >
          ল্যাব টেস্ট রিপোর্ট
        </button>
      </div>

      {activeTab === 'field-test' && (
        <div className="space-y-4">
          {/* Squeeze test illustration card (matching screenshot 005837) */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-stone-900">নমুনা মাটি পরীক্ষা পদ্ধতি</h2>
            <div className="h-36 rounded-xl overflow-hidden bg-stone-200 relative">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80"
                alt="Soil in hand"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs text-white font-semibold">
                  মাটি ভেজা অবস্থায় হাতের মুঠোয় চেপে বল তৈরি করার চেষ্টা করুন
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              আপনার জমির ৪-৫টি স্থান থেকে ৬-৯ ইঞ্চি গভীরতার মাটি সংগ্রহ করে মিশিয়ে নিন। সামান্য পানি দিয়ে গোল বল তৈরি করে মাটির প্রকার নিশ্চিত করুন।
            </p>
          </div>

          {/* Soil types list */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-stone-900">আপনার মাটির ধরনের সাথে মেলান</h3>
            {soilTypes.map((item) => {
              const isSelected = selectedSoil === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedSoil(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white border-stone-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-stone-900">{item.name}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.status === 'সর্বোত্তম'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mb-2 leading-relaxed">{item.desc}</p>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                    <span>উপযুক্ত: {item.suitable}</span>
                    <span className="font-semibold text-stone-700">pH: {item.ph}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onOpenAdvisorWithSoil(selectedSoil)}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>এই মাটির তথ্য দিয়ে ফলন বৃদ্ধি হিসাব করুন</span>
          </button>
        </div>
      )}

      {activeTab === 'lab-report' && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-sm font-bold text-stone-900">SRDI ল্যাব রিপোর্ট স্যাম্পল</h3>
                <span className="text-[11px] text-stone-500">মৃত্তিকা সম্পদ উন্নয়ন ইনস্টিটিউট</span>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                যাচাইকৃত
              </span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'মাটির pH মাত্রা', value: '৬.৮', status: 'আদর্শ মান', color: 'text-emerald-700' },
                { name: 'জৈব পদার্থ (Organic Matter)', value: '২.১%', status: 'সন্তোষজনক', color: 'text-emerald-700' },
                { name: 'নাইট্রোজেন (N)', value: '০.১৫%', status: 'মাঝারি ঘাটতি', color: 'text-amber-700' },
                { name: 'ফসফরাস (P)', value: '১৮ ppm', status: 'পর্যাপ্ত', color: 'text-emerald-700' },
                { name: 'পটাশিয়াম (K)', value: '০.২৮ meq/100g', status: 'উচ্চ', color: 'text-emerald-700' },
                { name: 'সালফার (S)', value: '১২ ppm', status: 'স্বাভাবিক', color: 'text-emerald-700' },
                { name: 'দস্তা (Zinc)', value: '১.২ ppm', status: 'সামান্য ঘাটতি', color: 'text-amber-700' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 bg-stone-50 rounded-lg">
                  <span className="font-semibold text-stone-800">{item.name}</span>
                  <div className="text-right">
                    <span className="font-bold text-stone-900 block">{item.value}</span>
                    <span className={`text-[10px] font-bold ${item.color}`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-950 block mb-1">ল্যাব সুপারিশ:</span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                নাইট্রোজেন ও দস্তার সামান্য ঘাটতি পূরণে ইউরিয়ার সাথে প্রতি শতকে ২০ গ্রাম জিংক সালফেট এবং পর্যাপ্ত পচা গোবর প্রয়োগ করুন।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
