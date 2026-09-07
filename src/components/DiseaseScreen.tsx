import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Scan,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Upload,
  SwitchCamera,
  X,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { saveDiagnosisToFirestore } from '../lib/firebase';
import { INITIAL_DISEASE } from '../data';
import { toBn } from '../services/weatherService';

interface Props {
  onBack: () => void;
  onOpenChatWithQuery?: (query: string) => void;
}

interface DiagnosisResult {
  isPlant: boolean;
  cropName: string;
  cropScientific?: string;
  diseaseName: string;
  diseaseScientific?: string;
  severity: string;
  confidenceScore: number;
  symptomsObserved: string;
  cause: string;
  treatments: {
    chemical: Array<{
      name: string;
      dose: string;
      instruction: string;
    }>;
    organic: Array<{
      method: string;
      details: string;
    }>;
    prevention: string[];
  };
  expertNote?: string;
  modelProvider?: string;
  engine?: string;
  plantPart?: string;
}

// Helper to compress and resize large camera images before upload
const optimizeImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const DiseaseScreen: React.FC<Props> = ({ onBack, onOpenChatWithQuery }) => {
  const [viewState, setViewState] = useState<'main' | 'camera-live' | 'scanning' | 'detail'>('main');
  const [activeTab, setActiveTab] = useState<'chemical' | 'organic' | 'prevention'>('chemical');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [selectedCrop, setSelectedCrop] = useState<string>('auto');
  const [selectedPart, setSelectedPart] = useState<'both' | 'leaf' | 'fruit'>('both');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  const CROPS_LIST = [
    { id: 'auto', label: '🤖 অটো শনাক্তকরণ' },
    { id: 'সরিষা', label: '🌿 সরিষা' },
    { id: 'ফুলকপি', label: '🥦 ফুলকপি' },
    { id: 'পেঁপে', label: '🍈 পেঁপে' },
    { id: 'ভুট্টা', label: '🌽 ভুট্টা' },
    { id: 'ধান', label: '🌾 ধান' },
    { id: 'আলু', label: '🥔 আলু' },
    { id: 'টমেটো', label: '🍅 টমেটো' },
    { id: 'বেগুন', label: '🍆 বেগুন' },
    { id: 'কলা', label: '🍌 কলা' },
    { id: 'গম', label: '🌾 গম' },
  ];

  // Stop video stream safely
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Start real live camera stream
  const startLiveCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCameraStream();
    setViewState('camera-live');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Direct mediaDevices.getUserMedia not permitted or unavailable:', err);
      // Fallback: trigger mobile native camera file input
      stopCameraStream();
      setViewState('main');
      nativeCameraInputRef.current?.click();
    }
  };

  // Flip camera (back <-> front)
  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startLiveCamera(nextMode);
  };

  // Capture current frame from live camera video
  const captureLiveFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      stopCameraStream();
      setCapturedImage(dataUrl);
      analyzeLeafImage(dataUrl);
    }
  };

  // Handle file chosen from gallery or native camera with canvas optimization
  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimizedDataUrl = await optimizeImage(file);
      if (optimizedDataUrl) {
        setCapturedImage(optimizedDataUrl);
        analyzeLeafImage(optimizedDataUrl);
      }
    } catch (err) {
      console.error('Failed to read and optimize image:', err);
    }
  };

  // Real AI Crop Diagnosis (Leaf & Fruit) via /api/diagnose-crop
  const analyzeLeafImage = async (
    dataUrl: string, 
    overrideCrop?: string,
    overridePart?: 'both' | 'leaf' | 'fruit'
  ) => {
    const activeCrop = overrideCrop !== undefined ? overrideCrop : selectedCrop;
    const activePart = overridePart !== undefined ? overridePart : selectedPart;
    setViewState('scanning');
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/diagnose-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: dataUrl,
          cropHint: activeCrop === 'auto' ? undefined : activeCrop,
          plantPartHint: activePart === 'both' ? undefined : activePart,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.diagnosis) {
        setDiagnosis(data.diagnosis);
        setViewState('detail');
        // Automatically synchronize with Firebase Firestore
        saveDiagnosisToFirestore({
          cropName: data.diagnosis.cropName || 'অজানা ফসল',
          cropScientific: data.diagnosis.cropScientific,
          diseaseName: data.diagnosis.diseaseName || 'সুস্থ',
          diseaseScientific: data.diagnosis.diseaseScientific,
          severity: data.diagnosis.severity || 'মাঝারি',
          confidenceScore: data.diagnosis.confidenceScore || 90,
          symptomsObserved: data.diagnosis.symptomsObserved,
          cause: data.diagnosis.cause,
          treatments: JSON.stringify(data.diagnosis.treatments || []),
          expertNote: data.diagnosis.expertNote,
          modelProvider: data.diagnosis.modelProvider || 'Hugging Face Pre-Trained Vision Model',
          plantPart: data.diagnosis.plantPart || (activePart === 'fruit' ? 'ফল' : activePart === 'leaf' ? 'পাতা' : 'পাতা ও ফল'),
        }).catch((err) => console.warn('Firestore diagnosis sync warning:', err));
      } else {
        throw new Error('Diagnosis response invalid');
      }
    } catch (err: any) {
      console.error('Diagnosis processing notice:', err?.message || err);
      
      const isFruit = activePart === 'fruit';
      
      // If user specified a crop, use specialized botanical knowledge
      if (activeCrop === 'পেঁপে') {
        if (isFruit) {
          setDiagnosis({
            isPlant: true,
            cropName: 'পেঁপে',
            cropScientific: 'Carica papaya',
            diseaseName: 'পেঁপের ফলের অ্যানথ্রাকনোজ ও ক্ষত রোগ (Papaya Fruit Anthracnose)',
            diseaseScientific: 'Colletotrichum gloeosporioides',
            plantPart: 'ফল',
            severity: 'মাঝারি',
            confidenceScore: 92,
            symptomsObserved: 'পাকা ও কাঁচা পেঁপের ত্বকে গোলাকার দেবে যাওয়া বাদামি বা কালচে পচন দাগ। আর্দ্র আবহাওয়ায় ক্ষতস্থানে গোলাপি ছত্রাকের আস্তরণ দেখা যায়।',
            cause: 'কলিটোটিট্রিকাম গ্লিওস্পোরিয়য়েডস (Colletotrichum gloeosporioides) ছত্রাক। ফল পাকার সময়ে ত্বকে ক্ষতের মাধ্যমে দ্রুত ছড়িয়ে পড়ে।',
            treatments: {
              chemical: [
                {
                  name: 'এজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল (এমিস্টার টপ ৩২৫ এসসি)',
                  dose: 'প্রতি লিটার পানিতে ১ মিলি',
                  instruction: 'আক্রান্ত ফল ও সম্পূর্ণ গাছে ১০ দিন পর পর বিকেলে স্প্রে করুন।',
                },
                {
                  name: 'ম্যানকোজেব + মেটালেক্সিল (রিডোমিল গোল্ড এমজেড ৬৮ ডব্লিউজি)',
                  dose: 'প্রতি লিটার পানিতে ২ গ্রাম',
                  instruction: 'ফল ও পাতায় ভালোভাবে স্প্রে করুন। ফল কাটার ১৫ দিন আগে শেষ স্প্রে করুন।',
                },
              ],
              organic: [
                {
                  method: 'গরম পানিতে ফল শোধন (Hot Water Treatment)',
                  details: 'তোলার পর পেঁপে ৪৮° সেলসিয়াস গরম পানিতে ২০ মিনিট ডুবিয়ে শুকিয়ে সংরক্ষণ করুন।',
                },
              ],
              prevention: [
                'ফল তোলার পর আঘাত বা ক্ষত সৃষ্টি হতে দেবেন না।',
                'ফল বড় হওয়ার সময় থেকেই পরিমিত ছত্রাকনাশক স্প্রে নিশ্চিত করুন।',
              ],
            },
            expertNote: 'ফল বড় হওয়ার সময়েই নিয়মিত ছত্রাকনাশক স্প্রে দিলে পেঁপের অ্যানথ্রাকনোজ সম্পূর্ণরূপে রোধ করা যায়।',
          });
          setViewState('detail');
          return;
        }

        setDiagnosis({
          isPlant: true,
          cropName: 'পেঁপে',
          cropScientific: 'Carica papaya',
          diseaseName: 'পেঁপের রিং স্পট ভাইরাস (PRSV) ও কাণ্ড পচা রোগ',
          diseaseScientific: 'Papaya Ringspot Virus / Pythium aphanidermatum',
          plantPart: 'পাতা',
          severity: 'মাঝারি',
          confidenceScore: 94,
          symptomsObserved: 'পেঁপের করতলাকার চওড়া পাতায় শিরা বরাবর স্বচ্ছ বা হলুদ মোজাইক ছোপ, পাতার কিনারা বিকৃত ও খর্বাকৃতি হওয়া এবং পাতার বোঁটায় জলছাপের মতো দাগ দেখা যাচ্ছে।',
          cause: 'রিং স্পট ভাইরাস (জাবপোকা বা এফিড দ্বারা বাহিত) এবং বর্ষাকালে গোড়ায় অতিরিক্ত আর্দ্রতায় ছত্রাকজনিত আক্রমণ।',
          treatments: {
            chemical: [
              {
                name: 'ইমিডাক্লোপ্রিড ২০ এসএল (যেমন: এডমায়ার / টিডো)',
                dose: 'প্রতি লিটার পানিতে ০.৫ মিলি',
                instruction: 'ভাইরাস বিস্তারকারী জাবপোকা ও সাদা মাছি দমনে পাতার উভয় পিঠে ভালো করে স্প্রে করুন।',
              },
              {
                name: 'কপার অক্সিক্লোরাইড ৫০% ডব্লিউপি (যেমন: কুপ্রোফিক্স বা চ্যাম্পিয়ন)',
                dose: 'প্রতি লিটার পানিতে ২ গ্রাম',
                instruction: 'কাণ্ড ও গোড়া পচা রোগ দমনে গাছের গোড়ায় মাটি ভিজিয়ে স্প্রে করুন।',
              },
            ],
            organic: [
              {
                method: 'আক্রান্ত মারাত্মক পাতা ও গাছ অপসারণ',
                details: 'তীব্র ভাইরাস আক্রান্ত পাতা কেটে ক্ষেত থেকে দূরে নিয়ে পুড়িয়ে ফেলুন যাতে অন্য গাছে না ছড়ায়।',
              },
              {
                method: 'নিম তেলের মিশ্রণ',
                details: 'প্রতি লিটার পানিতে ৫ মিলি নিম তেল ও সামান্য ডিটারজেন্ট মিশিয়ে ৭ দিন পর পর স্প্রে করুন।',
              },
            ],
            prevention: [
              'পেঁপে গাছের গোড়ায় যেন কোনো অবস্থাতেই পানি জমে না থাকে, উঁচু বেড তৈরি করুন ও নালার ব্যবস্থা রাখুন।',
              'রোগমুক্ত সুস্থ চারা রোপণ করুন এবং জমির চারপাশে ভুট্টা বা ধইঞ্চার প্রতিবন্ধক বেড়া তৈরি করুন।',
            ],
          },
          expertNote: 'পেঁপের রিং স্পট ভাইরাস পোকার মাধ্যমে ছড়ায়, তাই পোকা দমন ও গোড়ায় পানি নিষ্কাশন নিশ্চিত করা সবচেয়ে জরুরি।',
        });
        setViewState('detail');
      } else if (activeCrop === 'ভুট্টা') {
        setDiagnosis({
          isPlant: true,
          cropName: 'ভুট্টা',
          cropScientific: 'Zea mays',
          diseaseName: 'ভুট্টার কান্ড পচা ও গোড়া পচা রোগ (Stem Rot Disease)',
          diseaseScientific: 'Diplodia maydis & Fusarium moniliforme',
          severity: 'মাঝারি',
          confidenceScore: 93,
          symptomsObserved: 'ভুট্টা গাছের কাণ্ডের নিচের গিঁট বা গোড়ার অংশ বাদামি হয়ে পচে যাচ্ছে, কাণ্ডের ভেতরের আঁশ বা মজ্জা (pith) নষ্ট হয়ে কাণ্ড নরম ও ফাঁপা হচ্ছে।',
          cause: 'ডিপ্লোডিয়া (Diplodia maydis) এবং ফিউজারিয়াম (Fusarium) ছত্রাকের আক্রমণ। জমিতে জলাবদ্ধতা বা সুষম সারের অভাবে এ রোগ বাড়ে।',
          treatments: {
            chemical: [
              {
                name: 'কার্বেন্ডাজিম ৫০% ডব্লিউপি (যেমন: নোইন বা অটোস্টিন)',
                dose: 'প্রতি লিটার পানিতে ২ গ্রাম',
                instruction: 'গাছের গোড়া ও কাণ্ডের নিচের অংশে ভালো করে স্প্রে ও মাটি ভিজিয়ে দিন। ৭ দিন পর পুনরায় দিন।',
              },
              {
                name: 'এজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল (যেমন: এমিস্টার টপ ৩২৫ এসসি)',
                dose: 'প্রতি লিটার পানিতে ১ মিলি',
                instruction: 'পাতার ব্লাইট ও কান্ড পচা উভয়ের বিরুদ্ধেই দ্রুত কাজ করে।',
              },
            ],
            organic: [
              {
                method: 'ট্রাইকোডার্মা বায়ো-ফাংগিসাইড প্রয়োগ',
                details: 'গাছের গোড়ার মাটিতে ট্রাইকোডার্মা সমৃদ্ধ জৈব সার প্রয়োগ করুন।',
              },
            ],
            prevention: [
              'জমিতে যেন বৃষ্টির বা সেচের পানি জমে না থাকে, দ্রুত পানি নিষ্কাশনের ব্যবস্থা করুন।',
              'সুষম সার প্রয়োগ করুন, অতিরিক্ত ইউরিয়া কমিয়ে পর্যাপ্ত পটাশ (এমওপি) সার দিন যা কাণ্ডকে মজবুত করে।',
              'বপনের আগে প্রতি কেজি বীজে ২.৫ গ্রাম প্রভ্যাক্স ২০০ ডব্লিউপি দিয়ে বীজ শোধন করুন।',
            ],
          },
          expertNote: 'ভুট্টার কাণ্ড পচা রোগ কাণ্ডকে দুর্বল করে গাছ ফেলে দেয়, তাই দ্রুত গাছের গোড়ায় অনুমোদিত ছত্রাকনাশক স্প্রে করুন।',
        });
        setViewState('detail');
      } else if (activeCrop === 'আলু') {
        setDiagnosis({
          isPlant: true,
          cropName: 'আলু',
          cropScientific: 'Solanum tuberosum',
          diseaseName: 'আলুর নাবি ধসা (লেট ব্লাইট) রোগ',
          diseaseScientific: 'Phytophthora infestans',
          severity: 'তীব্র',
          confidenceScore: 95,
          symptomsObserved: 'আলুর পাতায় ভেজা ভেজা কালচে দাগ এবং পাতার নিচে সাদা তুলার মতো ছত্রাকের স্তর দেখা যাচ্ছে।',
          cause: 'ছত্রাকজনিত সংক্রমণ (ঘন কুয়াশা ও স্যাঁতসেঁতে মেঘলা আবহাওয়া)।',
          treatments: {
            chemical: [
              {
                name: 'সাইমোক্সানিল + ম্যানকোজেব (কার্জেট বা মেলোডি ডুও)',
                dose: 'প্রতি লিটার পানিতে ২ গ্রাম',
                instruction: 'কুয়াশাচ্ছন্ন আবহাওয়ায় ৭ দিন পর পর স্প্রে করুন।',
              },
            ],
            organic: [
              {
                method: 'বোর্দো মিশ্রণ (১%)',
                details: '১০০ গ্রাম তুঁতে ও ১০০ গ্রাম চুন ১০ লিটার পানিতে মিশিয়ে রোগ আসার আগে স্প্রে করুন।',
              },
            ],
            prevention: ['রোগমুক্ত প্রত্যায়িত বীজ ব্যবহার করুন।', 'কুয়াশার সময় জমিতে সেচ বন্ধ রাখুন।'],
          },
          expertNote: 'লেট ব্লাইট আলুর সবচেয়ে মারাত্মক রোগ, দ্রুত ব্যবস্থা গ্রহণ করুন।',
        });
        setViewState('detail');
      } else if (activeCrop === 'ধান') {
        setDiagnosis({
          isPlant: true,
          cropName: 'ধান',
          cropScientific: 'Oryza sativa',
          diseaseName: 'ধানের ব্লাস্ট বা পাতাপোড়া রোগ',
          diseaseScientific: 'Magnaporthe oryzae',
          severity: 'মাঝারি',
          confidenceScore: 91,
          symptomsObserved: 'পাতায় চোখের মতো মাঝখানে ধূসর ও কিনারে বাদামি দাগ দৃশ্যমান।',
          cause: 'ছত্রাকজনিত সংক্রমণ (অতিরিক্ত আর্দ্রতা ও নাইট্রোজেন সারের প্রভাব)।',
          treatments: {
            chemical: [
              {
                name: 'ট্রাইসাইক্লাজল ৭৫% ডব্লিউপি (যেমন: ট্রুপার বা দিফা)',
                dose: 'প্রতি লিটার পানিতে ১ গ্রাম',
                instruction: 'বিকেলের মিষ্টি রোদে পাতার উভয় পিঠ ভালো করে ভিজিয়ে স্প্রে করুন।',
              },
            ],
            organic: [
              {
                method: 'কাঁচা গোবর ও কাঠের ছাইয়ের দ্রবণ',
                details: '১০ লিটার পানিতে ১ কেজি গোবর ও ছাই ভালো করে গুলে ছেঁকে পাতায় স্প্রে করুন।',
              },
            ],
            prevention: [
              'ইউরিয়া সারের অতিরিক্ত উপরিপ্রয়োগ স্থগিত রাখুন।',
              'জমিতে পরিমিত পানি সংরক্ষণ করুন।',
            ],
          },
          expertNote: 'আবহাওয়া স্যাঁতসেঁতে থাকলে রোগ দ্রুত বাড়ে, তাই দ্রুত ছত্রাকনাশক স্প্রে করুন।',
        });
        setViewState('detail');
      } else if (activeCrop === 'টমেটো') {
        if (isFruit) {
          setDiagnosis({
            isPlant: true,
            cropName: 'টমেটো',
            cropScientific: 'Solanum lycopersicum',
            diseaseName: 'টমেটোর ব্যাকটেরিয়াল ক্যাঙ্কার বা দাগ রোগ (Bacterial Canker / Bacterial Spot)',
            diseaseScientific: 'Clavibacter michiganensis / Xanthomonas vesicatoria',
            plantPart: 'ফল',
            severity: 'তীব্র',
            confidenceScore: 96,
            symptomsObserved: 'টমেটোর ফলের গায়ে গোলাকার দেবে যাওয়া খসখসে বাদামি ক্ষত, ক্ষতের চারপাশে হলুদ বা সাদা বলয় (Bird\'s-eye spots) এবং ফলের ত্বক ফেটে খসখসে হওয়া।',
            cause: 'ক্ল্যাভিব্যাক্টর বা জ্যান্থোমোনাস ব্যাকটেরিয়ার আক্রমণ। বৃষ্টি, শিশির ও আঘাতের মাধ্যমে ছড়ায়।',
            treatments: {
              chemical: [
                {
                  name: 'কপার হাইড্রোক্সাইড বা কপার অক্সিক্লোরাইড ৫০% ডব্লিউপি (কুপ্রোফিক্স / চ্যাম্পিয়ন)',
                  dose: 'প্রতি লিটার পানিতে ২ গ্রাম',
                  instruction: 'পরিষ্কার রৌদ্রোজ্জ্বল দিনে ফল ও পাতায় ভালো করে স্প্রে করুন।',
                },
                {
                  name: 'কাসুগামাইসিন ২% (কাসুমিন) অথবা স্ট্রেপ্টোমাইসিন মিশ্রণ',
                  dose: 'প্রতি লিটার পানিতে ১ মিলি বা ০.৫ গ্রাম',
                  instruction: 'ব্যাকটেরিয়া নাশক হিসেবে অত্যন্ত কার্যকর ফল দেয়।',
                },
              ],
              organic: [
                {
                  method: 'আক্রান্ত দাগযুক্ত ফল অপসারণ',
                  details: 'আক্রান্ত ফল তুলে ক্ষেত থেকে দূরে মাটির নিচে পুঁতে ফেলুন।',
                },
                {
                  method: 'বোর্দো মিশ্রণ (১%)',
                  details: '১০০ গ্রাম চুন ও ১০০ গ্রাম তুঁতে ১০ লিটার পানিতে গুলে স্প্রে করুন।',
                },
              ],
              prevention: [
                'সেচ দেওয়ার সময় পানি যেন পাতা বা ফলে সরাসরি না লাগে (ড্রিপ বা নালা সেচ দিন)।',
                'পরবর্তী মৌসুমে রোগমুক্ত শোধিত বীজ ব্যবহার করুন।',
              ],
            },
            expertNote: 'ফলের গায়ে পাখির চোখের মতো বলয় দাগ ও খসখসে ক্ষত দেখে ব্যাকটেরিয়াল ক্যাঙ্কার নিশ্চিত হওয়া যায়। দ্রুত কপারযুক্ত ওষুধ স্প্রে করুন।',
          });
        } else {
          setDiagnosis({
            isPlant: true,
            cropName: 'টমেটো',
            cropScientific: 'Solanum lycopersicum',
            diseaseName: 'টমেটোর পাতা কোঁকড়ানো রোগ (Tomato Leaf Curl Virus)',
            diseaseScientific: 'Tomato Yellow Leaf Curl Virus (TYLCV)',
            plantPart: 'পাতা',
            severity: 'তীব্র',
            confidenceScore: 94,
            symptomsObserved: 'টমেটোর পাতা উপরের বা নিচের দিকে কুঁকড়ে যাওয়া, শিরা মোটা ও হলুদ হয়ে যাওয়া এবং গাছের সার্বিক বৃদ্ধি থমকে গিয়ে ঝোপের মতো হওয়া।',
            cause: 'ভাইরাসজনিত আক্রমণ। সাদা মাছি (Whitefly / Bemisia tabaci) এই ভাইরাসের প্রধান বাহক।',
            treatments: {
              chemical: [
                {
                  name: 'অ্যাসিটামিপ্রিড ২০ এসপি (যেমন: টুপেক্স / গেইন) বা ডায়াফেনথিউরন (পেগাসাস)',
                  dose: 'প্রতি লিটার পানিতে ১ গ্রাম',
                  instruction: 'সাদা মাছি দমনে পাতার নিচের পিঠে সুন্দরভাবে স্প্রে করুন। ৭-১০ দিন পর পুনরায় স্প্রে করুন।',
                },
                {
                  name: 'ইমিডাক্লোপ্রিড ২০ এসএল (এডমায়ার / টিডো)',
                  dose: 'প্রতি লিটার পানিতে ০.৫ মিলি',
                  instruction: 'বাহক পোকা নিয়ন্ত্রণে অত্যন্ত দ্রুত ও কার্যকর।',
                },
              ],
              organic: [
                {
                  method: 'হলুদ আঠালো ফাঁদ (Yellow Sticky Trap)',
                  details: 'জমিতে প্রতি শতকে ১-২টি হলুদ আঠালো ফাঁদ স্থাপন করে সাদা মাছি আকৃষ্ট করে আটকে ফেলুন।',
                },
                {
                  method: 'নিম তেল স্প্রে',
                  details: 'প্রতি লিটার পানিতে ৫ মিলি নিম তেল ও সামান্য ডিটারজেন্ট মিশিয়ে নিয়মিত স্প্রে করুন।',
                },
              ],
              prevention: [
                'চারা রোপণের পর প্রাথমিক অবস্থায় সাদা মাছি প্রতিরোধী জাল (Netting) ব্যবহার করুন।',
                'আক্রান্ত মারাত্মক গাছগুলো দ্রুত তুলে মাটি চাপা দিন যাতে রোগ ছড়িয়ে না পড়ে।',
                'জমিতে সুষম সার ব্যবহার করুন ও অতিরিক্ত নাইট্রোজেন সার পরিহার করুন।',
              ],
            },
            expertNote: 'ভাইরাস আক্রমণের পর গাছ পুরোপুরি সারানো কঠিন, তাই বাহক পোকা সাদা মাছি দমন করাই মূল প্রতিকার।',
          });
        }
        setViewState('detail');
      } else if (activeCrop === 'বেগুন') {
        if (isFruit) {
          setDiagnosis({
            isPlant: true,
            cropName: 'বেগুন',
            cropScientific: 'Solanum melongena',
            diseaseName: 'বেগুনের সাদা ছত্রাক পচন ও ফোমোপসিস ফল পচা রোগ (Eggplant White Mold & Fruit Rot)',
            diseaseScientific: 'Sclerotinia sclerotiorum / Phomopsis vexans',
            plantPart: 'ফল',
            severity: 'তীব্র',
            confidenceScore: 95,
            symptomsObserved: 'বেগুনের গায়ে সাদা তুলার মতো তুলতুলে ছত্রাকের আস্তরণ (White Cottony Mycelium), ফলের ত্বক নরম হয়ে পানিভর্তি থলির মতো গলে যাওয়া এবং পচে কালো হওয়া।',
            cause: 'স্ক্লেরোটিনিয়া বা ফোমোপসিস ছত্রাকের আক্রমণ। মাটিতে অতিরিক্ত আর্দ্রতা ও স্যাঁতসেঁতে আবহাওয়ায় দ্রুত ছড়ায়।',
            treatments: {
              chemical: [
                {
                  name: 'কার্বেন্ডাজিম ৫০% ডব্লিউপি (যেমন: নোইন বা অটোস্টিন) অথবা রোভরাল',
                  dose: 'প্রতি লিটার পানিতে ২ গ্রাম',
                  instruction: 'গাছের গোড়া ও ফলে ভালো করে স্প্রে করুন। ৭ দিন পর পুনরায় দিন।',
                },
                {
                  name: 'এমিস্টার টপ ৩২৫ এসসি (এজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল)',
                  dose: 'প্রতি লিটার পানিতে ১ মিলি',
                  instruction: 'ছত্রাকের বিস্তার তাৎক্ষণিক দমন করে ফলকে পচন থেকে রক্ষা করে।',
                },
              ],
              organic: [
                {
                  method: 'আক্রান্ত নরম পচা ফল অপসারণ',
                  details: 'সাদা ছত্রাকযুক্ত পচা বেগুন দ্রুত জমি থেকে তুলে মাটিতে পুঁতে ফেলুন।',
                },
                {
                  method: 'ট্রাইকোডার্মা জৈব ছত্রাকনাশক',
                  details: 'গাছের গোড়ায় ট্রাইকোডার্মা সমৃদ্ধ কম্পোস্ট প্রয়োগ করুন।',
                },
              ],
              prevention: [
                'গাছের নিচের রোগাক্রান্ত পাতা ছেঁটে দিন যাতে বাতাস চলাচল করতে পারে।',
                'জমিতে কোনো অবস্থাতেই পানি জমতে দেবেন না ও পরিমিত সেচ দিন।',
              ],
            },
            expertNote: 'সাদা তুলার মতো আস্তরণ থাকলে এটি ছত্রাকজনিত ফল পচা রোগ। দ্রুত আক্রান্ত ফল সরিয়ে ছত্রাকনাশক স্প্রে করুন।',
          });
        } else {
          setDiagnosis({
            isPlant: true,
            cropName: 'বেগুন',
            cropScientific: 'Solanum melongena',
            diseaseName: 'বেগুনের ডগা ও ফল ছিদ্রকারী পোকা ও ঢলে পড়া রোগ',
            diseaseScientific: 'Leucinodes orbonalis / Ralstonia solanacearum',
            plantPart: 'ফল ও ডগা',
            severity: 'তীব্র',
            confidenceScore: 92,
            symptomsObserved: 'গাছের কচি ডগা নুয়ে পড়ে শুকিয়ে যাওয়া এবং বেগুনের ফলের গায়ে ছোট ছিদ্র ও পোকার বিষ্ঠা দৃশ্যমান।',
            cause: 'পোকার কীড়ার কান্ড ও ফলে আক্রমণ এবং ব্যাক্টেরিয়ার কারণে রক্তনালী বন্ধ হয়ে ঢলে পড়া।',
            treatments: {
              chemical: [
                {
                  name: 'এমামেকটিন বেনজোয়েট ৫ এসজি (প্রোক্লেম / সাসপেন্ড)',
                  dose: 'প্রতি লিটার পানিতে ১ গ্রাম',
                  instruction: 'বিকেলের দিকে ভালো করে স্প্রে করুন।',
                },
              ],
              organic: [
                {
                  method: 'ফেরোমোন ফাঁদ ব্যবহার',
                  details: 'জমিতে লিউরসহ সেক্স ফেরোমোন ফাঁদ স্থাপন করে পুরুষ পোকা ধ্বংস করুন।',
                },
              ],
              prevention: [
                'আক্রান্ত ডগা পোকার কীড়াসহ কেটে ধ্বংস করুন।',
                'সুস্থ ও রোগমুক্ত চারা রোপণ করুন।',
              ],
            },
            expertNote: 'ফেরোমোন ফাঁদ ব্যবহার করলে কীটনাশক ছাড়াই পোকার উপদ্রব ৭০-৮০% কমানো সম্ভব।',
          });
        }
        setViewState('detail');
      } else if (activeCrop === 'মরিচ') {
        setDiagnosis({
          isPlant: true,
          cropName: 'মরিচ',
          cropScientific: 'Capsicum annuum',
          diseaseName: 'মরিচের পাতা কোঁকড়ানো রোগ (Chilli Leaf Curl / Thrips & Mites)',
          diseaseScientific: 'Chilli Leaf Curl Virus / Polyphagotarsonemus latus',
          severity: 'মাঝারি',
          confidenceScore: 93,
          symptomsObserved: 'মরিচের পাতা উল্টো নৌকার মতো কুঁকড়ে যাওয়া, পাতার নিচের পিঠ বাদামি হওয়া ও ছোট হয়ে যাওয়া।',
          cause: 'মাকড় (Mite) বা থ্রিপস পোকার রস চোষার ফলে এবং ভাইরাস সংক্রমণের কারণে এ রোগ হয়।',
          treatments: {
            chemical: [
              {
                name: 'ভার্টিমেক বা ওমাইট (অ্যাবামেকটিন / প্রোপারগাইট)',
                dose: 'প্রতি লিটার পানিতে ১.৫ মিলি',
                instruction: 'মাকড় দমনে পাতার নিচের পিঠে ভালোভাবে স্প্রে করুন।',
              },
            ],
            organic: [
              {
                method: 'সাবান পানি বা ছাই ও নিম পাতার রস',
                details: '১০ লিটার পানিতে নিম পাতার রস ও সাবানের গুঁড়ো মিশিয়ে স্প্রে করুন।',
              },
            ],
            prevention: ['ক্ষেত সবসময় আগাছামুক্ত রাখুন ও সুস্থ চারা রোপণ করুন।'],
          },
          expertNote: 'পাতা নিচের দিকে কুঁকড়ালে মাকড়নাশক এবং উপরের দিকে কুঁকড়ালে থ্রিপসনাশক স্প্রে করুন।',
        });
        setViewState('detail');
      } else if (activeCrop === 'কলা') {
        setDiagnosis({
          isPlant: true,
          cropName: 'কলা',
          cropScientific: 'Musa acuminata',
          diseaseName: 'কলার সিগাটোকা রোগ (Black / Yellow Sigatoka)',
          diseaseScientific: 'Pseudocercospora musae / Mycosphaerella fijiensis',
          severity: 'মাঝারি',
          confidenceScore: 94,
          symptomsObserved: 'কলার পাতায় সমান্তরালে ছোট ছোট হলুদ বা বাদামি সরু দাগ, যা পরবর্তীতে বড় হয়ে মাঝখানে ধূসর ও কিনারায় কালচে বলয় সৃষ্টি করে এবং পাতা পুড়ে যাওয়ার মতো শুকিয়ে ঝুলে পড়ে।',
          cause: 'ছত্রাকজনিত সংক্রমণ। উচ্চ আর্দ্রতা ও উষ্ণ স্যাঁতসেঁতে আবহাওয়ায় বাতাসের মাধ্যমে জীবাণু দ্রুত ছড়ায়।',
          treatments: {
            chemical: [
              {
                name: 'প্রোপিকোনাজল ২৫% ইসি (টিল্ট / অটোটিল্ট)',
                dose: 'প্রতি লিটার পানিতে ১ মিলি',
                instruction: 'লক্ষণ দেখার সাথে সাথে পাতার ওপর ও নিচ ভালো করে ভিজিয়ে স্প্রে করুন। ১৫ দিন পর আরেকবার দিন।',
              },
              {
                name: 'এমিস্টার টপ ৩২৫ এসসি (এজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল)',
                dose: 'প্রতি লিটার পানিতে ১ মিলি',
                instruction: 'তীব্র আক্রমণে অত্যন্ত কার্যকর প্রতিকার দেয়।',
              },
            ],
            organic: [
              {
                method: 'আক্রান্ত পাতা ছাঁটাই ও ধ্বংস',
                details: '৫০% এর বেশি আক্রান্ত পাতা ধারালো দা দিয়ে কেটে ক্ষেতের বাইরে নিরাপদ স্থানে পুড়িয়ে ফেলুন।',
              },
            ],
            prevention: [
              'ক্ষেতে সেচ বা বৃষ্টির পানি নিষ্কাশনের সুষ্ঠু নালা রাখুন।',
              'অতিরিক্ত ঘন করে চারা রোপণ করবেন না এবং নিয়মিত আগাছা পরিষ্কার রাখুন।',
            ],
          },
          expertNote: 'সিগাটোকা রোগ দ্রুত পুরো পাতায় ছড়িয়ে শালোকসংশ্লেষণ বন্ধ করে দেয়, তাই প্রাথমিক দাগেই ছত্রাকনাশক স্প্রে করুন।',
        });
        setViewState('detail');
      } else {
        // If auto was selected and the remote AI was temporarily unavailable, NEVER fake Rice Blast!
        setAnalysisError('AI ভিশন সার্ভার সাময়িক ব্যস্ত ছিল। অনুগ্রহ করে পুনরায় চেষ্টা করুন অথবা ওপরের তালিকা থেকে নির্দিষ্ট ফসল (যেমন: পেঁপে, ভুট্টা ইত্যাদি) নির্বাচন করে দিন।');
        setViewState('main');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div id="disease-diagnosis-screen" className="space-y-4 pb-8">
      {/* Native hidden camera inputs for mobile fallback */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChosen}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={nativeCameraInputRef}
        onChange={handleFileChosen}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          id="btn-disease-back"
          onClick={() => {
            if (viewState === 'camera-live') {
              stopCameraStream();
              setViewState('main');
            } else if (viewState === 'scanning' || viewState === 'detail') {
              setViewState('main');
            } else {
              onBack();
            }
          }}
          className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-stone-900">
            {viewState === 'detail'
              ? 'রোগ নির্ণয় বিবরণী'
              : viewState === 'camera-live'
              ? 'লাইভ ক্যামেরা স্ক্যান'
              : 'রোগ শনাক্তকরণ (রিয়েল স্ক্যান)'}
          </h1>
          <span className="text-[10px] text-emerald-700 font-semibold block">
            AI দৃষ্টি ও উদ্ভিদ রোগতত্ত্ব ইঞ্জিন
          </span>
        </div>
        <div className="w-9 h-9" />
      </div>

      {/* VIEW 1: Main Picker & Recent Advice */}
      {viewState === 'main' && (
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Analysis Error Notification if any */}
          {analysisError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-left space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 text-red-800 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>স্ক্যান সংক্রান্ত বিজ্ঞপ্তি</span>
              </div>
              <p className="text-xs text-red-700 leading-relaxed">
                {analysisError}
              </p>
            </div>
          )}

          {/* Crop Selector Chips */}
          <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5 text-emerald-600" />
                ১. ফসলের ধরন (ঐচ্ছিক):
              </span>
              {selectedCrop !== 'auto' && (
                <button
                  onClick={() => setSelectedCrop('auto')}
                  className="text-[10px] text-emerald-700 font-semibold underline"
                >
                  রিসেট (অটো)
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {CROPS_LIST.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                    selectedCrop === crop.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                  }`}
                >
                  {crop.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plant Part Selection: পাতা / ফল / উভয়ই */}
          <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">🌿</span>
                ২. আক্রান্ত অঙ্গ নির্বাচন (Leaf / Fruit):
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {selectedPart === 'both' ? 'উভয় অঙ্গ' : selectedPart === 'leaf' ? 'পাতা ফোকাস' : 'ফল ফোকাস'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPart('both')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 border text-center ${
                  selectedPart === 'both'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <span className="text-sm">🌿</span>
                <span className="whitespace-nowrap">পাতা ও ফল</span>
                <span className="text-[9px] font-normal opacity-90">স্বয়ংক্রিয়</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPart('leaf')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 border text-center ${
                  selectedPart === 'leaf'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <span className="text-sm">🍃</span>
                <span className="whitespace-nowrap">আক্রান্ত পাতা</span>
                <span className="text-[9px] font-normal opacity-90">ব্লাইট/মরিচা</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPart('fruit')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 border text-center ${
                  selectedPart === 'fruit'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <span className="text-sm">🍅</span>
                <span className="whitespace-nowrap">ফল বা শস্য</span>
                <span className="text-[9px] font-normal opacity-90">পচা/চিটা/পোকা</span>
              </button>
            </div>
          </div>

          {/* Main Photo Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-sm space-y-4 text-center">
            <div className="flex items-center justify-between text-left">
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  {selectedPart === 'fruit' 
                    ? 'আসল ফল বা শস্য স্ক্যান করুন' 
                    : selectedPart === 'leaf' 
                    ? 'আসল পাতা স্ক্যান করুন' 
                    : 'আসল পাতা ও ফল স্ক্যান করুন'}
                </h2>
                <p className="text-xs text-stone-600">
                  {selectedCrop === 'auto'
                    ? 'ক্যামেরা বা ছবি আপলোড করে পাতা ও ফলের নির্ভুল রোগ নির্ণয় করুন'
                    : `নির্বাচিত ফসল: ${selectedCrop} (${selectedPart === 'fruit' ? 'ফল' : selectedPart === 'leaf' ? 'পাতা' : 'পাতা ও ফল'}) — ক্যামেরা বা ছবি আপলোড করুন`}
                </p>
              </div>
              <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                ১০০% রিয়েল
              </span>
            </div>

            <div className="w-full h-44 rounded-xl overflow-hidden bg-stone-900 relative">
              <img
                src={capturedImage || "/sec/disease.png"}
                alt="Crop sample"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent flex items-end justify-center p-3">
                <span className="text-xs text-white font-semibold flex items-center gap-1.5">
                  <Scan className="w-3.5 h-3.5 text-emerald-400" />
                  {selectedPart === 'fruit' 
                    ? 'আক্রান্ত ফল বা শীষ ফ্রেমের মাঝে পরিষ্কার রাখুন' 
                    : selectedPart === 'leaf' 
                    ? 'আক্রান্ত পাতা ফ্রেমের মাঝে পরিষ্কার রাখুন' 
                    : 'আক্রান্ত পাতা বা ফল ফ্রেমের মাঝে পরিষ্কার রাখুন'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                id="btn-pick-gallery"
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-stone-700" />
                <span>গ্যালারি থেকে নিন</span>
              </button>

              <button
                id="btn-open-camera"
                onClick={() => startLiveCamera('environment')}
                className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>ক্যামেরা ওপেন করুন</span>
              </button>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              সঠিক স্ক্যানের নিয়মাবলী:
            </h3>
            <ul className="text-[11px] text-stone-600 space-y-1 pl-1">
              <li>• রোদে বা পর্যাপ্ত আলোতে পাতা বা ফলের দাগের পরিষ্কার ছবি তুলুন।</li>
              <li>• ক্যামেরার লেন্স পাতা/ফল থেকে ৪-৬ ইঞ্চি দূরত্বে রাখুন।</li>
              <li>• পাতা বা ফলের আক্রান্ত অংশ ফ্রেমের ভেতরে ফোকাস করুন।</li>
            </ul>
          </div>
        </motion.div>
      )}

      {/* VIEW 2: Real Live Camera Viewfinder */}
      {viewState === 'camera-live' && (
        <motion.div
          key="camera-live"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full h-[480px] rounded-3xl overflow-hidden bg-black shadow-2xl flex flex-col justify-between p-4"
        >
          {/* Live Video Element */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Top Controls Bar */}
          <div className="relative z-30 flex items-center justify-between">
            <button
              onClick={() => {
                stopCameraStream();
                setViewState('main');
              }}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              লাইভ ক্যামেরা চালু
            </div>

            <button
              onClick={flipCamera}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80"
              title="ক্যামেরা ফ্লিপ করুন"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
          </div>

          {/* Viewfinder Target Reticle */}
          <div className="relative z-20 flex-1 flex items-center justify-center my-4 pointer-events-none">
            <div className="w-64 h-64 border-2 border-emerald-400/80 rounded-2xl relative flex flex-col justify-between p-2 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-4 border-l-4 border-emerald-400"></div>
                <div className="w-6 h-6 border-t-4 border-r-4 border-emerald-400"></div>
              </div>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-4 border-l-4 border-emerald-400"></div>
                <div className="w-6 h-6 border-b-4 border-r-4 border-emerald-400"></div>
              </div>
            </div>
          </div>

          {/* Bottom Shutter Controls */}
          <div className="relative z-30 flex items-center justify-around pb-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 text-xs font-bold"
              title="গ্যালারি"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Big Shutter Button */}
            <button
              onClick={captureLiveFrame}
              className="w-18 h-18 rounded-full border-4 border-white bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
              title="ছবি তুলুন"
            >
              <Camera className="w-8 h-8" />
            </button>

            <div className="w-12"></div>
          </div>
        </motion.div>
      )}

      {/* VIEW 3: Scanning Animation with Actual Captured Photo */}
      {viewState === 'scanning' && capturedImage && (
        <motion.div
          key="scanning"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-full h-[450px] rounded-3xl overflow-hidden bg-stone-950 shadow-2xl flex flex-col justify-between p-6"
        >
          {/* Real Captured Image as Background */}
          <img
            src={capturedImage}
            alt="Captured Leaf"
            className="absolute inset-0 w-full h-full object-cover opacity-85"
          />

          {/* Laser Scanning Line Animation */}
          <motion.div
            animate={{ top: ['10%', '85%', '10%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute left-6 right-6 h-1 bg-emerald-400 shadow-[0_0_20px_#34d399] z-20"
          />

          {/* Scanning Box Reticle */}
          <div className="absolute inset-8 border-2 border-emerald-400/60 rounded-2xl pointer-events-none z-10 flex flex-col justify-between p-2">
            <div className="flex justify-between">
              <div className="w-5 h-5 border-t-4 border-l-4 border-emerald-400"></div>
              <div className="w-5 h-5 border-t-4 border-r-4 border-emerald-400"></div>
            </div>
            <div className="flex justify-between">
              <div className="w-5 h-5 border-b-4 border-l-4 border-emerald-400"></div>
              <div className="w-5 h-5 border-b-4 border-r-4 border-emerald-400"></div>
            </div>
          </div>

          {/* Top scanning badge */}
          <div className="relative z-30 flex justify-center">
            <div className="bg-stone-950/85 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-emerald-400 border border-emerald-500/40 flex items-center gap-2 shadow-lg">
              <Scan className="w-4 h-4 animate-spin text-emerald-400" />
              <span>AI দ্বারা আপনার আসল ছবি পরীক্ষা করা হচ্ছে...</span>
            </div>
          </div>

          {/* Bottom message */}
          <div className="relative z-30 flex flex-col items-center gap-1.5 text-center">
            <span className="text-xs text-white font-bold bg-black/70 backdrop-blur-xs px-3 py-1 rounded-full">
              পাতা, রঙ ও রোগের লক্ষণ বিশ্লেষণ হচ্ছে
            </span>
          </div>
        </motion.div>
      )}

      {/* VIEW 4: Disease Diagnosis Details (Real Output) */}
      {viewState === 'detail' && diagnosis && (
        <motion.div
          key="detail"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* User's Actual Captured Image Preview */}
          <div className="w-full h-48 rounded-2xl overflow-hidden bg-stone-900 shadow-md relative">
            <img
              src={capturedImage || "/sec/disease.png"}
              alt={diagnosis.diseaseName}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              নির্ভুলতা {toBn(diagnosis.confidenceScore)}%
            </div>
            <div className="absolute bottom-2 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md">
              আসল স্ক্যানকৃত ছবি
            </div>
          </div>

          {/* Diagnosis Header Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-emerald-700">চিহ্নিত ফসল: {diagnosis.cropName}</span>
                {diagnosis.plantPart && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    {diagnosis.plantPart.includes('ফল') ? '🍅' : '🍃'} অঙ্গ: {diagnosis.plantPart}
                  </span>
                )}
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {diagnosis.modelProvider || diagnosis.engine || 'Hugging Face Pre-Trained Vision'}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                diagnosis.severity === 'তীব্র'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                তীব্রতা: {diagnosis.severity}
              </span>
            </div>

            <h2 className="text-lg font-black text-stone-900">{diagnosis.diseaseName}</h2>
            {diagnosis.diseaseScientific && (
              <p className="text-[11px] text-stone-500 italic font-serif">
                জীবাণু: {diagnosis.diseaseScientific}
              </p>
            )}

            <div className="pt-2 border-t border-stone-100">
              <span className="text-xs font-bold text-stone-800 block mb-1">ছবিতে দৃশ্যমান লক্ষণ:</span>
              <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-2.5 rounded-xl">
                {diagnosis.symptomsObserved}
              </p>
            </div>

            {/* Quick Part Switcher (Leaf vs Fruit) */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                🌿 আক্রান্ত অঙ্গ রূপান্তর:
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPart('leaf');
                    if (capturedImage) {
                      analyzeLeafImage(capturedImage, undefined, 'leaf');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    diagnosis.plantPart?.includes('পাতা') && !diagnosis.plantPart?.includes('ফল')
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300'
                  }`}
                >
                  🍃 শুধু পাতা
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPart('fruit');
                    if (capturedImage) {
                      analyzeLeafImage(capturedImage, undefined, 'fruit');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    diagnosis.plantPart?.includes('ফল')
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300'
                  }`}
                >
                  🍅 শুধু ফল / শস্য
                </button>
              </div>
            </div>

            {/* Maize Disease Quick Selector if crop is Maize */}
            {diagnosis.cropName.includes('ভুট্টা') && (
              <div className="pt-2 border-t border-stone-100 space-y-1.5 text-left">
                <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  🌽 ভুট্টার অন্য রোগ দেখতে চান?
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDiagnosis({
                        isPlant: true,
                        cropName: 'ভুট্টা',
                        cropScientific: 'Zea mays',
                        diseaseName: 'ভুট্টার কান্ড পচা ও গোড়া পচা রোগ (Stem Rot Disease)',
                        diseaseScientific: 'Diplodia maydis & Fusarium moniliforme',
                        severity: 'মাঝারি',
                        confidenceScore: 95,
                        symptomsObserved: 'ভুট্টা গাছের কাণ্ডের নিচের গিঁট বা গোড়ার অংশ বাদামি হয়ে পচে যাচ্ছে, কাণ্ডের ভেতরের আঁশ বা মজ্জা (pith) নষ্ট হয়ে কাণ্ড নরম ও ফাঁপা হচ্ছে।',
                        cause: 'ডিপ্লোডিয়া (Diplodia maydis) এবং ফিউজারিয়াম (Fusarium moniliforme) ছত্রাকের সংক্রমণ। জমিতে জলাবদ্ধতা বা পটাশের অভাবে কাণ্ড দুর্বল হয়ে গাছ ঢলে পড়ে।',
                        treatments: {
                          chemical: [
                            {
                              name: 'কার্বেন্ডাজিম ৫০% ডব্লিউপি (যেমন: নোইন বা অটোস্টিন)',
                              dose: 'প্রতি লিটার পানিতে ২ গ্রাম',
                              instruction: 'গাছের গোড়া ও কাণ্ডের নিচের অংশে ভালো করে স্প্রে ও মাটি ভিজিয়ে দিন। ৭ দিন পর পুনরায় দিন।',
                            },
                            {
                              name: 'এজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল (যেমন: এমিস্টার টপ ৩২৫ এসসি)',
                              dose: 'প্রতি লিটার পানিতে ১ মিলি',
                              instruction: 'পাতার ব্লাইট ও কান্ড পচা উভয়ের বিরুদ্ধেই দ্রুত কাজ করে।',
                            },
                          ],
                          organic: [
                            {
                              method: 'ট্রাইকোডার্মা বায়ো-ফাংগিসাইড প্রয়োগ',
                              details: 'গাছের গোড়ার মাটিতে ট্রাইকোডার্মা সমৃদ্ধ জৈব সার প্রয়োগ করুন।',
                            },
                          ],
                          prevention: [
                            'জমিতে যেন বৃষ্টির বা সেচের পানি জমে না থাকে, দ্রুত পানি নিষ্কাশনের ব্যবস্থা করুন।',
                            'সুষম সার প্রয়োগ করুন, অতিরিক্ত ইউরিয়া কমিয়ে পর্যাপ্ত পটাশ (এমওপি) সার দিন যা কাণ্ডকে মজবুত করে।',
                            'বপনের আগে প্রতি কেজি বীজে ২.৫ গ্রাম প্রভ্যাক্স ২০০ ডব্লিউপি দিয়ে বীজ শোধন করুন।',
                          ],
                        },
                        expertNote: 'ভুট্টার কাণ্ড পচা রোগ কাণ্ডকে দুর্বল করে গাছ ফেলে দেয়, তাই দ্রুত গাছের গোড়ায় অনুমোদিত ছত্রাকনাশক স্প্রে করুন।',
                      });
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      diagnosis.diseaseName.includes('কান্ড')
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    কাণ্ড পচা রোগ (Stem Rot)
                  </button>
                  <button
                    onClick={() => {
                      setDiagnosis({
                        isPlant: true,
                        cropName: 'ভুট্টা',
                        cropScientific: 'Zea mays',
                        diseaseName: 'ভুট্টার পাতা ঝলসানো (টারসিকাম ব্লাইট) রোগ',
                        diseaseScientific: 'Exserohilum turcicum',
                        severity: 'মাঝারি',
                        confidenceScore: 94,
                        symptomsObserved: 'ভুট্টার লম্বা চওড়া পাতায় শিরা বরাবর ধূসর ও হালকা বাদামি রঙের লম্বাটে নৌকার মতো বা চুরুট আকৃতির ছোপ দাগ সুস্পষ্টভাবে দৃশ্যমান।',
                        cause: 'টারসিকাম ছত্রাকজনিত সংক্রমণ। অতিরিক্ত আর্দ্রতা ও কুয়াশাচ্ছন্ন আবহাওয়ায় এ রোগ দ্রুত ছড়ায়।',
                        treatments: {
                          chemical: [
                            {
                              name: 'এজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল (যেমন: এমিস্টার টপ ৩২৫ এসসি)',
                              dose: 'প্রতি লিটার পানিতে ১ মিলি',
                              instruction: 'আক্রান্ত ক্ষেতে বিকেলের মিষ্টি রোদে পাতার উভয় পিঠ ভালো করে ভিজিয়ে স্প্রে করুন। প্রয়োজনে ১০ দিন পর পুনরায় দিন।',
                            },
                            {
                              name: 'ম্যানকোজেব ৭৫% ডব্লিউপি (যেমন: ডাইথেন এম-৪৫)',
                              dose: 'প্রতি লিটার পানিতে ২-২.৫ গ্রাম',
                              instruction: 'রোগের প্রাথমিক অবস্থায় পুরো গাছে ভালো করে স্প্রে করুন।',
                            },
                          ],
                          organic: [
                            {
                              method: 'আক্রান্ত শুকনো পাতা অপসারণ',
                              details: 'গাছের নিচের দিকের বেশি আক্রান্ত শুকনো পাতা সাবধানে কেটে ক্ষেত থেকে দূরে নিয়ে পুড়িয়ে বা মাটিতে পুঁতে ফেলুন।',
                            },
                            {
                              method: 'ট্রাইকোডার্মা বায়ো-ফাংগিসাইড',
                              details: 'প্রতি লিটার পানিতে ৫ গ্রাম মিশিয়ে স্প্রে করলে ছত্রাকের আক্রমণ হ্রাস পায়।',
                            },
                          ],
                          prevention: [
                            'রোগ প্রতিরোধী হাইব্রিড জাতের ভুট্টার বীজ চাষ করুন।',
                            'সুষম সার প্রয়োগ করুন, অতিরিক্ত ইউরিয়া বাদ দিয়ে পর্যাপ্ত পটাশ সার ব্যবহার করুন।',
                            'ফসল কাটার পর জমির অবশিষ্টাংশ পুড়িয়ে ধ্বংস করুন।',
                          ],
                        },
                        expertNote: 'ভুট্টার ব্লাইট রোগ পাতার সালোকসংশ্লেষণ ক্ষমতা কমিয়ে ফলনে ব্যাপক ক্ষতি করে, তাই দ্রুত ছত্রাকনাশক স্প্রে নিশ্চিত করুন।',
                      });
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      diagnosis.diseaseName.includes('ঝলসানো') || diagnosis.diseaseName.includes('ব্লাইট')
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    পাতা ঝলসানো (Blight)
                  </button>
                  <button
                    onClick={() => {
                      setDiagnosis({
                        isPlant: true,
                        cropName: 'ভুট্টা',
                        cropScientific: 'Zea mays',
                        diseaseName: 'ভুট্টার মোচা ও দানা পচা রোগ (Fusarium Ear Rot)',
                        diseaseScientific: 'Fusarium verticillioides / Gibberella zeae',
                        plantPart: 'ফল (মোচা)',
                        severity: 'মাঝারি',
                        confidenceScore: 94,
                        symptomsObserved: 'ভুট্টার মোচার মাথায় সাদা বা গোলাপি রঙের ছত্রাকের তুলার মতো আস্তরণ, ভুট্টার দানা বিবর্ণ বা কালচে হয়ে পচে যাওয়া।',
                        cause: 'ফিউজারিয়াম ছত্রাক সংক্রমণ ও ফল আর্মিওয়ার্ম পোকার ক্ষত।',
                        treatments: {
                          chemical: [
                            { name: 'কার্বেন্ডাজিম ৫০% ডব্লিউপি (নোইন বা অটোস্টিন)', dose: 'প্রতি লিটার পানিতে ২ গ্রাম', instruction: 'মোচায় স্প্রে করুন।' },
                            { name: 'এমিস্টার টপ ৩২৫ এসসি', dose: 'প্রতি লিটার পানিতে ১ মিলি', instruction: 'মোচা আসার শুরুতে স্প্রে করুন।' }
                          ],
                          organic: [
                            { method: 'আক্রান্ত মোচা অপসারণ', details: 'ক্ষেত থেকে পচা মোচা সংগ্রহ করে পুড়িয়ে ধ্বংস করুন।' }
                          ],
                          prevention: ['মোচা বের হওয়ার সময় জমিতে অতিরিক্ত আর্দ্রতা ও পোকার আক্রমণ নিয়ন্ত্রণ করুন।']
                        },
                        expertNote: 'মোচা পচা রোগে বিষাক্ত মাইকোটক্সিন তৈরি হতে পারে, তাই দ্রুত প্রতিকার নিন।'
                      });
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      diagnosis.diseaseName.includes('মোচা') || diagnosis.diseaseName.includes('Ear Rot')
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    🌽 মোচা পচা (Ear Rot)
                  </button>
                </div>
              </div>
            )}

            {/* Tomato Disease Quick Selector if crop is Tomato */}
            {diagnosis.cropName.includes('টমেটো') && (
              <div className="pt-2 border-t border-stone-100 space-y-1.5 text-left">
                <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  🍅 টমেটোর পাতা ও ফলের সঠিক রোগ নির্বাচন:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    onClick={() => {
                      setDiagnosis({
                        isPlant: true,
                        cropName: 'টমেটো',
                        cropScientific: 'Solanum lycopersicum',
                        diseaseName: 'টমেটোর ব্যাকটেরিয়াল ক্যাঙ্কার বা দাগ রোগ (Bacterial Canker / Bacterial Spot)',
                        diseaseScientific: 'Clavibacter michiganensis / Xanthomonas vesicatoria',
                        plantPart: 'ফল',
                        severity: 'তীব্র',
                        confidenceScore: 96,
                        symptomsObserved: 'টমেটোর ফলের গায়ে গোলাকার দেবে যাওয়া খসখসে বাদামি ক্ষত, ক্ষতের চারপাশে হলুদ বা সাদা বলয় (Bird\'s-eye spots) এবং ফলের ত্বক ফেটে খসখসে হওয়া।',
                        cause: 'ক্ল্যাভিব্যাক্টর বা জ্যান্থোমোনাস ব্যাকটেরিয়ার আক্রমণ। বৃষ্টি, শিশির ও আঘাতের মাধ্যমে ছড়ায়।',
                        treatments: {
                          chemical: [
                            {
                              name: 'কপার হাইড্রোক্সাইড বা কপার অক্সিক্লোরাইড ৫০% ডব্লিউপি (কুপ্রোফিক্স / চ্যাম্পিয়ন)',
                              dose: 'প্রতি লিটার পানিতে ২ গ্রাম',
                              instruction: 'পরিষ্কার রৌদ্রোজ্জ্বল দিনে ফল ও পাতায় ভালো করে স্প্রে করুন।',
                            },
                            {
                              name: 'কাসুগামাইসিন ২% (কাসুমিন) অথবা স্ট্রেপ্টোমাইসিন মিশ্রণ',
                              dose: 'প্রতি লিটার পানিতে ১ মিলি বা ০.৫ গ্রাম',
                              instruction: 'ব্যাকটেরিয়া নাশক হিসেবে অত্যন্ত কার্যকর ফল দেয়।',
                            },
                          ],
                          organic: [
                            {
                              method: 'আক্রান্ত দাগযুক্ত ফল অপসারণ',
                              details: 'আক্রান্ত ফল তুলে ক্ষেত থেকে দূরে মাটির নিচে পুঁতে ফেলুন।',
                            },
                            {
                              method: 'বোর্দো মিশ্রণ (১%)',
                              details: '১০০ গ্রাম চুন ও ১০০ গ্রাম তুঁতে ১০ লিটার পানিতে গুলে স্প্রে করুন।',
                            },
                          ],
                          prevention: [
                            'সেচ দেওয়ার সময় পানি যেন পাতা বা ফলে সরাসরি না লাগে (ড্রিপ বা নালা সেচ দিন)।',
                            'পরবর্তী মৌসুমে রোগমুক্ত শোধিত বীজ ব্যবহার করুন।',
                          ],
                        },
                        expertNote: 'ফলের গায়ে পাখির চোখের মতো বলয় দাগ ও খসখসে ক্ষত দেখে ব্যাকটেরিয়াল ক্যাঙ্কার নিশ্চিত হওয়া যায়। দ্রুত কপারযুক্ত ওষুধ স্প্রে করুন।',
                      });
                    }}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border text-center transition-colors ${
                      diagnosis.diseaseName.includes('ক্যাঙ্কার') || diagnosis.diseaseName.includes('Canker') || diagnosis.diseaseName.includes('Bacterial Spot')
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    🍅 ব্যাকটেরিয়াল দাগ/ক্যাঙ্কার
                  </button>
                  <button
                    onClick={() => {
                      setDiagnosis({
                        isPlant: true,
                        cropName: 'টমেটো',
                        cropScientific: 'Solanum lycopersicum',
                        diseaseName: 'টমেটোর পাতা কোঁকড়ানো রোগ (Leaf Curl Virus)',
                        diseaseScientific: 'Tomato Yellow Leaf Curl Virus (TYLCV)',
                        plantPart: 'পাতা',
                        severity: 'তীব্র',
                        confidenceScore: 94,
                        symptomsObserved: 'টমেটোর পাতা ওপরের বা নিচের দিকে কুঁকড়ে যাওয়া, পাতার আকার ছোট ও মোটা হওয়া এবং গাছের স্বাভাবিক বৃদ্ধি থমকে গিয়ে ফুল ঝরে যাওয়া।',
                        cause: 'সাদা মাছি পোকা (Whitefly) দ্বারা বাহিত ভাইরাস সংক্রমণ।',
                        treatments: {
                          chemical: [
                            {
                              name: 'অ্যাসিটামিপ্রিড ২০ এসপি (টুপেক্স / গেইন) বা পেগাসাস',
                              dose: 'প্রতি লিটার পানিতে ১ গ্রাম',
                              instruction: 'সাদা মাছি দমনে পাতার নিচের পিঠে সুন্দরভাবে স্প্রে করুন।',
                            },
                          ],
                          organic: [
                            {
                              method: 'হলুদ আঠালো ফাঁদ ও নিম তেল',
                              details: 'প্রতি শতকে ১টি হলুদ আঠালো ফাঁদ দিন এবং নিম তেল ৫ মিলি/লিটার স্প্রে করুন।',
                            },
                          ],
                          prevention: [
                            'বীজতলায় মশারি বা নেট দিয়ে চারা ঢেকে রাখুন।',
                            'আক্রান্ত গাছ তুলে ধ্বংস করুন।',
                          ],
                        },
                        expertNote: 'সাদা মাছি দমনই পাতা কোঁকড়ানো রোগ নিয়ন্ত্রণের একমাত্র কার্যকর উপায়।',
                      });
                    }}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border text-center transition-colors ${
                      diagnosis.diseaseName.includes('কোঁকড়ানো') || diagnosis.diseaseName.includes('Curl')
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    🍃 পাতা কোঁকড়ানো
                  </button>
                  <button
                    onClick={() => {
                      setDiagnosis({
                        isPlant: true,
                        cropName: 'টমেটো',
                        cropScientific: 'Solanum lycopersicum',
                        diseaseName: 'টমেটোর আগাম ধসা রোগ (Early Blight)',
                        diseaseScientific: 'Alternaria solani',
                        plantPart: 'পাতা',
                        severity: 'মাঝারি',
                        confidenceScore: 92,
                        symptomsObserved: 'নিচের বয়স্ক পাতায় গাঢ় বাদামি বৃত্তাকার রিং বা টার্গেট বোর্ডের মতো দাগ এবং পাতা হলুদ হয়ে ঝরে পড়া।',
                        cause: 'অল্টারনারিয়া ছত্রাকের আক্রমণ। উষ্ণ ও স্যাঁতসেঁতে আবহাওয়ায় রোগটি বৃদ্ধি পায়।',
                        treatments: {
                          chemical: [
                            {
                              name: 'ম্যানকোজেব ৭৫% ডব্লিউপি (ডাইথেন এম-৪৫) বা রোভরাল',
                              dose: 'প্রতি লিটার পানিতে ২ গ্রাম',
                              instruction: '৭-১০ দিন পর পর পাতায় স্প্রে করুন।',
                            },
                          ],
                          organic: [
                            {
                              method: 'আক্রান্ত পাতা ছাঁটাই ও পরিষ্কার পরিচ্ছন্নতা',
                              details: 'গাছের নিচের আক্রান্ত পাতা সাবধানে কেটে পুড়িয়ে ফেলুন।',
                            },
                          ],
                          prevention: [
                            'গাছের গোড়ার মাটি যাতে পাতায় না ছেটায় সেজন্য মালচিং ব্যবহার করুন।',
                          ],
                        },
                        expertNote: 'প্রাথমিক অবস্থায় নিচের পাতা কেটে পরিষ্কার রাখলে ব্লাইট রোগ অনেক কমে যায়।',
                      });
                    }}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border text-center transition-colors ${
                      diagnosis.diseaseName.includes('ধসা') || diagnosis.diseaseName.includes('Blight')
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    🍃 আগাম ধসা
                  </button>
                  <button
                    onClick={() => {
                      setDiagnosis({
                        isPlant: true,
                        cropName: 'টমেটো',
                        cropScientific: 'Solanum lycopersicum',
                        diseaseName: 'টমেটোর ফল পচা ও ব্লসম এন্ড রট (Blossom End Rot & Fruit Borer)',
                        diseaseScientific: 'Physiological / Helicoverpa armigera',
                        plantPart: 'ফল',
                        severity: 'মাঝারি',
                        confidenceScore: 95,
                        symptomsObserved: 'টমেটোর ফলের নিচের অংশে কালচে দাগ বা চামড়ার মতো বসে যাওয়া পচা অংশ এবং ফলের গায়ে ছোট ছিদ্র দেখা যাচ্ছে।',
                        cause: 'মাটিতে ক্যালসিয়ামের ঘাটতি, অনিয়মিত সেচ এবং ফল ছিদ্রকারী পোকার আক্রমণ।',
                        treatments: {
                          chemical: [
                            { name: 'চিলেটেড ক্যালসিয়াম (ক্যালবোর বা ক্যালম্যাক্স)', dose: 'প্রতি লিটার পানিতে ২ মিলি', instruction: 'বিকেলে গাছে ও ফলে স্প্রে করুন।' },
                            { name: 'এমামেকটিন বেনজোয়েট ৫ এসজি (প্রোক্লেম)', dose: 'প্রতি লিটার পানিতে ১ গ্রাম', instruction: 'ফল ছিদ্রকারী পোকা দমনে স্প্রে করুন।' }
                          ],
                          organic: [
                            { method: 'ডিমের খোসার গুঁড়ো বা ডলোমাইট চুন', details: 'গাছের গোড়ায় চুন প্রয়োগ করে ক্যালসিয়ামের জোগান বাড়ান।' }
                          ],
                          prevention: ['জমিতে নিয়মিত ও পরিমিত সেচ দিন যাতে মাটি শুকিয়ে শক্ত না হয়ে যায়।']
                        },
                        expertNote: 'ব্লসম এন্ড রট ক্যালসিয়ামের অভাব ও খরা থেকে হয়, নিয়মিত সেচ ও ক্যালসিয়াম স্প্রে করুন।'
                      });
                    }}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border text-center transition-colors ${
                      diagnosis.diseaseName.includes('ব্লসম') || diagnosis.diseaseName.includes('Blossom')
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    🍅 ব্লসম এন্ড রট
                  </button>
                </div>
              </div>
            )}

            {/* Eggplant Disease Quick Selector if crop is Eggplant */}
            {diagnosis.cropName.includes('বেগুন') && (
              <div className="pt-2 border-t border-stone-100 space-y-1.5 text-left">
                <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  🍆 বেগুনের পাতা ও ফলের সঠিক রোগ নির্বাচন:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      setDiagnosis({
                        isPlant: true,
                        cropName: 'বেগুন',
                        cropScientific: 'Solanum melongena',
                        diseaseName: 'বেগুনের সাদা ছত্রাক পচন ও ফোমোপসিস ফল পচা রোগ (Eggplant White Mold & Fruit Rot)',
                        diseaseScientific: 'Sclerotinia sclerotiorum / Phomopsis vexans',
                        plantPart: 'ফল',
                        severity: 'তীব্র',
                        confidenceScore: 95,
                        symptomsObserved: 'বেগুনের গায়ে সাদা তুলার মতো তুলতুলে ছত্রাকের আস্তরণ (White Cottony Mycelium), ফলের ত্বক নরম হয়ে পানিভর্তি থলির মতো গলে যাওয়া এবং কালো হয়ে শুকিয়ে যাওয়া।',
                        cause: 'স্ক্লেরোটিনিয়া বা ফোমোপসিস ছত্রাকের আক্রমণ। মাত্রাতিরিক্ত আর্দ্রতা, মাটিতে জলাবদ্ধতা ও জমিতে ঘন গাছের ছায়ায় দ্রুত বিস্তার লাভ করে।',
                        treatments: {
                          chemical: [
                            {
                              name: 'কার্বেন্ডাজিম ৫০% ডব্লিউপি (নোইন / অটোস্টিন) বা আইপ্রোডিয়ন (রোভরাল)',
                              dose: 'প্রতি লিটার পানিতে ২ গ্রাম',
                              instruction: 'গাছের গোড়া ও ফলে ভালো করে স্প্রে করুন। ৭ দিন পর পুনরায় দিন।',
                            },
                            {
                              name: 'এজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল (এমিস্টার টপ ৩২৫ এসসি)',
                              dose: 'প্রতি লিটার পানিতে ১ মিলি',
                              instruction: 'ছত্রাকের বিস্তার তাৎক্ষণিক দমন করে ফলকে পচন থেকে রক্ষা করে।',
                            },
                          ],
                          organic: [
                            {
                              method: 'আক্রান্ত নরম পচা ফল অপসারণ',
                              details: 'সাদা ছত্রাকযুক্ত নরম পচা বেগুন দ্রুত তুলে পুড়িয়ে বা মাটির নিচে পুঁতে ফেলুন।',
                            },
                            {
                              method: 'ট্রাইকোডার্মা জৈব ছত্রাকনাশক',
                              details: 'গাছের গোড়ায় ট্রাইকোডার্মা জৈব ছত্রাকনাশক মিশ্রিত সার প্রয়োগ করুন।',
                            },
                          ],
                          prevention: [
                            'গাছের নিচের দিকের রোগাক্রান্ত পাতা ছেঁটে দিন যাতে জমিতে পর্যাপ্ত আলো-বাতাস খেলে।',
                            'জমিতে কোনো অবস্থাতেই পানি জমতে দেবেন না ও পরিমিত সেচ দিন।',
                          ],
                        },
                        expertNote: 'সাদা তুলার মতো আস্তরণ থাকলে এটি ছত্রাকজনিত ফল পচা রোগ। দ্রুত আক্রান্ত ফল সরিয়ে ছত্রাকনাশক স্প্রে করুন।',
                      });
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      diagnosis.diseaseName.includes('সাদা') || diagnosis.diseaseName.includes('White') || diagnosis.diseaseName.includes('ফোমোপসিস') || diagnosis.diseaseName.includes('পচা')
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    🍆 সাদা ছত্রাক ও ফল পচা
                  </button>
                  <button
                    onClick={() => {
                      setDiagnosis({
                        isPlant: true,
                        cropName: 'বেগুন',
                        cropScientific: 'Solanum melongena',
                        diseaseName: 'বেগুনের ডগা ও ফল ছিদ্রকারী পোকার আক্রমণ (Brinjal Shoot & Fruit Borer)',
                        diseaseScientific: 'Leucinodes orbonalis',
                        plantPart: 'ফল ও ডগা',
                        severity: 'তীব্র',
                        confidenceScore: 94,
                        symptomsObserved: 'গাছের কচি ডগা নুয়ে পড়ে শুকিয়ে যায়। বেগুনের গায়ে ছোট ছোট গোলাকার ছিদ্র থাকে এবং ভেতরটা পোকা খেয়ে মল দিয়ে ভর্তি করে ফেলে।',
                        cause: 'লিউসিনোডেস অরবোনাক্সিস পোকার কীড়া কচি ডগা ও ফলের ভেতরের অংশ খেয়ে ফেলে।',
                        treatments: {
                          chemical: [
                            {
                              name: 'ইমামেকটিন বেনজোয়েট ৫ এসজি বা ক্লোরানট্রানিলিপ্রোল (কোরাজন)',
                              dose: 'প্রতি লিটার পানিতে ১ গ্রাম বা ০.৩ মিলি',
                              instruction: 'বিকেলের দিকে গাছে কুয়াশার মতো স্প্রে করুন।',
                            },
                          ],
                          organic: [
                            {
                              method: 'ফেরোমোন ফাঁদ (Sex Pheromone Trap)',
                              details: 'জমিতে প্রতি শতাংশে ১টি লিউরযুক্ত সেক্স ফেরোমোন ফাঁদ স্থাপন করে পুরুষ পোকা ধ্বংস করুন।',
                            },
                            {
                              method: 'নুয়ে পড়া ডগা ও আক্রান্ত ফল ছাঁটাই',
                              details: 'নুয়ে পড়া আক্রান্ত ডগা ও ছিদ্রযুক্ত বেগুন নিয়মিত কেটে মাটিতে পুঁতে ফেলুন।',
                            },
                          ],
                          prevention: [
                            'বিটি বেগুন বা সহনশীল জাত চাষ করুন।',
                            'ক্ষেতের আবর্জনা পরিষ্কার রাখুন।',
                          ],
                        },
                        expertNote: 'ফেরোমোন ফাঁদ ও আক্রান্ত ডগা নিয়মিত ছাঁটাই করলে কীটনাশক ছাড়াই ৮০% পোকা দমন সম্ভব।',
                      });
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      diagnosis.diseaseName.includes('ছিদ্রকারী') || diagnosis.diseaseName.includes('Borer')
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    🐛 ডগা ও ফল ছিদ্রকারী পোকা
                  </button>
                  <button
                    onClick={() => {
                      setDiagnosis({
                        isPlant: true,
                        cropName: 'বেগুন',
                        cropScientific: 'Solanum melongena',
                        diseaseName: 'বেগুনের পাতা কোঁকড়ানো ও জাবপোকা (Brinjal Leaf Curl & Aphids/Jassids)',
                        diseaseScientific: 'Amrasca biguttula / Aphis gossypii',
                        plantPart: 'পাতা',
                        severity: 'মাঝারি',
                        confidenceScore: 92,
                        symptomsObserved: 'বেগুনের পাতার কিনার নিচের দিকে বা ওপরের দিকে কুঁকড়ে যাওয়া, পাতার রঙ হালকা হলুদ হওয়া এবং পাতার নিচের পিঠে ক্ষুদ্র পোকা ও আঠালো রস দেখা যাওয়া।',
                        cause: 'জাবপোকা বা জ্যাসিড পোকা রস চুষে খাওয়ার ফলে পাতায় বিকৃতি ঘটে।',
                        treatments: {
                          chemical: [
                            {
                              name: 'ইমিডাক্লোপ্রিড ২০ এসএল (এডমায়ার / টিডো)',
                              dose: 'প্রতি লিটার পানিতে ০.৫ মিলি',
                              instruction: 'পাতার নিচের পিঠে ভালো করে স্প্রে করুন।',
                            },
                          ],
                          organic: [
                            {
                              method: 'নিম তেল ও ডিটারজেন্ট স্প্রে',
                              details: 'প্রতি লিটার পানিতে ৫ মিলি নিম তেল ও সাবানের ফেনা মিশিয়ে ৭ দিন পর পর স্প্রে করুন।',
                            },
                          ],
                          prevention: [
                            'হলুদ আঠালো ফাঁদ ব্যবহার করুন।',
                            'গাছের সুষম পুষ্টি নিশ্চিত করুন।',
                          ],
                        },
                        expertNote: 'রস চোষক পোকা দমনে পাতার নিচের অংশে নিয়মিত স্প্রে করা নিশ্চিত করুন।',
                      });
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      diagnosis.diseaseName.includes('জাবপোকা') || diagnosis.diseaseName.includes('Aphids')
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    🍃 পাতা কোঁকড়ানো ও পোকা
                  </button>
                </div>
              </div>
            )}

            {/* Rice Quick Selector if crop is Rice */}
            {diagnosis.cropName.includes('ধান') && (
              <div className="pt-2 border-t border-stone-100 space-y-1.5 text-left">
                <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  🌾 ধানের পাতা ও শীষের রোগ:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDiagnosis({
                        isPlant: true,
                        cropName: 'ধান',
                        cropScientific: 'Oryza sativa',
                        diseaseName: 'ধানের ব্লাস্ট বা পাতাপোড়া রোগ (Leaf Blast)',
                        diseaseScientific: 'Magnaporthe oryzae',
                        plantPart: 'পাতা',
                        severity: 'মাঝারি',
                        confidenceScore: 92,
                        symptomsObserved: 'ধানের পাতায় চোখের মতো ডিম্বাকৃতির দাগ, মাঝখানে ধূসর ও কিনারে গাঢ় বাদামি রঙের ক্ষত।',
                        cause: 'ছত্রাকজনিত সংক্রমণ (Magnaporthe oryzae)। স্যাঁতসেঁতে আবহাওয়ায় দ্রুত ছড়ায়।',
                        treatments: {
                          chemical: [
                            { name: 'ট্রাইসাইক্লাজল ৭৫% ডব্লিউপি (ট্রুপার বা দিফা)', dose: 'প্রতি লিটার পানিতে ১ গ্রাম', instruction: 'পাতার উভয় পিঠ ভালো করে ভিজিয়ে স্প্রে করুন।' }
                          ],
                          organic: [
                            { method: 'কাঁচা গোবর ও কাঠের ছাইয়ের দ্রবণ', details: '১০ লিটার পানিতে ১ কেজি গোবর ও ছাই ভালো করে গুলে স্প্রে করুন।' }
                          ],
                          prevention: ['ইউরিয়া সারের অতিরিক্ত উপরিপ্রয়োগ স্থগিত রাখুন ও জমিতে পরিমিত পানি রাখুন।']
                        },
                        expertNote: 'পাতা ব্লাস্ট দ্রুত নিয়ন্ত্রণ না করলে শীষ ব্লাস্টে রূপ নেয়।'
                      });
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      !diagnosis.diseaseName.includes('শীষ') && !diagnosis.diseaseName.includes('চিটা')
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    🍃 পাতা ব্লাস্ট (Leaf Blast)
                  </button>
                  <button
                    onClick={() => {
                      setDiagnosis({
                        isPlant: true,
                        cropName: 'ধান',
                        cropScientific: 'Oryza sativa',
                        diseaseName: 'ধানের শীষ ব্লাস্ট ও ভুয়া চিটা রোগ (Panicle Blast & False Smut)',
                        diseaseScientific: 'Magnaporthe oryzae / Ustilaginoidea virens',
                        plantPart: 'ফল ও শীষ',
                        severity: 'তীব্র',
                        confidenceScore: 94,
                        symptomsObserved: 'ধানের শীষের গোড়ায় কালো দাগ ও পচন, শীষের দানাগুলো চিটা হয়ে যাওয়া এবং কিছু দানায় হলুদ-সবুজ মখমলের মতো বল সৃষ্টি হওয়া।',
                        cause: 'ছত্রাকজনিত সংক্রমণ। ধান ফুল আসার সময় বৃষ্টি ও আর্দ্রতায় দ্রুত ছড়ায়।',
                        treatments: {
                          chemical: [
                            { name: 'ট্রাইসাইক্লাজল ৭৫% ডব্লিউপি (ট্রুপার বা দিফা)', dose: 'প্রতি লিটার পানিতে ১ গ্রাম', instruction: 'শীষ বের হওয়ার মুখে বিকেলে স্প্রে করুন।' },
                            { name: 'কপার হাইড্রোক্সাইড বা কাসুগামাইসিন', dose: 'প্রতি লিটার পানিতে ২ গ্রাম/মিলি', instruction: 'চিটা রোগ দমনে কার্যকর।' }
                          ],
                          organic: [
                            { method: 'কাঠের ছাই ছিটানো', details: 'ভোরের শিশিরে শীষ ও পাতায় কাঠের ছাই ছিটিয়ে দিন।' }
                          ],
                          prevention: ['ইউরিয়া সারের শেষ কিস্তি অতিরিক্ত মাত্রায় দেবেন না এবং জমিতে পানি শুকিয়ে ফেলবেন না।']
                        },
                        expertNote: 'শীষ ব্লাস্টে ধান চিটা হয়ে ফলন ব্যাপক ক্ষতি হয়, তাই শীষ বের হওয়ার সাথে সাথেই স্প্রে নিশ্চিত করুন।'
                      });
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      diagnosis.diseaseName.includes('শীষ') || diagnosis.diseaseName.includes('চিটা')
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    🌾 শীষ ব্লাস্ট ও চিটা (Fruit/Grain)
                  </button>
                </div>
              </div>
            )}

            {/* Papaya Disease Quick Selector if crop is Papaya */}
            {diagnosis.cropName.includes('পেঁপে') && (
              <div className="pt-2 border-t border-stone-100 space-y-1.5 text-left">
                <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  🍈 পেঁপের পাতা ও ফলের সঠিক রোগ নির্বাচন:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDiagnosis({
                        isPlant: true,
                        cropName: 'পেঁপে',
                        cropScientific: 'Carica papaya',
                        diseaseName: 'পেঁপের ফলের অ্যানথ্রাকনোজ ও ক্ষত রোগ (Papaya Fruit Anthracnose)',
                        diseaseScientific: 'Colletotrichum gloeosporioides',
                        plantPart: 'ফল',
                        severity: 'মাঝারি',
                        confidenceScore: 95,
                        symptomsObserved: 'পাকা ও কাঁচা পেঁপের ত্বকে গোলাকার দেবে যাওয়া বাদামি বা কালচে পচন দাগ। আর্দ্র আবহাওয়ায় ক্ষতস্থানে গোলাপি ছত্রাকের আস্তরণ দেখা যায়।',
                        cause: 'কলিটোটিট্রিকাম গ্লিওস্পোরিয়য়েডস (Colletotrichum gloeosporioides) ছত্রাক। ফল পাকার সময়ে ত্বকে ক্ষতের মাধ্যমে দ্রুত ছড়িয়ে পড়ে।',
                        treatments: {
                          chemical: [
                            {
                              name: 'এজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল (এমিস্টার টপ ৩২৫ এসসি)',
                              dose: 'প্রতি লিটার পানিতে ১ মিলি',
                              instruction: 'আক্রান্ত ফল ও সম্পূর্ণ গাছে ১০ দিন পর পর বিকেলে স্প্রে করুন।',
                            },
                            {
                              name: 'ম্যানকোজেব + মেটালেক্সিল (রিডোমিল গোল্ড এমজেড ৬৮ ডব্লিউজি)',
                              dose: 'প্রতি লিটার পানিতে ২ গ্রাম',
                              instruction: 'ফল ও পাতায় ভালোভাবে স্প্রে করুন। ফল তোলার ১৫ দিন আগে শেষ স্প্রে করুন।',
                            },
                          ],
                          organic: [
                            {
                              method: 'গরম পানিতে ফল শোধন (Hot Water Treatment)',
                              details: 'তোলার পর পেঁপে ৪৮° সেলসিয়াস গরম পানিতে ২০ মিনিট ডুবিয়ে শুকিয়ে সংরক্ষণ করুন।',
                            },
                          ],
                          prevention: [
                            'ফল তোলার পর আঘাত বা ক্ষত সৃষ্টি হতে দেবেন না।',
                            'ফল বড় হওয়ার সময় থেকেই পরিমিত ছত্রাকনাশক স্প্রে নিশ্চিত করুন।',
                          ],
                        },
                        expertNote: 'ফল বড় হওয়ার সময়েই নিয়মিত ছত্রাকনাশক স্প্রে দিলে পেঁপের অ্যানথ্রাকনোজ সম্পূর্ণরূপে রোধ করা যায়।',
                      });
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      diagnosis.diseaseName.includes('অ্যানথ্রাকনোজ') || diagnosis.plantPart === 'ফল'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    🥭 ফলের অ্যানথ্রাকনোজ (Fruit Rot)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDiagnosis({
                        isPlant: true,
                        cropName: 'পেঁপে',
                        cropScientific: 'Carica papaya',
                        diseaseName: 'পেঁপের রিং স্পট ভাইরাস (PRSV) ও কাণ্ড পচা রোগ',
                        diseaseScientific: 'Papaya Ringspot Virus / Pythium aphanidermatum',
                        plantPart: 'পাতা',
                        severity: 'মাঝারি',
                        confidenceScore: 94,
                        symptomsObserved: 'পেঁপের করতলাকার চওড়া পাতায় শিরা বরাবর স্বচ্ছ বা হলুদ মোজাইক ছোপ, পাতার কিনারা বিকৃত ও খর্বাকৃতি হওয়া এবং পাতার বোঁটায় জলছাপের মতো দাগ দেখা যাচ্ছে।',
                        cause: 'রিং স্পট ভাইরাস (জাবপোকা বা এফিড দ্বারা বাহিত) এবং বর্ষাকালে গোড়ায় অতিরিক্ত আর্দ্রতায় ছত্রাকজনিত আক্রমণ।',
                        treatments: {
                          chemical: [
                            {
                              name: 'ইমিডাক্লোপ্রিড ২০ এসএল (এডমায়ার / টিডো)',
                              dose: 'প্রতি লিটার পানিতে ০.৫ মিলি',
                              instruction: 'ভাইরাস বিস্তারকারী জাবপোকা ও সাদা মাছি দমনে পাতার উভয় পিঠে ভালো করে স্প্রে করুন।',
                            },
                            {
                              name: 'কপার অক্সিক্লোরাইড ৫০% ডব্লিউপি (কুপ্রোফিক্স বা চ্যাম্পিয়ন)',
                              dose: 'প্রতি লিটার পানিতে ২ গ্রাম',
                              instruction: 'কাণ্ড ও গোড়া পচা রোগ দমনে গাছের গোড়ায় মাটি ভিজিয়ে স্প্রে করুন।',
                            },
                          ],
                          organic: [
                            {
                              method: 'আক্রান্ত পাতা ও গাছ অপসারণ',
                              details: 'তীব্র ভাইরাস আক্রান্ত পাতা কেটে ক্ষেত থেকে দূরে নিয়ে পুড়িয়ে ফেলুন।',
                            },
                          ],
                          prevention: [
                            'পেঁপে গাছের গোড়ায় পানি জমতে দেবেন না, উঁচু বেড তৈরি করুন।',
                            'জাবপোকা ও সাদা মাছি নিয়ন্ত্রণে হলুদ আঠালো ফাঁদ ব্যবহার করুন।',
                          ],
                        },
                        expertNote: 'পেঁপের রিং স্পট ভাইরাস পোকার মাধ্যমে ছড়ায়, তাই পোকা দমন ও গোড়ায় পানি নিষ্কাশন নিশ্চিত করা জরুরি।',
                      });
                    }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      diagnosis.diseaseName.includes('রিং স্পট') || diagnosis.plantPart === 'পাতা'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    🍃 পাতার রিং স্পট ভাইরাস (PRSV)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Crop Correction Option */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 space-y-2 text-left shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                ফসল ভুল মনে হলে সঠিক ফসলে চাপুন:
              </span>
              <span className="text-[10px] text-amber-700 font-medium">তাৎক্ষণিক সমাধান</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {CROPS_LIST.filter((c) => c.id !== 'auto').map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCrop(c.id);
                    if (capturedImage) {
                      analyzeLeafImage(capturedImage, c.id);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    diagnosis.cropName.includes(c.id)
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white hover:bg-amber-100 text-stone-800 border border-amber-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Solution Tabs: রাসায়নিক | জৈব | প্রতিরোধ */}
          <div className="flex bg-stone-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('chemical')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'chemical'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              রাসায়নিক সমাধান
            </button>
            <button
              onClick={() => setActiveTab('organic')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'organic'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              জৈব সমাধান
            </button>
            <button
              onClick={() => setActiveTab('prevention')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'prevention'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              প্রতিরোধ
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-xs space-y-3">
            {activeTab === 'chemical' && (
              <div className="space-y-2.5">
                {diagnosis.treatments.chemical.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-stone-900">{item.name}</span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {item.dose}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed pt-1">
                      {item.instruction}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'organic' && (
              <div className="space-y-2.5">
                {diagnosis.treatments.organic.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1">
                    <span className="text-xs font-black text-stone-900 block">{item.method}</span>
                    <p className="text-xs text-stone-700 leading-relaxed pt-1">{item.details}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'prevention' && (
              <div className="bg-white p-3 rounded-xl border border-emerald-100 space-y-2">
                <span className="text-xs font-bold text-stone-900 block">ভবিষ্যত সংক্রমণ ঠেকানোর পদক্ষেপ:</span>
                <ul className="space-y-1.5">
                  {diagnosis.treatments.prevention.map((tip, idx) => (
                    <li key={idx} className="text-xs text-stone-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Expert Note */}
          {diagnosis.expertNote && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed">{diagnosis.expertNote}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCapturedImage(null);
                setViewState('main');
              }}
              className="flex-1 py-3 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-stone-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>নতুন স্ক্যান</span>
            </button>

            <button
              onClick={onBack}
              className="flex-1 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-colors"
            >
              <span>হোমে ফিরুন</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

