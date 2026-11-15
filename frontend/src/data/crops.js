
export const seasons = ["Kharif", "Rabi", "Zaid"];

export const seasonMeta = {
  Kharif: { emoji: "🌧️", label: "Kharif" },
  Rabi: { emoji: "❄️", label: "Rabi" },
  Zaid: { emoji: "☀️", label: "Zaid" }
};

export const cropOptions = [
  { en: "Rice", bn: "ধান" },
  { en: "Maize", bn: "ভুট্টা" },
  { en: "Ragi", bn: "রাগি" },
  { en: "Horse Gram", bn: "কুলথি" },
  { en: "Moth Bean", bn: "মটকি" },
  { en: "Peas / Beans", bn: "মটর / শিম" },
  { en: "Safflower", bn: "কুসুম" },
  { en: "Potato", bn: "আলু" },
  { en: "Tomato", bn: "টমেটো" },
  { en: "Brinjal", bn: "বেগুন" },
  { en: "Cucurbits", bn: "কুমড়াজাতীয়" },
  { en: "Cabbage", bn: "বাঁধাকপি" },
  { en: "Cauliflower", bn: "ফুলকপি" },
  { en: "Bhindi", bn: "ঢেঁড়স" },
  { en: "Onion", bn: "পেঁয়াজ" },
  { en: "Wheat", bn: "গম" },
  { en: "Mustard", bn: "সরিষা" },
  { en: "Lentil", bn: "মসুর ডাল" },
  { en: "Chickpea", bn: "ছোলা" },
  { en: "Green Gram", bn: "মুগ ডাল" },
  { en: "Black Gram", bn: "মাষকলাই" },
  { en: "Pigeon Pea", bn: "অড়হর ডাল" },
  { en: "Groundnut", bn: "চিনাবাদাম" },
  { en: "Sesame", bn: "তিল" },
  { en: "Soybean", bn: "সয়াবিন" },
  { en: "Jute", bn: "পাট" },
  { en: "Sunflower", bn: "সূর্যমুখী" }
];

export const cropsBySeason = {
  Kharif: [
    "Rice", "Maize", "Ragi", "Horse Gram",
    "Moth Bean", "Peas / Beans", "Tomato",
    "Brinjal", "Cucurbits", "Bhindi", "Onion",
    "Green Gram", "Black Gram", "Pigeon Pea",
    "Groundnut", "Sesame", "Soybean", "Jute"
  ],

  Rabi: [
    "Horse Gram", "Moth Bean", "Peas / Beans",
    "Safflower", "Potato", "Tomato", "Brinjal",
    "Cabbage", "Cauliflower", "Onion",
    "Wheat", "Mustard", "Lentil", "Chickpea",
    "Sunflower", "Maize"
  ],

  Zaid: [
    "Maize", "Ragi", "Peas / Beans", "Potato",
    "Tomato", "Brinjal", "Cucurbits",
    "Bhindi", "Onion", "Green Gram",
    "Black Gram", "Groundnut", "Sunflower"
  ]
};

export const cropEmoji = {
  Rice: "🌾",
  Maize: "🌽",
  Ragi: "🌾",
  "Horse Gram": "🫘",
  "Moth Bean": "🫘",
  "Peas / Beans": "🫛",
  Safflower: "🌼",
  Potato: "🥔",
  Tomato: "🍅",
  Brinjal: "🍆",
  Cucurbits: "🥒",
  Cabbage: "🥬",
  Cauliflower: "🥦",
  Bhindi: "🌿",
  Onion: "🧅",
  Wheat: "🌾",
  Mustard: "🌼",
  Lentil: "🫘",
  Chickpea: "🫘",
  "Green Gram": "🌱",
  "Black Gram": "🫘",
  "Pigeon Pea": "🌿",
  Groundnut: "🥜",
  Sesame: "🌱",
  Soybean: "🫘",
  Jute: "🌿",
  Sunflower: "🌻"
};

export const soilTypeOptions = [
  "Clay Soil",
  "Sandy Soil",
  "Loamy Soil",
  "Silty Soil"
];
