import { GoogleGenAI, Type } from "@google/genai";

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

function toBengaliNumeral(n: number | string): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/[0-9]/g, (w) => bnDigits[Number(w)]);
}

function formatBengaliAmount(amount: number): string {
  const str = Math.round(amount).toString();
  if (str.length <= 3) return toBengaliNumeral(str);
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return toBengaliNumeral(formattedOthers + "," + lastThree);
}

function calculateFallbackAdvisorData(data: any) {
  const crop = data.cropType || "ধান";
  const landSize = Number(data.landSize) || 2;
  const landUnit = data.landUnit || "একর";
  const soil = data.soilType || "দোআঁশ";
  const seedQty = Number(data.seedQuantity) || 8;

  let baseYieldPerAcre = 4.0;
  let maxPotentialPerAcre = 5.2;

  if (crop.includes("আলু")) {
    baseYieldPerAcre = 18.0;
    maxPotentialPerAcre = 24.0;
  } else if (crop.includes("গম")) {
    baseYieldPerAcre = 3.2;
    maxPotentialPerAcre = 4.2;
  } else if (crop.includes("ভুট্টা")) {
    baseYieldPerAcre = 7.5;
    maxPotentialPerAcre = 9.8;
  } else if (crop.includes("সরিষা")) {
    baseYieldPerAcre = 1.4;
    maxPotentialPerAcre = 1.9;
  }

  let score = 84;
  if (soil.includes("বেলে") && !soil.includes("দোআঁশ")) score -= 8;
  if (seedQty < 6 || seedQty > 12) score -= 5;
  score = Math.max(50, Math.min(96, score));

  const yieldRatio = score / 100;
  const currentYield = Number((baseYieldPerAcre * (0.85 + yieldRatio * 0.15)).toFixed(1));
  const maxYield = Number(maxPotentialPerAcre.toFixed(1));
  const pricePerTon = crop.includes("আলু") ? 18000 : crop.includes("ভুট্টা") ? 22000 : 32000;
  const landMultiplier = landUnit === "বিঘা" ? landSize * 0.33 : landSize;
  const yieldDiffTons = Math.max(0.4, (maxYield - currentYield) * landMultiplier);
  const potentialExtraProfit = Math.round(yieldDiffTons * pricePerTon);

  const statusText = score >= 80 ? "খুব ভালো" : score >= 65 ? "সন্তোষজনক" : "উন্নতি প্রয়োজন";
  const creditStatus = score >= 75 ? "ভাল" : score >= 60 ? "মাঝারি" : "খারাপ";

  return {
    score_analysis: {
      score,
      max_score: 100,
      status_text: statusText,
      credit_status: creditStatus,
    },
    yield_prediction: {
      current_yield: currentYield,
      max_yield: maxYield,
      unit: landUnit === "বিঘা" ? "মণ/বিঘা" : "টন/একর",
    },
    financials: {
      potential_extra_profit_bdt: potentialExtraProfit,
      formatted_extra_profit: formatBengaliAmount(potentialExtraProfit),
    },
    ai_recommendations: [
      {
        category: "রোগ নিয়ন্ত্রণ",
        title: "ছত্রাকনাশক প্রয়োগ",
        action: `${crop} এর ব্লাস্ট বা পাতাপোড়া রোগ প্রতিরোধে ট্রাইসাইক্লাজোল বা মেনকোজেব অনুমোদিত মাত্রায় বিকেল বেলা স্প্রে করুন।`,
      },
      {
        category: "সার প্রয়োগ",
        title: "ইউরিয়া ও পটাশ উপরি প্রয়োগ",
        action: "জমি শুকানোর পর ইউরিয়া ও মিউরেট অব পটাশ (MOP) সার কুশি গজানোর সময় দ্বিতীয় কিস্তিতে দিন।",
      },
      {
        category: "সেচ ব্যবস্থাপনা",
        title: "পরিমিত পানি নিয়ন্ত্রণ",
        action: "জমিতে অতিরিক্ত পানি জমিয়ে না রেখে ২-৩ ইঞ্চি পানি ধরে রাখুন এবং ফুল আসার সময় আর্দ্রতা নিশ্চিত করুন।",
      },
    ],
    daily_tasks: [
      { task: "সেচ দেওয়া", recommended: true },
      { task: "সার প্রয়োগ", recommended: false },
      { task: "আগাছা পরিষ্কার", recommended: true },
    ],
    alerts: [
      "আজ আপনার এলাকায় হালকা বৃষ্টির সম্ভাবনা রয়েছে, ড্রেন পরিষ্কার রাখুন।",
      `বর্তমান আর্দ্র আবহাওয়ায় ${crop}-এ রোগবালাইয়ের ঝুঁকি রয়েছে, নিয়মিত ক্ষেত পরিদর্শন করুন।`,
    ],
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body || {};
    const ai = getGenAI();

    if (!ai) {
      return res.status(200).json(calculateFallbackAdvisorData(data));
    }

    const prompt = `You are an expert Agricultural AI Advisor tailored for Bangladeshi farmers.
Process farm parameters:
Crop Type: ${data.cropType || "ধান"}
Variety: ${data.cropVariety || "উফশী"}
Land: ${data.landSize || 2} ${data.landUnit || "একর"}, Soil: ${data.soilType || "দোআঁশ"}
Return JSON with score_analysis, yield_prediction, financials, ai_recommendations, daily_tasks, alerts in Bengali.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim();
    if (text) {
      return res.status(200).json(JSON.parse(text));
    }
    return res.status(200).json(calculateFallbackAdvisorData(data));
  } catch (err) {
    console.error("Vercel advisor error:", err);
    return res.status(200).json(calculateFallbackAdvisorData(req.body || {}));
  }
}
