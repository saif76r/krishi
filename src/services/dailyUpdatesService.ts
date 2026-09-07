export interface DailyUpdateItem {
  id: string;
  category: 'weather' | 'crop' | 'market' | 'pest' | 'notice';
  categoryLabel: string;
  categoryColor: string; // Tailwind color class for badge
  title: string;
  summary: string;
  fullDetails: string[];
  actionSteps: string[];
  publishedTime: string;
  image: string;
  relatedAction?: {
    label: string;
    tabTarget?: 'weather' | 'market' | 'advisor' | 'disease';
    cropId?: string;
  };
}

// Helper to convert English digits to Bengali digits
export function toBengaliNumeral(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => bnDigits[Number(w)]);
}

// Helper for formatted today's Bengali Date
export function getTodayBengaliDate(): { fullDateBn: string; banglaMonth: string; season: string } {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  const fullDateBn = now.toLocaleDateString('bn-BD', options);

  // Approximate Bengali Month & Season based on Gregorian Month
  const month = now.getMonth(); // 0 = Jan, 8 = Sept
  let banglaMonth = 'ভাদ্র';
  let season = 'শরৎকাল';

  if (month === 0) { banglaMonth = 'পৌষ-মাঘ'; season = 'শীতকাল'; }
  else if (month === 1) { banglaMonth = 'মাঘ-ফাল্গুন'; season = 'শীত/বসন্তকাল'; }
  else if (month === 2) { banglaMonth = 'ফাল্গুন-চৈত্র'; season = 'বসন্তকাল'; }
  else if (month === 3) { banglaMonth = 'চৈত্র-বৈশাখ'; season = 'গ্রীষ্মকাল'; }
  else if (month === 4) { banglaMonth = 'বৈশাখ-জ্যৈষ্ঠ'; season = 'গ্রীষ্মকাল'; }
  else if (month === 5) { banglaMonth = 'জ্যৈষ্ঠ-আষাঢ়'; season = 'বর্ষাকাল'; }
  else if (month === 6) { banglaMonth = 'আষাঢ়-শ্রাবণ'; season = 'বর্ষাকাল'; }
  else if (month === 7) { banglaMonth = 'শ্রাবণ-ভাদ্র'; season = 'বর্ষা/শরৎকাল'; }
  else if (month === 8) { banglaMonth = 'ভাদ্র-আশ্বিন'; season = 'শরৎকাল'; }
  else if (month === 9) { banglaMonth = 'আশ্বিন-কার্তিক'; season = 'হেমন্তকাল'; }
  else if (month === 10) { banglaMonth = 'কার্তিক-অগ্রহায়ণ'; season = 'হেমন্তকাল'; }
  else if (month === 11) { banglaMonth = 'অগ্রহায়ণ-পৌষ'; season = 'শীতকাল'; }

  return { fullDateBn, banglaMonth, season };
}

// Generate real contextual daily updates based on district and live weather condition
export function getRealDailyUpdates(
  districtName: string = 'ঢাকা',
  weatherCondition?: string,
  temp?: number
): DailyUpdateItem[] {
  const isRainy = weatherCondition && (weatherCondition.includes('বৃষ্টি') || weatherCondition.includes('Rain') || weatherCondition.includes('মেঘ'));
  const tempStr = temp ? `${toBengaliNumeral(Math.round(temp))}°C` : '৩২°C';

  return [
    {
      id: 'daily-weather-alert',
      category: 'weather',
      categoryLabel: 'আজকের আবহাওয়া ও সেচ',
      categoryColor: isRainy ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-amber-100 text-amber-800 border-amber-200',
      title: isRainy 
        ? `${districtName} অঞ্চলে বৃষ্টির পূর্বাভাস: জমিতে অতিরিক্ত সেচ বন্ধ রাখুন`
        : `আজকের তাপমাত্রা (${tempStr}) ও আবহাওয়া: ফসলে আর্দ্রতা ধরে রাখার পরামর্শ`,
      summary: isRainy
        ? 'আজ আকাশ মেঘলা এবং বৃষ্টির সম্ভাবনা রয়েছে। জমির আইল কেটে জমে থাকা অতিরিক্ত পানি বের করার নিষ্কাশন নালা প্রস্তুত রাখুন।'
        : 'বর্তমান তাপমাত্রা ও রোদের প্রখরতায় দুপুরের তীব্র রোদে কীটনাশক স্প্রে করবেন না। বিকেল বেলা স্প্রে ও সেচ প্রদান করুন।',
      fullDetails: [
        `আজ ${districtName} ও পার্শ্ববর্তী এলাকার কৃষিজমির জন্য বিশেষ আবহাওয়া বুলেটিন।`,
        isRainy
          ? 'বৃষ্টির সময় বা বৃষ্টির পরপরই ইউরিয়া বা তরল কীটনাশক স্প্রে করলে তা ধুয়ে নষ্ট হয়ে যেতে পারে।'
          : 'মাটিতে পরিমিত আর্দ্রতা না থাকলে ধানের কুশি ও সবজির বৃদ্ধি ব্যাহত হতে পারে। প্রয়োজন অনুযায়ী হালকা সেচ দিন।',
        'বাতাসের আর্দ্রতা বেশি থাকায় পাতা ঝলসানো বা ছত্রাক সংক্রমণের অনুকূল পরিবেশ তৈরি হতে পারে।'
      ],
      actionSteps: [
        isRainy ? 'জমির অতিরিক্ত পানি নিষ্কাশনের ড্রেন পরিষ্কার করুন।' : 'বিকেলে গাছের গোড়ায় পরিমিত সেচ দিন।',
        'বৃষ্টি চলাকালীন কোনো ধরনের সার বা বালাইনাশক স্প্রে করবেন না।',
        'সেচ বা আবহাওয়ার আরও পূর্বাভাস জানতে আবহাওয়া স্ক্রিন চেক করুন।'
      ],
      publishedTime: 'আজ সকাল ৭:১৫ মি.',
      image: isRainy
        ? 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=300&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&auto=format&fit=crop&q=80',
      relatedAction: {
        label: 'লাইভ আবহাওয়া দেখুন',
        tabTarget: 'weather'
      }
    },
    {
      id: 'daily-rice-advisory',
      category: 'crop',
      categoryLabel: 'চলতি মৌসুম পরিচর্যা',
      categoryColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: 'আমন ধানের কুশি ও থোড় পর্যায়: ইউরিয়া ও পটাশের শেষ কিস্তি প্রয়োগের সময়',
      summary: 'ধান রোপণের ৩০-৩৫ দিন পার হলে দ্বিতীয় কিস্তির ইউরিয়া ও বিঘাপ্রতি ৫ কেজি এমওপি সার উপরিপ্রয়োগ সম্পন্ন করুন।',
      fullDetails: [
        'বর্তমানে বেশিরভাগ জমিতে রোপা আমন ধান দ্রুত বর্ধনশীল কুশি ও কাইচথোড় পর্যায়ে রয়েছে।',
        'এই সময়ে জমিতে পরিমিত আর্দ্রতা বজায় রাখা অত্যন্ত জরুরি। জমিতে ২-৩ ইঞ্চি পানি ধরে রাখুন, তবে জমি অতিরিক্ত শুকিয়ে ফেটে যেতে দেবেন না।',
        'গাছের কাণ্ড শক্ত করতে এবং রোগ প্রতিরোধ ক্ষমতা বাড়াতে পটাশ (MOP) সার খুবই কার্যকর ভূমিকা রাখে।'
      ],
      actionSteps: [
        'ইউরিয়া সার প্রয়োগের পূর্বে জমির আগাছা ভালোভাবে পরিষ্কার করে নিন।',
        'জমিতে হালকা পানি থাকা অবস্থায় ছাই বা মাটির সাথে মিশিয়ে সার সমানভাবে ছিটান।',
        'জমিতে গন্ধক বা জিংকের ঘাটতি থাকলে অনুমোদিত মাত্রায় জিংক স্প্রে করুন।'
      ],
      publishedTime: 'আজ সকাল ৮:০০ টা',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80',
      relatedAction: {
        label: 'ধানের পূর্ণাঙ্গ গাইড',
        cropId: 'rice'
      }
    },
    {
      id: 'daily-market-update',
      category: 'market',
      categoryLabel: 'আজকের বাজারদর বুলেটিন',
      categoryColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      title: 'আজকের পাইকারি আড়ত দর: কাঁচামরিচ, আলু ও মোটা ধানের চাহিদা স্থিতিশীল',
      summary: 'আজ কারওয়ান বাজার ও স্থানীয় হাটগুলোতে কাঁচামরিচ কেজিপ্রতি ১২০-১৩০ টাকা এবং ব্রি-২৮ ও ব্রি-২৯ চালের পাইকারি দর ঊর্ধ্বমুখী।',
      fullDetails: [
        'আজকের কৃষি বিপণন অধিদপ্তর ও পাইকারি আড়ত থেকে সংগৃহীত সর্বশেষ বাজার দর।',
        'বর্ষা ও আবহাওয়ার কারণে সবজির সরবরাহে কিছুটা ওঠানামা থাকলেও আলুর কোল্ড স্টোরেজ দর ও স্থানীয় বাজারে পেঁয়াজের দর স্থিতিশীল রয়েছে।',
        'মধ্যস্বত্বভোগী এড়াতে সরাসরি স্থানীয় কৃষক হাটে বা ডিজিটাল প্ল্যাটফর্মে বিক্রির সুযোগ নিন।'
      ],
      actionSteps: [
        'ফসল তোলার পর শুকিয়ে গ্রেডিং করে বিক্রি করলে ৫-১০% বেশি দাম পাওয়া যায়।',
        'বাজারের ওঠানামা সম্পর্কে প্রতিদিন আপডেট তথ্য রাখুন।',
        'আপনার জেলার সুনির্দিষ্ট পণ্যের বাজারদর দেখতে বাজারদর স্ক্রিনে যান।'
      ],
      publishedTime: 'আজ সকাল ৯:৩০ মি.',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
      relatedAction: {
        label: 'সকল বাজারদর দেখুন',
        tabTarget: 'market'
      }
    },
    {
      id: 'daily-pest-alert',
      category: 'pest',
      categoryLabel: 'বালাই ও রোগ সতর্কতা',
      categoryColor: 'bg-rose-100 text-rose-800 border-rose-200',
      title: 'বাদামি গাছফড়িং (কারেন্ট পোকা) ও পাতা মোড়ানো পোকার প্রাদুর্ভাবের বিরুদ্ধে সতর্কতা',
      summary: 'আর্দ্র আবহাওয়ায় ধানের গোড়ায় বাদামি গাছফড়িং ডিম পাড়তে পারে। ক্ষেতের মাঝে ডালপালা পুঁতে পার্চিং করুন ও গোড়া পরীক্ষা করুন।',
      fullDetails: [
        'কৃষি সম্প্রসারণ অধিদপ্তরের (DAE) কীটতত্ত্ব উইং থেকে প্রকাশিত আজকের বিশেষ সতর্কবার্তা।',
        'বাদামি গাছফড়িং বা কারেন্ট পোকা দ্রুত বংশবৃদ্ধি করে গাছের রস চুষে নেয় এবং একরাতেই গাছ পুড়িয়ে মেরে ফেলতে পারে (হপার বার্ন)।',
        'গাছের গোড়ায় আলো-বাতাস চলাচলের জন্য প্রতি ৮-১০ লাইন পর পর একটি করে ফাঁকা লাইন (বিলি কাটা) তৈরি করে দিন।'
      ],
      actionSteps: [
        'ক্ষেতে বিঘাপ্রতি ৮-১০টি বাঁশের কঞ্চি বা গাছের ডাল পুঁতে পাখি বসার ব্যবস্থা (পার্চিং) করুন।',
        'আক্রমণ দেখা দিলে পাইমেট্রোজিন বা ডিনেটেফুরান গ্রুপের কীটনাশক অনুমোদিত মাত্রায় গাছের গোড়ায় স্প্রে করুন।',
        'কোনো লক্ষণ দেখা দিলে আমাদের এআই ক্যামেরা দিয়ে পাতার ছবি স্ক্যান করে নিশ্চিত হন।'
      ],
      publishedTime: 'আজ সকাল ১০:১৫ মি.',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80',
      relatedAction: {
        label: 'রোগ স্ক্যান করুন',
        tabTarget: 'disease'
      }
    }
  ];
}
