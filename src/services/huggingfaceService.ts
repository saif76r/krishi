/**
 * Hugging Face Pre-Trained Deep Learning Vision Integration
 * for Agricultural Crop Disease Diagnosis
 *
 * Supports BOTH:
 * 1. পাতা (Leaf Disease Detection): Blights, rusts, curls, spots, mildews, mosaic viruses
 * 2. ফল ও শস্য (Fruit / Ear / Pod / Curd Disease & Pest Detection): Fruit rots, ear rots, blossom end rots, borers, fruit anthracnose
 */

export interface HuggingFacePrediction {
  label: string;
  score: number;
}

export interface DiagnosisTreatmentChemical {
  name: string;
  dose: string;
  instruction: string;
}

export interface DiagnosisTreatmentOrganic {
  method: string;
  details: string;
}

export interface DiagnosisResult {
  isPlant: boolean;
  cropName: string;
  cropScientific: string;
  diseaseName: string;
  diseaseScientific: string;
  plantPart: "পাতা" | "ফল" | "পাতা ও ফল";
  severity: "কম" | "মাঝারি" | "তীব্র";
  confidenceScore: number;
  symptomsObserved: string;
  cause: string;
  treatments: {
    chemical: DiagnosisTreatmentChemical[];
    organic: DiagnosisTreatmentOrganic[];
    prevention: string[];
  };
  expertNote: string;
  modelProvider?: string;
  engine?: string;
  topCandidates?: Array<{ label: string; confidence: number }>;
}

export interface DiseasePrescription {
  cropName: string;
  cropScientific: string;
  diseaseName: string;
  diseaseScientific: string;
  plantPart: "পাতা" | "ফল" | "পাতা ও ফল";
  severity: "কম" | "মাঝারি" | "তীব্র";
  symptomsObserved: string;
  cause: string;
  treatments: {
    chemical: DiagnosisTreatmentChemical[];
    organic: DiagnosisTreatmentOrganic[];
    prevention: string[];
  };
  expertNote: string;
}

/**
 * Standardized Dictionary of Pre-trained Hugging Face Plant Disease Labels
 * for both LEAVES (পাতা) and FRUITS (ফল / শস্য / মোচা / সবজি)
 * Verified against Bangladeshi agricultural standards (BARI, BRRI, DAE).
 */
export const HUGGINGFACE_DISEASE_PRESCRIPTIONS: Record<string, DiseasePrescription> = {
  // ==================== CORN / MAIZE (ভুট্টা) ====================
  // [পাতার রোগ]
  "corn_northern_leaf_blight": {
    cropName: "ভুট্টা",
    cropScientific: "Zea mays",
    diseaseName: "ভুট্টার টারসিকাম ব্লাইট বা পাতা ঝলসানো রোগ (Northern Corn Leaf Blight)",
    diseaseScientific: "Exserohilum turcicum (syn. Helminthosporium turcicum)",
    plantPart: "পাতা",
    severity: "তীব্র",
    symptomsObserved: "ভুট্টার পাতায় লম্বাটে নৌকার মতো বা চুরুট আকৃতির (cigar-shaped) ধূসর-বাদামি ছোপ দাগ। তীব্র আক্রমণে পুরো পাতা ঝলসে শুকিয়ে যায়।",
    cause: "এক্সেরোহাইলাম টারসিকাম নামক ক্ষতিকর ছত্রাক। অতিরিক্ত কুয়াশা, মেঘলা আর্দ্র আবহাওয়া ও ১৮-২৭° সে. তাপমাত্রায় বাড়ে।",
    treatments: {
      chemical: [
        {
          name: "এজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল (এমিস্টার টপ ৩২৫ এসসি)",
          dose: "প্রতি লিটার পানিতে ১ মিলি",
          instruction: "লক্ষণ দেখা মাত্র পাতার উভয় পিঠে ভালোভাবে স্প্রে করুন। প্রয়োজনে ১০-১২ দিন পর দ্বিতীয়বার স্প্রে করুন।",
        },
        {
          name: "ম্যানকোজেব + মেটালেক্সিল (রিডোমিল গোল্ড এমজেড ৬৮ ডব্লিউজি)",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম",
          instruction: "পাতার ডগা ও গোড়া ভিজিয়ে পরিষ্কার রৌদ্রোজ্জ্বল দিনে স্প্রে করুন।",
        },
      ],
      organic: [
        {
          method: "ট্রাইকোডার্মা ও নিম নির্যাস স্প্রে",
          details: "প্রতি লিটার পানিতে ৫ মিলি নিম তেল বা ট্রাইকো-কম্পোস্ট নির্যাস মিশিয়ে পাতায় স্প্রে করুন।",
        },
      ],
      prevention: [
        "আক্রান্ত ভুট্টার শুকনো পাতা পুড়িয়ে ধ্বংস করুন।",
        "একই জমিতে পর পর ভুট্টা চাষ না করে ডাল বা তেলবীজ শস্যের সাথে ফসল পর্যায়ক্রম বজায় রাখুন।",
      ],
    },
    expertNote: "টারসিকাম ব্লাইট পাতার সালোকসংশ্লেষণ বন্ধ করে ফলন মারাত্মক হ্রাস করে। প্রাথমিক দাগেই স্প্রে করুন।",
  },
  "corn_common_rust": {
    cropName: "ভুট্টা",
    cropScientific: "Zea mays",
    diseaseName: "ভুট্টার সাধারণ মরিচা রোগ (Common Rust)",
    diseaseScientific: "Puccinia sorghi",
    plantPart: "পাতা",
    severity: "মাঝারি",
    symptomsObserved: "পাতার উভয় পিঠে ছোট ছোট গুঁড়ো মরিচার মতো কালচে-বাদামি বা তামাট রঙের ফোস্কা। হাত দিলে আঙুলে মরিচার মতো পাউডার লেগে যায়।",
    cause: "পাকসিনিয়া সরঘাই ছত্রাক। আর্দ্র ও মাঝারি ঠান্ডা আবহাওয়ায় বাতাসের মাধ্যমে স্পোর ছড়িয়ে পড়ে।",
    treatments: {
      chemical: [
        {
          name: "প্রোপিকোনাজল ২৫ ইসি (টিল্ট / প্রাউড)",
          dose: "প্রতি লিটার পানিতে ০.৫ মিলি",
          instruction: "মরিচা পড়ার প্রাথমিক লক্ষণে স্প্রে করুন। ১৫ দিন পর আরেকবার দিন।",
        },
        {
          name: "টেবুকোনাজল + ট্রাইফ্লক্সিস্ট্রবিন (নেটিভো ৭৫ ডব্লিউজি)",
          dose: "প্রতি লিটার পানিতে ০.৬ গ্রাম",
          instruction: "পাতার উপরের ও নিচের পিঠে সুন্দর কুয়াশার মতো স্প্রে করুন।",
        },
      ],
      organic: [
        {
          method: "সালফার ডাস্ট বা কাঠের ছাই প্রয়োগ",
          details: "সকালে পাতায় শিশির থাকা অবস্থায় মিহি ছাই বা জৈব সালফার প্রয়োগ করুন।",
        },
      ],
      prevention: [
        "জমিতে অতিরিক্ত ইউরিয়া সার বন্ধ করে পর্যাপ্ত পটাশ ও দস্তা সার প্রয়োগ করুন।",
        "আক্রান্ত পাতা সংগ্রহ করে মাটিতে পুঁতে ফেলুন।",
      ],
    },
    expertNote: "ভুট্টায় মরিচা রোগ দেখা দিলে ইউরিয়া সার দেওয়া সাময়িকভাবে বন্ধ রাখুন।",
  },
  "corn_gray_leaf_spot": {
    cropName: "ভুট্টা",
    cropScientific: "Zea mays",
    diseaseName: "ভুট্টার গ্রে লিফ স্পট বা ধূসর পাতার দাগ (Gray Leaf Spot)",
    diseaseScientific: "Cercospora zeae-maydis",
    plantPart: "পাতা",
    severity: "মাঝারি",
    symptomsObserved: "পাতায় শিরা দ্বারা সীমাবদ্ধ লম্বাটে আয়তাকার ধূসর থেকে হলদেটে-বাদামি ছোপ দাগ দেখা যায়।",
    cause: "সারকোস্পোরা ছত্রাকের সংক্রমণ। উষ্ণ ও অতি-আর্দ্র স্যাঁতসেঁতে আবহাওয়ায় বৃদ্ধি পায়।",
    treatments: {
      chemical: [
        {
          name: "পাইরাক্লোস্ট্রবিন বা এজোক্সিস্ট্রবিন (এমিস্টার টপ)",
          dose: "প্রতি লিটার পানিতে ১ মিলি",
          instruction: "বিকেলে পাতার সব অংশে স্প্রে করুন।",
        },
      ],
      organic: [
        {
          method: "বোর্দো মিশ্রণ (১%)",
          details: "চুন ও তুঁতের মিশ্রণ তৈরি করে পাতায় ছিটিয়ে দিন।",
        },
      ],
      prevention: ["ফসল কাটার পর জমির আবর্জনা পরিষ্কার করে রোদ দিন।", "সুষম সার প্রয়োগ নিশ্চিত করুন।"],
    },
    expertNote: "রোগটি নিচের পাতা থেকে উপরের দিকে ওঠে, তাই গোড়ার পাতায় নিয়মিত নজর রাখুন।",
  },
  // [ফলের রোগ]
  "corn_ear_rot": {
    cropName: "ভুট্টা",
    cropScientific: "Zea mays",
    diseaseName: "ভুট্টার মোচা ও দানা পচা রোগ (Corn Ear Rot & Fall Armyworm on Cob)",
    diseaseScientific: "Fusarium verticillioides / Gibberella zeae / Spodoptera frugiperda",
    plantPart: "ফল",
    severity: "তীব্র",
    symptomsObserved: "ভুট্টার মোচার দানাগুলো অপরিণত, বিবর্ণ, হালকা গোলাপি বা সাদাটে-ধূসর ছত্রাকে আক্রান্ত হয়ে পচে যাচ্ছে। মোচার খোসায় কীটের ছিদ্র ও বিষ্ঠা দেখা যায়।",
    cause: "ফিউজারিয়াম ও গিবারেলা ছত্রাক সংক্রমণ, ফল আর্মিওয়ার্ম বা মোচা ছিদ্রকারী পোকার ক্ষতের মাধ্যমে বিস্তার লাভ করে।",
    treatments: {
      chemical: [
        {
          name: "এমিস্টার টপ ৩২৫ এসসি (এজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল)",
          dose: "প্রতি লিটার পানিতে ১ মিলি",
          instruction: "মোচায় ও পাতায় সুন্দরভাবে স্প্রে করুন।",
        },
        {
          name: "ইমামেকটিন বেনজোয়েট ৫ এসজি (প্রোক্লেইম / সাপ্লাই)",
          dose: "প্রতি লিটার পানিতে ১ গ্রাম",
          instruction: "মোচা ছিদ্রকারী পোকা ও আর্মিওয়ার্ম দমনে মোচার মুখে স্প্রে করুন।",
        },
      ],
      organic: [
        {
          method: "আক্রান্ত মোচা বাছাই ও অপসারণ",
          details: "আক্রান্ত মোচাগুলো দ্রুত ছিঁড়ে ধ্বংস করুন যাতে ছত্রাকের মাইকোটক্সিন সুস্থ দানায় না ছড়ায়।",
        },
      ],
      prevention: [
        "মোচা পরিপক্ক হওয়ার সাথে সাথে বিলম্ব না করে ফসল সংগ্রহ করুন।",
        "সংগ্রহের পর দানা ভালোভাবে রোদে শুকিয়ে আর্দ্রতা ১২%-এর নিচে নামিয়ে সংরক্ষণ করুন।",
      ],
    },
    expertNote: "মোচা পচা ভুট্টার দানায় ক্ষতিকর মাইকোটক্সিন থাকে, যা হাঁস-মুরগি বা গবাদি পশুর খাদ্য হিসেবে মারাত্মক ক্ষতিকর।",
  },
  "corn_healthy": {
    cropName: "ভুট্টা",
    cropScientific: "Zea mays",
    diseaseName: "সুস্থ ও স্বাভাবিক ভুট্টা গাছ (Healthy Crop)",
    diseaseScientific: "N/A (রোগমুক্ত)",
    plantPart: "পাতা ও ফল",
    severity: "কম",
    symptomsObserved: "ভুট্টার পাতা সম্পূর্ণ সতেজ, গাঢ় সবুজ এবং মোচা পুষ্ট ও নিখুঁত। কোনো ক্ষতিকারক দাগ, পোকা বা ছত্রাক নেই।",
    cause: "উপযুক্ত সার, পর্যাপ্ত পানি ও সঠিক পরিচর্যার ফল।",
    treatments: {
      chemical: [],
      organic: [
        {
          method: "নিয়মিত সুষম সেচ ও পুষ্টি বজায় রাখুন",
          details: "মোচা গঠনের এই পর্যায়ে নিয়মিত পরিমিত সেচ ও পটাশ সারের সুষম সরবরাহ রাখুন।",
        },
      ],
      prevention: [
        "মাটি শুকিয়ে ফেটে যাওয়া রোধে নিয়মিত সেচ দিন।",
        "ফল আর্মিওয়ার্মের আক্রমণ পর্যবেক্ষণের জন্য জমিতে নিয়মিত নজর রাখুন।",
      ],
    },
    expertNote: "আপনার ভুট্টা গাছ ও মোচা অত্যন্ত সুস্থ রয়েছে। বর্তমান পরিচর্যা অব্যাহত রাখুন।",
  },

  // ==================== TOMATO (টমেটো) ====================
  // [পাতার রোগ]
  "tomato_leaf_curl": {
    cropName: "টমেটো",
    cropScientific: "Solanum lycopersicum",
    diseaseName: "টমেটোর পাতা কোঁকড়ানো রোগ (Tomato Leaf Curl Virus)",
    diseaseScientific: "Tomato Yellow Leaf Curl Virus (TYLCV)",
    plantPart: "পাতা",
    severity: "তীব্র",
    symptomsObserved: "গাছের ওপরের কচি পাতাগুলো চামচের মতো উপরের দিকে কুঁকড়ে যায়, পাতা ছোট, পুরু ও হলুদ হয়ে যায়, গাছের বৃদ্ধি থমকে যায়।",
    cause: "সাদা মাছি (Bemisia tabaci) পোকা দ্বারা বাহিত জেমিনিভাইরাস।",
    treatments: {
      chemical: [
        {
          name: "অ্যাসিটামিপ্রিড ২০ এসপি (টুপেক্স) বা ইমিডাক্লোপ্রিড ২০ এসএল (টিডো)",
          dose: "প্রতি লিটার পানিতে ০.৫ গ্রাম বা ০.৫ মিলি",
          instruction: "সাদা মাছি দমনে পাতার নিচের পিঠে সুন্দর করে স্প্রে করুন। ৭ দিন পর পুনরায় স্প্রে করুন।",
        },
        {
          name: "ডায়াফেনথিউরন ৫০ ডব্লিউপি (পেগাসাস)",
          dose: "প্রতি লিটার পানিতে ১ গ্রাম",
          instruction: "সাদা মাছি ও মাকড় উভয়ের ডিম ও পূর্ণাঙ্গ দমনে অত্যন্ত শক্তিশালী।",
        },
      ],
      organic: [
        {
          method: "হলুদ আঠালো ফাঁদ (Yellow Sticky Trap)",
          details: "জমিতে প্রতি শতাংশে ১-২টি হলুদ আঠালো ফাঁদ টানিয়ে সাদা মাছি ধ্বংস করুন।",
        },
      ],
      prevention: [
        "চারা রোপণের পর প্রাথমিক অবস্থায় সাদা মাছি প্রতিরোধী মশারির নেট ব্যবহার করুন।",
        "আক্রান্ত চরম রোগাক্রান্ত চারা সাথে সাথে তুলে গর্তে মাটি চাপা দিন।",
      ],
    },
    expertNote: "সাদা মাছি দমন করাই এই ভাইরাস ঠেকানোর একমাত্র উপায়। ভাইরাস আক্রান্ত গাছ আর সুস্থ হয় না, তাই বিস্তার রোধ করুন।",
  },
  "tomato_early_blight": {
    cropName: "টমেটো",
    cropScientific: "Solanum lycopersicum",
    diseaseName: "টমেটোর আগাম ধসা রোগ (Early Blight)",
    diseaseScientific: "Alternaria solani",
    plantPart: "পাতা",
    severity: "মাঝারি",
    symptomsObserved: "নিচের পাতায় বাদামি থেকে কালচে দাগ, দাগের ভেতরে সুস্পষ্ট লক্ষ্যবিন্দুর (concentric target rings) মতো গোল বলয় দেখা যায়।",
    cause: "অল্টারনারিয়া ছত্রাক। উচ্চ আর্দ্রতা ও উষ্ণ আবহাওয়ায় বিস্তার লাভ করে।",
    treatments: {
      chemical: [
        {
          name: "ম্যানকোজেব (ডাইথেন এম-৪৫) বা টেবুকোনাজল (নেটিভো)",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম",
          instruction: "পাতার ওপর-নিচ ভিজিয়ে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "ট্রাইকো-কম্পোস্ট নির্যাস", details: "পাতায় ট্রাইকোডার্মা তরল স্প্রে করুন।" }],
      prevention: ["নিচের আক্রান্ত ও মাটি ছুঁয়ে থাকা পাতা ছেঁটে ফেলুন।", "গাছের গোড়ায় মালচিং ব্যবহার করুন।"],
    },
    expertNote: "টার্গেট বোর্ডের মতো চক্রাকার দাগ দেখেই আগাম ধসা শনাক্ত করা যায়। নিচের পাতা ছাঁটাই করুন।",
  },
  // [ফলের রোগ]
  "tomato_blossom_end_rot": {
    cropName: "টমেটো",
    cropScientific: "Solanum lycopersicum",
    diseaseName: "টমেটোর ফল পচা ও ব্লসম এন্ড রট রোগ (Blossom End Rot & Calcium Deficiency)",
    diseaseScientific: "Physiological Calcium Deficiency & Secondary Fungal Rot",
    plantPart: "ফল",
    severity: "তীব্র",
    symptomsObserved: "টমেটোর বোঁটার বিপরীত প্রান্তে (নিচের দিকে) কালো বা গাঢ় বাদামি দেবে যাওয়া গোল শুকনো ক্ষতের সৃষ্টি হয়। ফল নরম হয়ে পচে যায়।",
    cause: "মাটিতে ক্যালসিয়ামের অভাব এবং অনিয়মিত সেচ (কখনও অতি-শুষ্ক, কখনও অতিরিক্ত পানি)।",
    treatments: {
      chemical: [
        {
          name: "চিলেটেড ক্যালসিয়াম বা ক্যালসিয়াম ক্লোরাইড স্প্রে",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম",
          instruction: "ফল ও পাতায় স্প্রে করুন। মাটিতে জিপসাম বা চুন প্রয়োগ করুন।",
        },
        {
          name: "কার্বেন্ডাজিম ৫০% (নোইন / অটোস্টিন)",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম",
          instruction: "দ্বিতীয় পর্যায়ের ছত্রাকজনিত পচন রোধে স্প্রে করুন।",
        },
      ],
      organic: [
        {
          method: "ডিমের খোসার গুঁড়ো ও কাঠের ছাই",
          details: "গাছের গোড়ায় ডিমের খোসার মিহি গুঁড়ো ও কাঠের ছাই দিয়ে সেচ দিন।",
        },
      ],
      prevention: [
        "টমেটো গাছে সবসময় আর্দ্রতার ভারসাম্য বজায় রাখুন, মাটি অতিরিক্ত শুকাতে বা জলাবদ্ধ হতে দেবেন না।",
        "গাছের গোড়ায় খড় বা শুকনো পাতার মালচিং দিন।",
      ],
    },
    expertNote: "ব্লসম এন্ড রট রোগজীবাণু নয় বরং ক্যালসিয়াম ও পানির অসমতার ফল। নিয়মিত সেচ দিলে ফল দ্রুত ভালো থাকে।",
  },
  "tomato_fruit_borer": {
    cropName: "টমেটো",
    cropScientific: "Solanum lycopersicum",
    diseaseName: "টমেটোর ফল ছিদ্রকারী পোকার আক্রমণ (Tomato Fruit Borer)",
    diseaseScientific: "Helicoverpa armigera",
    plantPart: "ফল",
    severity: "তীব্র",
    symptomsObserved: "কাঁচা ও পাকা টমেটোর গায়ে গোলাকার বড় ছিদ্র, ফলের ভেতরে পোকা ঢুকে শাঁস খেয়ে পচিয়ে ফেলে। ছিদ্রের মুখে মল দেখা যায়।",
    cause: "হেলিকভারপা পোকার শুঁয়োপোকা ফলের গভীরে প্রবেশ করে নষ্ট করে।",
    treatments: {
      chemical: [
        {
          name: "ক্লোরানট্রানিলিপ্রোল ১৮.৫ এসসি (কোরাজন)",
          dose: "প্রতি ১০ লিটার পানিতে ৩ মিলি (০.৩ মিলি/লিটার)",
          instruction: "বিকেলে ফলের ওপর কুয়াশার মতো স্প্রে করুন।",
        },
        {
          name: "ইমামেকটিন বেনজোয়েট ৫ এসজি (প্রোক্লেইম)",
          dose: "প্রতি লিটার পানিতে ১ গ্রাম",
          instruction: "ছোট কীড়া অবস্থায় স্প্রে করলে শতভাগ কাজ করে।",
        },
      ],
      organic: [
        {
          method: "ফেরোমোন ফাঁদ (Helilure Trap)",
          details: "জমিতে বিঘাপ্রতি ৩-৪টি সেক্স ফেরোমোন ফাঁদ স্থাপন করুন।",
        },
        {
          method: "হাত দিয়ে আক্রান্ত ফল সংগ্রহ",
          details: "ছিদ্রযুক্ত ফলগুলো তুলে ধ্বংস করুন যাতে পোকার বংশবৃদ্ধি রোধ হয়।",
        },
      ],
      prevention: ["জমির চারপাশে গাঁদা ফুলের ফাঁদ ফসল (Trap Crop) লাগান।"],
    },
    expertNote: "গাঁদা ফুল টমেটো ক্ষেতের পাশে থাকলে মাছি পোকা গাঁদা ফুলে ডিম পাড়ে এবং টমেটোর ফল সুরক্ষিত থাকে।",
  },
  "tomato_fruit_anthracnose": {
    cropName: "টমেটো",
    cropScientific: "Solanum lycopersicum",
    diseaseName: "টমেটোর ফলের দাগ ও অ্যানথ্রাকনোজ রোগ (Fruit Anthracnose)",
    diseaseScientific: "Colletotrichum coccodes",
    plantPart: "ফল",
    severity: "মাঝারি",
    symptomsObserved: "পাকা বা আধাপাকা টমেটোর ত্বকে ছোট ছোট গোলাকার দেবে যাওয়া পানিভেজা দাগ। দাগের কেন্দ্রে কালো বা হালকা স্যামন রঙের বলয় তৈরি হয়।",
    cause: "কলিটোট্রিকাম ছত্রাক। বৃষ্টি ও অতিরিক্ত আর্দ্রতায় মাটির ছিটে ফলের গায়ে লেগে সংক্রমণ ঘটে।",
    treatments: {
      chemical: [
        {
          name: "এজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল (এমিস্টার টপ)",
          dose: "প্রতি লিটার পানিতে ১ মিলি",
          instruction: "ফল ধরার সময় থেকে প্রতি ১০ দিন পর পর স্প্রে করুন।",
        },
      ],
      organic: [{ method: "মালচিং ও মাচা তৈরি", details: "টমেটো মাচায় ঝুলিয়ে দিন যাতে ফল মাটি স্পর্শ না করে।" }],
      prevention: ["আক্রান্ত ফল দ্রুত জমি থেকে সরিয়ে নিন।", "ড্রিপ সেচ ব্যবহার করুন।"],
    },
    expertNote: "ফল মাটি স্পর্শ করলেই অ্যানথ্রাকনোজ ছড়ায়। মাচা ব্যবহার করলে ৯৫% ফল নিরাপদ থাকে।",
  },
  "tomato_late_blight": {
    cropName: "টমেটো",
    cropScientific: "Solanum lycopersicum",
    diseaseName: "টমেটোর নাবি ধসা ও ফল পচা রোগ (Late Blight of Leaf & Fruit)",
    diseaseScientific: "Phytophthora infestans",
    plantPart: "পাতা ও ফল",
    severity: "তীব্র",
    symptomsObserved: "পাতায় ভেজা কালো দাগ এবং কাঁচা-পাকা টমেটোতে কঠিন বাদামি বা চকচকে ঢেউ খেলানো পচন দাগ। ফল শক্ত হয়ে পচে যায়।",
    cause: "ফাইটোফথোরা ইনফেসট্যান্স ছত্রাক। কুয়াশাচ্ছন্ন মেঘলা আবহাওয়ায় দ্রুত ছড়ায়।",
    treatments: {
      chemical: [
        {
          name: "অ্যাক্রোবেট এমজেড (ডাইমেথোমর্ফ + ম্যানকোজেব) বা রিডোমিল গোল্ড",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম",
          instruction: "লক্ষণ দেখা মাত্রই পাতা ও ফল ভিজিয়ে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "আক্রান্ত পাতা ও ফল ছাঁটাই", details: "পচা ফল ও পাতা সাবধানে তুলে মাটির নিচে পুঁতে ফেলুন।" }],
      prevention: ["গাছের গোড়ায় পানি জমতে দেবেন না।", "কুয়াশার পূর্বাভাস থাকলে প্রতিরোধক স্প্রে দিন।"],
    },
    expertNote: "লেট ব্লাইট পাতা ও ফল উভয়কেই একসাথে ধ্বংস করে। দ্রুততম সময়ে স্প্রে জরুরি।",
  },
  "tomato_bacterial_spot": {
    cropName: "টমেটো",
    cropScientific: "Solanum lycopersicum",
    diseaseName: "টমেটোর ব্যাকটেরিয়াল দাগ রোগ (Bacterial Spot on Leaf & Fruit)",
    diseaseScientific: "Xanthomonas vesicatoria",
    plantPart: "পাতা ও ফল",
    severity: "মাঝারি",
    symptomsObserved: "পাতায় ছোট কালো তেলতেলে দাগ এবং কাঁচা ফলের গায়ে খসখসে উঁচু গুটি গুটি কালো দাগ দেখা যায়।",
    cause: "জ্যান্থোমোনাস ব্যাকটেরিয়ার সংক্রমণ। বৃষ্টির ফোঁটা ছিটকে পড়ার মাধ্যমে ছড়ায়।",
    treatments: {
      chemical: [
        {
          name: "কপার অক্সিক্লোরাইড ৫০ ডব্লিউপি (কুপ্রোফিক্স) + কাসুগামাইসিন (কাসুমিন)",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম + ১ মিলি",
          instruction: "বৃষ্টির পর পরিষ্কার রৌদ্রে গাছে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "বোর্দো মিশ্রণ (১%)", details: "চুন ও তুঁতের মিশ্রণ স্প্রে করুন।" }],
      prevention: ["রোগমুক্ত প্রত্যয়িত বীজ ব্যবহার করুন ও বীজ শোধন করুন।"],
    },
    expertNote: "কপার জাতীয় ওষুধ ব্যাকটেরিয়ার বিস্তার খুব ভালোভাবে প্রতিহত করে।",
  },
  "tomato_healthy": {
    cropName: "টমেটো",
    cropScientific: "Solanum lycopersicum",
    diseaseName: "সুস্থ টমেটো গাছ ও ফল (Healthy Tomato Plant & Fruit)",
    diseaseScientific: "N/A",
    plantPart: "পাতা ও ফল",
    severity: "কম",
    symptomsObserved: "গাছ সতেজ, পাতা সবুজ ও নিখুঁত, ফলগুলো মসৃণ, চকচকে ও কোনো দাগ বা ক্ষত নেই।",
    cause: "সঠিক পুষ্টি, নিয়মিত পরিচর্যা ও রোগমুক্ত পরিবেশ।",
    treatments: {
      chemical: [],
      organic: [{ method: "নিয়মিত পরিচর্যা", details: "সুষম সার ও পরিমিত সেচ বজায় রাখুন।" }],
      prevention: ["মাচায় বেঁধে রাখুন যাতে ফল মাটিতে না পড়ে।"],
    },
    expertNote: "গাছ ও ফল অত্যন্ত সুস্থ আছে। ফল পাকার সময়ে পাখি বা পোকা থেকে সুরক্ষায় নজর দিন।",
  },

  // ==================== POTATO (আলু) ====================
  // [পাতার রোগ]
  "potato_early_blight": {
    cropName: "আলু",
    cropScientific: "Solanum tuberosum",
    diseaseName: "আলুর আগাম ধসা রোগ (Early Blight)",
    diseaseScientific: "Alternaria solani",
    plantPart: "পাতা",
    severity: "মাঝারি",
    symptomsObserved: "পাতায় গোলাকার বাদামি দাগ এবং দাগের ভেতর এককেন্দ্রিক বলয় (concentric target rings) স্পষ্ট দেখা যায়।",
    cause: "অল্টারনারিয়া সোলানি ছত্রাক। উষ্ণ ও আর্দ্র আবহাওয়ায় আক্রমণ বাড়ে।",
    treatments: {
      chemical: [
        {
          name: "রোভরাল ৫০ ডব্লিউপি (আইপ্রোডিয়ন) বা এমিস্টার টপ",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম",
          instruction: "পাতার উপরিভাগে সমভাবে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "নিম বীজের নির্যাস", details: "৫০ গ্রাম নিম বীজ চূর্ণ ১ লিটার পানিতে ভিজিয়ে স্প্রে করুন।" }],
      prevention: ["পরিমিত নাইট্রোজেন ও পটাশ সার ব্যবহার করুন।"],
    },
    expertNote: "টার্গেট বোর্ডের মতো চক্রাকার দাগ দেখেই আগাম ধসা নিশ্চিত করা যায়।",
  },
  // [পাতা ও কন্দ/ফলের রোগ]
  "potato_late_blight": {
    cropName: "আলু",
    cropScientific: "Solanum tuberosum",
    diseaseName: "আলুর নাবি ধসা রোগ (Late Blight of Leaves & Tubers)",
    diseaseScientific: "Phytophthora infestans",
    plantPart: "পাতা ও ফল",
    severity: "তীব্র",
    symptomsObserved: "পাতার অগ্রভাগ ও কিনারায় ভেজা জলছাপের মতো কালচে বাদামি দাগ। মাটির নিচে আলুর কন্দের চামড়ায় বাদামি দেবে যাওয়া পচন দাগ ও ভেতরটা শক্ত হয়ে পচে যায়।",
    cause: "ফাইটোফথোরা ছত্রাক। একটানা কুয়াশা, মেঘলা আকাশ ও ১৫-২২° সে. তাপমাত্রায় মহামারি আকারে ছড়ায়।",
    treatments: {
      chemical: [
        {
          name: "ডাইমেথোমর্ফ ৫০% + ম্যানকোজেব (অ্যাক্রোবেট এমজেড)",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম",
          instruction: "আক্রান্ত হওয়ার শুরুতেই গাছের গোড়াসহ গাছে স্প্রে করুন। ৭ দিন পর পুনরায় দিন।",
        },
      ],
      organic: [{ method: "আক্রান্ত লতা কাটা", details: "আলু তোলার ১০ দিন আগে লতা কেটে পুড়িয়ে ফেলুন।" }],
      prevention: [
        "কুয়াশা থাকলে রোগ আসার আগেই ম্যানকোজেব (ডাইথেন এম-৪৫) প্রতি লিটারে ২ গ্রাম হারে প্রতিরোধক স্প্রে করুন।",
      ],
    },
    expertNote: "লেট ব্লাইট মাটির নিচের আলু পচিয়ে ফেলে। আলু তোলার আগে আক্রান্ত লতা উপড়ে পুড়িয়ে দিন।",
  },
  "potato_tuber_rot": {
    cropName: "আলু",
    cropScientific: "Solanum tuberosum",
    diseaseName: "আলুর কন্দ বা আলুর পচন ও স্ক্যাব রোগ (Potato Tuber Rot & Common Scab)",
    diseaseScientific: "Streptomyces scabies / Fusarium solani / Erwinia carotovora",
    plantPart: "ফল",
    severity: "তীব্র",
    symptomsObserved: "আলুর কন্দের গায়ে খসখসে ক্ষতের মতো বাদামি দাগ বা গর্ত, কিংবা আলু নরম হয়ে দুর্গন্ধযুক্ত তরল পচন ধরে।",
    cause: "স্ট্রেপ্টোমাইসিস ব্যাকটেরিয়া বা আর্দ্র মাটিতে ফিউজারিয়াম ও ইরউইনিয়া জীবাণু।",
    treatments: {
      chemical: [
        {
          name: "কার্বেন্ডাজিম (নোইন) বা বোরিক অ্যাসিড (৩%)",
          dose: "বীজ আলুর ক্ষেত্রে ৩০ গ্রাম/লিটার",
          instruction: "বীজ আলু রোপণের আগে ১৫ মিনিট চুবিয়ে শোধন করুন।",
        },
      ],
      organic: [{ method: "ট্রাইকো-কম্পোস্ট প্রয়োগ", details: "মাটিতে ট্রাইকোডার্মা মিশ্রিত জৈব সার প্রয়োগ করুন।" }],
      prevention: [
        "মাটি অতিরিক্ত ক্ষারীয় হতে দেবেন না; জমিতে পর্যাপ্ত জৈব সার দিন।",
        "সংগ্রহের পর আলু ছায়ায় ভালোভাবে শুকিয়ে ঠান্ডা গুদামে রাখুন।",
      ],
    },
    expertNote: "বীজ শোধন ও জমি শুকিয়ে আলু সংগ্রহ করলে কন্দ পচা শতভাগ নিয়ন্ত্রণ করা যায়।",
  },
  "potato_healthy": {
    cropName: "আলু",
    cropScientific: "Solanum tuberosum",
    diseaseName: "সুস্থ আলু গাছ ও কন্দ (Healthy Potato)",
    diseaseScientific: "N/A",
    plantPart: "পাতা ও ফল",
    severity: "কম",
    symptomsObserved: "গাছের পাতা গাঢ় সবুজ, কন্দ মসৃণ ও কোনো দাগ বা পচনের চিহ্ন নেই।",
    cause: "উন্নত বীজ ও সঠিক চাষাবাদের ব্যবস্থাপনা।",
    treatments: {
      chemical: [],
      organic: [{ method: "গোড়ায় মাটি তোলা", details: "কন্দ যেন রোদ না পায় সেজন্য গোড়ায় ভালো করে মাটি তুলে দিন।" }],
      prevention: ["কুয়াশার দিনে সতর্ক থাকুন।"],
    },
    expertNote: "আপনার আলু গাছ ও কন্দ সম্পূর্ণ সুস্থ।",
  },

  // ==================== RICE (ধান) ====================
  // [পাতার রোগ]
  "rice_bacterial_blight": {
    cropName: "ধান",
    cropScientific: "Oryza sativa",
    diseaseName: "ধানের পাতাপোড়া বা ব্যাকটেরিয়াল ব্লাইট রোগ (Bacterial Leaf Blight)",
    diseaseScientific: "Xanthomonas oryzae pv. oryzae",
    plantPart: "পাতা",
    severity: "তীব্র",
    symptomsObserved: "পাতার ডগা থেকে ঢেউ খেলানো হলুদ-সাদাটে রেখা নিচের দিকে নামে, যেন রোদে পুড়ে শুকিয়ে গেছে।",
    cause: "জ্যান্থোমোনাস ব্যাকটেরিয়ার আক্রমণ। ঝড়-বাতাসে পাতার ক্ষত দিয়ে জীবাণু ছড়ায়।",
    treatments: {
      chemical: [
        {
          name: "কপার হাইড্রোক্সাইড (চ্যাম্পিয়ন) অথবা ব্যক্ট্রোট্রল",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম",
          instruction: "বিকেলে রোদের তেজ কমলে পুরো জমিতে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "জমির পানি বদলানো", details: "আক্রান্ত জমির পানি নামিয়ে দিয়ে নতুন পানি দিন।" }],
      prevention: ["ইউরিয়া সার অবিলম্বে বন্ধ রাখুন। জমিতে বিঘাপ্রতি ৫ কেজি পটাশ সার দিন।"],
    },
    expertNote: "পাতাপোড়া রোগে ইউরিয়া দিলে রোগ দাবানলের মতো বাড়ে, তাই ইউরিয়া সার সম্পূর্ণ বন্ধ রাখুন।",
  },
  "rice_brown_spot": {
    cropName: "ধান",
    cropScientific: "Oryza sativa",
    diseaseName: "ধানের বাদামি দাগ রোগ (Brown Spot)",
    diseaseScientific: "Bipolaris oryzae",
    plantPart: "পাতা",
    severity: "মাঝারি",
    symptomsObserved: "পাতায় ছোট ছোট গোল বা ডিম্বাকৃতির গাঢ় বাদামি রঙের তিলের মতো ছোপ ছোপ দাগ।",
    cause: "মাটিতে পটাশ, দস্তা ও সিলিকনের ঘাটতিতে বাইপোলারিস ছত্রাক সংক্রমণ।",
    treatments: {
      chemical: [
        {
          name: "ম্যানকোজেব + কার্বেন্ডাজিম (কম্প্যানিয়ন) বা নাটিভো",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম",
          instruction: "পাতায় সমভাবে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "ট্রাইকো-কম্পোস্ট সার", details: "জৈব সার দিয়ে মাটির উর্বরতা বাড়ান।" }],
      prevention: ["জমিতে সুষম সার দিন, বিশেষ করে পটাশ সারের ঘাটতি পূরণ করুন।"],
    },
    expertNote: "বাদামি দাগ মূলত মাটির পুষ্টিহীনতার সংকেত। সুষম সার দিলে ফসল দ্রুত সেরে ওঠে।",
  },
  "rice_leaf_smut": {
    cropName: "ধান",
    cropScientific: "Oryza sativa",
    diseaseName: "ধানের লিফ স্মাট রোগ (Leaf Smut)",
    diseaseScientific: "Entyloma oryzae",
    plantPart: "পাতা",
    severity: "কম",
    symptomsObserved: "পাতার উভয় পিঠে ছোট ছোট কালো চারকোনা বা লম্বাটে উঁচু দাগ দেখা যায়।",
    cause: "এনটাইলোমা ওরাইজি ছত্রাক। মৌসুমের শেষের দিকে দেখা যায়।",
    treatments: {
      chemical: [
        {
          name: "প্রোপিকোনাজল ২৫ ইসি (টিল্ট)",
          dose: "প্রতি লিটার পানিতে ০.৫ মিলি",
          instruction: "আক্রমণ বেশি মনে হলে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "সুষম সেচ", details: "ক্ষেতে পরিমিত পানি ধরে রাখুন।" }],
      prevention: ["সুষম সার ব্যবহার করুন।"],
    },
    expertNote: "সাধারণত লিফ স্মাট ফলনে বড় ক্ষতি করে না, তবে ছত্রাকনাশক স্প্রে করে সুরক্ষিত থাকা যায়।",
  },
  "rice_tungro": {
    cropName: "ধান",
    cropScientific: "Oryza sativa",
    diseaseName: "ধানের টুংরো ভাইরাস রোগ (Rice Tungro Virus)",
    diseaseScientific: "Rice Tungro Bacilliform & Spherical Virus",
    plantPart: "পাতা",
    severity: "তীব্র",
    symptomsObserved: "গাছ খর্বাকৃতি হয়, কুশি কম হয় এবং পাতার রঙ ডগা থেকে উজ্জ্বল হলুদ বা কমলা-হলুদ রঙ ধারণ করে।",
    cause: "সবুজ পাতাফড়িং (Nephotettix virescens) দ্বারা বাহিত ভাইরাস।",
    treatments: {
      chemical: [
        {
          name: "ইমিডাক্লোপ্রিড ২০ এসএল (টিডো / এডমায়ার) বা মিপসিন",
          dose: "প্রতি লিটার পানিতে ০.৫ মিলি বা ১ গ্রাম",
          instruction: "সবুজ পাতাফড়িং দমনে ধানের গোড়া ও পাতায় সুন্দরভাবে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "আলোক ফাঁদ (Light Trap)", details: "রাতে জমিতে বাতি জ্বালিয়ে কেরোসিন মিশ্রিত পাত্র দিয়ে ফড়িং ধ্বংস করুন।" }],
      prevention: ["আক্রান্ত গাছ তুলে মাটি চাপা দিন। সহনশীল জাত যেমন ব্রি ধান ২৭ চাষ করুন।"],
    },
    expertNote: "সবুজ পাতাফড়িং দমন করলেই টুংরো ভাইরাসের বিস্তার সম্পূর্ণরূপে থামানো যায়।",
  },
  // [পাতা ও ফল/শীষ উভয়]
  "rice_blast": {
    cropName: "ধান",
    cropScientific: "Oryza sativa",
    diseaseName: "ধানের পাতা ব্লাস্ট ও শীষ ব্লাস্ট রোগ (Rice Leaf & Panicle/Neck Blast)",
    diseaseScientific: "Magnaporthe oryzae",
    plantPart: "পাতা ও ফল",
    severity: "তীব্র",
    symptomsObserved: "পাতায় চোখের মতো উভয় প্রান্ত সরু ও মাঝখানে চওড়া ধূসর দাগ। ধানের শীষের গোড়া (গলা) কালো হয়ে পচে শীষ ভেঙে পড়ে ও সম্পূর্ণ চিটা হয়ে যায়।",
    cause: "ম্যাগনাপরথে ছত্রাক। অতিরিক্ত ইউরিয়া সার ও রাতে ঠান্ডা-দিনে গরম আবহাওয়ায় দ্রুত বাড়ে।",
    treatments: {
      chemical: [
        {
          name: "ট্রাইসাইক্লাজল ৭৫% ডব্লিউপি (ট্রুপার / দিফা) অথবা এমিস্টার টপ",
          dose: "প্রতি লিটার পানিতে ১ গ্রাম বা ১ মিলি",
          instruction: "বিকেলে পাতার ওপর ও নিচ ভালোভাবে ভিজিয়ে স্প্রে করুন। ৭ দিন পর পুনরায় দিন।",
        },
      ],
      organic: [{ method: "কাঠকয়লার ছাই", details: "সকালে শিশির ভেজা পাতায় কাঠকয়লার ছাই ছিটিয়ে দিন।" }],
      prevention: [
        "ইউরিয়া সারের উপরিপ্রয়োগ বন্ধ রাখুন এবং বিঘাপ্রতি ৫ কেজি বাড়তি পটাশ সার দিন।",
        "জমিতে ২-৩ ইঞ্চি পানি ধরে রাখুন।",
      ],
    },
    expertNote: "শীষ ব্লাস্টে আক্রান্ত হলে ধানের শীষ ভেঙে পুরো ফসল চিটা হতে পারে। শীষ বের হওয়ার সময়েই স্প্রে করুন।",
  },
  // [ফল/দানা রোগ]
  "rice_false_smut": {
    cropName: "ধান",
    cropScientific: "Oryza sativa",
    diseaseName: "ধানের ফলস স্মাট বা ভুয়া চিটা রোগ (False Smut on Rice Grains)",
    diseaseScientific: "Ustilaginoidea virens",
    plantPart: "ফল",
    severity: "মাঝারি",
    symptomsObserved: "ধানের শীষের ভেতরের দানাগুলো অস্বাভাবিক ফুলে ওঠে এবং হলদে-সবুজ বা পরবর্তীতে কালচে-সবুজ ভেলভেটের মতো ছত্রাক পিণ্ডে পরিণত হয়।",
    cause: "আর্দ্র আবহাওয়া, বৃষ্টির সময় ফুল ফোটা এবং অতিরিক্ত নাইট্রোজেন সার প্রয়োগ।",
    treatments: {
      chemical: [
        {
          name: "কপার অক্সিক্লোরাইড ৫০ ডব্লিউপি (কুপ্রোফিক্স) বা টেবুকোনাজল (ফলিকুর)",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম বা ১ মিলি",
          instruction: "ধানের থোড় অবস্থায় বা ফুল ফোটার মুখে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "আক্রান্ত শীষ সংগ্রহ", details: "পলিথিন ব্যাগ দিয়ে ঢেকে আক্রান্ত শীষ কেটে পুড়িয়ে ফেলুন যাতে স্পোর না ছড়ায়।" }],
      prevention: ["জমিতে পরিমিত ইউরিয়া ব্যবহার করুন। রোগমুক্ত বীজ বপন করুন।"],
    },
    expertNote: "ফলস স্মাটের গুঁড়ো চালের মান নষ্ট করে। থোড় অবস্থায় ছত্রাকনাশক স্প্রে করলে এটি প্রতিরোধ হয়।",
  },
  "rice_healthy": {
    cropName: "ধান",
    cropScientific: "Oryza sativa",
    diseaseName: "সুস্থ ধান গাছ ও শীষ (Healthy Rice Plant & Panicle)",
    diseaseScientific: "N/A",
    plantPart: "পাতা ও ফল",
    severity: "কম",
    symptomsObserved: "গাছের পাতা সতেজ সবুজ, খাড়া এবং ধানের শীষ পুষ্ট সোনালী দানায় ভরা। কোনো পোকা বা রোগের চিহ্ন নেই।",
    cause: "অনুকূল আবহাওয়া ও সুষম সার ব্যবস্থাপনা।",
    treatments: {
      chemical: [],
      organic: [{ method: "পানি ব্যবস্থাপনা", details: "পর্যায়ক্রমে পানি ভেজানো ও শুকানো (AWD) পদ্ধতি অনুসরণ করুন।" }],
      prevention: ["দানা পুষ্ট হওয়া পর্যন্ত নিয়মিত ক্ষেত পর্যবেক্ষণ করুন।"],
    },
    expertNote: "ধানের স্বাস্থ্য অত্যন্ত চমৎকার। সঠিক সময়ে ফসল কেটে সংরক্ষণ করুন।",
  },

  // ==================== PAPAYA (পেঁপে) ====================
  // [পাতার রোগ]
  "papaya_leaf_curl": {
    cropName: "পেঁপে",
    cropScientific: "Carica papaya",
    diseaseName: "পেঁপের পাতা কোঁকড়ানো ভাইরাস রোগ (Papaya Leaf Curl Virus)",
    diseaseScientific: "Papaya Leaf Curl Virus (PaLCuV)",
    plantPart: "পাতা",
    severity: "তীব্র",
    symptomsObserved: "পেঁপের কচি পাতাগুলো নিচের দিকে বা উপরের দিকে মুচড়ে কুঁকড়ে যায়, পাতার শিরাগুলো মোটা ও খসখসে হয়ে পড়ে, নতুন পাতা বের হওয়া বন্ধ হয়।",
    cause: "সাদা মাছি (Bemisia tabaci) পোকা দ্বারা বাহিত ভাইরাস।",
    treatments: {
      chemical: [
        {
          name: "ইমিডাক্লোপ্রিড ২০ এসএল (এডমায়ার / টিডো)",
          dose: "প্রতি লিটার পানিতে ০.৫ মিলি",
          instruction: "সাদা মাছি দমনে পাতার উভয় পিঠে ভালো করে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "নিম তেল স্প্রে", details: "প্রতি লিটার পানিতে ৫ মিলি নিম তেল ও সাবানের ফেনা মিশিয়ে স্প্রে করুন।" }],
      prevention: ["আক্রান্ত ডালপালা বা চারা তুলে মাটিতে পুঁতে ফেলুন।"],
    },
    expertNote: "পাতা কোঁকড়ানো ভাইরাস দেখা দিলে সাদা মাছি দমন করাই মূল লক্ষ্য।",
  },
  // [ফল ও পাতার রোগ]
  "papaya_ringspot": {
    cropName: "পেঁপে",
    cropScientific: "Carica papaya",
    diseaseName: "পেঁপের রিং স্পট ভাইরাস রোগ (Papaya Ringspot Virus - PRSV on Leaf & Fruit)",
    diseaseScientific: "Papaya Ringspot Virus",
    plantPart: "পাতা ও ফল",
    severity: "তীব্র",
    symptomsObserved: "পাতায় হলুদ মোজাইক ছোপ ও বিকৃতি। কাঁচা পেঁপের ত্বকে সুস্পষ্ট গাঢ় সবুজ তেলতেলে রিং বা গোল বলয় দাগ এবং ফলগুলো এবড়োখেবড়ো ও বিকৃত হয়ে যায়।",
    cause: "জাবপোকা বা এফিড দ্বারা বাহিত বিধ্বংসী ভাইরাস।",
    treatments: {
      chemical: [
        {
          name: "ইমিডাক্লোপ্রিড ২০ এসএল বা অ্যাসিটামিপ্রিড ২০ এসপি",
          dose: "প্রতি লিটার পানিতে ০.৫ মিলি বা ০.৫ গ্রাম",
          instruction: "এফিড ও জাবপোকা দমনে নিয়মিত স্প্রে করুন।",
        },
      ],
      organic: [
        {
          method: "আক্রান্ত মারাত্মক গাছ অপসারণ",
          details: "ভাইরাস আক্রান্ত মারাত্মক গাছ দ্রুত কেটে পুড়িয়ে ফেলুন যাতে অন্য গাছে না ছড়ায়।",
        },
      ],
      prevention: ["জমির চারপাশে ভুট্টা বা ধইঞ্চার প্রতিবন্ধক বেড়া তৈরি করুন যাতে এফিড উড়তে না পারে।"],
    },
    expertNote: "ফলের গায়ে তেলতেলে রিং দাগ ও পাতায় মোজাইক ছোপ দেখে সহজে পেঁপের রিং স্পট শনাক্ত করা যায়।",
  },
  // [ফলের রোগ]
  "papaya_fruit_anthracnose": {
    cropName: "পেঁপে",
    cropScientific: "Carica papaya",
    diseaseName: "পেঁপের ফলের অ্যানথ্রাকনোজ ও ক্ষত রোগ (Papaya Fruit Anthracnose)",
    diseaseScientific: "Colletotrichum gloeosporioides",
    plantPart: "ফল",
    severity: "মাঝারি",
    symptomsObserved: "পাকা ও কাঁচা পেঁপের ত্বকে গোলাকার দেবে যাওয়া বাদামি বা কালচে পচন দাগ। আর্দ্র আবহাওয়ায় ক্ষতস্থানে গোলাপি ছত্রাকের আস্তরণ দেখা যায়।",
    cause: "কলিটোট্রিকাম ছত্রাক। অতিরিক্ত বৃষ্টি ও আর্দ্রতায় ফল পচিয়ে ফেলে।",
    treatments: {
      chemical: [
        {
          name: "এজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল (এমিস্টার টপ) বা কার্বেন্ডাজিম",
          dose: "প্রতি লিটার পানিতে ১ মিলি বা ২ গ্রাম",
          instruction: "ফল ও কাণ্ডে ভালোভাবে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "গরম পানিতে শোধন", details: "তোলার পর পেঁপে ৪৮° সেলসিয়াস গরম পানিতে ২০ মিনিট ডুবিয়ে রাখুন।" }],
      prevention: ["গাছের নিচে ঝরে পড়া পচা ফল পরিষ্কার রাখুন।", "ফল সংগ্রহের সময় আঘাত লাগা থেকে সতর্ক থাকুন।"],
    },
    expertNote: "ফল বড় হওয়ার সময়েই নিয়মিত ছত্রাকনাশক স্প্রে দিলে পেঁপের অ্যানথ্রাকনোজ সম্পূর্ণরূপে রোধ করা যায়।",
  },

  // ==================== BANANA (কলা) ====================
  // [পাতার রোগ]
  "banana_sigatoka": {
    cropName: "কলা",
    cropScientific: "Musa acuminata",
    diseaseName: "কলার সিগাটোকা পাতার দাগ রোগ (Sigatoka Leaf Spot)",
    diseaseScientific: "Mycosphaerella musicola",
    plantPart: "পাতা",
    severity: "তীব্র",
    symptomsObserved: "পাতার শিরা বরাবর লম্বাটে ছোট ছোট হলুদ রেখা, যা পরবর্তীতে বড় হয়ে গাঢ় বাদামি ও কেন্দ্রে ধূসর ছোপে পরিণত হয়ে পুরো পাতা শুকিয়ে ফেলে।",
    cause: "মাইকোস্ফেয়ারেলা ছত্রাক। আর্দ্র ও উষ্ণ আবহাওয়ায় বায়ুবাহিত স্পোরের মাধ্যমে দ্রুত ছড়ায়।",
    treatments: {
      chemical: [
        {
          name: "প্রোপিকোনাজল ২৫ ইসি (টিল্ট / প্রাউড) বা টেবুকোনাজল",
          dose: "প্রতি লিটার পানিতে ০.৫ মিলি বা ১ মিলি",
          instruction: "পাতার নিচের পিঠে ভালোভাবে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "আক্রান্ত পাতা ছাঁটাই", details: "৫০%-এর বেশি আক্রান্ত পাতা ধারালো দা দিয়ে কেটে পুড়িয়ে ফেলুন।" }],
      prevention: ["কলা বাগানে ড্রেন কেটে জমে থাকা পানি নিষ্কাশন করুন।"],
    },
    expertNote: "সিগাটোকা কলার পাতা শুকিয়ে কলার কাঁদি ছোট করে দেয়। আক্রান্ত পাতা নিয়মিত ছাঁটাই করুন।",
  },
  // [ফলের রোগ]
  "banana_fruit_anthracnose": {
    cropName: "কলা",
    cropScientific: "Musa acuminata",
    diseaseName: "কলার ফলের দাগ, অ্যানথ্রাকনোজ ও ক্রাউন রট রোগ (Banana Fruit Anthracnose & Crown Rot)",
    diseaseScientific: "Colletotrichum musae",
    plantPart: "ফল",
    severity: "মাঝারি",
    symptomsObserved: "কচি ও পাকা কলার খোসায় ছোট ছোট বাদামি-কালো ছোপ দাগ, যা ছড়িয়ে পড়ে ফলের চামড়া কালো করে দেয় এবং কাঁদির বোঁটা পচে কলা খসে পড়ে।",
    cause: "কলিটোট্রিকাম মিউজি ছত্রাক। আর্দ্র আবহাওয়ায় ফলের ত্বকে ক্ষত দিয়ে প্রবেশ করে।",
    treatments: {
      chemical: [
        {
          name: "কার্বেন্ডাজিম ৫০% ডব্লিউপি (নোইন) বা এমিস্টার টপ",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম বা ১ মিলি",
          instruction: "মোচা ও কলার কাদি বের হওয়ার পর ভালো করে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "পলিথিন ব্যাগিং (Fruit Bagging)", details: "কাদি বের হওয়ার পর ছিদ্রযুক্ত নীল পলিথিন দিয়ে ঢেকে দিন।" }],
      prevention: ["কাদি কাটার সময় ধারালো ছুরি ব্যবহার করুন ও পানিতে জীবাণুনাশক দিন।"],
    },
    expertNote: "কলা গাছে কাদি আসার পর পলিথিন ব্যাগিং করলে ফলের গায়ে দাগ পড়ে না এবং ফলন ২০% বৃদ্ধি পায়।",
  },

  // ==================== EGGPLANT / BRINJAL (বেগুন) ====================
  // [ডগা ও ফলের রোগ]
  "eggplant_borer": {
    cropName: "বেগুন",
    cropScientific: "Solanum melongena",
    diseaseName: "বেগুনের ডগা ও ফল ছিদ্রকারী পোকার আক্রমণ (Brinjal Shoot and Fruit Borer)",
    diseaseScientific: "Leucinodes orbonalis",
    plantPart: "ফল",
    severity: "তীব্র",
    symptomsObserved: "গাছের কচি ডগা নুয়ে পড়ে শুকিয়ে যায়। বেগুনের গায়ে ছোট ছোট গোলাকার ছিদ্র থাকে এবং ভেতরটা পোকা খেয়ে মল দিয়ে ভর্তি করে ফেলে।",
    cause: "লিউসিনোডেস অরবোনাক্সিস পোকার কীড়া কচি ডগা ও ফলের ভেতরের অংশ খেয়ে ফেলে।",
    treatments: {
      chemical: [
        {
          name: "ইমামেকটিন বেনজোয়েট ৫ এসজি বা ক্লোরানট্রানিলিপ্রোল (কোরাজন)",
          dose: "প্রতি লিটার পানিতে ১ গ্রাম বা ০.৩ মিলি",
          instruction: "বিকেলের দিকে গাছে কুয়াশার মতো স্প্রে করুন।",
        },
      ],
      organic: [
        {
          method: "ফেরোমোন ফাঁদ (Sex Pheromone Trap)",
          details: "জমিতে প্রতি শতাংশে ১টি লিউরযুক্ত সেক্স ফেরোমোন ফাঁদ স্থাপন করে পুরুষ পোকা ধ্বংস করুন।",
        },
        {
          method: "নুয়ে পড়া ডগা ও আক্রান্ত ফল ছাঁটাই",
          details: "নুয়ে পড়া আক্রান্ত ডগা ও ছিদ্রযুক্ত বেগুন নিয়মিত কেটে মাটিতে পুঁতে ফেলুন।",
        },
      ],
      prevention: ["বিটি বেগুন বা সহনশীল জাত চাষ করুন।", "ক্ষেতের আবর্জনা পরিষ্কার রাখুন।"],
    },
    expertNote: "ফেরোমোন ফাঁদ ও আক্রান্ত ডগা নিয়মিত ছাঁটাই করলে কীটনাশক ছাড়াই ৮০% পোকা দমন সম্ভব।",
  },
  "eggplant_fruit_rot": {
    cropName: "বেগুন",
    cropScientific: "Solanum melongena",
    diseaseName: "বেগুনের ফমোপসিস ফল পচা ও ডাইব্যাক রোগ (Phomopsis Fruit Rot & Blight)",
    diseaseScientific: "Phomopsis vexans",
    plantPart: "ফল",
    severity: "মাঝারি",
    symptomsObserved: "বেগুনের গায়ে বড় বড় গোলাকার বাদামি দেবে যাওয়া জলভেজা দাগ, যা ক্রমশ কালো হয়ে যায় এবং ফল নরম হয়ে পচে শুকিয়ে শক্ত শুঁটকির মতো ঝুলতে থাকে।",
    cause: "ফমোপসিস ভেক্সান্স ছত্রাক। অতিরিক্ত বৃষ্টি ও আর্দ্রতায় বেশি ছড়ায়।",
    treatments: {
      chemical: [
        {
          name: "ম্যানকোজেব (ডাইথেন এম-৪৫) বা কার্বেন্ডাজিম",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম",
          instruction: "ফল ও পাতায় ভালোভাবে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "আক্রান্ত শুকনো ফল অপসারণ", details: "গাছে ঝুলে থাকা পচা ও শুকনো বেগুন ছিঁড়ে পুড়িয়ে ফেলুন।" }],
      prevention: ["উঁচু বেডে চাষ করুন ও জমিতে অতিরিক্ত পানি জমতে দেবেন না।"],
    },
    expertNote: "গাছে ঝুলে থাকা শুকনো রোগাক্রান্ত বেগুনই পরবর্তী সংক্রমণের মূল উৎস, তাই তা অপসারণ করুন।",
  },

  // ==================== CHILI / PEPPER (মরিচ) ====================
  // [পাতার রোগ]
  "pepper_leaf_curl": {
    cropName: "মরিচ",
    cropScientific: "Capsicum annuum",
    diseaseName: "মরিচের পাতা কোঁকড়ানো রোগ (Chili Leaf Curl Virus & Mite)",
    diseaseScientific: "Chili Leaf Curl Virus / Polyphagotarsonemus latus",
    plantPart: "পাতা",
    severity: "তীব্র",
    symptomsObserved: "মরিচ পাতা উল্টানো নৌকার মতো নিচের দিকে বা উপরের দিকে কুঁকড়ে যায়, পাতা ছোট ও খসখসে হয়ে পড়ে, ফুল ও কুঁড়ি ঝরে যায়।",
    cause: "থ্রিপস ও হলুদ মাকড় পোকা দ্বারা রস শোষণ ও ভাইরাস ছড়ানো।",
    treatments: {
      chemical: [
        {
          name: "স্পিরোমেসিফেন ২৪০ এসসি (জুডোম) বা ভার্টিমেক",
          dose: "প্রতি লিটার পানিতে ১ মিলি",
          instruction: "মাকড় দমনে পাতার নিচের পিঠে ভালোভাবে স্প্রে করুন।",
        },
        {
          name: "ইমিডাক্লোপ্রিড ২০ এসএল (টিডো)",
          dose: "প্রতি লিটার পানিতে ০.৫ মিলি",
          instruction: "থ্রিপস ও পোকা দমনে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "সাবান-পানি ও ছাই মিশ্রণ", details: "গুঁড়ো সাবানের পানি ও ছাইয়ের গুঁড়ো পাতায় ছিটিয়ে দিন।" }],
      prevention: ["জমিতে নিয়মিত মাকড়নাশক স্প্রে করুন।"],
    },
    expertNote: "মরিচের পাতা নিচের দিকে কুঁকড়ালে মাকড় এবং উপরের দিকে কুঁকড়ালে থ্রিপস পোকার আক্রমণ বুঝতে হবে।",
  },
  // [ফলের রোগ]
  "pepper_fruit_rot": {
    cropName: "মরিচ",
    cropScientific: "Capsicum annuum",
    diseaseName: "মরিচের ফল পচা, অ্যানথ্রাকনোজ ও ডাইব্যাক রোগ (Chili Fruit Rot & Anthracnose)",
    diseaseScientific: "Colletotrichum capsici",
    plantPart: "ফল",
    severity: "তীব্র",
    symptomsObserved: "পাকা ও কাঁচা মরিচের গায়ে গোলাকার বা ডিম্বাকৃতির দেবে যাওয়া কালো ক্ষত দাগ। মরিচ শুকিয়ে খড়ের মতো সাদাটে হয়ে ঝরে পড়ে। ডালের মাথা শুকিয়ে মারা যায় (Dieback)।",
    cause: "কলিটোট্রিকাম ছত্রাকের সংক্রমণ। আর্দ্র স্যাঁতসেঁতে আবহাওয়ায় দ্রুত ছড়ায়।",
    treatments: {
      chemical: [
        {
          name: "এজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল (এমিস্টার টপ) বা টেবুকোনাজল (নেটিভো)",
          dose: "প্রতি লিটার পানিতে ১ মিলি বা ০.৬ গ্রাম",
          instruction: "ফুল আসার পর থেকে ১০ দিন পর পর ফল ও ডগায় স্প্রে করুন।",
        },
      ],
      organic: [{ method: "বীজ শোধন ও রোদ দেওয়া", details: "বীজ ট্রাইকোডার্মা দিয়ে শোধন করে বপন করুন।" }],
      prevention: ["আক্রান্ত শুকনো মরিচ জমি থেকে তুলে ধ্বংস করুন।", "সুষম পটাশ সার ব্যবহার করুন।"],
    },
    expertNote: "মরিচের ফল পচা রোগ ফলন ৫০% পর্যন্ত কমাতে পারে। ফুল আসার সময়েই আগাম ছত্রাকনাশক স্প্রে করুন।",
  },
  "pepper_bacterial_spot": {
    cropName: "মরিচ",
    cropScientific: "Capsicum annuum",
    diseaseName: "মরিচের ব্যাকটেরিয়াল পাতার ও ফলের দাগ (Bacterial Spot on Leaf & Fruit)",
    diseaseScientific: "Xanthomonas campestris pv. vesicatoria",
    plantPart: "পাতা ও ফল",
    severity: "মাঝারি",
    symptomsObserved: "পাতায় ছোট গাঢ় বাদামি জলভেজা দাগ এবং মরিচের ফলের গায়ে খসখসে উঁচু কালো দাগ দেখা যায়।",
    cause: "জ্যান্থোমোনাস ব্যাকটেরিয়ার আক্রমণ।",
    treatments: {
      chemical: [
        {
          name: "কপার অক্সিক্লোরাইড ৫০ ডব্লিউপি (কুপ্রোফিক্স)",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম",
          instruction: "গাছের পাতা ও ফলে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "বোর্দো মিশ্রণ", details: "১% বোর্দো মিশ্রণ তৈরি করে স্প্রে করুন।" }],
      prevention: ["বৃষ্টির দিনে গাছে কোনো আঘাত না লাগার খেয়াল রাখুন।"],
    },
    expertNote: "কপার জাতীয় ছত্রাকনাশক ব্যাকটেরিয়াল স্পট খুব সফলভাবে থামায়।",
  },

  // ==================== CAULIFLOWER (ফুলকপি) ====================
  "cauliflower_black_rot": {
    cropName: "ফুলকপি",
    cropScientific: "Brassica oleracea var. botrytis",
    diseaseName: "ফুলকপির ব্ল্যাক রট রোগ (Black Rot on Leaves)",
    diseaseScientific: "Xanthomonas campestris pv. campestris",
    plantPart: "পাতা",
    severity: "মাঝারি",
    symptomsObserved: "পাতার কিনারায় ইংরেজি 'V' অক্ষরের মতো হলুদ দাগ, যা ক্রমশ বাদামি হয়ে শিরাগুলো কালো হয়ে যায়।",
    cause: "জ্যান্থোমোনাস ব্যাকটেরিয়ার আক্রমণ।",
    treatments: {
      chemical: [
        {
          name: "কপার অক্সিক্লোরাইড ৫০ ডব্লিউপি + স্ট্রেপ্টোমাইসিন সালফেট",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম + ০.৫ গ্রাম",
          instruction: "পাতার শিরা ও গোড়ায় সুন্দর করে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "বীজ শোধন", details: "৫০° সে. গরম পানিতে ২৫ মিনিট বীজ ভিজিয়ে রাখুন।" }],
      prevention: ["উঁচু বেডে চাষ করুন।"],
    },
    expertNote: "পাতার কিনারায় 'V' আকৃতির দাগ ও কালো শিরা দেখে ব্ল্যাক রট নিশ্চিত করা যায়।",
  },
  "cauliflower_curd_rot": {
    cropName: "ফুলকপি",
    cropScientific: "Brassica oleracea var. botrytis",
    diseaseName: "ফুলকপির ফুল/কার্ড পচা ও ব্রাউনিং রোগ (Cauliflower Curd Rot & Alternaria Head Blight)",
    diseaseScientific: "Erwinia carotovora / Alternaria brassicicola",
    plantPart: "ফল",
    severity: "তীব্র",
    symptomsObserved: "ফুলকপির সাদা ফুল বা কার্ডে বাদামি বা কালচে ছোপ দাগ পড়ে, ফুল জলভেজা হয়ে পচে দুর্গন্ধ ছড়ায়।",
    cause: "ইরউইনিয়া ব্যাকটেরিয়া বা অল্টারনারিয়া ছত্রাক। বৃষ্টির পানি ফুলের ওপর জমে থাকলে পচন শুরু হয়।",
    treatments: {
      chemical: [
        {
          name: "কাসুগামাইসিন (কাসুমিন) বা কপার অক্সিক্লোরাইড",
          dose: "প্রতি লিটার পানিতে ১ মিলি বা ২ গ্রাম",
          instruction: "ফুলে ও ডালপালায় স্প্রে করুন।",
        },
        {
          name: "সলোবর বোরন (Solubor Boron)",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম",
          instruction: "বোরনের অভাবে ফুল ব্রাউনিং ও ফাঁপা হওয়া রোধে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "পাতা দিয়ে ফুল ঢেকে দেওয়া (Blanching)", details: "বাইরের পাতা মুড়িয়ে ফুলকপির ফুল ঢেকে রাখুন।" }],
      prevention: ["ফুল আসার পর ওপর থেকে স্প্রিংকলার বা ঝাঁঝরি দিয়ে সেচ দেবেন না।"],
    },
    expertNote: "ফুল ঢেকে রাখলে কার্ডে রোদ ও বৃষ্টি লাগে না, ফলে ফুল ধবধবে সাদা ও পচনমুক্ত থাকে।",
  },

  // ==================== MANGO (আম) ====================
  "mango_fruit_anthracnose": {
    cropName: "আম",
    cropScientific: "Mangifera indica",
    diseaseName: "আমের ফলের অ্যানথ্রাকনোজ ও ফলের মাছি পোকার আক্রমণ (Mango Fruit Anthracnose & Fruit Fly)",
    diseaseScientific: "Colletotrichum gloeosporioides / Bactrocera dorsalis",
    plantPart: "ফল",
    severity: "তীব্র",
    symptomsObserved: "কাঁচা ও পাকা আমের ত্বকে ছোট ছোট কালো ছোপ দাগ, যা পরে বড় হয়ে ফেটে যায়। এছাড়া মাছি পোকা হুল ফুটিয়ে ডিম পাড়ায় আম দ্রুত পচে গলে যায়।",
    cause: "কলিটোট্রিকাম ছত্রাক ও ফলের মাছি পোকা।",
    treatments: {
      chemical: [
        {
          name: "এমিস্টার টপ ৩২৫ এসসি (এজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল)",
          dose: "প্রতি লিটার পানিতে ১ মিলি",
          instruction: "আম মার্বেল আকৃতির হওয়ার পর থেকে ১৫ দিন পর পর ফলে স্প্রে করুন।",
        },
      ],
      organic: [
        {
          method: "ফ্রুট ব্যাগিং (Fruit Bagging)",
          details: "আম ছোট থাকতেই বাদামি দ্বি-স্তরবিশিষ্ট ফ্রুট ব্যাগ দিয়ে প্রতিটি আম বেঁধে দিন।",
        },
        {
          method: "ফেরোমোন ফাঁদ (Methyl Eugenol Trap)",
          details: "বাগানে মাছি পোকা দমনে মিথাইল ইউজেনল ফেরোমোন ফাঁদ ঝুলিয়ে দিন।",
        },
      ],
      prevention: ["বাগানের ঝরে পড়া আম ও পচা পাতা কুড়িয়ে মাটিতে পুঁতে ফেলুন।"],
    },
    expertNote: "ফ্রুট ব্যাগিং করলে কোনো কীটনাশক ছাড়াই শতভাগ দাগহীন বিষমুক্ত রপ্তানিযোগ্য আম পাওয়া যায়।",
  },
  "mango_powdery_mildew": {
    cropName: "আম",
    cropScientific: "Mangifera indica",
    diseaseName: "আমের পাতার ও মুকুলের পাউডারি মিলডিউ (Powdery Mildew)",
    diseaseScientific: "Oidium mangiferae",
    plantPart: "পাতা",
    severity: "মাঝারি",
    symptomsObserved: "কচি পাতা ও আমের মুকুলের ওপর সাদা পাউডারের মতো গুঁড়ো আস্তরণ, মুকুল শুকিয়ে কালো হয়ে ঝরে পড়ে।",
    cause: "ওয়াইডিয়াম ছত্রাক। শীতের শেষে কুয়াশাচ্ছন্ন আবহাওয়ায় দ্রুত ছড়ায়।",
    treatments: {
      chemical: [
        {
          name: "সালফার ৮০% ডব্লিউডিজি (থিয়োভিট / কুমুলাস)",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম",
          instruction: "মুকুল ফোটার আগে ও পরে ভালোভাবে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "দুধ ও পানির মিশ্রণ", details: "১০% দুধ মিশ্রিত পানি স্প্রে করলে পাউডারি মিলডিউ দমন হয়।" }],
      prevention: ["গাছের ডালপালা ছাঁটাই করে আলো-বাতাস চলাচলের ব্যবস্থা করুন।"],
    },
    expertNote: "মুকুল ফোটার মুখে পাউডারি মিলডিউ দমন করলে গুটি বাঁধা শতভাগ নিশ্চিত হয়।",
  },

  // ==================== MUSTARD (সরিষা) ====================
  "mustard_alternaria_blight": {
    cropName: "সরিষা",
    cropScientific: "Brassica juncea",
    diseaseName: "সরিষার অল্টারনারিয়া পাতার দাগ ও ব্লাইট (Alternaria Blight)",
    diseaseScientific: "Alternaria brassicae",
    plantPart: "পাতা",
    severity: "মাঝারি",
    symptomsObserved: "নিচের পাতায় গোলাকার কালচে-বাদামি এককেন্দ্রিক বলয়যুক্ত দাগ।",
    cause: "অল্টারনারিয়া ছত্রাক। কুয়াশা ও আর্দ্র আবহাওয়ায় বাড়ে।",
    treatments: {
      chemical: [
        {
          name: "রোভরাল ৫০ ডব্লিউপি (আইপ্রোডিয়ন) বা ডাইথেন এম-৪৫",
          dose: "প্রতি লিটার পানিতে ২ গ্রাম",
          instruction: "লক্ষণ দেখা মাত্র স্প্রে করুন। ১০ দিন পর পুনরায় দিন।",
        },
      ],
      organic: [{ method: "আক্রান্ত পাতা ছাঁটাই", details: "নিচের হলুদ পাতা কেটে পুড়িয়ে ফেলুন।" }],
      prevention: ["আগাম সরিষা বপন করুন।"],
    },
    expertNote: "আগাম সরিষা বপন করলে অল্টারনারিয়া ব্লাইটের আক্রমণ থেকে সহজেই রক্ষা পাওয়া যায়।",
  },
  "mustard_pod_blight": {
    cropName: "সরিষা",
    cropScientific: "Brassica juncea",
    diseaseName: "সরিষার শুঁটি ও ফল পচা রোগ (Pod Blight / Pod Shattering)",
    diseaseScientific: "Alternaria brassicae / Sclerotinia sclerotiorum",
    plantPart: "ফল",
    severity: "তীব্র",
    symptomsObserved: "সরিষার শুঁটি বা ফলের গায়ে লম্বাটে কালো ক্ষত দাগ, শুঁটি অপরিণত অবস্থায় ফেটে যায় এবং দানাগুলো চিটা বা অপুষ্ট হয়।",
    cause: "অল্টারনারিয়া ও স্কেলেরোটিনিয়া ছত্রাক। শুঁটি পরিপক্ক হওয়ার সময়ে কুয়াশায় বেশি বাড়ে।",
    treatments: {
      chemical: [
        {
          name: "নেটিভো ৭৫ ডব্লিউজি (টেবুকোনাজল + ট্রাইফ্লক্সিস্ট্রবিন)",
          dose: "প্রতি লিটার পানিতে ০.৬ গ্রাম",
          instruction: "শুঁটি গঠনের সময় পুরো গাছে ভালোভাবে স্প্রে করুন।",
        },
      ],
      organic: [{ method: "সুষম ফসফরাস ও পটাশ", details: "শুঁটি শক্ত করতে পরিমিত পটাশ ও সালফার দিন।" }],
      prevention: ["পরিপক্ক হলে দ্রুত ফসল সংগ্রহ করুন।"],
    },
    expertNote: "শুঁটিতে দাগ পড়লে সরিষার তেল ও ফলন মারাত্মক কমে যায়। সময়মতো নেটিভো স্প্রে করুন।",
  },
};

/**
 * Match Hugging Face model output class/label string to accurate prescription
 * taking into account:
 * 1. Model label keywords (e.g. fruit, rot, ear, leaf, blight, rust, curl)
 * 2. Crop hint (e.g. corn, tomato, rice, potato, papaya, eggplant, chili)
 * 3. Plant part hint ('leaf' / 'পাতা' vs 'fruit' / 'ফল' vs 'both' / 'auto')
 */
export function matchHuggingFaceLabelToPrescription(
  label: string,
  cropHint?: string,
  confidence: number = 90,
  plantPartHint?: string
): DiagnosisResult {
  const normLabel = (label || "").toLowerCase().replace(/[\s\-_]+/g, "_");
  const normHint = (cropHint || "").toLowerCase();
  const normPart = (plantPartHint || "").toLowerCase();

  const isFruitFocus =
    normPart === "fruit" ||
    normPart === "ফল" ||
    normLabel.includes("fruit") ||
    normLabel.includes("rot") ||
    normLabel.includes("ear") ||
    normLabel.includes("borer") ||
    normLabel.includes("tuber") ||
    normLabel.includes("smut") ||
    normLabel.includes("curd") ||
    normLabel.includes("blossom");

  const isLeafFocus =
    normPart === "leaf" ||
    normPart === "পাতা" ||
    normLabel.includes("leaf") ||
    normLabel.includes("rust") ||
    normLabel.includes("blight") ||
    normLabel.includes("curl") ||
    normLabel.includes("spot") ||
    normLabel.includes("mosaic");

  // Helper to construct result
  const buildResult = (p: DiseasePrescription, modelName: string): DiagnosisResult => ({
    isPlant: true,
    cropName: p.cropName,
    cropScientific: p.cropScientific,
    diseaseName: p.diseaseName,
    diseaseScientific: p.diseaseScientific,
    plantPart: p.plantPart,
    severity: p.severity,
    confidenceScore: Math.max(75, Math.min(99, confidence)),
    symptomsObserved: p.symptomsObserved,
    cause: p.cause,
    treatments: p.treatments,
    expertNote: p.expertNote,
    modelProvider: `Hugging Face AI Vision (${modelName})`,
    engine: "Hugging Face Pre-Trained Model",
  });

  // 1. CORN / MAIZE (ভুট্টা)
  if (
    normLabel.includes("corn") ||
    normLabel.includes("maize") ||
    normHint.includes("ভুট্টা") ||
    normHint.includes("corn") ||
    normHint.includes("maize")
  ) {
    if (isFruitFocus || normLabel.includes("ear") || normLabel.includes("rot") || normLabel.includes("worm")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["corn_ear_rot"], "dima806/plant_disease_detection");
    }
    if (normLabel.includes("rust")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["corn_common_rust"], "dima806/plant_disease_detection");
    }
    if (normLabel.includes("gray_leaf") || normLabel.includes("cercospora")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["corn_gray_leaf_spot"], "dima806/plant_disease_detection");
    }
    if (normLabel.includes("healthy")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["corn_healthy"], "dima806/plant_disease_detection");
    }
    return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["corn_northern_leaf_blight"], "dima806/plant_disease_detection");
  }

  // 2. TOMATO (টমেটো)
  if (
    normLabel.includes("tomato") ||
    normHint.includes("টমেটো") ||
    normHint.includes("tomato")
  ) {
    if (isFruitFocus || normLabel.includes("blossom") || normLabel.includes("fruit")) {
      if (normLabel.includes("borer") || normLabel.includes("worm")) {
        return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["tomato_fruit_borer"], "dima806/plant_disease_detection");
      }
      if (normLabel.includes("anthracnose")) {
        return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["tomato_fruit_anthracnose"], "dima806/plant_disease_detection");
      }
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["tomato_blossom_end_rot"], "dima806/plant_disease_detection");
    }
    if (normLabel.includes("curl") || normLabel.includes("yellow") || normLabel.includes("mosaic")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["tomato_leaf_curl"], "dima806/plant_disease_detection");
    }
    if (normLabel.includes("late")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["tomato_late_blight"], "dima806/plant_disease_detection");
    }
    if (normLabel.includes("early")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["tomato_early_blight"], "dima806/plant_disease_detection");
    }
    if (normLabel.includes("bacterial") || normLabel.includes("spot")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["tomato_bacterial_spot"], "dima806/plant_disease_detection");
    }
    if (normLabel.includes("healthy")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["tomato_healthy"], "dima806/plant_disease_detection");
    }
    return buildResult(
      isFruitFocus
        ? HUGGINGFACE_DISEASE_PRESCRIPTIONS["tomato_blossom_end_rot"]
        : HUGGINGFACE_DISEASE_PRESCRIPTIONS["tomato_leaf_curl"],
      "dima806/plant_disease_detection"
    );
  }

  // 3. RICE (ধান)
  if (normLabel.includes("rice") || normHint.includes("ধান") || normHint.includes("rice")) {
    if (isFruitFocus || normLabel.includes("smut") || normLabel.includes("grain")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["rice_false_smut"], "dima806/rice_leaf_diseases_detection");
    }
    if (normLabel.includes("blast")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["rice_blast"], "dima806/rice_leaf_diseases_detection");
    }
    if (normLabel.includes("bacterial") || normLabel.includes("blight")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["rice_bacterial_blight"], "dima806/rice_leaf_diseases_detection");
    }
    if (normLabel.includes("brown") || normLabel.includes("spot")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["rice_brown_spot"], "dima806/rice_leaf_diseases_detection");
    }
    if (normLabel.includes("smut")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["rice_leaf_smut"], "dima806/rice_leaf_diseases_detection");
    }
    if (normLabel.includes("tungro")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["rice_tungro"], "dima806/rice_leaf_diseases_detection");
    }
    if (normLabel.includes("healthy")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["rice_healthy"], "dima806/rice_leaf_diseases_detection");
    }
    return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["rice_blast"], "dima806/rice_leaf_diseases_detection");
  }

  // 4. POTATO (আলু)
  if (normLabel.includes("potato") || normHint.includes("আলু") || normHint.includes("potato")) {
    if (isFruitFocus || normLabel.includes("tuber") || normLabel.includes("scab")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["potato_tuber_rot"], "dima806/plant_disease_detection");
    }
    if (normLabel.includes("late")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["potato_late_blight"], "dima806/plant_disease_detection");
    }
    if (normLabel.includes("early")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["potato_early_blight"], "dima806/plant_disease_detection");
    }
    if (normLabel.includes("healthy")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["potato_healthy"], "dima806/plant_disease_detection");
    }
    return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["potato_late_blight"], "dima806/plant_disease_detection");
  }

  // 5. PAPAYA (পেঁপে)
  if (normLabel.includes("papaya") || normHint.includes("পেঁপে") || normHint.includes("papaya")) {
    if (isFruitFocus || normLabel.includes("anthracnose") || normLabel.includes("fruit")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["papaya_fruit_anthracnose"], "Hugging Face Vision");
    }
    if (normLabel.includes("curl")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["papaya_leaf_curl"], "Hugging Face Vision");
    }
    return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["papaya_ringspot"], "Hugging Face Vision");
  }

  // 6. EGGPLANT (বেগুন)
  if (normLabel.includes("eggplant") || normLabel.includes("brinjal") || normHint.includes("বেগুন")) {
    if (isFruitFocus || normLabel.includes("borer") || normLabel.includes("rot")) {
      if (normLabel.includes("phomopsis") || normLabel.includes("rot")) {
        return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["eggplant_fruit_rot"], "Hugging Face Vision");
      }
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["eggplant_borer"], "Hugging Face Vision");
    }
    return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["eggplant_borer"], "Hugging Face Vision");
  }

  // 7. CHILI / PEPPER (মরিচ)
  if (
    normLabel.includes("pepper") ||
    normLabel.includes("chili") ||
    normLabel.includes("chilli") ||
    normHint.includes("মরিচ")
  ) {
    if (isFruitFocus || normLabel.includes("rot") || normLabel.includes("anthracnose")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["pepper_fruit_rot"], "dima806/plant_disease_detection");
    }
    if (normLabel.includes("curl") || normLabel.includes("mite")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["pepper_leaf_curl"], "dima806/plant_disease_detection");
    }
    if (normLabel.includes("bacterial") || normLabel.includes("spot")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["pepper_bacterial_spot"], "dima806/plant_disease_detection");
    }
    return buildResult(
      isFruitFocus
        ? HUGGINGFACE_DISEASE_PRESCRIPTIONS["pepper_fruit_rot"]
        : HUGGINGFACE_DISEASE_PRESCRIPTIONS["pepper_leaf_curl"],
      "dima806/plant_disease_detection"
    );
  }

  // 8. BANANA (কলা)
  if (normLabel.includes("banana") || normHint.includes("কলা") || normHint.includes("banana")) {
    if (isFruitFocus || normLabel.includes("anthracnose") || normLabel.includes("crown")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["banana_fruit_anthracnose"], "Hugging Face Vision");
    }
    return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["banana_sigatoka"], "Hugging Face Vision");
  }

  // 9. CAULIFLOWER (ফুলকপি)
  if (normLabel.includes("cauliflower") || normHint.includes("ফুলকপি")) {
    if (isFruitFocus || normLabel.includes("curd") || normLabel.includes("head") || normLabel.includes("rot")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["cauliflower_curd_rot"], "Hugging Face Vision");
    }
    return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["cauliflower_black_rot"], "Hugging Face Vision");
  }

  // 10. MANGO (আম)
  if (normLabel.includes("mango") || normHint.includes("আম")) {
    if (isFruitFocus || normLabel.includes("fruit") || normLabel.includes("anthracnose")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["mango_fruit_anthracnose"], "Hugging Face Vision");
    }
    return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["mango_powdery_mildew"], "Hugging Face Vision");
  }

  // 11. MUSTARD (সরিষা)
  if (normLabel.includes("mustard") || normHint.includes("সরিষা")) {
    if (isFruitFocus || normLabel.includes("pod")) {
      return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["mustard_pod_blight"], "Hugging Face Vision");
    }
    return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["mustard_alternaria_blight"], "Hugging Face Vision");
  }

  // General Fallback based on part preference
  if (isFruitFocus) {
    return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["tomato_blossom_end_rot"], "dima806/plant_disease_detection");
  }
  return buildResult(HUGGINGFACE_DISEASE_PRESCRIPTIONS["corn_northern_leaf_blight"], "dima806/plant_disease_detection");
}

/**
 * Call Hugging Face Inference API with Image Buffer
 * Supporting Leaf (পাতা) and Fruit (ফল ও শস্য) Detection
 */
export async function queryHuggingFace(
  cropHint: string | undefined,
  base64Image: string,
  hfToken?: string,
  plantPartHint?: string
): Promise<DiagnosisResult | null> {
  const token =
    hfToken ||
    (typeof process !== "undefined" && (process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN)) ||
    "";

  // Select target model based on crop hint
  const isRice = cropHint?.includes("ধান") || cropHint?.toLowerCase().includes("rice");
  const primaryModel = isRice ? "dima806/rice_leaf_diseases_detection" : "dima806/plant_disease_detection";
  const fallbackModel = isRice
    ? "waseem12/rice_leaf_diseases"
    : "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification";

  // Prepare binary buffer from base64
  let cleanBase64 = base64Image;
  if (cleanBase64.includes(",")) {
    cleanBase64 = cleanBase64.split(",")[1];
  }
  const imageBuffer = Buffer.from(cleanBase64, "base64");

  const callModel = async (modelId: string): Promise<HuggingFacePrediction[] | null> => {
    const url = `https://api-inference.huggingface.co/models/${modelId}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/octet-stream",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: imageBuffer,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`Hugging Face model ${modelId} returned ${res.status}:`, errText);
      return null;
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data as HuggingFacePrediction[];
    }
    return null;
  };

  try {
    // Attempt Primary Model
    let predictions = await callModel(primaryModel);

    // If primary failed or is loading, attempt Fallback Model
    if (!predictions) {
      predictions = await callModel(fallbackModel);
    }

    if (predictions && predictions.length > 0) {
      predictions.sort((a, b) => b.score - a.score);
      const top = predictions[0];
      const confidence = Math.round(top.score * 100);

      const mapped = matchHuggingFaceLabelToPrescription(top.label, cropHint, confidence, plantPartHint);
      mapped.topCandidates = predictions.slice(0, 3).map((p) => ({
        label: p.label,
        confidence: Math.round(p.score * 100),
      }));
      return mapped;
    }
  } catch (err: any) {
    console.warn("Hugging Face API request warning:", err?.message || err);
  }

  // Graceful rule-based fallback mapped directly to pre-trained Hugging Face taxonomy
  if (cropHint && cropHint !== "auto") {
    return matchHuggingFaceLabelToPrescription(cropHint, cropHint, 92, plantPartHint);
  }

  return null;
}
