
export const seasons = ["Kharif", "Rabi", "Zaid"];

export const seasonMeta = {
  Kharif: { emoji: "🌧️", label: "Kharif" },
  Rabi: { emoji: "❄️", label: "Rabi" },
  Zaid: { emoji: "☀️", label: "Zaid" }
};

export const cropOptions = [
  { en: "Rice", bn: "ধান" },
  { en: "Maize", bn: "ভুট্টা" },
  { en: "Wheat", bn: "গম" },
  { en: "Lentil", bn: "মসুর ডাল" },
  { en: "Mustard", bn: "সরিষা" },
  { en: "Chickpea", bn: "ছোলা" },
  { en: "Green Gram", bn: "মুগ ডাল" }
];

export const cropsBySeason = {
  Kharif: ["Rice", "Maize", "Green Gram"],
  Rabi: ["Wheat", "Lentil", "Mustard", "Chickpea", "Maize"],
  Zaid: ["Green Gram"]
};

export const cropEmoji = {
  Rice: "🌾",
  Maize: "🌽",
  Wheat: "🌾",
  Lentil: "🫘",
  Mustard: "🌼",
  Chickpea: "🫘",
  "Green Gram": "🌱"
};

export const soilTypeOptions = [
  "Clay Soil",
  "Sandy Soil",
  "Loamy Soil",
  "Silty Soil"
];
