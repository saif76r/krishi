import { GoogleGenAI } from "@google/genai";

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
  });
}

function getAgriculturalFallbackReply(message: string, location: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("ভুট্টা") ||
    lower.includes("কান্ড পচা") ||
    lower.includes("কান্ডপচা") ||
    lower.includes("stem rot") ||
    lower.includes("stalk rot") ||
    lower.includes("diplodia") ||
    lower.includes("fusarium")
  ) {
    return `🌽 ভুট্টার কান্ড পচা ও গোড়া পচা রোগ (Stem Rot / Stalk Rot of Maize):

📌 কারণ ও জীবাণু:
এটি প্রধানত ডিপ্লোডিয়া (*Diplodia maydis*) এবং ফিউজারিয়াম (*Fusarium moniliforme / Gibberella zeae*) নামক ক্ষতিকর ছত্রাকের আক্রমণে ঘটে থাকে। জমিতে অতিরিক্ত আর্দ্রতা, জলাবদ্ধতা বা ফুল ও দানা আসার সময় খরা হলে এ রোগের প্রকোপ বাড়ে।

🔍 দৃশ্যমান লক্ষণসমূহ:
১. গাছের গোড়ার দিকের কান্ড বা নিচের গিঁট নরম, খড় বর্ণের বা কালচে-বাদামি হয়ে পচে যায়।
২. কান্ডের ভেতরের নরম আঁশ বা মজ্জা (pith) বিনষ্ট হয়ে ভেতরের অংশ ফাঁপা ও ভঙ্গুর হয়ে যায়।
৩. কাণ্ড দুর্বল হয়ে সামান্য বাতাসে বা হাত দিলেই গাছ মাটিতে নুয়ে বা ভেঙে পড়ে।
৪. মোচায় পুষ্ট দানা তৈরি হতে পারে না, দানা হালকা ও কুঁচকানো হয়।

🛡️ অনুমোদিত রাসায়নিক সমাধান:
১. কার্বেন্ডাজিম ৫০% ডব্লিউপি (যেমন: নোইন বা অটোস্টিন) অথবা থায়োফেনেট মিথাইল (যেমন: রোকো) প্রতি লিটার পানিতে ২ গ্রাম হারে মিশিয়ে গাছের গোড়া ও কান্ড ভিজিয়ে স্প্রে করুন।
২. অথবা অ্যাজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল (যেমন: এমিস্টার টপ ৩২৫ এসসি) প্রতি লিটার পানিতে ১ মিলি হারে স্প্রে করতে পারেন।
৩. আক্রমণ দেখা দিলে ৫–৭ দিন পর দ্বিতীয়বার স্প্রে সম্পন্ন করুন।

🌿 জৈব ও কৃষি ব্যবস্থাপনা:
• বীজ শোধন: বপনের আগে প্রতি কেজি ভুট্টার বীজে ২.৫–৩ গ্রাম প্রভ্যাক্স ২০০ ডব্লিউপি বা ট্রাইকোডার্মা গুঁড়া ভালো করে মিশিয়ে শোধন করুন।
• সুষম সার: অতিরিক্ত ইউরিয়া সার পরিহার করুন এবং জমিতে পর্যাপ্ত পটাশ (এমওপি) সার ব্যবহার করুন যা ভুট্টার কাণ্ডকে মজবুত করে।
• নিষ্কাশন: জমিতে যেন কোনোভাবেই বৃষ্টির বা সেচের পানি জমে না থাকে, দ্রুত পানি নিষ্কাশনের জন্য নালার ব্যবস্থা রাখুন।`;
  }

  if (lower.includes("পেঁপে") || lower.includes("papaya") || lower.includes("রিং স্পট") || lower.includes("মোজাইক")) {
    return `🍈 পেঁপের রিং স্পট ভাইরাস (PRSV) ও কাণ্ড পচা রোগ প্রতিকার:

📌 লক্ষণসমূহ:
১. পেঁপের কচি পাতায় হলুদ-সবুজ মোজাইক ছোপ, পাতার আকার ছোট ও বিকৃত হয়ে যাওয়া।
২. পাতার বোঁটায় ও কাণ্ডে গাঢ় সবুজ তৈলাক্ত বা জলছাপের মতো দাগ।
৩. কাণ্ডের গোড়ায় পানি জমে নরম হয়ে পচে যাওয়া (Pythium ছত্রাকজনিত)।

🛡️ সমাধান ও পরামর্শ:
১. ভাইরাস বিস্তারকারী জাবপোকা ও সাদা মাছি দমনে ইমিডাক্লোপ্রিড (এডমায়ার / টিডো) ০.৫ মিলি/লিটার পানিতে স্প্রে করুন।
২. কাণ্ড ও গোড়া পচা ঠেকাতে কপার অক্সিক্লোরাইড ৫০% ডব্লিউপি (কুপ্রোফিক্স) প্রতি লিটার পানিতে ২ গ্রাম হারে গাছের গোড়ার মাটিতে স্প্রে করুন।
৩. আক্রান্ত চরম ক্ষতিগ্রস্ত গাছ তুলে ধ্বংস করুন এবং উঁচু বেডে পেঁপে চাষ করুন যেন পানি জমে না থাকে।`;
  }

  if (lower.includes("কলা") || lower.includes("banana") || lower.includes("সিগাটোকা") || lower.includes("পানামা")) {
    return `🍌 কলার রোগবালাই (সিগাটোকা ও পানামা রোগ) ব্যবস্থাপনা:

📌 লক্ষণ ও কারণ:
১. সিগাটোকা রোগ: পাতায় সমান্তরালে ছোট হলুদ/বাদামি সরু দাগ তৈরি হয় যা দ্রুত শুকিয়ে কালচে হয়ে পুড়ে যাওয়ার মতো দেখায়।
২. পানামা রোগ: কাণ্ড ও পাতার শিরা হলুদ হয়ে পাতা বোঁটাসহ ভেঙে ঝুলে পড়ে।

🛡️ সমাধান ও প্রতিকার:
১. সিগাটোকা দেখা দিলে প্রতি লিটার পানিতে ১ মিলি টিল্ট ২৫% ইসি (প্রোপিকোনাজল) বা এমিস্টার টপ স্প্রে করুন।
২. আক্রান্ত বেশি ক্ষতিগ্রস্ত পাতা কেটে বাগানের বাইরে ধ্বংস করুন।
৩. জমিতে সেচ ও বৃষ্টির পানি নিষ্কাশনের সুষ্ঠু নালা তৈরি করে রাখুন।`;
  }

  if (lower.includes("বেগুন") || lower.includes("eggplant") || lower.includes("ডগা") || lower.includes("ফল ছিদ্র")) {
    return `🍆 বেগুনের ডগা ও ফল ছিদ্রকারী পোকা এবং রোগ ব্যবস্থাপনা:

📌 লক্ষণ:
১. কচি ডগার মাথা নুয়ে পড়ে শুকিয়ে যায়।
২. ফলের গায়ে ছিদ্র ও পোকার মল দেখা যায়, ফল পচে যায়।

🛡️ আধুনিক সমাধান (IPM):
১. জমিতে প্রতি শতকে ১টি সেক্স ফেরোমোন ফাঁদ স্থাপন করুন (সবচেয়ে কার্যকর)।
২. পোকা দেখা দিলে এমামেকটিন বেনজোয়েট ৫ এসজি (প্রোক্লেম / সাসপেন্ড) প্রতি লিটার পানিতে ১ গ্রাম হারে স্প্রে করুন।
৩. আক্রান্ত ডগা ও ফল হাত দিয়ে সংগ্রহ করে মাটির নিচে পুঁতে ফেলুন।`;
  }

  if (lower.includes("ব্লাস্ট") || lower.includes("পাতাপোড়া") || (lower.includes("ধান") && lower.includes("রোগ"))) {
    return `🌾 ধানের ব্লাস্ট বা পাতাপোড়া রোগের কার্যকর প্রতিকার:

১. জমিতে ইউরিয়া সারের উপরিপ্রয়োগ আপাতত বন্ধ রাখুন এবং বিঘাপ্রতি অতিরিক্ত ৫ কেজি এমওপি (পটাশ) সার প্রয়োগ করুন।
২. ট্রাইসাইক্লাজল ৭৫% ডব্লিউপি (যেমন: ট্রুপার বা দিফা) প্রতি লিটার পানিতে ১ গ্রাম হারে মিশিয়ে বিকেলে স্প্রে করুন।
৩. অথবা এ্যাজোক্সিস্ট্রবিন + ডাইফেনোকোনাজল (যেমন: এমিস্টার টপ) প্রতি লিটার পানিতে ১ মিলি হারে স্প্রে করতে পারেন।
৪. জমিতে সবসময় ২-৩ ইঞ্চি পানি ধরে রাখুন, জমি শুকিয়ে ফেটে যেতে দেবেন না।`;
  }

  if (lower.includes("আলু") || lower.includes("ধসা") || lower.includes("লেট ব্লাইট")) {
    return `🥔 আলুর নাবি ধসা (Late Blight) রোগ নিয়ন্ত্রণ:

১. কুয়াশাচ্ছন্ন ও মেঘলা আবহাওয়ায় রোগ দ্রুত ছড়ায়। লক্ষণ দেখা দিলে সেচ দেওয়া বন্ধ রাখুন।
২. প্রতি লিটার পানিতে ২ গ্রাম ম্যানকোজেব (যেমন: ডাইথেন এম-৪৫) অথবা মেনকোজেব + ফেনামিডন (সিকিউর) মিশিয়ে ৭-১০ দিন পর পর স্প্রে করুন।
৩. তীব্র আক্রমণে ডাইমেথোমর্ফ (অ্যাক্রোবেট এমজেড) প্রতি লিটার পানিতে ২ গ্রাম হারে স্প্রে করুন।
৪. পাতার ওপর ও নিচ উভয় পাশ ভালোভাবে ভিজিয়ে দিন।`;
  }

  if (lower.includes("সার") || lower.includes("ইউরিয়া") || lower.includes("পটাশ") || lower.includes("টিএসপি") || lower.includes("ড্যাপ")) {
    return `🧪 সুষম সার ব্যবহারের নিয়মাবলী (বিঘা প্রতি ৩৩ শতক):

• আমন/বোরো ধানের জন্য: ইউরিয়া ৩৫-৪০ কেজি, টিএসপি/ডিএপি ১২-১৫ কেজি, এমওপি (পটাশ) ১৮-২০ কেজি, জিপসাম ৮-১০ কেজি এবং জিংক সালফেট ১.৫ কেজি।
• ইউরিয়া প্রয়োগের সঠিক কিস্তি:
  - ১ম কিস্তি: চারা রোপণের ১৫-২০ দিন পর।
  - ২য় কিস্তি: কুশি গজানোর সময় (রোপণের ৩০-৩৫ দিন পর)।
  - ৩য় কিস্তি: থোড় আসার ৫-৭ দিন পূর্বে।
• মনে রাখবেন: ডিএপি ব্যবহার করলে ইউরিয়া সারের পরিমাণ কিছুটা কমিয়ে দিতে হবে।`;
  }

  if (lower.includes("পোকা") || lower.includes("মাজরা") || lower.includes("লেদা") || lower.includes("বিছা")) {
    return `🐛 ফসলের পোকা দমনের আধুনিক সমন্বিত বালাই ব্যবস্থাপনা (IPM):

১. পার্চিং পদ্ধতি: ক্ষেতে বিঘাপ্রতি ৮-১০টি বাঁশের কঞ্চি বা ডালপালা পুঁতে দিন যাতে ফিঙে, শালিক ইত্যাদি পাখি বসে পোকা খেয়ে ফেলতে পারে।
২. আলোক ফাঁদ: রাতে ক্ষেতের পাশে আলোর নিচে কেরোসিন মিশ্রিত পানির পাত্র রেখে মাজরা ও গান্ধী পোকা দমন করুন।
৩. আক্রমণ বেশি হলে দানাদার কীটনাশক কার্বোফুরান ৫জি (যেমন: ফুরাডান) বিঘাপ্রতি ১.৫ কেজি প্রয়োগ করুন অথবা ভিরতাকো (থায়ামেথোক্সাম + ক্লোরান্ট্রানিলিপ্রোল) প্রতি লিটার পানিতে ০.৫ গ্রাম হারে স্প্রে করুন।`;
  }

  if (lower.includes("হলুদ") || lower.includes("পাতা")) {
    return `🌱 পাতা হলুদ হওয়ার প্রধান কারণ ও প্রতিকার:

১. নাইট্রোজেনের ঘাটতি: পুরো পাতা বিশেষ করে নিচের পাতা সমভাবে হালকা হলুদ হলে বিঘাপ্রতি ৫-৭ কেজি ইউরিয়া উপরিপ্রয়োগ করুন।
২. সালফারের (গন্ধক) ঘাটতি: গাছের ওপরের কচি পাতা আগে হলুদ হলে জিপসাম সার প্রয়োগ করতে হবে।
৩. দস্তার (জিংক) ঘাটতি: পাতার শিরা বরাবর বাদামি মরিচার মতো দাগ হলে চিলেটেড জিংক (যেমন: লিবরেল জিংক) প্রতি লিটার পানিতে ১ গ্রাম হারে স্প্রে করুন।
৪. অতিরিক্ত পানি জমে থাকলে ড্রেন তৈরি করে পানি নিষ্কাশনের ব্যবস্থা করুন।`;
  }

  if (lower.includes("সেচ") || lower.includes("পানি")) {
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
৪. আরও নির্দিষ্ট পরামর্শের জন্য আপনার ফসলের নাম ও লক্ষণ বিস্তারিত লিখে জানান।`;
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
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
    const { message, history, location } = req.body || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const farmerLocation = location || "ঢাকা, বাংলাদেশ";
    const ai = getGenAI();

    if (!ai) {
      const fallbackReply = getAgriculturalFallbackReply(message, farmerLocation);
      return res.status(200).json({ reply: fallbackReply, model: "agronomic-knowledge-base" });
    }

    const systemInstruction = `আপনি 'কৃষি বন্ধু' (Krishi Bondhu) - বাংলাদেশের কৃষকদের জন্য নিবেদিত একজন অভিজ্ঞ, অত্যন্ত বিনয়ী ও বিশেষজ্ঞ ডিজিটাল কৃষিবিদ।
কৃষকের বর্তমান অবস্থান: ${farmerLocation}।
আপনার প্রধান দায়িত্ব হলো:
১. সহজ, স্পষ্ট ও সাবলীল বাংলায় কৃষকদের রোগবালাই, সার প্রয়োগ, বীজ নির্বাচন, সেচ ও আবহাওয়া সংক্রান্ত প্রশ্নের সরাসরি কার্যকর সমাধান দেওয়া।
২. পরামর্শ যেন বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (BRRI), বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (BARI) এবং কৃষি সম্প্রসারণ অধিদপ্তর (DAE)-এর সুপারিশকৃত বাস্তব নিয়মের সাথে সামঞ্জস্যপূর্ণ হয়।
৩. সার ও কীটনাশকের ক্ষেত্রে সঠিক পরিমাণ এবং স্প্রে করার সঠিক সময় উল্লেখ করুন।
৪. উত্তর সংক্ষিপ্ত, সুস্পষ্ট এবং পয়েন্ট আকারে সাজিয়ে উপস্থাপন করুন।`;

    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-6)) {
        if (turn && turn.text && typeof turn.text === "string" && turn.text.trim()) {
          const role = turn.role === "assistant" || turn.role === "model" ? "model" : "user";
          if (contents.length === 0 && role === "model") continue;
          if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += "\n" + turn.text.trim();
          } else {
            contents.push({ role, parts: [{ text: turn.text.trim() }] });
          }
        }
      }
    }

    if (contents.length > 0 && contents[contents.length - 1].role === "user") {
      contents[contents.length - 1].parts[0].text += "\n" + message.trim();
    } else {
      contents.push({ role: "user", parts: [{ text: message.trim() }] });
    }

    function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout of ${ms}ms exceeded`)), ms)
        ),
      ]);
    }

    const candidateModels = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];
    let finalReply = "";
    let usedModel = "";

    for (const model of candidateModels) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              temperature: 0.6,
              maxOutputTokens: 1024,
            },
          }),
          4000
        );

        if (response && response.text && response.text.trim()) {
          finalReply = response.text.trim();
          usedModel = model;
          break;
        }
      } catch (genError) {
        console.warn(`Vercel function: Model ${model} failed or timed out:`, genError);
      }
    }

    if (!finalReply) {
      finalReply = getAgriculturalFallbackReply(message, farmerLocation);
      usedModel = "agronomic-knowledge-base";
    }

    return res.status(200).json({ reply: finalReply, model: usedModel });
  } catch (error) {
    console.error("Vercel api/chat error:", error);
    const fallbackReply = getAgriculturalFallbackReply(
      req.body?.message || "",
      req.body?.location || "বাংলাদেশ"
    );
    return res.status(200).json({
      reply: fallbackReply,
      model: "agronomic-fallback",
    });
  }
}
