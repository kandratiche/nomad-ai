import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const GUIDES = [
  {
    email: "aibek.nurlan@nomad.ai",
    name: "Aibek Nurlan",
    home_city: "Almaty",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    guide_info: {
      bio: "Born and raised in Almaty. I love showing visitors the hidden gems and stories behind every street. 10+ years guiding experience.",
      price: 8500,
      currency: "₸",
      rating: 4.9,
      reviews_count: 247,
      experience_years: 10,
      tours_completed: 412,
      languages: ["Kazakh", "Russian", "English"],
      specialties: ["City Tours", "Food Tours", "Photography Walks"],
      tags: ["History", "Architecture", "Local Food"],
      whatsapp_number: "77001234567",
      response_time: "< 1 hour",
      hero_image_url: "https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=800",
      is_verified: true,
      tour_packages: [
        { title: "Almaty Highlights", duration: "4h", price: 34000, currency: "₸", description: "Best of Almaty in one day" },
        { title: "Food & Bazaar", duration: "3h", price: 25500, currency: "₸", description: "Green Bazaar & local tastings" },
      ],
      schedule: { monday: ["09:00-18:00"], tuesday: ["09:00-18:00"], wednesday: ["09:00-18:00"], thursday: ["09:00-18:00"], friday: ["09:00-18:00"] },
    },
  },
  {
    email: "dana.serikova@nomad.ai",
    name: "Dana Serikova",
    home_city: "Almaty",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    guide_info: {
      bio: "Mountain lover and certified hiking guide. Kok Tobe, Medeu, and beyond. Let's find the best views together.",
      price: 7200,
      currency: "₸",
      rating: 4.8,
      reviews_count: 189,
      experience_years: 6,
      tours_completed: 298,
      languages: ["Russian", "English"],
      specialties: ["Mountain Tours", "Sunset Views", "Instagram Spots"],
      tags: ["Nature", "Hiking", "Photography"],
      whatsapp_number: "77001234568",
      response_time: "< 2 hours",
      hero_image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
      is_verified: true,
      tour_packages: [
        { title: "Kok Tobe Sunset", duration: "3h", price: 21600, currency: "₸", description: "Cable car & mountain views" },
        { title: "Medeu & Shymbulak", duration: "6h", price: 43200, currency: "₸", description: "Ice rink & ski resort" },
      ],
      schedule: { weekend: ["10:00-20:00"], friday: ["14:00-20:00"] },
    },
  },
  {
    email: "yerzhan.batyrov@nomad.ai",
    name: "Yerzhan Batyrov",
    home_city: "Astana",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    guide_info: {
      bio: "Astana native. Expert in the new capital's architecture, parks, and the best spots for evening fun.",
      price: 6500,
      currency: "₸",
      rating: 4.7,
      reviews_count: 134,
      experience_years: 5,
      tours_completed: 221,
      languages: ["Kazakh", "Russian", "English"],
      specialties: ["Architecture Tours", "Bayterek", "Khan Shatyr"],
      tags: ["Astana", "Modern Architecture", "Nightlife"],
      whatsapp_number: "77001234569",
      response_time: "< 1 hour",
      hero_image_url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800",
      is_verified: true,
      tour_packages: [
        { title: "Astana in a Day", duration: "5h", price: 32500, currency: "₸", description: "Bayterek, Nur-Astana Mosque, Expo" },
      ],
      schedule: { monday: ["10:00-19:00"], tuesday: ["10:00-19:00"], wednesday: ["10:00-19:00"], thursday: ["10:00-19:00"], friday: ["10:00-19:00"], saturday: ["10:00-16:00"] },
    },
  },
  {
    email: "aruzhan.ospanova@nomad.ai",
    name: "Aruzhan Ospanova",
    home_city: "Almaty",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    guide_info: {
      bio: "Art historian and family-friendly guide. Museums, parks, and activities that kids love.",
      price: 5500,
      currency: "₸",
      rating: 4.6,
      reviews_count: 67,
      experience_years: 3,
      tours_completed: 89,
      languages: ["Kazakh", "Russian"],
      specialties: ["Museum Tours", "Family Tours", "Cultural Walks"],
      tags: ["Culture", "Museums", "Family"],
      whatsapp_number: "77001234570",
      response_time: "< 3 hours",
      hero_image_url: "https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=800",
      is_verified: false,
      tour_packages: [
        { title: "Museum Day", duration: "4h", price: 22000, currency: "₸", description: "Central State Museum & more" },
      ],
      schedule: { tuesday: ["10:00-17:00"], thursday: ["10:00-17:00"], saturday: ["10:00-15:00"] },
    },
  },
  {
    email: "murat.zhanatayev@nomad.ai",
    name: "Murat Zhanatayev",
    home_city: "Aktau",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    guide_info: {
      bio: "Caspian coast specialist. Sherkala, beaches, and the unique landscape of Mangystau. Off-road and camping trips.",
      price: 9000,
      currency: "₸",
      rating: 4.9,
      reviews_count: 312,
      experience_years: 12,
      tours_completed: 534,
      languages: ["Kazakh", "Russian", "English"],
      specialties: ["Caspian Tours", "Sherkala", "Desert Adventures"],
      tags: ["Aktau", "Caspian", "Adventure"],
      whatsapp_number: "77001234571",
      response_time: "< 1 hour",
      hero_image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
      is_verified: true,
      tour_packages: [
        { title: "Sherkala & Canyon", duration: "8h", price: 72000, currency: "₸", description: "Full day desert adventure" },
        { title: "Caspian Beach Day", duration: "5h", price: 45000, currency: "₸", description: "Beaches and local seafood" },
      ],
      schedule: { monday: ["07:00-20:00"], tuesday: ["07:00-20:00"], wednesday: ["07:00-20:00"], thursday: ["07:00-20:00"], friday: ["07:00-20:00"], saturday: ["07:00-20:00"] },
    },
  },
];

async function seed() {
  for (const guide of GUIDES) {
    // Check if user with this email already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", guide.email)
      .maybeSingle();

    if (existing) {
      // Update existing guide
      const { error } = await supabase
        .from("users")
        .update({
          name: guide.name,
          home_city: guide.home_city,
          avatar_url: guide.avatar_url,
          guide_info: guide.guide_info,
          roles: "guide",
        })
        .eq("id", existing.id);

      if (error) {
        console.error(`Failed to update ${guide.name}:`, error.message);
      } else {
        console.log(`✅ Updated: ${guide.name} (${guide.home_city})`);
      }
    } else {
      // Create new guide user via admin API
      const { data: auth, error: authErr } = await supabase.auth.admin.createUser({
        email: guide.email,
        password: "NomadGuide2025!",
        email_confirm: true,
      });

      if (authErr) {
        console.error(`Failed to create auth for ${guide.name}:`, authErr.message);
        continue;
      }

      const { error } = await supabase
        .from("users")
        .update({
          name: guide.name,
          home_city: guide.home_city,
          avatar_url: guide.avatar_url,
          guide_info: guide.guide_info,
          roles: "guide",
        })
        .eq("id", auth.user.id);

      if (error) {
        console.error(`Failed to set profile for ${guide.name}:`, error.message);
      } else {
        console.log(`✅ Created: ${guide.name} (${guide.home_city})`);
      }
    }
  }

  console.log("\nDone!");
}

seed().catch(console.error);
