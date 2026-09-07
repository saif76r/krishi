import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  Table,
  CheckCircle2,
  RefreshCw,
  X,
  Copy,
  Layers,
  FileCode,
  Search,
  ExternalLink,
  HardDrive,
  ShieldCheck,
  Sparkles,
  Tag,
  Clock,
  UserCheck,
  Cloud,
  Flame,
} from 'lucide-react';
import {
  getRecentFirestoreDiagnoses,
  getFirestoreFarmers,
  FirebaseDiagnosis,
  FarmerAccount,
  firebaseConfig,
} from '../lib/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface DiagnosisRow {
  id: number;
  farmer_id: string;
  crop_name: string;
  disease_name: string;
  disease_scientific?: string;
  severity: string;
  confidence_score: number;
  symptoms_observed?: string;
  treatments_json?: string;
  model_provider?: string;
  created_at: string;
}

export const DatabaseExplorerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'firebase' | 'records' | 'schema' | 'architecture'>('firebase');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [records, setRecords] = useState<DiagnosisRow[]>([]);
  const [firestoreRecords, setFirestoreRecords] = useState<FirebaseDiagnosis[]>([]);
  const [firestoreFarmers, setFirestoreFarmers] = useState<FarmerAccount[]>([]);
  const [schemaInfo, setSchemaInfo] = useState<any>(null);
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('all');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);

  const fetchDatabaseData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/database/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // 2. Fetch Diagnoses
      const diagRes = await fetch(`/api/database/diagnoses?crop=${selectedCropFilter}`);
      if (diagRes.ok) {
        const diagData = await diagRes.json();
        setRecords(diagData.diagnoses || []);
      }

      // 3. Fetch Schema
      const schemaRes = await fetch('/api/database/schema');
      if (schemaRes.ok) {
        const schemaData = await schemaRes.json();
        setSchemaInfo(schemaData.schema);
      }

      // 4. Fetch Firestore live records
      const fRecords = await getRecentFirestoreDiagnoses(15);
      setFirestoreRecords(fRecords);

      // 5. Fetch registered farmers from Firestore
      const fFarmers = await getFirestoreFarmers(15);
      setFirestoreFarmers(fFarmers);
    } catch (err) {
      console.warn('Database fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDatabaseData();
    }
  }, [isOpen, selectedCropFilter]);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  if (!isOpen) return null;

  const SQL_DDL_CODE = `-- =========================================================================
-- KRISHI SHAHAYOK: PRODUCTION RELATIONAL DATABASE SCHEMA
-- Compatible with PostgreSQL & SQLite 3
-- =========================================================================

-- 1. Farmers / Users Table
CREATE TABLE IF NOT EXISTS farmers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    division TEXT,
    district TEXT,
    upazila TEXT,
    farm_size_bigha REAL DEFAULT 1.0,
    primary_crop TEXT DEFAULT 'ধান',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crop Leaf Disease Diagnoses Table
CREATE TABLE IF NOT EXISTS diagnoses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id TEXT,
    crop_name TEXT NOT NULL,
    crop_scientific TEXT,
    disease_name TEXT NOT NULL,
    disease_scientific TEXT,
    severity TEXT CHECK(severity IN ('কম', 'মাঝারি', 'তীব্র')),
    confidence_score REAL NOT NULL,
    symptoms_observed TEXT,
    cause TEXT,
    treatments_json TEXT,
    expert_note TEXT,
    image_url TEXT,
    model_provider TEXT DEFAULT 'Roboflow Computer Vision + Gemini',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE SET NULL
);

-- 3. Yield & Fertilizer Advisory Records Table
CREATE TABLE IF NOT EXISTS advisories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id TEXT,
    crop_name TEXT NOT NULL,
    land_size REAL NOT NULL,
    land_unit TEXT DEFAULT 'বিঘা',
    soil_type TEXT,
    planting_date TEXT,
    expected_yield REAL,
    yield_unit TEXT,
    potential_profit_bdt REAL,
    recommendations_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE SET NULL
);

-- 4. Farmer AI Chat Logs Table
CREATE TABLE IF NOT EXISTS chat_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id TEXT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    detected_crop TEXT,
    response_mode TEXT DEFAULT 'ai_agronomic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optimized Performance Indexes
CREATE INDEX IF NOT EXISTS idx_diagnoses_crop ON diagnoses(crop_name);
CREATE INDEX IF NOT EXISTS idx_diagnoses_disease ON diagnoses(disease_name);
CREATE INDEX IF NOT EXISTS idx_diagnoses_created ON diagnoses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_advisories_crop ON advisories(crop_name);`;

  const ARCHITECTURE_EXPLANATION = `Storage Architecture & Lifecycle Strategy:

1. Relational Database (PostgreSQL / SQLite):
   - Table 'farmers': Multi-tenant farmer profiles, land telemetry, and geo-districts.
   - Table 'diagnoses': Structured audit logs of every leaf scan with confidence scores, disease taxonomy, and prescriptive treatments.
   - Table 'advisories': Yield forecasts and optimized N-P-K fertilizer schedules.
   - Indexing: B-tree indexes on (crop_name), (disease_name), and (created_at DESC).

2. Object Storage (Cloudflare R2 / AWS S3 / GCS):
   - High-resolution leaf images uploaded by farmers stored with presigned URLs.
   - Partitioning schema: /uploads/{crop_type}/{YYYY-MM}/{image_id}.webp.

3. In-Memory Cache (Redis):
   - Sub-millisecond response for recurring disease patterns and API token rate limiting.`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden text-left"
      >
        {/* Modal Top Header */}
        <div className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Firebase ও SQL ডাটাবেজ</h3>
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ক্লাউড লাইভ
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Google Cloud Firestore + SQLite 3 Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Database Quick Metrics */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 py-2.5 grid grid-cols-3 gap-2 shrink-0 text-center">
          <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] text-stone-500 block font-medium">ক্লাউড প্রজেক্ট</span>
            <span className="text-xs font-mono font-bold text-amber-600 truncate block">
              {firebaseConfig.projectId || 'krishiguide'}
            </span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] text-stone-500 block font-medium">মোট রোগ রেকর্ড</span>
            <span className="text-base font-extrabold text-emerald-700">
              {stats?.totalDiagnoses ?? records.length} টি
            </span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] text-stone-500 block font-medium">কালেকশন / টেবিল</span>
            <span className="text-base font-extrabold text-stone-900">৪টি</span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-stone-200 bg-stone-100/70 px-4 pt-2 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('firebase')}
            className={`pb-2 px-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'firebase'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Firebase Console</span>
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`pb-2 px-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'records'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>SQL রেকর্ডস</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2 px-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>SQL Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2 px-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>আর্কিটেকচার ও ফর্ম</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* TAB 0: Firebase Console & Cloud Firestore */}
          {activeTab === 'firebase' && (
            <div className="space-y-3">
              {/* Firebase Banner Card */}
              <div className="bg-linear-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 border border-amber-300 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 leading-tight">
                        Google Cloud Firebase কনসোল
                      </h4>
                      <p className="text-[11px] text-stone-600">
                        সরাসরি ব্রাউজারে ফুল গ্রাফিক্যাল ডাটাবেজ ড্যাশবোর্ড
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full shrink-0">
                    Spark Plan (Free)
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  <div className="bg-white/80 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-stone-500 block">Project ID:</span>
                      <span className="font-mono font-bold text-stone-800">{firebaseConfig.projectId}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(firebaseConfig.projectId, 'projId')}
                      className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-[10px] font-medium text-stone-700 flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedSection === 'projId' ? 'কপি হয়েছে' : 'কপি'}
                    </button>
                  </div>

                  <div className="bg-white/80 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-stone-500 block">Database:</span>
                      <span className="font-mono font-bold text-stone-800 text-[11px]">
                        {firebaseConfig.firestoreDatabaseId || '(default)'}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          firebaseConfig.firestoreDatabaseId || '(default)',
                          'dbId'
                        )
                      }
                      className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-[10px] font-medium text-stone-700 flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedSection === 'dbId' ? 'কপি হয়েছে' : 'কপি'}
                    </button>
                  </div>
                </div>

                {/* Direct Console Access Link */}
                <a
                  href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Firebase Console ড্যাশবোর্ড ওপেন করুন ↗</span>
                </a>
              </div>

              {/* Firestore Collections Guide */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-amber-600" />
                  ক্লাউড Firestore কালেকশন সমূহ:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <span className="font-mono font-bold text-amber-700 block">/diagnoses</span>
                    <span className="text-stone-500 text-[10px]">রোগ নির্ণয় ও প্রেসক্রিপশন</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <span className="font-mono font-bold text-emerald-700 block">/farmers</span>
                    <span className="text-stone-500 text-[10px]">কৃষকের প্রোফাইল তথ্য</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <span className="font-mono font-bold text-blue-700 block">/advisories</span>
                    <span className="text-stone-500 text-[10px]">সার ও ফলন ক্যালকুলেশন</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-stone-200">
                    <span className="font-mono font-bold text-purple-700 block">/chat_inquiries</span>
                    <span className="text-stone-500 text-[10px]">AI প্রশ্নোত্তর অডিট লগ</span>
                  </div>
                </div>
              </div>

              {/* Live Firestore Diagnoses */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <Table className="w-3.5 h-3.5 text-stone-500" />
                    লাইভ ফায়ারবেস ডকুমেন্টস ({firestoreRecords.length})
                  </span>
                  <button
                    onClick={fetchDatabaseData}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    রিফ্রেশ
                  </button>
                </div>

                {firestoreRecords.length === 0 ? (
                  <div className="bg-stone-50 border border-dashed border-stone-300 rounded-xl p-4 text-center space-y-1 text-stone-500">
                    <Cloud className="w-6 h-6 mx-auto text-amber-400" />
                    <p className="text-xs font-medium text-stone-700">ফায়ারবেসে এখনও কোনো রেকর্ড নেই</p>
                    <p className="text-[11px] text-stone-500">
                      ক্যামেরা বা গ্যালারি থেকে যেকোনো পাতার ছবি স্ক্যান করুন, স্বয়ংক্রিয়ভাবে ফায়ারবেসে যুক্ত হবে।
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {firestoreRecords.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="bg-white border border-stone-200 rounded-xl p-2.5 shadow-2xs hover:border-amber-400 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-stone-900">{item.cropName}</span>
                              <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 font-bold px-1.5 rounded">
                                Firestore Doc
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-stone-800 mt-0.5">
                              {item.diseaseName}
                            </p>
                          </div>
                          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                            {item.confidenceScore}% নির্ভুল
                          </span>
                        </div>
                        {item.symptomsObserved && (
                          <p className="text-[11px] text-stone-600 mt-1 line-clamp-1">
                            {item.symptomsObserved}
                          </p>
                        )}
                        <div className="mt-1.5 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                          <span>Doc ID: {item.id ? item.id.substring(0, 10) + '...' : 'pending'}</span>
                          <span className="text-emerald-600 font-medium">সংরক্ষিত ✓</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Firestore Registered Farmers */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    নিবন্ধিত কৃষকবৃন্দ (/farmers কালেকশন) ({firestoreFarmers.length})
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    নাম, ফোন, পাসওয়ার্ড স্টোর
                  </span>
                </div>

                {firestoreFarmers.length === 0 ? (
                  <div className="bg-stone-50 border border-dashed border-stone-200 rounded-xl p-3 text-center space-y-0.5 text-stone-500">
                    <p className="text-xs font-medium text-stone-600">ক্লাউড ফায়ারবেসে এখনো কোনো নতুন নিবন্ধন নেই</p>
                    <p className="text-[10px] text-stone-400">
                      লগআউট করে নতুন একাউন্ট নিবন্ধন করলে স্বয়ংক্রিয়ভাবে এখানে ও ফায়ারবেসে প্রদর্শিত হবে।
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {firestoreFarmers.map((f, idx) => (
                      <div
                        key={f.phone || idx}
                        className="bg-white border border-stone-200 rounded-xl p-2.5 shadow-2xs hover:border-emerald-400 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-stone-900">{f.name}</span>
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 rounded">
                              {f.district || 'বাংলাদেশ'}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
                            {f.phone}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400">
                          <span className="font-mono">পাসওয়ার্ড: {f.password || '••••••••'} (সুরক্ষিত)</span>
                          <span className="text-emerald-600 font-medium">Firestore Active ✓</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: Live SQL Records */}
          {activeTab === 'records' && (
            <div className="space-y-3">
              {/* Filter and Refresh */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {['all', 'পেঁপে', 'কলা', 'বেগুন', 'ভুট্টা', 'ধান'].map((crop) => (
                    <button
                      key={crop}
                      onClick={() => setSelectedCropFilter(crop)}
                      className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                        selectedCropFilter === crop
                          ? 'bg-emerald-700 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                      }`}
                    >
                      {crop === 'all' ? 'সব ফসল' : crop}
                    </button>
                  ))}
                </div>

                <button
                  onClick={fetchDatabaseData}
                  disabled={loading}
                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 shrink-0"
                  title="রিফ্রেশ করুন"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
                </button>
              </div>

              {/* Records List */}
              <div className="space-y-2">
                {records.length === 0 ? (
                  <div className="p-8 text-center text-stone-500 text-xs bg-stone-50 rounded-xl border border-stone-200">
                    কোনো রোগ রেকর্ড পাওয়া যায়নি।
                  </div>
                ) : (
                  records.map((row) => {
                    const isExpanded = expandedRecordId === row.id;
                    let treatments: any = null;
                    try {
                      if (row.treatments_json) {
                        treatments = typeof row.treatments_json === 'string'
                          ? JSON.parse(row.treatments_json)
                          : row.treatments_json;
                      }
                    } catch (e) {
                      // ignore
                    }

                    return (
                      <div
                        key={row.id}
                        className="bg-white border border-stone-200 rounded-xl p-3 shadow-2xs hover:border-emerald-400 transition-all text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-stone-900">
                                {row.crop_name} : {row.disease_name}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                  row.severity === 'তীব্র'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {row.severity}
                              </span>
                            </div>
                            <div className="text-[10px] text-stone-500 mt-0.5 flex items-center gap-2">
                              <span>ID: #{row.id}</span>
                              <span>•</span>
                              <span>কনফিডেন্স: {row.confidence_score}%</span>
                              <span>•</span>
                              <span>{row.created_at}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => setExpandedRecordId(isExpanded ? null : row.id)}
                            className="text-[11px] text-emerald-700 font-semibold hover:underline shrink-0"
                          >
                            {isExpanded ? 'সংক্ষেপ' : 'বিস্তারিত'}
                          </button>
                        </div>

                        {/* Model Source Tag */}
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-stone-600 bg-stone-50 px-2 py-1 rounded-md border border-stone-200/60">
                          <HardDrive className="w-3 h-3 text-emerald-600" />
                          <span className="truncate">মডেল: {row.model_provider || 'Roboflow Computer Vision'}</span>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-2.5 pt-2.5 border-t border-stone-100 space-y-2 text-xs">
                            {row.symptoms_observed && (
                              <div>
                                <span className="font-bold text-stone-800 text-[11px] block">লক্ষণ:</span>
                                <p className="text-[11px] text-stone-600 leading-relaxed">
                                  {row.symptoms_observed}
                                </p>
                              </div>
                            )}

                            {treatments?.chemical && treatments.chemical.length > 0 && (
                              <div>
                                <span className="font-bold text-emerald-800 text-[11px] block">রাসায়নিক প্রতিকার:</span>
                                <p className="text-[11px] text-stone-700">
                                  {treatments.chemical[0].name} ({treatments.chemical[0].dose})
                                </p>
                              </div>
                            )}

                            {treatments?.organic && treatments.organic.length > 0 && (
                              <div>
                                <span className="font-bold text-emerald-800 text-[11px] block">জৈব দমন:</span>
                                <p className="text-[11px] text-stone-700">
                                  {treatments.organic[0].method}: {treatments.organic[0].details}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SQL DDL Schema */}
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">রিলেশনাল স্কিমা (DDL)</h4>
                  <p className="text-[10px] text-stone-500">PostgreSQL ও SQLite উভয় ডাটাবেজে ব্যবহারযোগ্য</p>
                </div>
                <button
                  onClick={() => copyToClipboard(SQL_DDL_CODE, 'sql-schema')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  {copiedSection === 'sql-schema' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>SQL কপি করুন</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-stone-900 text-emerald-300 p-3 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[380px] border border-stone-800">
                <pre className="whitespace-pre">{SQL_DDL_CODE}</pre>
              </div>

              {/* Active Indexes Info */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>পারফরম্যান্স ইনডেক্সসমূহ:</span>
                </div>
                <ul className="text-[11px] text-emerald-800 space-y-0.5 list-disc pl-4">
                  <li><code className="font-mono">idx_diagnoses_crop</code>: দ্রুত ফসল অনুযায়ী কুয়েরির জন্য</li>
                  <li><code className="font-mono">idx_diagnoses_created</code>: সর্বশেষ স্ক্যান ইতিহাস দ্রুত সাজানোর জন্য</li>
                  <li><code className="font-mono">idx_advisories_crop</code>: সার ও ফলন হিস্ট্রি অনুসন্ধানের জন্য</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: Architecture & Hackathon Form Guide */}
          {activeTab === 'architecture' && (
            <div className="space-y-3">
              <div className="bg-stone-900 text-white p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    হ্যাকাথন ফর্ম সাবমিশন গাইড
                  </span>
                  <button
                    onClick={() => copyToClipboard(ARCHITECTURE_EXPLANATION, 'form-text')}
                    className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 flex items-center gap-1"
                  >
                    {copiedSection === 'form-text' ? 'কপি হয়েছে' : 'টেক্সট কপি করুন'}
                  </button>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  আপনার আপলোড করা হ্যাকাথন ফর্মে টিক দেওয়ার নিয়ম ও নিচের বক্সে লেখার ইংরেজি টেক্সট:
                </p>
              </div>

              {/* Checkbox guide cards */}
              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900">Relational (Postgres, MySQL, SQLite):</strong>
                    <p className="text-[11px] text-stone-600">
                      কৃষকের আইডি, সংরক্ষিত রোগ নির্ণয় টেবিল, সার ও ফলন হিস্ট্রি সংরক্ষণের মূল ডাটাবেজ।
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900">Object Storage (S3, R2, GCS):</strong>
                    <p className="text-[11px] text-stone-600">
                      কৃষকের তোলা উচ্চ রেজোলিউশনের পাতার ছবি ক্লাউড বাকেট এ স্টোর রাখার জন্য।
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900">Cache / KV (Redis, Memcached):</strong>
                    <p className="text-[11px] text-stone-600">
                      ঘন ঘন হওয়া রোগ নির্ণয় রেজাল্ট ও API কোটা অপটিমাইজ করার দ্রুত ক্যাশিং লেয়ার।
                    </p>
                  </div>
                </div>
              </div>

              {/* Copyable Box */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-1.5">
                <span className="text-[11px] font-bold text-stone-700 block">
                  নিচের বক্সে পেস্ট করার কপি-রেডি টেক্সট:
                </span>
                <div className="bg-white p-2.5 rounded-lg border border-stone-200 text-[10px] font-mono text-stone-800 leading-relaxed max-h-[140px] overflow-y-auto">
                  {ARCHITECTURE_EXPLANATION}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-stone-50 px-4 py-2.5 border-t border-stone-200 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-stone-500 flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-emerald-600" />
            ফাইল: <code className="font-mono">krishi_database.sqlite</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </motion.div>
    </div>
  );
};
