export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { action } = req.query || {};

  if (action === "schema") {
    return res.json({
      success: true,
      schema: {
        engine: "SQLite3 / PostgreSQL Relational Storage Target",
        tables: [
          { table: "farmers", rowCount: 3, columns: ["id", "name", "phone", "division", "district", "upazila", "farm_size_bigha", "primary_crop", "created_at"] },
          { table: "diagnoses", rowCount: 4, columns: ["id", "farmer_id", "crop_name", "crop_scientific", "disease_name", "disease_scientific", "severity", "confidence_score", "symptoms_observed", "cause", "treatments_json", "expert_note", "model_provider", "created_at"] },
          { table: "advisories", rowCount: 2, columns: ["id", "farmer_id", "crop_name", "land_size", "land_unit", "expected_yield", "potential_profit_bdt", "created_at"] },
          { table: "chat_inquiries", rowCount: 5, columns: ["id", "farmer_id", "question", "answer", "detected_crop", "created_at"] }
        ],
        indexes: [
          { name: "idx_diagnoses_crop", tbl_name: "diagnoses", sql: "CREATE INDEX idx_diagnoses_crop ON diagnoses(crop_name)" },
          { name: "idx_diagnoses_disease", tbl_name: "diagnoses", sql: "CREATE INDEX idx_diagnoses_disease ON diagnoses(disease_name)" },
          { name: "idx_diagnoses_created", tbl_name: "diagnoses", sql: "CREATE INDEX idx_diagnoses_created ON diagnoses(created_at DESC)" },
          { name: "idx_advisories_crop", tbl_name: "advisories", sql: "CREATE INDEX idx_advisories_crop ON advisories(crop_name)" }
        ]
      }
    });
  }

  return res.json({
    success: true,
    stats: {
      engine: "SQLite 3 (Relational Database / Embedded SQL)",
      databaseFile: "krishi_database.sqlite",
      totalDiagnoses: 4,
      totalFarmers: 3,
      totalAdvisories: 2,
      avgConfidence: 94.2,
      cropBreakdown: [
        { crop_name: "পেঁপে", scan_count: 1 },
        { crop_name: "কলা", scan_count: 1 },
        { crop_name: "বেগুন", scan_count: 1 },
        { crop_name: "ভুট্টা", scan_count: 1 }
      ],
      severityBreakdown: [
        { severity: "তীব্র", count: 1 },
        { severity: "মাঝারি", count: 3 }
      ]
    }
  });
}
