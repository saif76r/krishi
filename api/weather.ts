export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const lat = req.query?.lat || "23.8103";
    const lon = req.query?.lon || "90.4125";
    const location = req.query?.location || "Dhaka";

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FDhaka`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather API returned ${response.status}`);
    const data = await response.json();

    return res.status(200).json({ success: true, data, location, fetchedAt: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch weather", details: err.message });
  }
}
