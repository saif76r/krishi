import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'krishi_database.sqlite');

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initDatabase(dbInstance);
  }
  return dbInstance;
}

function initDatabase(db: DatabaseSync) {
  // Execute base DDL schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS farmers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      division TEXT,
      district TEXT,
      upazila TEXT,
      farm_size_bigha REAL DEFAULT 1.0,
      primary_crop TEXT DEFAULT 'ধান',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

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
      model_provider TEXT DEFAULT 'Hugging Face Pre-Trained Vision Model',
      plant_part TEXT DEFAULT 'পাতা',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE SET NULL
    );

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
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS chat_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id TEXT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      detected_crop TEXT,
      response_mode TEXT DEFAULT 'ai_agronomic',
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_diagnoses_crop ON diagnoses(crop_name);
    CREATE INDEX IF NOT EXISTS idx_diagnoses_disease ON diagnoses(disease_name);
    CREATE INDEX IF NOT EXISTS idx_diagnoses_created ON diagnoses(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_advisories_crop ON advisories(crop_name);
    CREATE INDEX IF NOT EXISTS idx_advisories_created ON advisories(created_at DESC);
  `);

  // Seed sample initial records if empty for hackathon demonstration
  try {
    const countRow = db.prepare('SELECT COUNT(*) as count FROM diagnoses').get() as { count: number };
    if (countRow && countRow.count === 0) {
      seedDemoData(db);
    }
  } catch (err) {
    console.warn('Database seed check warning:', err);
  }
}

function seedDemoData(db: DatabaseSync) {
  // Insert demo farmers
  const insertFarmer = db.prepare(`
    INSERT OR IGNORE INTO farmers (id, name, phone, division, district, upazila, farm_size_bigha, primary_crop)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertFarmer.run('farmer_001', 'মো: রফিকুল ইসলাম', '01711223344', 'রাজশাহী', 'বগুড়া', 'শিবগঞ্জ', 3.5, 'ভুট্টা');
  insertFarmer.run('farmer_002', 'আব্দুল করিম', '01822334455', 'ঢাকা', 'নরসিংদী', 'বেলাব', 2.0, 'কলা');
  insertFarmer.run('farmer_003', 'মো: হাসেম আলী', '01933445566', 'খুলনা', 'যশোর', 'বাঘারপাড়া', 1.8, 'বেগুন');

  // Insert demo diagnoses
  const insertDiag = db.prepare(`
    INSERT INTO diagnoses (farmer_id, crop_name, crop_scientific, disease_name, disease_scientific, severity, confidence_score, symptoms_observed, cause, treatments_json, expert_note, model_provider, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 days', 'localtime'))
  `);

  insertDiag.run(
    'farmer_001',
    'পেঁপে',
    'Carica papaya',
    'পেঁপের রিং স্পট ভাইরাস (PRSV)',
    'Papaya Ringspot Virus',
    'মাঝারি',
    94.5,
    'পাতায় তৈলাক্ত বলয় ও গাঢ়-হালকা সবুজ মোজাইক ছোপ, পাতা কোঁকড়ানো',
    'এফিড বা জাবপোকা বাহিত ভাইরাস সংক্রমণ',
    JSON.stringify({
      chemical: [{ name: 'ইমিডাক্লোপ্রিড ২০ এসএল', dose: '০.৫ মিলি/লিটার পানি', instruction: 'পাতার উভয় পিঠে স্প্রে করুন।' }],
      organic: [{ method: 'নিম তেল স্প্রে', details: '৫ মিলি/লিটার পানিতে স্প্রে করে বাহক পোকা নিয়ন্ত্রণ করুন।' }],
      prevention: ['সুস্থ ও রোগমুক্ত চারা ব্যবহার করুন এবং চারা অবস্থায় নেট ব্যবহার করুন।']
    }),
    'রিং স্পট ভাইরাস সরাসরি ওষুধ দিয়ে সারানো যায় না, বাহক পোকা দমনই প্রধান সমাধান।',
    'Hugging Face AI Vision (dima806/plant_disease_detection)'
  );

  insertDiag.run(
    'farmer_002',
    'কলা',
    'Musa acuminata',
    'কলার সিগাটোকা রোগ (Black / Yellow Sigatoka)',
    'Pseudocercospora musae',
    'মাঝারি',
    92.0,
    'পাতায় সমান্তরালে ছোট হলুদ ও বাদামি লম্বাটে ছোপ দাগ, পরবর্তীতে পাতা পুড়ে যাওয়ার মতো শুকিয়ে যাওয়া',
    'উচ্চ আর্দ্রতা ও স্যাঁতসেঁতে আবহাওয়ায় ছত্রাকের বিস্তার',
    JSON.stringify({
      chemical: [{ name: 'প্রোপিকোনাজল ২৫% ইসি (টিল্ট)', dose: '১ মিলি/লিটার পানি', instruction: 'লক্ষণ দেখা মাত্র পাতার ওপর-নিচে ভালো করে ভিজিয়ে স্প্রে করুন।' }],
      organic: [{ method: 'আক্রান্ত পাতা ছাঁটাই', details: 'অর্ধেকের বেশি আক্রান্ত পাতা কেটে বাগানের বাইরে পুড়িয়ে ফেলুন।' }],
      prevention: ['জমিতে সেচ ও বৃষ্টির পানি নিষ্কাশনের সুষ্ঠু নালা রাখুন।']
    }),
    'সিগাটোকা রোগ দ্রুত পুরো পাতায় ছড়িয়ে যায়, তাই প্রাথমিক দাগেই ছত্রাকনাশক দিন।',
    'Hugging Face AI Vision (dima806/plant_disease_detection)'
  );

  insertDiag.run(
    'farmer_003',
    'বেগুন',
    'Solanum melongena',
    'বেগুনের ডগা ও ফল ছিদ্রকারী পোকা (Shoot & Fruit Borer)',
    'Leucinodes orbonalis',
    'তীব্র',
    95.0,
    'কচি ডগা নুয়ে পড়ে শুকিয়ে যাওয়া এবং ফলের গায়ে ছিদ্র ও কীড়ার মল দৃশ্যমান',
    'লুসিনোডেস পোকার কীড়া ডগা ও ফলের ভেতর ঢুকে ক্ষতি করে',
    JSON.stringify({
      chemical: [{ name: 'এমামেকটিন বেনজোয়েট ৫ এসজি (প্রোক্লেম)', dose: '১ গ্রাম/লিটার পানি', instruction: 'বিকেলের মিষ্টি রোদে পাতায় ও ডগায় স্প্রে করুন।' }],
      organic: [{ method: 'সেক্স ফেরোমোন ফাঁদ', details: 'প্রতি শতকে ১টি লিউরযুক্ত ফাঁদ স্থাপন করে পুরুষ পোকা আটকে ফেলুন।' }],
      prevention: ['নুয়ে পড়া ডগা নিয়মিত হাত দিয়ে ভেঙে মাটিতে পুঁতে ফেলুন।']
    }),
    'ফেরোমোন ফাঁদ ব্যবহার করলে কীটনাশক ছাড়াই পোকার আক্রমণ ৮০% কমানো যায়।',
    'Hugging Face AI Vision (dima806/plant_disease_detection)'
  );

  insertDiag.run(
    'farmer_001',
    'ভুট্টা',
    'Zea mays',
    'ভুট্টার কাণ্ড পচা ও গোড়া পচা রোগ (Stem Rot)',
    'Diplodia maydis & Fusarium',
    'মাঝারি',
    93.8,
    'গাছের গোড়ার কাণ্ড কালচে বাদামি ও নরম হয়ে যাওয়া, কাণ্ড ফাঁপা হওয়া',
    'জমিতে জলাবদ্ধতা ও অতিরিক্ত আর্দ্রতায় ছত্রাকের আক্রমণ',
    JSON.stringify({
      chemical: [{ name: 'কার্বেন্ডাজিম ৫০% ডব্লিউপি (অটোস্টিন)', dose: '২ গ্রাম/লিটার পানি', instruction: 'গাছের গোড়া ও মাটিতে স্প্রে করুন।' }],
      organic: [{ method: 'ট্রাইকোডার্মা জৈব সার', details: 'গোড়ার মাটিতে ট্রাইকোডার্মা মিশ্রিত ভার্মিকম্পোস্ট দিন।' }],
      prevention: ['পানি নিষ্কাশন ও পটাশ সার ব্যবহার কাণ্ড শক্ত রাখে।']
    }),
    'বাতাসে গাছ ভেঙে পড়ার ঝুঁকি থাকে, দ্রুত ড্রেন পরিষ্কার করে ছত্রাকনাশক প্রয়োগ করুন।',
    'Hugging Face AI Vision (dima806/plant_disease_detection)'
  );
}

// -------------------------------------------------------------
// Database Access Methods
// -------------------------------------------------------------

export interface DiagnosisRecordInput {
  farmerId?: string;
  cropName: string;
  cropScientific?: string;
  diseaseName: string;
  diseaseScientific?: string;
  severity?: string;
  confidenceScore: number;
  symptomsObserved?: string;
  cause?: string;
  treatments?: any;
  expertNote?: string;
  imageUrl?: string;
  modelProvider?: string;
  plantPart?: string;
}

export function saveDiagnosis(input: DiagnosisRecordInput): number {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO diagnoses (
      farmer_id, crop_name, crop_scientific, disease_name, disease_scientific,
      severity, confidence_score, symptoms_observed, cause,
      treatments_json, expert_note, image_url, model_provider, plant_part
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const treatmentsJson = typeof input.treatments === 'string' 
    ? input.treatments 
    : JSON.stringify(input.treatments || {});

  const res = stmt.run(
    input.farmerId || 'anonymous_farmer',
    input.cropName,
    input.cropScientific || '',
    input.diseaseName,
    input.diseaseScientific || '',
    input.severity || 'মাঝারি',
    input.confidenceScore || 90,
    input.symptomsObserved || '',
    input.cause || '',
    treatmentsJson,
    input.expertNote || '',
    input.imageUrl || '',
    input.modelProvider || 'Hugging Face Pre-Trained Vision Model',
    input.plantPart || 'পাতা'
  );

  return Number(res.lastInsertRowid);
}

export function getDiagnoses(limit: number = 20, offset: number = 0, crop?: string) {
  const db = getDatabase();
  if (crop && crop !== 'all') {
    return db.prepare(`
      SELECT * FROM diagnoses 
      WHERE crop_name = ? 
      ORDER BY id DESC 
      LIMIT ? OFFSET ?
    `).all(crop, limit, offset);
  }

  return db.prepare(`
    SELECT * FROM diagnoses 
    ORDER BY id DESC 
    LIMIT ? OFFSET ?
  `).all(limit, offset);
}

export function getDatabaseStats() {
  const db = getDatabase();
  const totalDiagnoses = (db.prepare('SELECT COUNT(*) as count FROM diagnoses').get() as { count: number }).count;
  const totalFarmers = (db.prepare('SELECT COUNT(*) as count FROM farmers').get() as { count: number }).count;
  const totalAdvisories = (db.prepare('SELECT COUNT(*) as count FROM advisories').get() as { count: number }).count;

  const cropBreakdown = db.prepare(`
    SELECT crop_name, COUNT(*) as scan_count 
    FROM diagnoses 
    GROUP BY crop_name 
    ORDER BY scan_count DESC
  `).all();

  const severityBreakdown = db.prepare(`
    SELECT severity, COUNT(*) as count 
    FROM diagnoses 
    GROUP BY severity
  `).all();

  const avgConfidenceRow = db.prepare(`
    SELECT AVG(confidence_score) as avg_confidence 
    FROM diagnoses
  `).get() as { avg_confidence: number };

  const latestScan = db.prepare(`
    SELECT * FROM diagnoses 
    ORDER BY id DESC 
    LIMIT 1
  `).get();

  return {
    engine: 'SQLite 3 (Relational Database / Embedded SQL)',
    databaseFile: path.basename(DB_PATH),
    totalDiagnoses,
    totalFarmers,
    totalAdvisories,
    avgConfidence: avgConfidenceRow ? Math.round(avgConfidenceRow.avg_confidence * 10) / 10 : 0,
    cropBreakdown,
    severityBreakdown,
    latestScan,
  };
}

export function getDatabaseSchemaMetadata() {
  const db = getDatabase();
  const tables = ['farmers', 'diagnoses', 'advisories', 'chat_inquiries'];
  
  const metadata = tables.map((tableName) => {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    const count = (db.prepare(`SELECT COUNT(*) as c FROM ${tableName}`).get() as { c: number }).c;
    return {
      table: tableName,
      rowCount: count,
      columns,
    };
  });

  const indexes = db.prepare(`
    SELECT name, tbl_name, sql 
    FROM sqlite_master 
    WHERE type = 'index' AND sql IS NOT NULL
  `).all();

  return {
    engine: 'SQLite3 / PostgreSQL Relational Storage Target',
    tables: metadata,
    indexes,
  };
}
