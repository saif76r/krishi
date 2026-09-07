export interface ScoreAnalysis {
  score: number;
  max_score: number;
  status_text: string;
  credit_status: string;
}

export interface YieldPrediction {
  current_yield: number;
  max_yield: number;
  unit: string;
}

export interface Financials {
  potential_extra_profit_bdt: number;
  formatted_extra_profit: string;
}

export interface AIRecommendation {
  category: string;
  title: string;
  action: string;
}

export interface DailyTask {
  task: string;
  recommended: boolean;
}

export interface AdvisorResponse {
  score_analysis: ScoreAnalysis;
  yield_prediction: YieldPrediction;
  financials: Financials;
  ai_recommendations: AIRecommendation[];
  daily_tasks: DailyTask[];
  alerts: string[];
}

export interface AdvisorRequest {
  cropType: string;
  cropVariety?: string;
  season?: string;
  landSize: number;
  landUnit: 'বিঘা' | 'একর' | 'শতাংশ';
  soilType: string;
  soilTestDate?: string;
  soilTestSummary?: string;
  sowingDate?: string;
  seedQuantity?: number;
  seedUnit?: string;
  irrigationStatus?: string;
  cropStage?: string;
  region: string;
  notes?: string;
  inputsUsed?: Array<{
    category: string;
    name: string;
    quantity: number;
    unit: string;
    price?: number;
  }>;
}

export interface CropInfo {
  id: string;
  name: string;
  scientificName: string;
  image: string;
  category?: 'দানা ফসল' | 'সবজি' | 'ফল ও অর্থকরী' | 'তৈলবীজ ও মসলা';
  seasonTag?: string;
  suitableSeason: string;
  soilType: string;
  seedRate: string;
  fertilizerGuide: string;
  irrigationGuide: string;
  commonPests: string[];
  commonDiseases: string[];
  harvestingTime: string;
  preservation: string;
}

export interface MarketPriceItem {
  id: string;
  name: string;
  category: 'ধান' | 'গম' | 'সবজি' | 'ফল' | 'মসলা';
  price: number;
  unit: string;
  location: string;
  change: 'up' | 'down' | 'stable';
  changePercentage: number;
  image: string;
  updatedAt: string;
}

export interface WeatherDay {
  dayName: string;
  date: string;
  temp: number;
  condition: string;
  humidity: number;
  rainProbability: number;
  warning?: string;
}

export interface CropDisease {
  id: string;
  crop: string;
  name: string;
  description: string;
  symptoms: string[];
  organicSolution: string;
  chemicalSolution: {
    chemical: string;
    usage: string;
    dose: string;
  };
  prevention: string;
  image: string;
}

export interface InputItem {
  id: string;
  category: 'বীজ' | 'সার' | 'কীটনাশক' | 'ছত্রাকনাশক' | 'অন্যান্য';
  name: string;
  quantity: number;
  unit: string;
  price: number;
  date: string;
  selected?: boolean;
}
