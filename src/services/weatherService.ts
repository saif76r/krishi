// Real-time live weather service for Bangladesh districts and GPS geolocation
// Powered by Open-Meteo real meteorological API with zero mock data

export interface LiveWeatherData {
  locationName: string;
  latitude: number;
  longitude: number;
  current: {
    temp: number;
    apparentTemp: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    conditionText: string;
    weatherCode: number;
    time: string;
  };
  daily: Array<{
    dayName: string;
    date: string;
    maxTemp: number;
    minTemp: number;
    precipitationProb: number;
    conditionText: string;
    weatherCode: number;
  }>;
  agriculturalAdvice: {
    title: string;
    message: string;
    sprayWarning: boolean;
    irrigationNeeded: boolean;
  };
  lastUpdated: string;
  isLive: boolean;
}

export interface DistrictLocation {
  id: string;
  nameBn: string;
  nameEn: string;
  lat: number;
  lon: number;
}

export const BD_DISTRICTS: DistrictLocation[] = [
  // Dhaka Division (১৩টি)
  { id: 'dhaka', nameBn: 'ঢাকা', nameEn: 'Dhaka', lat: 23.8103, lon: 90.4125 },
  { id: 'gazipur', nameBn: 'গাজীপুর', nameEn: 'Gazipur', lat: 24.0023, lon: 90.4264 },
  { id: 'narayanganj', nameBn: 'নারায়ণগঞ্জ', nameEn: 'Narayanganj', lat: 23.6238, lon: 90.5000 },
  { id: 'tangail', nameBn: 'টাঙ্গাইল', nameEn: 'Tangail', lat: 24.2513, lon: 89.9167 },
  { id: 'narsingdi', nameBn: 'নরসিংদী', nameEn: 'Narsingdi', lat: 23.9322, lon: 90.7154 },
  { id: 'manikganj', nameBn: 'মানিকগঞ্জ', nameEn: 'Manikganj', lat: 23.8644, lon: 90.0047 },
  { id: 'munshiganj', nameBn: 'মুন্সীগঞ্জ', nameEn: 'Munshiganj', lat: 23.5422, lon: 90.5305 },
  { id: 'kishoreganj', nameBn: 'কিশোরগঞ্জ', nameEn: 'Kishoreganj', lat: 24.4449, lon: 90.7766 },
  { id: 'faridpur', nameBn: 'ফরিদপুর', nameEn: 'Faridpur', lat: 23.6071, lon: 89.8429 },
  { id: 'gopalganj', nameBn: 'গোপালগঞ্জ', nameEn: 'Gopalganj', lat: 23.0051, lon: 89.8266 },
  { id: 'madaripur', nameBn: 'মাদারীপুর', nameEn: 'Madaripur', lat: 23.1641, lon: 90.1897 },
  { id: 'rajbari', nameBn: 'রাজবাড়ী', nameEn: 'Rajbari', lat: 23.7574, lon: 89.6445 },
  { id: 'shariatpur', nameBn: 'শরীয়তপুর', nameEn: 'Shariatpur', lat: 23.2423, lon: 90.4348 },

  // Chattogram Division (১১টি)
  { id: 'chattogram', nameBn: 'চট্টগ্রাম', nameEn: 'Chattogram', lat: 22.3569, lon: 91.7832 },
  { id: 'coxsbazar', nameBn: 'কক্সবাজার', nameEn: "Cox's Bazar", lat: 21.4272, lon: 92.0058 },
  { id: 'cumilla', nameBn: 'কুমিল্লা', nameEn: 'Cumilla', lat: 23.4607, lon: 91.1809 },
  { id: 'feni', nameBn: 'ফেনী', nameEn: 'Feni', lat: 23.0186, lon: 91.3966 },
  { id: 'brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', nameEn: 'Brahmanbaria', lat: 23.9571, lon: 91.1115 },
  { id: 'rangamati', nameBn: 'রাঙ্গামাটি', nameEn: 'Rangamati', lat: 22.7324, lon: 92.2985 },
  { id: 'bandarban', nameBn: 'বান্দরবান', nameEn: 'Bandarban', lat: 22.1953, lon: 92.2184 },
  { id: 'khagrachhari', nameBn: 'খাগড়াছড়ি', nameEn: 'Khagrachhari', lat: 23.1193, lon: 91.9847 },
  { id: 'noakhali', nameBn: 'নোয়াখালী', nameEn: 'Noakhali', lat: 22.8696, lon: 91.0993 },
  { id: 'lakshmipur', nameBn: 'লক্ষ্মীপুর', nameEn: 'Lakshmipur', lat: 22.9425, lon: 90.8412 },
  { id: 'chandpur', nameBn: 'চাঁদপুর', nameEn: 'Chandpur', lat: 23.2333, lon: 90.6667 },

  // Rajshahi Division (৮টি)
  { id: 'rajshahi', nameBn: 'রাজশাহী', nameEn: 'Rajshahi', lat: 24.3745, lon: 88.6042 },
  { id: 'bogra', nameBn: 'বগুড়া', nameEn: 'Bogura', lat: 24.8465, lon: 89.3777 },
  { id: 'pabna', nameBn: 'পাবনা', nameEn: 'Pabna', lat: 24.0064, lon: 89.2372 },
  { id: 'sirajganj', nameBn: 'সিরাজগঞ্জ', nameEn: 'Sirajganj', lat: 24.4534, lon: 89.7008 },
  { id: 'naogaon', nameBn: 'নওগাঁ', nameEn: 'Naogaon', lat: 24.7936, lon: 88.9318 },
  { id: 'natore', nameBn: 'নাটোর', nameEn: 'Natore', lat: 24.4206, lon: 88.9322 },
  { id: 'joypurhat', nameBn: 'জয়পুরহাট', nameEn: 'Joypurhat', lat: 25.1015, lon: 89.0267 },
  { id: 'chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', nameEn: 'Chapainawabganj', lat: 24.5965, lon: 88.2776 },

  // Rangpur Division (৮টি)
  { id: 'rangpur', nameBn: 'রংপুর', nameEn: 'Rangpur', lat: 25.7439, lon: 89.2752 },
  { id: 'dinajpur', nameBn: 'দিনাজপুর', nameEn: 'Dinajpur', lat: 25.6217, lon: 88.6355 },
  { id: 'kurigram', nameBn: 'কুড়িগ্রাম', nameEn: 'Kurigram', lat: 25.8054, lon: 89.6362 },
  { id: 'gaibandha', nameBn: 'গাইবান্ধা', nameEn: 'Gaibandha', lat: 25.3288, lon: 89.5430 },
  { id: 'nilphamari', nameBn: 'নীলফামারী', nameEn: 'Nilphamari', lat: 25.9318, lon: 88.8560 },
  { id: 'panchagarh', nameBn: 'পঞ্চগড়', nameEn: 'Panchagarh', lat: 26.3411, lon: 88.5542 },
  { id: 'thakurgaon', nameBn: 'ঠাকুরগাঁও', nameEn: 'Thakurgaon', lat: 26.0337, lon: 88.4617 },
  { id: 'lalmonirhat', nameBn: 'লালমনিরহাট', nameEn: 'Lalmonirhat', lat: 25.9923, lon: 89.2847 },

  // Khulna Division (১০টি)
  { id: 'khulna', nameBn: 'খুলনা', nameEn: 'Khulna', lat: 22.8456, lon: 89.5403 },
  { id: 'jashore', nameBn: 'যশোর', nameEn: 'Jashore', lat: 23.1664, lon: 89.2081 },
  { id: 'kushtia', nameBn: 'কুষ্টিয়া', nameEn: 'Kushtia', lat: 23.9013, lon: 89.1205 },
  { id: 'jhenaidah', nameBn: 'ঝিনাইদহ', nameEn: 'Jhenaidah', lat: 23.5448, lon: 89.1539 },
  { id: 'satkhira', nameBn: 'সাতক্ষীরা', nameEn: 'Satkhira', lat: 22.7185, lon: 89.0705 },
  { id: 'bagerhat', nameBn: 'বাগেরহাট', nameEn: 'Bagerhat', lat: 22.6516, lon: 89.7859 },
  { id: 'chuadanga', nameBn: 'চুয়াডাঙ্গা', nameEn: 'Chuadanga', lat: 23.6402, lon: 88.8418 },
  { id: 'meherpur', nameBn: 'মেহেরপুর', nameEn: 'Meherpur', lat: 23.7749, lon: 88.6318 },
  { id: 'narail', nameBn: 'নড়াইল', nameEn: 'Narail', lat: 23.1725, lon: 89.5127 },
  { id: 'magura', nameBn: 'মাগুরা', nameEn: 'Magura', lat: 23.4873, lon: 89.4198 },

  // Barishal Division (৬টি)
  { id: 'barishal', nameBn: 'বরিশাল', nameEn: 'Barishal', lat: 22.7010, lon: 90.3535 },
  { id: 'bhola', nameBn: 'ভোলা', nameEn: 'Bhola', lat: 22.6859, lon: 90.6481 },
  { id: 'patuakhali', nameBn: 'পটুয়াখালী', nameEn: 'Patuakhali', lat: 22.3596, lon: 90.3299 },
  { id: 'pirojpur', nameBn: 'পিরোজপুর', nameEn: 'Pirojpur', lat: 22.5841, lon: 89.9720 },
  { id: 'barguna', nameBn: 'বরগুনা', nameEn: 'Barguna', lat: 22.0953, lon: 90.1121 },
  { id: 'jhalokathi', nameBn: 'ঝালকাঠি', nameEn: 'Jhalokathi', lat: 22.6406, lon: 90.1987 },

  // Sylhet Division (৪টি)
  { id: 'sylhet', nameBn: 'সিলেট', nameEn: 'Sylhet', lat: 24.8949, lon: 91.8687 },
  { id: 'moulvibazar', nameBn: 'মৌলভীবাজার', nameEn: 'Moulvibazar', lat: 24.4829, lon: 91.7774 },
  { id: 'habiganj', nameBn: 'হবিগঞ্জ', nameEn: 'Habiganj', lat: 24.3749, lon: 91.4155 },
  { id: 'sunamganj', nameBn: 'সুনামগঞ্জ', nameEn: 'Sunamganj', lat: 25.0658, lon: 91.3950 },

  // Mymensingh Division (৪টি)
  { id: 'mymensingh', nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh', lat: 24.7471, lon: 90.4203 },
  { id: 'jamalpur', nameBn: 'জামালপুর', nameEn: 'Jamalpur', lat: 24.9375, lon: 89.9378 },
  { id: 'netrokona', nameBn: 'নেত্রকোণা', nameEn: 'Netrokona', lat: 24.8709, lon: 90.7279 },
  { id: 'sherpur', nameBn: 'শেরপুর', nameEn: 'Sherpur', lat: 25.0205, lon: 90.0153 },
];

export function mapWeatherCodeToBengali(code: number): string {
  switch (code) {
    case 0:
      return 'পরিষ্কার রৌদ্রোজ্জ্বল আকাশ';
    case 1:
      return 'প্রধানত রৌদ্রোজ্জ্বল';
    case 2:
      return 'আংশিক মেঘলা আকাশ';
    case 3:
      return 'ঘন মেঘলা আকাশ';
    case 45:
    case 48:
      return 'কুয়াশাচ্ছন্ন আবহাওয়া';
    case 51:
    case 53:
    case 55:
      return 'হালকা গুঁড়ি গুঁড়ি বৃষ্টি';
    case 61:
    case 63:
      return 'মাঝারি বৃষ্টিপাত';
    case 65:
      return 'ভারী বর্ষণ';
    case 80:
    case 81:
    case 82:
      return 'বিক্ষিপ্ত বৃষ্টি বা ঝরনা';
    case 95:
      return 'বজ্রসহ বৃষ্টিপাত';
    case 96:
    case 99:
      return 'বজ্রঝড় ও শিলাবৃষ্টি';
    default:
      return 'স্বাভাবিক আবহাওয়া';
  }
}

const BENGALI_DAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const BENGALI_MONTHS = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];

export function toBn(num: number | string): string {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bn[Number(d)]);
}

// Fetch real live weather from Open-Meteo (zero mock!)
export async function fetchLiveWeather(lat: number, lon: number, locationName: string): Promise<LiveWeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FDhaka`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Weather fetch failed');
  }

  const data = await res.json();
  const current = data.current;
  const daily = data.daily;

  const currentCode = current.weather_code ?? 0;
  const rainProbMax = daily.precipitation_probability_max?.[0] ?? 0;
  const precip = current.precipitation ?? 0;
  const temp = Math.round(current.temperature_2m);
  const humidity = Math.round(current.relative_humidity_2m);
  const wind = Math.round(current.wind_speed_10m);

  // Generate real agricultural advice based on actual sensor metrics
  let title = 'অনুকূল আবহাওয়া';
  let message = 'আজ আবহাওয়া স্বাভাবিক রয়েছে। নিয়মিত সেচ ও ক্ষেত পরিচর্যা চালিয়ে যেতে পারেন।';
  let sprayWarning = false;
  let irrigationNeeded = false;

  if (currentCode >= 80 || rainProbMax > 60 || precip > 2) {
    title = 'বৃষ্টিপাত সতর্কতা';
    message = 'বৃষ্টির সম্ভাবনা বেশি। জমিতে কীটনাশক বা ফলিয়ার স্প্রে সাময়িক স্থগিত রাখুন এবং ড্রেনেজ নালা খুলে দিন।';
    sprayWarning = true;
  } else if (temp >= 35) {
    title = 'উচ্চ তাপমাত্রা সতর্কতা';
    message = 'তীব্র রোদের কারণে মাটির আর্দ্রতা কমে যাচ্ছে। চারা রক্ষায় বিকেলে বা ভোরে হালকা সেচ দিন।';
    irrigationNeeded = true;
  } else if (humidity > 85 && temp > 28) {
    title = 'ছত্রাক রোগ ঝুঁকি';
    message = 'উচ্চ আর্দ্রতা ও উষ্ণতার কারণে ব্লাস্ট ও ধসা রোগের ঝুঁকি বেশি। সতর্ক দৃষ্টি রাখুন।';
  }

  // Parse 7-day forecast
  const dailyForecast = (daily.time || []).map((dateStr: string, idx: number) => {
    const d = new Date(dateStr);
    const dayName = idx === 0 ? 'আজ' : idx === 1 ? 'আগামীকাল' : BENGALI_DAYS[d.getDay()];
    const dateFormatted = `${toBn(d.getDate())} ${BENGALI_MONTHS[d.getMonth()]}`;
    const code = daily.weather_code[idx] ?? 0;
    return {
      dayName,
      date: dateFormatted,
      maxTemp: Math.round(daily.temperature_2m_max[idx] ?? temp),
      minTemp: Math.round(daily.temperature_2m_min[idx] ?? temp - 5),
      precipitationProb: daily.precipitation_probability_max[idx] ?? 0,
      conditionText: mapWeatherCodeToBengali(code),
      weatherCode: code,
    };
  });

  return {
    locationName,
    latitude: lat,
    longitude: lon,
    current: {
      temp,
      apparentTemp: Math.round(current.apparent_temperature ?? temp),
      humidity,
      windSpeed: wind,
      precipitation: precip,
      conditionText: mapWeatherCodeToBengali(currentCode),
      weatherCode: currentCode,
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    },
    daily: dailyForecast.slice(0, 7),
    agriculturalAdvice: {
      title,
      message,
      sprayWarning,
      irrigationNeeded,
    },
    lastUpdated: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    isLive: true,
  };
}
