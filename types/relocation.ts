export type AccommodationType = '1BHK' | '2BHK' | '1RK' | 'Coliving' | 'Any';
export type FurnishedPreference = 'furnished' | 'semi-furnished' | 'unfurnished' | 'any';

export interface CustomRequirement {
  id: string;
  category: string; // e.g. 'school', 'hospital', 'daycare', 'pet_park', 'sports', 'coworking', 'park'
  label: string; // e.g. 'School / Education', 'Hospital / Clinic', 'Daycare / Preschool'
  targetDistanceKm: number; // e.g. 1.0
  queryKeyword?: string;
  priority?: 'essential' | 'preferred';
}

export interface CustomAmenityData {
  category: string;
  label: string;
  targetDistanceKm?: number;
  nearestDistanceKm: number;
  items: PlaceItem[];
  evaluation: string;
  isCompliant: boolean;
}

export interface UserConstraints {
  city: string;
  officeLocation: string;
  salaryLpa?: number;
  budgetMonthlyInr: number;
  maxCommuteMin: number;
  accommodationType: AccommodationType;
  furnishedPreference: FurnishedPreference;
  gymRequired: boolean;
  maxGymDistKm: number;
  foodPreference: 'diverse' | 'vegetarian' | 'budget_friendly' | 'cafes' | 'any';
  transitPreference: 'metro_priority' | 'bus_ok' | 'cab_commute' | 'walkable';
  groceryPreference: 'instant_delivery' | 'walkable_supermarket' | 'any';
  customRequirements?: CustomRequirement[];
  additionalNotes?: string;
  demoMode?: boolean;
}

export interface PlaceItem {
  id: string;
  title: string;
  rating?: number;
  reviewsCount?: number;
  address?: string;
  distanceKm?: number;
  category?: string;
  thumbnail?: string;
  link?: string;
  snippet?: string;
  priceLevel?: string;
  verifiedSource?: string;
}

export interface HotelItem {
  id: string;
  title: string;
  pricePerNightInr?: number;
  priceFormatted?: string;
  rating?: number;
  reviewsCount?: number;
  distanceToOfficeKm?: number;
  distanceDescription?: string;
  neighborhood?: string;
  thumbnail?: string;
  link?: string;
  amenities?: string[];
  sourceEngine: 'google_hotels' | 'demo_snapshot';
}

export interface ReviewTheme {
  sentiment: 'positive' | 'negative' | 'neutral';
  topic: string;
  text: string;
  sampleCount?: number;
}

export interface SourceCitation {
  title: string;
  url?: string;
  query: string;
  engine: 'google_maps' | 'google' | 'google_hotels' | 'google_local';
  accessedAt: string;
  isCachedDemo?: boolean;
}

export interface NeighborhoodData {
  id: string;
  name: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  overview: string;
  estimatedRent: {
    bhk1: { min: number; max: number };
    bhk2: { min: number; max: number };
    confidence: 'verified_market_range' | 'estimate' | 'insufficient_data';
    sourceSummary: string;
    sources: SourceCitation[];
  };
  commute: {
    estimatedMinutes: number;
    peakMinutes: number;
    distanceKm: number;
    mode: string;
    routeDescription: string;
    isEstimate: boolean;
  };
  gyms: {
    countWithinRadius: number;
    nearestDistanceKm: number;
    items: PlaceItem[];
  };
  restaurants: {
    countFound: number;
    topHighlights: PlaceItem[];
    vibe: string;
  };
  groceries: {
    countFound: number;
    quickCommerceAvailable: boolean;
    items: PlaceItem[];
  };
  transit: {
    nearestMetroStation?: string;
    metroDistanceKm?: number;
    hasDirectBus: boolean;
    transitItems: PlaceItem[];
  };
  reviewThemes: ReviewTheme[];
  pros: string[];
  cons: string[];
  sources: SourceCitation[];
  customAmenities?: CustomAmenityData[];
}

export interface ScoreFactorBreakdown {
  score: number; // 0 - 100
  weight: number; // e.g. 0.30
  weightedValue: number;
  summary: string;
}

export interface NeighborhoodScore {
  neighborhoodId: string;
  neighborhoodName: string;
  overallScore: number; // 0 - 100
  factors: {
    budget: ScoreFactorBreakdown;
    commute: ScoreFactorBreakdown;
    gym: ScoreFactorBreakdown;
    food: ScoreFactorBreakdown;
    groceries: ScoreFactorBreakdown;
    transit: ScoreFactorBreakdown;
    customFactors?: Record<string, ScoreFactorBreakdown>;
  };
  whyMatched: string[];
  tradeOffs: string[];
  recommendationSummary: string;
}

export interface ScoredNeighborhood {
  data: NeighborhoodData;
  score: NeighborhoodScore;
}

export type StepStatus = 'idle' | 'pending' | 'in_progress' | 'completed' | 'warning' | 'error';

export interface AgentStep {
  id: string;
  label: string;
  detail: string;
  status: StepStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  queryCount?: number;
  queriesRun?: string[];
}

export interface RefinementResult {
  updatedConstraints: UserConstraints;
  updatedNeighborhoods: ScoredNeighborhood[];
  agentResponse: string;
  changeSummary: string[];
}

export interface AgentResearchResponse {
  planId: string;
  userConstraints: UserConstraints;
  generatedAt: string;
  isDemoData: boolean;
  demoDate?: string;
  steps: AgentStep[];
  neighborhoods: ScoredNeighborhood[];
  temporaryHotels: HotelItem[];
  agentReasoning: string[];
  auditLog: {
    totalSerpApiQueries: number;
    cachedQueries: number;
    liveQueries: number;
    totalExecutionTimeMs: number;
    llmUsed: string;
  };
}
