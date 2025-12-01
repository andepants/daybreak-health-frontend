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
 * Fallback therapists shown when backend returns empty results
 * Using real therapist IDs from the database so bookings work end-to-end
 */
export const FALLBACK_THERAPISTS: FallbackTherapist[] = [
  {
    id: "5271678c-ad6e-4595-bc2c-7f2d40957c13",
    name: "Dr. Sarah Chen",
    credentials: "PhD, LMFT",
    photoUrl: null,
    specialties: ["Anxiety", "Teen Issues", "Family Therapy"],
    availabilityStatus: "available",
    availabilityText: "Contact us for availability",
    yearsOfExperience: 12,
    bio: "Specializing in adolescent mental health with a warm, evidence-based approach. Experienced in helping teens navigate anxiety, depression, and family challenges.",
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
    id: "d88882ce-f51a-407c-a71e-c16797466bb7",
    name: "Michael Torres",
    credentials: "LCSW",
    photoUrl: null,
    specialties: ["Depression", "ADHD", "School Issues"],
    availabilityStatus: "available",
    availabilityText: "Contact us for availability",
    yearsOfExperience: 8,
    bio: "Focused on helping children and adolescents build resilience and develop coping strategies. Collaborative approach working closely with families and schools.",
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
        text: "Specializes in ADHD and academic challenges",
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
 *
 * @param therapistId - The therapist ID to check
 * @returns true if the ID belongs to a fallback therapist
 */
export function isFallbackTherapist(therapistId: string): boolean {
  return therapistId.startsWith("fallback_");
}
