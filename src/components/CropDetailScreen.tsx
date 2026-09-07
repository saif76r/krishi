import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Sprout, Droplets, ShieldAlert, Layers, Clock, Award } from 'lucide-react';
import { CROPS_DATA } from '../data';
import { CROP_VARIETIES_MAP } from './YieldAdvisorWizard';

interface Props {
  cropId: string;
  onBack: () => void;
  onOpenAdvisor: () => void;
}

export const CropDetailScreen: React.FC<Props> = ({ cropId, onBack, onOpenAdvisor }) => {
  const crop = CROPS_DATA.find((c) => c.id === cropId) || CROPS_DATA[0];

  // Accordion state - all open by default or toggleable
  const [openSection, setOpenSection] = useState<string>('season');

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? '' : id);
  };

  const cropVarieties = CROP_VARIETIES_MAP[crop.name]?.varieties || [];

  const sections = [
    {
      id: 'season',
      title: 'উপযুক্ত সময় ও মাটি',
      icon: Layers,
      content: (
        <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
          <p>
            <strong className="text-stone-900">রোপণের উপযুক্ত সময়:</strong> {crop.suitableSeason}
          </p>
          <p>
            <strong className="text-stone-900">উপযুক্ত মাটি:</strong> {crop.soilType}
          </p>
        </div>
      ),
    },
    ...(cropVarieties.length > 0
      ? [
          {
            id: 'varieties',
            title: 'উচ্চফলনশীল ও অনুমোদিত জাতসমূহ',
            icon: Award,
            content: (
              <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
                <p className="text-stone-600 text-[11px]">
                  বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI) ও ধান গবেষণা ইনস্টিটিউট (BRRI) উদ্ভাবিত শীর্ষ জনপ্রিয় জাতসমূহ:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {cropVarieties.map((v, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-center justify-between"
                    >
                      <span className="font-semibold text-stone-900 text-xs">{v.name}</span>
                      {v.tag && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200 font-bold whitespace-nowrap ml-1">
                          {v.tag}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      id: 'seeds',
      title: 'বীজের পরিমাণ ও বপন পদ্ধতি',
      icon: Sprout,
      content: (
        <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
          <p>
            <strong className="text-stone-900">বীজের হার:</strong> {crop.seedRate}
          </p>
          <p>
            বীজ শোধনের জন্য অনুমোদিত ছত্রাকনাশক বা পানিতে লবণ গুলে ভালো বীজ আলাদা করে নিন। চারা গজানোর পর সারিবদ্ধভাবে রোপণ করুন।
          </p>
        </div>
      ),
    },
    {
      id: 'fertilizer',
      title: 'সার প্রয়োগের নিয়মাবলী',
      icon: Layers,
      content: (
        <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
          <p>{crop.fertilizerGuide}</p>
          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 mt-2">
            <span className="text-[11px] font-bold text-emerald-900 block mb-1">সুপারিশ:</span>
            <span className="text-[11px] text-emerald-800">
              জমি তৈরির শেষ চাষের সময় জৈব সার, টিএসপি, এমওপি ও জিপসাম প্রয়োগ করুন। ইউরিয়া সার সমান ৩ কিস্তিতে উপরি প্রয়োগ করুন।
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'irrigation',
      title: 'সেচ ব্যবস্থাপনা',
      icon: Droplets,
      content: (
        <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
          <p>{crop.irrigationGuide}</p>
        </div>
      ),
    },
    {
      id: 'pests',
      title: 'প্রধান পোকা ও রোগ বালাই',
      icon: ShieldAlert,
      content: (
        <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
          <div>
            <span className="font-bold text-stone-900 block mb-1">সাধারণ পোকা-মাকড়:</span>
            <div className="flex flex-wrap gap-1.5">
              {crop.commonPests.map((pest, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold">
                  {pest}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="font-bold text-stone-900 block mb-1">সাধারণ রোগসমূহ:</span>
            <div className="flex flex-wrap gap-1.5">
              {crop.commonDiseases.map((disease, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-semibold">
                  {disease}
                </span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'harvest',
      title: 'ফসল কাটার সময় ও সংরক্ষণ',
      icon: Clock,
      content: (
        <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
          <p>
            <strong className="text-stone-900">কাটার সময়:</strong> {crop.harvestingTime}
          </p>
          <p>
            <strong className="text-stone-900">সংরক্ষণ পদ্ধতি:</strong> {crop.preservation}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div id="crop-detail-screen" className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          id="btn-crop-detail-back"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-stone-900">{crop.name} চাষ নির্দেশিকা</h1>
        <div className="w-9"></div>
      </div>

      {/* Hero Image */}
      <div className="w-full h-44 rounded-2xl overflow-hidden bg-stone-200 relative shadow-sm">
        <img
          src={crop.image}
          alt={crop.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/sec/crop.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex items-end justify-between p-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {crop.category && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/90 text-white shadow-xs">
                  {crop.category}
                </span>
              )}
              {crop.seasonTag && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs text-white border border-white/20">
                  {crop.seasonTag}
                </span>
              )}
            </div>
            <span className="text-2xl font-black text-white block drop-shadow-sm">{crop.name}</span>
            <span className="text-xs text-emerald-200 italic font-medium">{crop.scientificName}</span>
          </div>
          <button
            onClick={onOpenAdvisor}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>AI পরামর্শ নিন</span>
          </button>
        </div>
      </div>

      {/* Accordion Sections (Matching Screenshot 005830) */}
      <div className="space-y-2.5">
        {sections.map((section) => {
          const isOpen = openSection === section.id;
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-stone-900">{section.title}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-stone-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-stone-100 bg-stone-50/50">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
