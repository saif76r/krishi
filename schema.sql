-- =========================================================================
-- KRISHI SHAHAYOK - RELATIONAL DATABASE SCHEMA (PostgreSQL / SQLite Compatible)
-- Project: AI-Powered Smart Agriculture & Crop Disease Diagnostic System
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

-- 4. Farmer AI Chat Logs & Inquiries Table
CREATE TABLE IF NOT EXISTS chat_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id TEXT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    detected_crop TEXT,
    response_mode TEXT DEFAULT 'ai_agronomic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance & Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_diagnoses_crop ON diagnoses(crop_name);
CREATE INDEX IF NOT EXISTS idx_diagnoses_disease ON diagnoses(disease_name);
CREATE INDEX IF NOT EXISTS idx_diagnoses_created ON diagnoses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_advisories_crop ON advisories(crop_name);
CREATE INDEX IF NOT EXISTS idx_advisories_created ON advisories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_inquiries(created_at DESC);
