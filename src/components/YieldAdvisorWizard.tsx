import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Calendar, Upload, CheckCircle2, XCircle, AlertTriangle, Sprout, TrendingUp, RefreshCw, Download, Share2 } from 'lucide-react';
import { AdvisorRequest, AdvisorResponse } from '../types';
import { CreditScoreGauge, toBengali } from './CreditScoreGauge';
import { BD_DISTRICTS } from '../services/weatherService';

export interface CropVarietyInfo {
  id: string;
  name: string;
  tag?: string;
}

export const CROP_VARIETIES_MAP: Record<string, { label: string; icon: string; varieties: CropVarietyInfo[] }> = {
  'ধান': {
    label: 'ধান (Rice)',
    icon: '🌾',
    varieties: [
      { id: 'BRRI 28', name: 'ব্রি ধান ২৮ (জনপ্রিয় বোরো)', tag: 'বোরো' },
      { id: 'BRRI 29', name: 'ব্রি ধান ২৯ (উচ্চফলনশীল বোরো)', tag: 'বোরো' },
      { id: 'BRRI 89', name: 'ব্রি ধান ৮৯ (সর্বোচ্চ ফলন)', tag: 'বোরো' },
      { id: 'BRRI 58', name: 'ব্রি ধান ৫৮', tag: 'বোরো' },
      { id: 'BRRI 49', name: 'ব্রি ধান ৪৯ (মেগা আমন)', tag: 'আমন' },
      { id: 'BRRI 50', name: 'ব্রি ধান ৫০ (বাংলামতি সুগন্ধি)', tag: 'সুগন্ধি' },
      { id: 'BRRI 81', name: 'ব্রি ধান ৮১ (রপ্তানিযোগ্য প্রিমিয়াম)', tag: 'বোরো' },
      { id: 'BINA 7', name: 'বিনা ধান-৭ (আগাম আমন)', tag: 'আমন' },
      { id: 'BINA 11', name: 'বিনা ধান-১১ (বন্যা সহনশীল)', tag: 'আমন' },
      { id: 'বাসমতী', name: 'বাসমতী হাইব্রিড', tag: 'সুগন্ধি' },
    ],
  },
  'আলু': {
    label: 'আলু (Potato)',
    icon: '🥔',
    varieties: [
      { id: 'ডায়মন্ড', name: 'ডায়মন্ড (Diamant - সেরা সাদা আলু)', tag: 'উচ্চফলনশীল' },
      { id: 'কার্ডিনাল', name: 'কার্ডিনাল (Cardinal - লাল চামড়া)', tag: 'উচ্চফলনশীল' },
      { id: 'গ্রানোলা', name: 'গ্রানোলা (Granola - রোগসহনশীল)', tag: 'জনপ্রিয়' },
      { id: 'অ্যাস্টেরিক্স', name: 'বারি আলু-৮ (অ্যাস্টেরিক্স - লাল আলু)', tag: 'রপ্তানিযোগ্য' },
      { id: 'লেডি রোসেটা', name: 'বারি আলু-২৫ (লেডি রোসেটা - চিপস জাত)', tag: 'শিল্প জাত' },
      { id: 'বারি টিপিএস', name: 'বারি আলু-৭ (টিপিএস হাইব্রিড)', tag: 'কম বীজ খরচ' },
      { id: 'দেশী লাল পাকড়ি', name: 'দেশী লাল পাকড়ি / শিল আলু', tag: 'স্থানীয়' },
    ],
  },
  'সরিষা': {
    label: 'সরিষা (Mustard)',
    icon: '🌿',
    varieties: [
      { id: 'বারি সরিষা-১৪', name: 'বারি সরিষা-১৪ (স্বল্পমেয়াদী ও সবচেয়ে জনপ্রিয়)', tag: '৭৫-৮০ দিন' },
      { id: 'বারি সরিষা-১৫', name: 'বারি সরিষা-১৫ (হলুদ দানা ও তেল বেশি)', tag: 'তেল বেশি' },
      { id: 'বারি সরিষা-১৭', name: 'বারি সরিষা-১৭ (উচ্চ ফলনশীল)', tag: 'বিঘা প্রতি ৭-৮ মণ' },
      { id: 'বারি সরিষা-১৮', name: 'বারি সরিষা-১৮ (ক্যানোলা জাত)', tag: 'স্বাস্থ্যকর' },
      { id: 'বিনা সরিষা-৪', name: 'বিনা সরিষা-৪', tag: 'উচ্চফলনশীল' },
      { id: 'বিনা সরিষা-৯', name: 'বিনা সরিষা-৯', tag: 'আগাম জাত' },
      { id: 'টোরি-৭', name: 'টোরি-৭ (দেশী লাল সরিষা)', tag: 'স্বল্পমেয়াদী' },
      { id: 'শ্বেত সরিষা', name: 'শ্বেত সরিষা / রাই সরিষা', tag: 'ঐতিহ্যবাহী' },
    ],
  },
  'ভুট্টা': {
    label: 'ভুট্টা (Maize)',
    icon: '🌽',
    varieties: [
      { id: 'বারি হাইব্রিড ভুট্টা-৯', name: 'বারি হাইব্রিড ভুট্টা-৯ (মেগা ফলন)', tag: 'উচ্চফলনশীল' },
      { id: 'বারি হাইব্রিড ভুট্টা-১৬', name: 'বারি হাইব্রিড ভুট্টা-১৬', tag: 'রোগসহনশীল' },
      { id: 'পাইওনিয়ার ৩৩৫৫', name: 'পাইওনিয়ার ৩৩৫৫ (Pioneer 3355)', tag: 'মাল্টিন্যাশনাল' },
      { id: 'এনকে-৪০', name: 'এনকে-৪০ (Syngenta NK-40)', tag: 'শক্ত কাণ্ড' },
      { id: 'প্যাসিফিক ৯৮৪', name: 'প্যাসিফিক ৯৮৪ (Pacific 984)', tag: 'জনপ্রিয়' },
      { id: 'কাবেরি ৫০', name: 'কাবেরি ৫০ (Kaveri 50)', tag: 'খরাসহনশীল' },
      { id: 'সুপার শাইন', name: 'সুপার শাইন হাইব্রিড', tag: 'উচ্চ পুষ্টি' },
    ],
  },
  'বেগুন': {
    label: 'বেগুন (Brinjal / Eggplant)',
    icon: '🍆',
    varieties: [
      { id: 'বারি বেগুন-১', name: 'বারি বেগুন-১ (উত্তরা - লম্বা জাত)', tag: 'শীতকালীন' },
      { id: 'বারি বেগুন-৮', name: 'বারি বেগুন-৮ (বিটি বেগুন-২ পোকারোধী)', tag: 'কীটনাশকমুক্ত' },
      { id: 'বারি বেগুন-১২', name: 'বারি বেগুন-১২ (কাজলা - চকচকে বেগুনি)', tag: 'উচ্চফলনশীল' },
      { id: 'ইসলামপুরী', name: 'ইসলামপুরী / তাল বেগুন (গোল মাংসল)', tag: 'ভাজির জন্য সেরা' },
      { id: 'সিংনাথ', name: 'সিংনাথ বেগুন (লম্বা ও নরম)', tag: 'জনপ্রিয়' },
      { id: 'ব্ল্যাক ডায়মন্ড', name: 'ব্ল্যাক ডায়মন্ড হাইব্রিড', tag: 'উচ্চফলনশীল' },
      { id: 'বারি বেগুন-১০', name: 'বারি বেগুন-১০ (নয়নতারা)', tag: 'গোলাকার' },
      { id: 'দেশী লম্বা বেগুন', name: 'দেশী সবুজ/বেগুনি লম্বা বেগুন', tag: 'স্থানীয়' },
    ],
  },
  'টমেটো': {
    label: 'টমেটো (Tomato)',
    icon: '🍅',
    varieties: [
      { id: 'বারি টমেটো-২', name: 'বারি টমেটো-২ (রতন - মাংসল ও মিষ্টি)', tag: 'শীতকালীন' },
      { id: 'বারি টমেটো-১৪', name: 'বারি টমেটো-১৪ (সর্বাধিক ফলন)', tag: 'শীতকালীন' },
      { id: 'বারি হাইব্রিড টমেটো-৮', name: 'বারি হাইব্রিড টমেটো-৮ (গ্রীষ্মকালীন)', tag: 'গ্রীষ্মকাল' },
      { id: 'মিন্টু সুপার', name: 'মিন্টু সুপার হাইব্রিড (Mintoo Super)', tag: 'মেগা ফলন' },
      { id: 'বিজলি হাইব্রিড', name: 'বিজলি হাইব্রিড (Bijli 11)', tag: 'উচ্চফলনশীল' },
      { id: 'টাইটান হাইব্রিড', name: 'টাইটান হাইব্রিড (পাকা শক্ত ত্বক)', tag: 'পরিবহনবান্ধব' },
      { id: 'বারি টমেটো-১৫', name: 'বারি টমেটো-১৫ (ভাইরাস সহনশীল)', tag: 'রোগসহনশীল' },
      { id: 'দেশী চেরি টমেটো', name: 'দেশী চেরি ও মানিক টমেটো', tag: 'সালাদ' },
    ],
  },
  'ফুলকপি': {
    label: 'ফুলকপি (Cauliflower)',
    icon: '🥦',
    varieties: [
      { id: 'বারি ফুলকপি-১', name: 'বারি ফুলকপি-১ (রূপা - ধবধবে সাদা)', tag: 'শীতকালীন' },
      { id: 'হোয়াইট মার্বেল', name: 'হোয়াইট মার্বেল হাইব্রিড (White Marble)', tag: 'আঁটসাঁট ফুল' },
      { id: 'স্নো হোয়াইট', name: 'স্নো হোয়াইট (Snow White)', tag: 'উচ্চফলনশীল' },
      { id: 'সামার স্টার', name: 'সামার স্টার (Summer Star - গ্রীষ্মকালীন আগাম)', tag: 'অফ-সিজন' },
      { id: 'পূষা দীপালী', name: 'পূষা দীপালী (আগাম জাত)', tag: 'অক্টোবর-নভেম্বর' },
      { id: 'কারেন্ট হাইব্রিড', name: 'কারেন্ট হাইব্রিড (Current)', tag: 'দ্রুত বর্ধনশীল' },
      { id: 'স্থানীয় দেশী ফুলকপি', name: 'স্থানীয় উন্নত জাত', tag: 'দেশী' },
    ],
  },
  'পেঁপে': {
    label: 'পেঁপে (Papaya)',
    icon: '🍈',
    varieties: [
      { id: 'রেড লেডি', name: 'রেড লেডি হাইব্রিড (Red Lady 786 - সেরা ফলন)', tag: 'উচ্চমূল্য ও মিষ্টি' },
      { id: 'বারি পেঁপে-১', name: 'বারি পেঁপে-১ (গাঢ় কমলা শাঁস)', tag: 'মিষ্টি ও সুস্বাদু' },
      { id: 'শাহী পেঁপে', name: 'শাহী পেঁপে (উচ্চ ফলনশীল)', tag: 'সবজি ও পাকা ফল' },
      { id: 'রাঁচি পেঁপে', name: 'রাঁচি জাতের পেঁপে', tag: 'সহনশীল' },
      { id: 'হানি ডিউ', name: 'হানি ডিউ (Honey Dew)', tag: 'অতিমিষ্টি' },
      { id: 'দেশী উন্নত পেঁপে', name: 'স্থানীয় দেশী পেঁপে জাত', tag: 'সহজ পরিচর্যা' },
    ],
  },
  'কলা': {
    label: 'কলা (Banana)',
    icon: '🍌',
    varieties: [
      { id: 'অমৃতসাগর', name: 'অমৃতসাগর কলা (সুস্বাদু ও প্রিমিয়াম)', tag: 'উচ্চ বাজারমূল্য' },
      { id: 'সবরি কলা', name: 'সবরি কলা (অনুপম স্বাদ ও মিষ্টি)', tag: 'জনপ্রিয়' },
      { id: 'মেহেরসাগর', name: 'মেহেরসাগর কলা (উচ্চ ফলন)', tag: 'বড় কাঁদি' },
      { id: 'চাম্পা কলা', name: 'চাম্পা বা চিনিচাম্পা (রোগ ও খরা সহনশীল)', tag: 'সহজ চাষ' },
      { id: 'বারি কলা-১', name: 'বারি কলা-১', tag: 'বিএআরআই উদ্ভাবিত' },
      { id: 'আনাজি কলা', name: 'আনাজি বা কাঁচকলা (সবজি জাত)', tag: 'সবজি' },
    ],
  },
  'গম': {
    label: 'গম (Wheat)',
    icon: '🌾',
    varieties: [
      { id: 'বারি গম-৩৩', name: 'বারি গম-৩৩ (ব্লাস্ট রোগ প্রতিরোধী ও জিঙ্ক সমৃদ্ধ)', tag: 'মেগা জাত' },
      { id: 'বারি গম-২৫', name: 'বারি গম-২৫ (লবণাক্ততা সহনশীল)', tag: 'উপকূলীয়' },
      { id: 'বারি গম-২৮', name: 'বারি গম-২৮ (দেরিতে বপন উপযোগী)', tag: 'তাপ সহনশীল' },
      { id: 'ডব্লিউএমআরআই গম-৩', name: 'ডব্লিউএমআরআই গম-৩ (WMRI Gom-3)', tag: 'উচ্চফলনশীল' },
      { id: 'কাঞ্চন গম', name: 'কাঞ্চন গম (ক্লাসিক জনপ্রিয়)', tag: 'সুপরিচিত' },
      { id: 'শতাব্দী', name: 'শতাব্দী গম', tag: 'উচ্চ পুষ্টি' },
    ],
  },
  'পান': {
    label: 'পান (Betel leaf)',
    icon: '🍃',
    varieties: [
      { id: 'মিষ্টি পান', name: 'মিষ্টি পান (সবচেয়ে সুস্বাদু ও দামি)', tag: 'উচ্চমূল্য' },
      { id: 'সাঁচি পান', name: 'সাঁচি পান (গাঢ় সবুজ ও ঝাল-মিষ্টি)', tag: 'দীর্ঘস্থায়ী' },
      { id: 'বাংলা পান', name: 'বাংলা পান (উচ্চফলনশীল ও বড় পাতা)', tag: 'জনপ্রিয়' },
      { id: 'গয়াসুর পান', name: 'গয়াসুর পান', tag: 'সুপরিচিত' },
      { id: 'উজালা পান', name: 'উজালা উন্নত জাত', tag: 'উন্নত বরোজ' },
    ],
  },
};

interface Props {
  onBackToHome: () => void;
  onSelectCropDetail?: (cropId: string) => void;
}

export const YieldAdvisorWizard: React.FC<Props> = ({ onBackToHome, onSelectCropDetail }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStepText, setLoadingStepText] = useState<string>('ইনপুট ও মাটির তথ্য যাচাই হচ্ছে...');

  // Form State initialized with realistic Bangladeshi farmer defaults
  const [formData, setFormData] = useState<AdvisorRequest>({
    cropType: 'ধান',
    cropVariety: 'BRRI 28',
    season: 'আমন',
    landSize: 2,
    landUnit: 'একর',
    soilType: 'দোআঁশ',
    soilTestDate: '১৫-০৫-২০২৬',
    soilTestSummary: 'নাইট্রোজেন ও ফসফরাস স্বাভাবিক',
    sowingDate: '১৫-০৫-২০২৬',
    seedQuantity: 8,
    seedUnit: 'কেজি',
    irrigationStatus: 'নিয়মিত সেচ হচ্ছে',
    cropStage: 'চারা রোপন হচ্ছে',
    region: 'রংপুর, কুড়িগ্রাম',
    notes: 'ইউরিয়া ৫০ কেজি, টিএসপি ২৫ কেজি এবং ট্রাইসাইক্লাজল স্প্রে করা হয়েছে।',
  });

  // Result state
  const [result, setResult] = useState<AdvisorResponse | null>({
    score_analysis: {
      score: 84,
      max_score: 100,
      status_text: 'খুব ভালো',
      credit_status: 'ভাল',
    },
    yield_prediction: {
      current_yield: 4.3,
      max_yield: 5.1,
      unit: 'টন /একর',
    },
    financials: {
      potential_extra_profit_bdt: 120000,
      formatted_extra_profit: '১,২০,০০০',
    },
    ai_recommendations: [
      {
        category: 'রোগ নিয়ন্ত্রণ',
        title: 'ছত্রাকনাশক প্রয়োগ',
        action: 'ধানের ব্লাস্ট রোগ প্রতিরোধে ট্রাইসাইক্লাজোল নির্ধারিত মাত্রায় বিকেল বেলা স্প্রে করুন।',
      },
      {
        category: 'সার প্রয়োগ',
        title: 'ইউরিয়া উপরি প্রয়োগ',
        action: 'জমি শুকানোর পর ইউরিয়া ও পটাশ সার দ্বিতীয় কিস্তিতে দিন।',
      },
      {
        category: 'সেচ ব্যবস্থাপনা',
        title: 'পানি নিয়ন্ত্রণ',
        action: 'জমিতে অতিরিক্ত পানি জমিয়ে না রেখে ২-৩ ইঞ্চি পানি ধরে রাখুন।',
      },
    ],
    daily_tasks: [
      { task: 'সেচ দেওয়া', recommended: true },
      { task: 'সার প্রয়োগ', recommended: false },
    ],
    alerts: [
      'আজ আপনার এলাকায় ভারী বৃষ্টির সম্ভাবনা রয়েছে, সেচ সাময়িক বন্ধ রাখুন।',
      'বর্তমান আবহাওয়ায় ধানে ব্লাস্ট রোগের ঝুঁকি বেড়েছে।',
    ],
  });

  // Call API for analysis
  const handleAnalyze = async () => {
    setCurrentStep(4);
    setLoading(true);

    // Simulate animated loading progress stages
    const stepMessages = [
      'মাটির পুষ্টি ও ইনপুট ব্যালেন্স যাচাই হচ্ছে...',
      'আঞ্চলিক আবহাওয়া ও জলবায়ু মডেল সমন্বয় হচ্ছে...',
      'সম্ভাব্য ফলন ও লাভ-ক্ষতি হিসাব হচ্ছে...',
      'AI কৃষি পরামর্শক রিপোর্ট তৈরি করছে...',
    ];

    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % stepMessages.length;
      setLoadingStepText(stepMessages[msgIndex]);
    }, 900);

    try {
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data: AdvisorResponse = await response.json();
        setResult(data);
      }
    } catch (err) {
      console.error('Advisor request error:', err);
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setLoading(false);
        setCurrentStep(5);
      }, 1800);
    }
  };

  const stepsList = [
    { num: 1, title: 'ফসলের তথ্য' },
    { num: 2, title: 'জমির তথ্য' },
    { num: 3, title: 'ইনপুট তথ্য' },
    { num: 4, title: 'বিশ্লেষণ' },
    { num: 5, title: 'ফলাফল' },
  ];

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          id="btn-advisor-back"
          onClick={onBackToHome}
          className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-stone-900">উৎপাদন বৃদ্ধি</h1>
        <div className="w-9"></div>
      </div>

      {/* 5-Step Stepper Bar (matching UI screen exactly) */}
      <div id="advisor-step-indicator" className="flex items-center justify-between mb-6 px-1">
        {stepsList.map((s, idx) => {
          const isDone = currentStep > s.num;
          const isCurrent = currentStep === s.num;
          return (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : 'bg-amber-400 text-stone-900'
                  }`}
                >
                  {toBengali(s.num)}
                </div>
                <span className="text-[10px] text-stone-700 font-medium mt-1 text-center whitespace-nowrap">
                  {s.title}
                </span>
              </div>
              {idx < stepsList.length - 1 && (
                <div className="flex-1 h-[2px] bg-stone-300 mx-1 mb-4"></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* STEP 1: ফসলের তথ্য */}
      {currentStep === 1 && (
        <motion.div
          key="step1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-stone-900">ফসল নির্বাচন করুন</h2>

            {/* Crop Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-700">ফসল নির্বাচন করুন</label>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  ১১টি ফসল সমর্থিত
                </span>
              </div>
              <select
                id="select-crop-type"
                value={formData.cropType}
                onChange={(e) => {
                  const newCrop = e.target.value;
                  const cropObj = CROP_VARIETIES_MAP[newCrop];
                  const firstVariety = cropObj?.varieties[0]?.id || 'বারি উন্নত জাত';
                  setFormData({
                    ...formData,
                    cropType: newCrop,
                    cropVariety: firstVariety,
                  });
                }}
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                {Object.entries(CROP_VARIETIES_MAP).map(([cropKey, info]) => (
                  <option key={cropKey} value={cropKey}>
                    {info.icon} {info.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Crop Variety */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-700">অনুমোদিত ও উচ্চফলনশীল জাত</label>
                <span className="text-[11px] font-medium text-stone-500">
                  {CROP_VARIETIES_MAP[formData.cropType]?.varieties.length || 0}টি জাত পাওয়া গেছে
                </span>
              </div>
              <select
                id="select-crop-variety"
                value={formData.cropVariety}
                onChange={(e) => setFormData({ ...formData, cropVariety: e.target.value })}
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                {(CROP_VARIETIES_MAP[formData.cropType]?.varieties || [
                  { id: 'বারি উন্নত জাত', name: 'বারি উন্নত জাত' },
                  { id: 'স্থানীয় দেশী জাত', name: 'স্থানীয় দেশী জাত' },
                  { id: 'হাইব্রিড জাত', name: 'উচ্চফলনশীল হাইব্রিড' },
                ]).map((variety) => (
                  <option key={variety.id} value={variety.id}>
                    {variety.name} {variety.tag ? `[${variety.tag}]` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-emerald-800 mt-1.5 flex items-center gap-1 font-medium bg-emerald-50/60 p-2 rounded-lg border border-emerald-200/50">
                <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>নির্বাচিত জাত: <strong>{formData.cropVariety}</strong> ({formData.cropType}) - রোগ সহনশীলতা ও স্থানীয় মাটির মান অনুযায়ী ফলন বিশ্লেষণ হবে।</span>
              </p>
            </div>
          </div>

          {/* Season Selection Cards */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-bold text-stone-900 mb-3 text-center">
              আপনি যে মৌসুমে চাষ করছেন
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'আমন',
                  name: 'আমন',
                  months: '( জুন - অক্টোবর )',
                  img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80',
                },
                {
                  id: 'আউশ',
                  name: 'আউশ',
                  months: '( এপ্রিল - জুলাই )',
                  img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&auto=format&fit=crop&q=80',
                },
                {
                  id: 'বোরো',
                  name: 'বোরো',
                  months: '( নভেম্বর - এপ্রিল )',
                  img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&auto=format&fit=crop&q=80',
                },
              ].map((s) => {
                const isSelected = formData.season === s.id;
                return (
                  <button
                    key={s.id}
                    id={`season-card-${s.id}`}
                    onClick={() => setFormData({ ...formData, season: s.id })}
                    className={`flex flex-col items-center p-2 rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-stone-200/60 border-stone-300 hover:bg-white'
                    }`}
                  >
                    <div className="w-14 h-12 rounded-lg overflow-hidden mb-1.5 bg-stone-300">
                      <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-bold text-stone-900">{s.name}</span>
                    <span className="text-[9px] text-stone-500 mt-0.5">{s.months}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next Button */}
          <button
            id="btn-step1-next"
            onClick={() => setCurrentStep(2)}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold flex items-center justify-center gap-2 shadow-sm border border-emerald-200 transition-colors"
          >
            <span>পরবর্তী</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* STEP 2: জমির তথ্য */}
      {currentStep === 2 && (
        <motion.div
          key="step2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          {/* Land Size & Unit */}
          <div>
            <label className="block text-xs font-bold text-stone-900 mb-1.5">জমির তথ্য দিন</label>
            <div className="flex items-center bg-emerald-50 border border-emerald-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex-1 p-3">
                <span className="block text-[10px] text-stone-500 font-semibold mb-1">জমির পরিমাণ</span>
                <input
                  id="input-land-size"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.landSize}
                  onChange={(e) => setFormData({ ...formData, landSize: Number(e.target.value) })}
                  className="w-full text-lg font-bold text-stone-900 bg-transparent focus:outline-none"
                />
              </div>
              <div className="w-[1px] h-12 bg-stone-400"></div>
              <div className="flex-1 p-3 flex items-center justify-between">
                <select
                  id="select-land-unit"
                  value={formData.landUnit}
                  onChange={(e) => setFormData({ ...formData, landUnit: e.target.value as any })}
                  className="w-full text-base font-bold text-stone-900 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="একর">একর</option>
                  <option value="বিঘা">বিঘা</option>
                  <option value="শতাংশ">শতাংশ</option>
                </select>
                <ArrowRight className="w-4 h-4 text-stone-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Soil Type */}
          <div>
            <label className="block text-xs font-bold text-stone-900 mb-1.5">মাটির ধরন</label>
            <select
              id="select-soil-type"
              value={formData.soilType}
              onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
              className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-3 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="দোআঁশ">দোআঁশ (Loam - আদর্শ)</option>
              <option value="বেলে-দোআঁশ">বেলে-দোআঁশ (Sandy Loam)</option>
              <option value="এঁটেল-দোআঁশ">এঁটেল-দোআঁশ (Clay Loam)</option>
              <option value="বেলে">বেলে (Sandy)</option>
              <option value="এঁটেল">এঁটেল (Clay)</option>
              <option value="পলি">পলি মাটি (Silt)</option>
            </select>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              id="btn-step2-prev"
              onClick={() => setCurrentStep(1)}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold flex items-center justify-center gap-2 border border-emerald-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>পেছনে</span>
            </button>
            <button
              id="btn-step2-next"
              onClick={() => setCurrentStep(3)}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold flex items-center justify-center gap-2 border border-emerald-200 transition-colors"
            >
              <span>পরবর্তী</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: ইনপুট তথ্য */}
      {currentStep === 3 && (
        <motion.div
          key="step3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <h2 className="text-xs font-bold text-stone-900">ইনপুট তথ্য দিন</h2>

          {/* Sowing Date */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">বপনের সময়</label>
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
              <input
                id="input-sowing-date"
                type="text"
                value={formData.sowingDate}
                onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                className="bg-transparent font-bold text-sm text-stone-900 focus:outline-none"
              />
              <Calendar className="w-5 h-5 text-stone-700" />
            </div>
          </div>

          {/* Seed Quantity */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              বীজের পরিমাণ (প্রতি একর)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="input-seed-quantity"
                type="number"
                min="1"
                value={formData.seedQuantity}
                onChange={(e) => setFormData({ ...formData, seedQuantity: Number(e.target.value) })}
                className="flex-1 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-base font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="w-24 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-sm font-bold text-stone-900 text-center">
                কেজি
              </div>
            </div>
          </div>

          {/* Irrigation Status */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">সেচের অবস্থা</label>
            <select
              id="select-irrigation-status"
              value={formData.irrigationStatus}
              onChange={(e) => setFormData({ ...formData, irrigationStatus: e.target.value })}
              className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="নিয়মিত সেচ হচ্ছে">নিয়মিত সেচ হচ্ছে (Optimal)</option>
              <option value="বৃষ্টির ওপর নির্ভরশীল">বৃষ্টির ওপর নির্ভরশীল (Rainfed)</option>
              <option value="সেচ সংকট / ঘাটতি">সেচ সংকট / ঘাটতি রয়েছে</option>
            </select>
          </div>

          {/* Crop Stage */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">বর্তমান অবস্থা</label>
            <select
              id="select-crop-stage"
              value={formData.cropStage}
              onChange={(e) => setFormData({ ...formData, cropStage: e.target.value })}
              className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="চারা রোপন হচ্ছে">চারা রোপন হচ্ছে</option>
              <option value="কুশি গজানোর পর্যায়">কুশি গজানোর পর্যায় (Tillering)</option>
              <option value="থোড় ও ফুল আসা">থোড় ও ফুল আসা পর্যায় (Panicle)</option>
              <option value="দানা পুষ্ট ও পরিপক্ব">দানা পুষ্ট ও পরিপক্ব পর্যায় (Ripening)</option>
            </select>
          </div>

          {/* Region */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-stone-700">এলাকা / জেলা (বাংলাদেশের ৬৪টি জেলা সমর্থিত)</label>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded">
                ৬৪ জেলা
              </span>
            </div>
            <div className="relative">
              <input
                id="input-farm-region"
                type="text"
                list="advisor-districts-list"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="জেলার নাম লিখুন বা তালিকা থেকে বাছুন (যেমন: বগুড়া, রংপুর, যশোর)..."
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
              <datalist id="advisor-districts-list">
                {BD_DISTRICTS.map((district) => (
                  <option key={district.id} value={`${district.nameBn} (${district.nameEn})`}>
                    {district.nameBn} জেলা
                  </option>
                ))}
              </datalist>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">
              * জেলা ও মাটির স্থানীয় আবহাওয়া অনুযায়ী কৃত্রিম বুদ্ধিমত্তা সুপারিশ প্রদান করবে।
            </p>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">অতিরিক্ত নোট ঐচ্ছিক</label>
            <textarea
              id="textarea-crop-notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="সার প্রয়োগ, কীটনাশক বা কোনো নির্দিষ্ট সমস্যার বিবরণ..."
              className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              id="btn-step3-prev"
              onClick={() => setCurrentStep(2)}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold flex items-center justify-center gap-2 border border-emerald-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>পেছনে</span>
            </button>
            <button
              id="btn-step3-submit"
              onClick={handleAnalyze}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>AI বিশ্লেষণ</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 4: বিশ্লেষণ চলছে (Loading State) */}
      {currentStep === 4 && (
        <motion.div
          key="step4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-6"
        >
          <h2 className="text-2xl font-black text-stone-900">AI বিশ্লেষণ চলছে</h2>

          {/* Circular Dots Rotating Spinner (matching screenshot 010033) */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="w-full h-full relative"
            >
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
                const radius = 50;
                const rad = (deg * Math.PI) / 180;
                const x = 64 + radius * Math.cos(rad);
                const y = 64 + radius * Math.sin(rad);
                const size = 6 + (i % 4) * 2;
                return (
                  <div
                    key={deg}
                    style={{
                      left: `${x - size / 2}px`,
                      top: `${y - size / 2}px`,
                      width: `${size}px`,
                      height: `${size}px`,
                    }}
                    className="absolute rounded-full bg-sky-500 shadow-sm"
                  />
                );
              })}
            </motion.div>
          </div>

          <div className="w-full max-w-xs space-y-3 pt-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-stone-100">
              <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
              <span className="text-xs font-semibold text-stone-700">{loadingStepText}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-stone-100">
              <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
              <span className="text-xs font-semibold text-stone-700">কৃষি কর্মকর্তাদের বৈজ্ঞানিক স্ট্যান্ডার্ড পর্যালোচনা</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 5: ফলাফল (Results matching Screenshot 010040 & JSON spec) */}
      {currentStep === 5 && result && (
        <motion.div
          key="step5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-stone-900">ফলাফল</h2>
            <button
              id="btn-re-analyze"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>পুনরায় পরীক্ষা</span>
            </button>
          </div>

          {/* Main Score & Gauge Card (Screenshot 010040) */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <span className="text-base font-bold text-stone-900 block mb-3">স্কোর</span>
                <div className="text-2xl font-black text-stone-900 tracking-tight">
                  {toBengali(result.score_analysis.score)}/
                  {toBengali(result.score_analysis.max_score)}
                </div>
                <div className="text-sm font-extrabold text-emerald-700 mt-1">
                  {result.score_analysis.status_text}
                </div>
                <p className="text-[11px] text-stone-600 mt-2">
                  ইনপুট সামঞ্জস্যতা ও মাটির পুষ্টি উপাদানের ভিত্তিতে নির্ধারিত মানদণ্ড।
                </p>
              </div>

              {/* Gauge */}
              <CreditScoreGauge
                score={result.score_analysis.score}
                maxScore={result.score_analysis.max_score}
                statusText={result.score_analysis.status_text}
                creditStatus={result.score_analysis.credit_status}
              />
            </div>
          </div>

          {/* Yield Predictions (Current vs Maximum) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Current Expected Yield */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 shadow-sm">
              <span className="text-xs font-bold text-stone-800 block mb-1">বর্তমান সম্ভাব্য ফলন</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-stone-900">
                  {toBengali(result.yield_prediction.current_yield)}
                </span>
                <span className="text-xs font-extrabold text-amber-700">
                  {result.yield_prediction.unit}
                </span>
              </div>
            </div>

            {/* Maximum Potential Yield */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 shadow-sm">
              <span className="text-xs font-bold text-stone-800 block mb-1">সর্বোচ্চ সম্ভাব্য ফলন</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-stone-900">
                  {toBengali(result.yield_prediction.max_yield)}
                </span>
                <span className="text-xs font-extrabold text-emerald-700">
                  {result.yield_prediction.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Potential Extra Profit Banner */}
          <div className="bg-emerald-100 border border-emerald-300 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-900 block">সম্ভাব্য অতিরিক্ত লাভ</span>
              <span className="text-[11px] text-stone-600">পরামর্শ অনুযায়ী ফলন বৃদ্ধি করলে</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-700">
                ৳ {result.financials.formatted_extra_profit}
              </span>
              <span className="block text-[10px] text-stone-500 font-semibold">BDT আনুমানিক</span>
            </div>
          </div>

          {/* Daily Tasks (আজকের কাজ) */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-stone-900 mb-2.5 flex items-center gap-1.5">
              <span>আজকের কাজ (Daily Tasks)</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {result.daily_tasks.map((task, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                    task.recommended
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {task.recommended ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  )}
                  <div className="text-xs font-bold">{task.task}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts (সতর্কবার্তা) */}
          {result.alerts && result.alerts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>জরুরি সতর্কতা (Alerts)</span>
              </h3>
              <div className="space-y-1.5">
                {result.alerts.map((alert, i) => (
                  <div key={i} className="text-xs font-medium text-amber-900 flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations (পদক্ষেপভিত্তিক পরামর্শ) */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>AI কৃষি পরামর্শ (Actionable Recommendations)</span>
            </h3>

            <div className="space-y-2.5">
              {result.ai_recommendations.map((rec, i) => (
                <div key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {rec.category}
                    </span>
                    <span className="text-xs font-bold text-stone-900">{rec.title}</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed pt-1">{rec.action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => alert('কৃষি পরামর্শ রিপোর্ট ডাউনলোড সম্পন্ন হয়েছে।')}
              className="flex-1 py-3 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-stone-300 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>রিপোর্ট ডাউনলোড</span>
            </button>
            <button
              onClick={() => onBackToHome()}
              className="flex-1 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-colors"
            >
              <span>হোমে ফিরে যান</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
