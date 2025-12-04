/**
 * Fallback therapist data for when backend returns no matches
 *
 * These are sample/placeholder therapists shown as suggestions when
 * the matching algorithm returns zero results. This provides a better
 * UX than showing an empty state, allowing parents to still browse
 * options and contact support.
 *
 * NOTE: These are NOT real therapist profiles. They are representative
 * samples that indicate the type of therapists available at Daybreak.
 */

/**
 * Match reason for display in therapist cards
 */
export interface FallbackMatchReason {
  id: string;
  text: string;
  icon: string | null;
}

/**
 * Fallback therapist data structure matching the MatchedTherapist GraphQL type
 * with an additional isFallback flag to distinguish from real therapists
 */
export interface FallbackTherapist {
  id: string;
  name: string;
  credentials: string;
  photoUrl: string | null;
  specialties: string[];
  availabilityStatus: string;
  availabilityText: string;
  yearsOfExperience: number | null;
  bio: string | null;
  matchScore: number;
  isBestMatch: boolean;
  matchReasons: FallbackMatchReason[];
  /** Flag to indicate this is a fallback/sample therapist */
  isFallback: true;
}

/**
 * Fallback results wrapper matching the GraphQL TherapistMatchResultsWrapper type
 */
export interface FallbackResults {
  therapists: FallbackTherapist[];
  totalCount: number;
  matchingCriteria: string | null;
  /** Flag for UI to know this is fallback data */
  isFallbackData: true;
}

/**
 * Real therapist IDs used for fallback display
 * These are actual clinicians imported from CSV data
 */
const FALLBACK_THERAPIST_IDS = [
  "9e0e8f0c-cfe7-43a5-90d2-f86e933d88ba", // Valeriya Bauer
  "e5ab0424-bc98-41f1-a12e-539a5dbcb00c", // JaNece Dickerson
];

/**
 * Fallback therapists shown when backend returns empty results
 * Using real therapist IDs from the database so bookings work end-to-end
 * Data sourced from clinicians_anonymized.csv
 */
export const FALLBACK_THERAPISTS: FallbackTherapist[] = [
  {
    id: "9e0e8f0c-cfe7-43a5-90d2-f86e933d88ba",
    name: "Valeriya Bauer",
    credentials: "LCSW",
    photoUrl: null,
    specialties: ["Anxiety", "Depression", "Teen Issues"],
    availabilityStatus: "available",
    availabilityText: "Available this week",
    yearsOfExperience: null,
    bio: "I have been passionate about mental health from a very young age. As a teen, I struggled to find and make meaningful connections and make sense of the world. I turned my personal quest for knowledge and healing into a career to help others do the same.",
    matchScore: 85,
    isBestMatch: true,
    matchReasons: [
      {
        id: "fallback_reason_1",
        text: "Specializes in teen mental health",
        icon: "specialty",
      },
      {
        id: "fallback_reason_2",
        text: "Evidence-based therapeutic approach",
        icon: "experience",
      },
    ],
    isFallback: true,
  },
  {
    id: "e5ab0424-bc98-41f1-a12e-539a5dbcb00c",
    name: "JaNece Dickerson",
    credentials: "LCSW",
    photoUrl: null,
    specialties: ["Depression", "Youth Therapy", "Social Work"],
    availabilityStatus: "available",
    availabilityText: "Available this week",
    yearsOfExperience: null,
    bio: "I am originally from California, but moved to Huntsville, Alabama to complete all of my schooling. I'm a firm believer in building the next generation and that begins with our mental health.",
    matchScore: 82,
    isBestMatch: false,
    matchReasons: [
      {
        id: "fallback_reason_3",
        text: "Works closely with families and schools",
        icon: "specialty",
      },
      {
        id: "fallback_reason_4",
        text: "Focused on youth mental health",
        icon: "experience",
      },
    ],
    isFallback: true,
  },
];

/**
 * Creates fallback results wrapper matching the GraphQL response shape
 * Used when the backend returns no matches
 *
 * @returns FallbackResults object with sample therapists
 */
export function createFallbackResults(): FallbackResults {
  return {
    therapists: FALLBACK_THERAPISTS,
    totalCount: FALLBACK_THERAPISTS.length,
    matchingCriteria: null,
    isFallbackData: true,
  };
}

/**
 * Checks if a therapist ID is a fallback therapist
 * Now uses real therapist IDs from the database
 *
 * @param therapistId - The therapist ID to check
 * @returns true if the ID belongs to a fallback therapist
 */
export function isFallbackTherapist(therapistId: string): boolean {
  return FALLBACK_THERAPIST_IDS.includes(therapistId);
}
