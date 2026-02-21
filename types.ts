export interface City {
  id: string;
  name: string;
  country: string;
  safetyScore: number;
  popularityScore: number;
  imageUrl: string;
}

export interface Interest {
  id: string;
  label: string;
  icon: string;
}

export interface Guide {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  pricePerHour: number;
  currency: string;
  tags: string[];
  bio: string;
  languages: string[];
  specialties: string[];
  heroImageUrl: string;
  toursCompleted: number;
  responseTime: string;
  experienceYears: number;
  tourPackages: TourPackage[];
  whatsappNumber: string;
}

export interface TourPackage {
  id: string;
  title: string;
  duration: string;
  price: number;
  currency: string;
  description: string;
}

export interface Place {
  id: string;
  name: string;
  imageUrl: string;
  safetyScore: number;
  rating?: number;
  tags: string[];
  description?: string;
}

export type SafetyLevel = "safe" | "warning" | "danger";

export interface TimelineStop {
  id: string;
  title: string;
  time: string;
  imageUrl: string;
  safetyLevel: SafetyLevel;
  safetyScore: number;
  tags: string[];
  description?: string;
  instaWorthy?: boolean;
  walkingTime?: string;
  walkingTerrain?: string;
  aiNote?: string;
  visibility?: string;
  crowdLevel?: string;
  // Detail fields
  type?: string;
  rating?: number | null;
  address?: string | null;
  priceLevel?: number;          // 0=free → 5=luxury
  openingHours?: string | null;
  contact?: string | null;
  reviewCount?: number;
  verified?: boolean;
  distanceKm?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export type ConfidenceLevel = "verified" | "ai_generated" | "low_confidence";

export interface SectionOption {
  place: TimelineStop;
  why: string;                         // AI-generated contextual description
  budgetHint?: string;                 // e.g., "10–15k KZT"
  confidence: number;                  // 0.0 – 1.0 semantic similarity score
  confidenceLevel: ConfidenceLevel;    // classification based on anti-hallucination pipeline
}

export interface StructuredSection {
  title: string;                       // "Ужин", "После ужина"
  emoji: string;                       // "🍽", "🌆"
  timeRange: string;                   // "18:30–20:00"
  options: SectionOption[];            // 2-3 shown options
  reserves: SectionOption[];           // 1-2 hidden backups for Replace
}

export interface AIResponse {
  title: string;
  sections: StructuredSection[];
  scoredPool: string[];                // Remaining place IDs for Replace fallback
}

export interface Itinerary {
  id: string;
  cityId: string;
  cityName: string;
  title: string;
  stops: TimelineStop[];
  totalSafetyScore: number;
  totalDuration: string;
  estimatedCost: string;
  previewImageUrl: string;
  createdAt: string;
}

export interface TrendingExperience {
  id: string;
  title: string;
  imageUrl: string;
  safetyScore: number;
  tags: string[];
}
