import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Send,
  RotateCcw,
  Mic,
  MicOff,
  User,
  AlertCircle,
  Loader2,
  Radio,
  Check,
  History,
  Cloud,
  X,
  MessageSquare,
} from 'lucide-react';
import {
  saveChatInquiryToFirestore,
  getRecentChatInquiries,
  FirebaseChatInquiry,
} from '../lib/firebase';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  model?: string;
}

interface Props {
  onBack: () => void;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-welcome',
    sender: 'bot',
    text: 'আসসালামু আলাইকুম! আমি আপনার কৃষি বন্ধু AI। ফসলের রোগবালাই, সার-কীটনাশকের সঠিক মাত্রা, সেচ বা ফলন বৃদ্ধির বিষয়ে যেকোনো প্রশ্ন লিখে বা নিচে মাইক চিহ্নে চাপ দিয়ে মুখে বলে আমাকে জিজ্ঞেস করতে পারেন।',
    time: 'এইমাত্র',
  },
];

const SUGGESTED_QUESTIONS = [
  '🌾 ধানের পাতা হলুদ হচ্ছে কেন ও প্রতিকার কী?',
  '🥔 আলুর নাবি ধসা রোগের দ্রুত চিকিৎসা কী?',
  '🧪 ১ বিঘা জমিতে ইউরিয়া ও পটাশের সঠিক মাত্রা',
  '🐛 ধানের মাজরা পোকা দমনে কোন ওষুধ দিব?',
  '🌧️ বৃষ্টির দিনে কোন স্প্রে বন্ধ রাখা উচিত?',
];

const CHAT_STORAGE_KEY = 'krishi_chat_messages_history_v1';

const detectCropName = (text: string): string => {
  if (text.includes('ধান')) return 'ধান';
  if (text.includes('গম')) return 'গম';
  if (text.includes('ভুট্টা')) return 'ভুট্টা';
  if (text.includes('আলু')) return 'আলু';
  if (text.includes('সরিষা')) return 'সরিষা';
  if (text.includes('টমেটো')) return 'টমেটো';
  if (text.includes('বেগুন')) return 'বেগুন';
  if (text.includes('ফুলকপি')) return 'ফুলকপি';
  if (text.includes('পেঁপে')) return 'পেঁপে';
  if (text.includes('কলা')) return 'কলা';
  if (text.includes('পান')) return 'পান';
  return 'সাধারণ ফসল';
};

export const AIChatBotScreen: React.FC<Props> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CHAT_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Chat cache read notice:', err);
      }
    }
    return INITIAL_MESSAGES;
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [savedInquiries, setSavedInquiries] = useState<FirebaseChatInquiry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isListening]);

  // Persist conversations to localStorage whenever messages state updates
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch (err) {
        console.warn('Local save notice:', err);
      }
    }
  }, [messages]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsLoading(true);
    setVoiceError(null);

    try {
      // Build conversation history
      const history = messages
        .filter((m) => m.id !== 'msg-welcome')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          text: m.text,
        }));

      const savedDistrict = localStorage.getItem('krishi_farmer_district') || 'dhaka';
      const locationLabel = savedDistrict === 'dhaka' ? 'ঢাকা, বাংলাদেশ' : `${savedDistrict}, বাংলাদেশ`;

      let botReply = '';
      let usedModel = '';

      try {
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 4200);

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: query, history, location: locationLabel }),
          signal: abortController.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.reply) {
            botReply = data.reply;
            usedModel = data.model || 'krishi-ai';
          }
        }
      } catch (fetchErr) {
        console.warn('Backend /api/chat error or timeout, activating instant agricultural engine:', fetchErr);
      }

      // If backend was unreachable or returned empty (e.g. Vercel static build or missing API key)
      if (!botReply) {
        botReply = getAgriculturalExpertReply(query, locationLabel);
        usedModel = 'কৃষি বিশেষজ্ঞ সহকারী (অফলাইন/ব্যাকআপ)';
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        model: usedModel,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Save consultation into Cloud Firestore (/chat_inquiries)
      const farmerPhone = localStorage.getItem('krishi_farmer_phone') || 'guest';
      const farmerName = localStorage.getItem('krishi_farmer_name') || 'কৃষক ভাই';
      saveChatInquiryToFirestore({
        farmerId: farmerPhone,
        farmerName,
        question: query,
        answer: botReply,
        detectedCrop: detectCropName(query),
        model: usedModel,
      }).catch((err) => console.warn('Firestore inquiry save notice:', err));
    } catch (error) {
      console.error('Chat error:', error);
      const fallbackReply = getAgriculturalExpertReply(query, 'বাংলাদেশ');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: fallbackReply,
        time: 'এইমাত্র',
        model: 'কৃষি বিশেষজ্ঞ (ব্যাকআপ)',
      };
      setMessages((prev) => [...prev, errorMessage]);

      const farmerPhone = localStorage.getItem('krishi_farmer_phone') || 'guest';
      const farmerName = localStorage.getItem('krishi_farmer_name') || 'কৃষক ভাই';
      saveChatInquiryToFirestore({
        farmerId: farmerPhone,
        farmerName,
        question: query,
        answer: fallbackReply,
        detectedCrop: detectCropName(query),
        model: 'কৃষি বিশেষজ্ঞ (ব্যাকআপ)',
      }).catch((err) => console.warn('Firestore fallback save notice:', err));
    } finally {
      setIsLoading(false);
    }
  };

  // Comprehensive Agricultural Expert Engine (runs 100% reliably even on Vercel without backend)
  const getAgriculturalExpertReply = (queryText: string, location: string): string => {
    const lower = queryText.toLowerCase();

    if (
      lower.includes('ভুট্টা') ||
      lower.includes('কান্ড পচা') ||
      lower.includes('কান্ডপচা') ||
      lower.includes('stem rot') ||
      lower.includes('stalk rot') ||
      lower.includes('diplodia') ||
      lower.includes('fusarium')
    ) {
      return `🌽 ভুট্টার কান্ড পচা ও গোড়া পচা রোগ (Stem Rot Disease of Maize):

📌 কারণ ও জীবাণু:
এটি ডিপ্লোডিয়া (*Diplodia maydis*) এবং ফিউজারিয়াম (*Fusarium moniliforme*) ছত্রাক দ্বারা ঘটে থাকে। অতিরিক্ত বৃষ্টিপাত, জলাবদ্ধতা বা মোচায় দানা আসার সময় খরা হলে এ রোগের আক্রমণ মারাত্মক আকার ধারণ করে।

🔍 প্রধান লক্ষণসমূহ:
১. কাণ্ডের নিচের দিকের গিঁট কালচে-বাদামি ও খড় বর্ণের হয়ে পচে যাওয়া।
২. কাণ্ডের ভেতরের মজ্জা (pith) নষ্ট হয়ে ফাঁপা ও ভঙ্গুর হয়ে যায়।
৩. সামান্য বাতাসেই গাছ গোড়া বা কাণ্ড থেকে ভেঙে মাটিতে লুটিয়ে পড়ে।
৪. মোচায় অপুষ্ট, কুঁচকানো দানা তৈরি হয়।

🛡️ অনুমোদিত রাসায়নিক দমন:
• কার্বেন্ডাজিম ৫০% ডব্লিউপি (যেমন: নোইন বা অটোস্টিন) অথবা থায়োফেনেট মিথাইল (রোকো) প্রতি লিটার পানিতে ২ গ্রাম হারে কাণ্ড ও গোড়ার মাটি ভিজিয়ে স্প্রে করুন।
• অথবা অ্যাজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল (যেমন: এমিস্টার টপ ৩২৫ এসসি) প্রতি লিটার পানিতে ১ মিলি হারে স্প্রে করুন।
• আক্রমণ বেশি হলে ৫-৭ দিন পর পুনরায় স্প্রে করুন।

🌿 কৃষি ও জৈব ব্যবস্থাপনা:
• বীজ বপনের পূর্বে প্রতি কেজি বীজে ৩ গ্রাম প্রভ্যাক্স ২০০ ডব্লিউপি বা ট্রাইকোডার্মা দিয়ে শোধন করুন।
• অতিরিক্ত ইউরিয়া পরিহার করে পর্যাপ্ত পটাশ (MOP) সার দিন যা কাণ্ড শক্ত রাখে।
• জমি থেকে দ্রুত বৃষ্টির পানি নিষ্কাশনের ড্রেন চালু রাখুন।`;
    }

    if (lower.includes('পেঁপে') || lower.includes('papaya') || lower.includes('রিং স্পট') || lower.includes('মোজাইক')) {
      return `🍈 পেঁপের রিং স্পট ভাইরাস (PRSV) ও কাণ্ড পচা রোগ প্রতিকার:

📌 লক্ষণ ও বিস্তার:
• রিং স্পট ভাইরাস মূলত জাবপোকা (Aphids) ও সাদা মাছি দ্বারা দ্রুত ছড়ায়। কচি পাতায় হলুদ-সবুজ মোজাইক ছোপ, পাতা বিকৃত ও কাণ্ডে বা পাতার বোঁটায় গাঢ় সবুজ তৈলাক্ত বা জলছাপ দাগ পড়ে।
• বর্ষাকালে গোড়ায় পানি জমলে কাণ্ড ও গোড়া পচা ছত্রাক আক্রমণ করে।

🛡️ প্রতিকার ও স্প্রে পরামর্শ:
১. ভাইরাস বিস্তারকারী পোকা দমনে ইমিডাক্লোপ্রিড ২০ এসএল (এডমায়ার / টিডো) প্রতি লিটার পানিতে ০.৫ মিলি হারে স্প্রে করুন।
২. কাণ্ড ও গোড়া পচা রোগ দমনে কপার অক্সিক্লোরাইড ৫০% ডব্লিউপি (কুপ্রোফিক্স বা চ্যাম্পিয়ন) প্রতি লিটার পানিতে ২ গ্রাম হারে গাছের গোড়ার মাটিতে স্প্রে করুন।
৩. তীব্র আক্রান্ত গাছ দ্রুত তুলে পুড়িয়ে ফেলুন এবং সবসময় উঁচু বেডে পেঁপে চাষ করুন যাতে গোড়ায় পানি না জমে।`;
    }

    if (lower.includes('ব্লাস্ট') || lower.includes('পাতাপোড়া') || (lower.includes('ধান') && (lower.includes('রোগ') || lower.includes('চিকিৎসা')))) {
      return `🌾 ধানের ব্লাস্ট বা পাতাপোড়া রোগের কার্যকর প্রতিকার:

১. জমিতে ইউরিয়া সারের উপরিপ্রয়োগ আপাতত বন্ধ রাখুন এবং বিঘাপ্রতি অতিরিক্ত ৫ কেজি এমওপি (পটাশ) সার প্রয়োগ করুন।
২. ট্রাইসাইক্লাজল ৭৫% ডব্লিউপি (যেমন: ট্রুপার বা দিফা) প্রতি লিটার পানিতে ১ গ্রাম হারে মিশিয়ে বিকেলে স্প্রে করুন।
৩. অথবা এ্যাজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল (যেমন: এমিস্টার টপ) প্রতি লিটার পানিতে ১ মিলি হারে স্প্রে করতে পারেন।
৪. জমিতে সবসময় ২-৩ ইঞ্চি পানি ধরে রাখুন, জমি শুকিয়ে ফেটে যেতে দেবেন না।`;
    }

    if (lower.includes('আলু') || lower.includes('ধসা') || lower.includes('লেট ব্লাইট') || lower.includes('ব্লাইট')) {
      return `🥔 আলুর নাবি ধসা (Late Blight) রোগ নিয়ন্ত্রণ:

১. কুয়াশাচ্ছন্ন ও মেঘলা আবহাওয়ায় রোগ দ্রুত ছড়ায়। লক্ষণ দেখা দিলে সেচ দেওয়া বন্ধ রাখুন।
২. প্রতি লিটার পানিতে ২ গ্রাম ম্যানকোজেব (যেমন: ডাইথেন এম-৪৫) অথবা মেনকোজেব + ফেনামিডন (সিকিউর) মিশিয়ে ৭-১০ দিন পর পর স্প্রে করুন।
৩. তীব্র আক্রমণে ডাইমেথোমর্ফ (অ্যাক্রোবেট এমজেড) প্রতি লিটার পানিতে ২ গ্রাম হারে স্প্রে করুন।
৪. স্প্রে করার সময় পাতার ওপর ও নিচ উভয় পাশ ভালোভাবে ভিজিয়ে দিন।`;
    }

    if (lower.includes('সার') || lower.includes('ইউরিয়া') || lower.includes('পটাশ') || lower.includes('টিএসপি') || lower.includes('ড্যাপ')) {
      return `🧪 সুষম সার ব্যবহারের নিয়মাবলী (বিঘা প্রতি ৩৩ শতক):

• আমন/বোরো ধানের জন্য: ইউরিয়া ৩৫-৪০ কেজি, টিএসপি/ডিএপি ১২-১৫ কেজি, এমওপি (পটাশ) ১৮-২০ কেজি, জিপসাম ৮-১০ কেজি এবং জিংক সালফেট ১.৫ কেজি।
• ইউরিয়া প্রয়োগের সঠিক কিস্তি:
  - ১ম কিস্তি: চারা রোপণের ১৫-২০ দিন পর।
  - ২য় কিস্তি: কুশি গজানোর সময় (রোপণের ৩০-৩৫ দিন পর)।
  - ৩য় কিস্তি: থোড় আসার ৫-৭ দিন পূর্বে।
• মনে রাখবেন: ডিএপি ব্যবহার করলে ইউরিয়া সারের পরিমাণ কিছুটা কমিয়ে দিতে হবে।`;
    }

    if (lower.includes('পোকা') || lower.includes('মাজরা') || lower.includes('লেদা') || lower.includes('বিছা') || lower.includes('ঘাসফড়িং')) {
      return `🐛 ফসলের পোকা দমনের আধুনিক সমন্বিত বালাই ব্যবস্থাপনা (IPM):

১. পার্চিং পদ্ধতি: ক্ষেতে বিঘাপ্রতি ৮-১০টি বাঁশের কঞ্চি বা ডালপালা পুঁতে দিন যাতে ফিঙে, শালিক ইত্যাদি পাখি বসে পোকা খেয়ে ফেলতে পারে।
২. আলোক ফাঁদ: রাতে ক্ষেতের পাশে আলোর নিচে কেরোসিন মিশ্রিত পানির পাত্র রেখে মাজরা ও গান্ধী পোকা দমন করুন।
৩. আক্রমণ বেশি হলে দানাদার কীটনাশক কার্বোফুরান ৫জি (যেমন: ফুরাডান) বিঘাপ্রতি ১.৫ কেজি প্রয়োগ করুন অথবা ভিরতাকো (থায়ামেথোক্সাম + ক্লোরান্ট্রানিলিপ্রোল) প্রতি লিটার পানিতে ০.৫ গ্রাম হারে স্প্রে করুন।`;
    }

    if (lower.includes('হলুদ') || lower.includes('পাতা')) {
      return `🌱 পাতা হলুদ হওয়ার প্রধান কারণ ও প্রতিকার:

১. নাইট্রোজেনের ঘাটতি: পুরো পাতা বিশেষ করে নিচের পাতা সমভাবে হালকা হলুদ হলে বিঘাপ্রতি ৫-৭ কেজি ইউরিয়া উপরিপ্রয়োগ করুন।
২. সালফারের (গন্ধক) ঘাটতি: গাছের ওপরের কচি পাতা আগে হলুদ হলে জিপসাম সার প্রয়োগ করতে হবে।
৩. দস্তার (জিংক) ঘাটতি: পাতার শিরা বরাবর বাদামি মরিচার মতো দাগ হলে চিলেটেড জিংক (যেমন: লিবরেল জিংক) প্রতি লিটার পানিতে ১ গ্রাম হারে স্প্রে করুন।
৪. অতিরিক্ত পানি জমে থাকলে ড্রেন তৈরি করে পানি নিষ্কাশনের ব্যবস্থা করুন।`;
    }

    if (lower.includes('সেচ') || lower.includes('পানি')) {
      return `💧 ফসলে আধুনিক সেচ ব্যবস্থাপনা:

১. ধানের কুশি পর্যায় ও থোড় আসার সময় জমিতে পর্যাপ্ত আর্দ্রতা নিশ্চিত করুন।
২. পর্যায়ক্রমিক ভিজানো ও শুকানো (AWD) পদ্ধতি ব্যবহার করলে সেচের পানির ২৫-৩০% সাশ্রয় হয়।
৩. বৃষ্টির সম্ভাবনা থাকলে সেচ দেওয়া থেকে বিরত থাকুন এবং ড্রেনগুলো পরিষ্কার রাখুন যাতে পানি জমতে না পারে।`;
    }

    return `👨‍🌾 কৃষি বন্ধু পরামর্শ:

আপনার জিজ্ঞাসার জন্য ধন্যবাদ। আপনার এলাকা (${location})-এর আবহাওয়া ও মাটির অবস্থা বিবেচনা করে:
১. জমিতে সুষম সার ব্যবহার করুন এবং মাত্রাতিরিক্ত ইউরিয়া পরিহার করুন।
২. কোনো ছত্রাকনাশক বা কীটনাশক ব্যবহারের পূর্বে মোড়কের গায়ে নির্দেশিত মাত্রা সতর্কতার সাথে পড়ে নিন।
৩. বিকেলের মিষ্টি রোদে স্প্রে করা সবচেয়ে কার্যকর এবং পরিবেশবান্ধব।
৪. আরও নির্দিষ্ট পরামর্শের জন্য আপনার ফসলের নাম ও লক্ষণ বিস্তারিত লিখে বা মুখে বলে জানান।`;
  };

  // Start Real Web Speech API or MediaRecorder Fallback
  const toggleVoiceInput = async () => {
    setVoiceError(null);

    // If currently listening, stop
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'bn-BD';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        let accumulatedTranscript = '';

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceError(null);
        };

        recognition.onresult = (event: any) => {
          let currentSessionText = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulatedTranscript += (accumulatedTranscript ? ' ' : '') + transcript;
            } else {
              currentSessionText += transcript;
            }
          }
          const fullText = (accumulatedTranscript + (currentSessionText ? ' ' + currentSessionText : '')).trim();
          if (fullText) {
            setInputText(fullText);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setVoiceError('মাইক্রোফোন ব্যবহারের অনুমতি নেই। ব্রাউজারে মাইক পারমিশন দিন।');
            setIsListening(false);
          } else if (event.error === 'no-speech') {
            // No speech detected, keep listening or stop gracefully
          } else if (event.error === 'network') {
            // Try recorder fallback if network recognition failed
            startMediaRecorderFallback();
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        return;
      } catch (err: any) {
        console.warn('Web speech failed to start, falling back to MediaRecorder:', err);
        startMediaRecorderFallback();
        return;
      }
    } else {
      // Browser doesn't support Web Speech API directly; use MediaRecorder + Gemini
      startMediaRecorderFallback();
    }
  };

  // MediaRecorder Fallback with Gemini Audio Transcription
  const startMediaRecorderFallback = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setVoiceError('আপনার ব্রাউজারে ভয়েস রেকর্ড সমর্থন করে না। অনুগ্রহ করে টাইপ করুন।');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsListening(false);

        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 1000) {
          return;
        }

        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const res = await fetch('/api/voice-transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Audio, mimeType: 'audio/webm' }),
            });
            const data = await res.json();
            if (data && data.text) {
              setInputText((prev) => (prev ? prev + ' ' + data.text : data.text));
            } else {
              setVoiceError('ভয়েস পরিষ্কার শোনা যায়নি। অনুগ্রহ করে আবার বলুন বা লিখুন।');
            }
            setIsTranscribing(false);
          };
        } catch (tErr) {
          console.error('Transcription error:', tErr);
          setVoiceError('ভয়েস প্রসেসিংয়ে সমস্যা হয়েছে। অনুগ্রহ করে লিখে জানান।');
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      setVoiceError(null);
    } catch (micErr: any) {
      console.error('Microphone access denied:', micErr);
      setVoiceError('মাইক্রোফোন চালু করা যায়নি। অনুগ্রহ করে ব্রাউজারে পারমিশন অনুমোদন করুন।');
      setIsListening(false);
    }
  };

  const handleOpenHistory = async () => {
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const farmerPhone = localStorage.getItem('krishi_farmer_phone') || undefined;
      const history = await getRecentChatInquiries(farmerPhone, 40);
      setSavedInquiries(history);
    } catch (err) {
      console.warn('Could not fetch chat inquiries:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLoadInquiry = (inquiry: FirebaseChatInquiry) => {
    const qMsg: Message = {
      id: `saved-q-${Date.now()}`,
      sender: 'user',
      text: inquiry.question,
      time: inquiry.clientTimestamp
        ? new Date(inquiry.clientTimestamp).toLocaleTimeString('bn-BD', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'সংরক্ষিত',
    };
    const aMsg: Message = {
      id: `saved-a-${Date.now() + 1}`,
      sender: 'bot',
      text: inquiry.answer,
      time: inquiry.clientTimestamp
        ? new Date(inquiry.clientTimestamp).toLocaleTimeString('bn-BD', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'সংরক্ষিত',
      model: inquiry.model || 'krishi-ai',
    };
    setMessages((prev) => [...prev, qMsg, aMsg]);
    setShowHistoryModal(false);
  };

  const handleConfirmReset = () => {
    setMessages(INITIAL_MESSAGES);
    setInputText('');
    setVoiceError(null);
    setShowClearConfirm(false);
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (_) {}
  };

  return (
    <div id="ai-chatbot-screen" className="flex flex-col h-[780px] max-h-[85vh] -mx-4 -mt-3 bg-stone-50 relative">
      {/* Chat Header */}
      <div className="bg-emerald-600 text-white px-3 sm:px-4 py-3 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            id="btn-chat-back"
            onClick={onBack}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>

          {/* Bot Avatar Picture from public/sec/bot.png */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 p-0.5 overflow-hidden border border-white/40 flex items-center justify-center">
              <img
                src="/sec/bot.png"
                alt="AI Bot"
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            {/* Online Green Indicator Dot */}
            <div className="w-2.5 h-2.5 bg-emerald-300 border-2 border-emerald-600 rounded-full absolute -bottom-0.5 -right-0.5 animate-pulse"></div>
          </div>

          <div>
            <h1 className="text-xs sm:text-sm font-extrabold flex items-center gap-1 leading-tight">
              <span>কৃষি বন্ধু AI</span>
            </h1>
            <span className="text-[9px] sm:text-[10px] text-emerald-100 font-medium block">
              সার্বক্ষণিক ডিজিটাল কৃষিবিদ
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Cloud Auto-Saved indicator */}
          <div
            className="hidden sm:flex items-center gap-1 text-[10px] bg-emerald-700/60 px-2 py-1 rounded-full text-emerald-100 border border-emerald-500/30"
            title="সব বার্তা ক্লাউড ডাটাবেজে ও ফোনে সংরক্ষিত রয়েছে"
          >
            <Cloud className="w-3 h-3 text-emerald-300" />
            <span>সংরক্ষিত</span>
          </div>

          {/* History Button */}
          <button
            id="btn-chat-history"
            onClick={handleOpenHistory}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors text-xs font-semibold"
            title="পূর্ববর্তী আলাপের ইতিহাস দেখুন"
          >
            <History className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden xs:inline">ইতিহাস</span>
          </button>

          {/* New Chat Button */}
          <button
            id="btn-chat-reset"
            onClick={() => setShowClearConfirm(true)}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 text-emerald-100 transition-colors"
            title="নতুন আলাপ শুরু করুন"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/80">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Bot Avatar in message list */}
            {msg.sender === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 overflow-hidden flex-shrink-0 p-0.5">
                <img
                  src="/sec/bot.png"
                  alt="AI Bot"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div
              className={`max-w-[84%] rounded-2xl p-3.5 shadow-xs text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none'
              }`}
            >
              {/* Message text with bold & line break support */}
              <div className="whitespace-pre-line font-medium text-[13px] space-y-1">
                {msg.text}
              </div>

              {/* Message footer with timestamp */}
              <div
                className={`text-[10px] mt-1.5 flex items-center justify-end ${
                  msg.sender === 'user'
                    ? 'text-emerald-200'
                    : 'text-stone-400'
                }`}
              >
                <span>{msg.time}</span>
              </div>
            </div>

            {/* User Icon avatar */}
            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* AI Thinking Animation */}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 overflow-hidden flex-shrink-0 p-0.5">
              <img src="/sec/bot.png" alt="AI Bot" className="w-full h-full object-contain" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-none p-3 shadow-xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
              <div
                className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                style={{ animationDelay: '0.4s' }}
              ></div>
              <span className="text-[11px] text-stone-600 ml-1 font-semibold">
                কৃষি বন্ধু উত্তর প্রস্তুত করছেন...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      {messages.length <= 2 && !isListening && (
        <div className="bg-white px-3 py-2 border-t border-stone-200">
          <span className="text-[10px] font-bold text-stone-500 block mb-1.5">
            সচরাচর জিজ্ঞাসিত প্রশ্ন (ক্লিক করে সরাসরি পাঠান):
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.replace(/^[^\s]+\s/, ''))}
                className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-semibold whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Voice Listening Banner with Audio Waves */}
      {isListening && (
        <div className="bg-rose-50 border-t border-rose-200 px-4 py-2.5 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-1 bg-rose-600 rounded-full h-3 animate-pulse"></span>
              <span className="w-1 bg-rose-600 rounded-full h-5 animate-bounce"></span>
              <span className="w-1 bg-rose-600 rounded-full h-2 animate-pulse"></span>
              <span className="w-1 bg-rose-600 rounded-full h-4 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
            </div>
            <div>
              <span className="font-bold text-rose-900 block text-[12px]">
                আপনার কথা শুনছি... বাংলায় প্রশ্ন করুন
              </span>
              <span className="text-[10px] text-rose-600 font-medium">
                বলা শেষ হলে 'সম্পন্ন' বা মাইক বাটনে চাপ দিন
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleVoiceInput}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              সম্পন্ন
            </button>
            <button
              onClick={() => {
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.stop();
                  } catch (_) {}
                }
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                  try {
                    mediaRecorderRef.current.stop();
                  } catch (_) {}
                }
                setIsListening(false);
              }}
              className="text-[11px] font-semibold text-stone-600 hover:underline"
            >
              বাতিল
            </button>
          </div>
        </div>
      )}

      {/* Voice Processing/Transcribing Indicator */}
      {isTranscribing && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
          <span className="font-semibold text-[11px]">আপনার কথা টেক্সটে রূপান্তর হচ্ছে...</span>
        </div>
      )}

      {/* Voice Error Notification Banner */}
      {voiceError && (
        <div className="bg-amber-50 border-t border-amber-200 px-3.5 py-1.5 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="text-[11px] font-medium">{voiceError}</span>
          </div>
          <button
            onClick={() => setVoiceError(null)}
            className="text-[10px] text-amber-900 font-bold ml-2 hover:underline"
          >
            ঠিক আছে
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="bg-white p-3 border-t border-stone-200 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Microphone Button */}
          <button
            id="btn-voice-input"
            type="button"
            onClick={toggleVoiceInput}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 relative ${
              isListening
                ? 'bg-rose-600 text-white shadow-lg ring-4 ring-rose-200 animate-pulse'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
            title={isListening ? 'কথা বলা বন্ধ করতে চাপুন' : 'মুখে বলে বাংলায় প্রশ্ন করুন'}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-emerald-700" />
            )}
            {/* Pulsing ring when active */}
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
            )}
          </button>

          {/* Text Input */}
          <input
            id="input-chat-message"
            type="text"
            placeholder={isListening ? 'আপনার কথা শোনা হচ্ছে...' : 'আপনার ফসলের প্রশ্ন লিখুন বা মাইকে বলুন...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading || isTranscribing}
            className={`flex-1 bg-stone-100 border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
              isListening ? 'border-rose-300 bg-rose-50/50' : 'border-stone-200'
            }`}
          />

          {/* Send Button */}
          <button
            id="btn-chat-send"
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
              inputText.trim() && !isLoading
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
            title="বার্তা পাঠান"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Clear Chat Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 text-center space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">নতুন চ্যাট শুরু করবেন?</h3>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                বর্তমান চ্যাট স্ক্রিন খালি করা হবে। আপনার পূর্ববর্তী সমস্ত প্রশ্নোত্তর ক্লাউড ডাটাবেজে সংরক্ষিত রয়েছে এবং যেকোনো সময় ইতিহাস থেকে দেখা যাবে।
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
              >
                নতুন চ্যাট শুরু করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Consultations History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <History className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">সংরক্ষিত আলাপের ইতিহাস</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50">
              {loadingHistory ? (
                <div className="py-12 text-center text-stone-500 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                  <p className="text-xs">সংরক্ষিত ইতিহাস লোড হচ্ছে...</p>
                </div>
              ) : savedInquiries.length === 0 ? (
                <div className="py-12 text-center text-stone-500 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-stone-400" />
                  <p className="text-sm font-semibold text-stone-700">কোনো সংরক্ষিত ইতিহাস পাওয়া যায়নি</p>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    AI কৃষি বন্ধুর সাথে আপনি যা কথা বলবেন, তা স্বয়ংক্রিয়ভাবে এখানে সংরক্ষিত থাকবে।
                  </p>
                </div>
              ) : (
                savedInquiries.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="bg-white border border-stone-200 rounded-xl p-3 shadow-2xs hover:border-emerald-500 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-stone-500 border-b border-stone-100 pb-1.5">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {item.detectedCrop || 'সাধারণ পরামর্শ'}
                      </span>
                      <span>
                        {item.clientTimestamp
                          ? new Date(item.clientTimestamp).toLocaleDateString('bn-BD', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'সংরক্ষিত'}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-stone-900 flex items-start gap-1.5">
                        <span className="text-emerald-600 flex-shrink-0">প্রশ্ন:</span>
                        <span>{item.question}</span>
                      </p>
                    </div>

                    <div className="bg-stone-50 rounded-lg p-2 text-[11px] text-stone-700 border border-stone-100 max-h-24 overflow-y-auto">
                      <span className="font-bold text-stone-800 block mb-0.5">পরামর্শ:</span>
                      <p className="whitespace-pre-line line-clamp-3">{item.answer}</p>
                    </div>

                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleLoadInquiry(item)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>চ্যাটে লোড করুন</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="bg-stone-100 border-t border-stone-200 px-4 py-2.5 flex items-center justify-end text-xs text-stone-600">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 font-semibold text-stone-800 rounded-lg transition-colors"
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
