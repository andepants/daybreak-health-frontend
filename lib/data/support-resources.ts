/**
 * Support resources and contextual help content for parent onboarding
 *
 * Contains curated resources from Daybreak Health and trusted external sources
 * (NIMH, AAP, AACAP) along with contextual help tips for form fields.
 */

/**
 * Available resource topics for categorization
 */
export const RESOURCE_TOPICS = [
  "anxiety",
  "depression",
  "trauma",
  "stress",
  "sleep",
  "school",
  "social",
  "family",
  "getting-started",
  "adhd",
  "behavior",
] as const;

export type ResourceTopic = (typeof RESOURCE_TOPICS)[number];

/**
 * Resource type definitions
 */
export type ResourceType =
  | "article"
  | "webinar"
  | "guide"
  | "one-pager"
  | "video"
  | "external";

export type ResourceSource = "daybreak" | "nimh" | "aap" | "aacap";

/**
 * Support resource type definition
 */
export interface SupportResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  source: ResourceSource;
  topics: ResourceTopic[];
  duration?: string;
  featured?: boolean;
}

/**
 * Contextual tips for form fields
 */
export interface ContextualTips {
  tips: string[];
  title?: string;
  learnMoreId?: string;
}

/**
 * Curated list of support resources for parents
 *
 * Includes Daybreak Health resources and trusted external sources
 * ordered by relevance for onboarding context.
 */
export const SUPPORT_RESOURCES: SupportResource[] = [
  // Daybreak Health Resources (Primary)
  {
    id: "regulate-relate-reason",
    title: "Regulate, Relate, then Reason",
    description:
      "Learn the proven approach to supporting your child through difficult emotions",
    type: "webinar",
    url: "https://www.daybreakhealth.com/resources/regulate-relate-then-reason-how-to-open-up-the-cortex-for-student-learning",
    source: "daybreak",
    topics: ["family", "stress", "anxiety"],
    duration: "45 min",
    featured: true,
  },
  {
    id: "back-to-school-toolkit",
    title: "Back-to-School Mental Health Toolkit",
    description:
      "Practical strategies for managing school-related anxiety and stress",
    type: "guide",
    url: "https://go.daybreakhealth.com/back-to-school-mental-health-toolkit",
    source: "daybreak",
    topics: ["school", "anxiety", "stress"],
    featured: true,
  },
  {
    id: "supporting-youth-trauma",
    title: "Supporting Youth Experiencing Trauma",
    description:
      "Understanding how to help children who have experienced acute or chronic trauma",
    type: "one-pager",
    url: "https://www.daybreakhealth.com/lp/supporting-youth-experiencing-trauma",
    source: "daybreak",
    topics: ["trauma", "family"],
    duration: "5 min read",
  },
  {
    id: "screens-and-health",
    title: "Screens and Our Health: 5 Ways to Protect Our Brains and Bodies",
    description:
      "Digital wellness strategies for families navigating technology use",
    type: "article",
    url: "https://www.daybreakhealth.com/resources/screens-and-our-health-5-ways-to-protect-our-brains-and-bodies",
    source: "daybreak",
    topics: ["family", "stress", "sleep"],
    duration: "8 min read",
  },
  {
    id: "what-to-expect-therapy",
    title: "Frequently Asked Questions",
    description:
      "A parent's guide to preparing for and supporting your child's therapy journey",
    type: "guide",
    url: "https://www.daybreakhealth.com/faq",
    source: "daybreak",
    topics: ["getting-started", "family"],
    duration: "10 min read",
    featured: true,
  },

  // NIMH Resources (Clinical Accuracy)
  {
    id: "nimh-teen-depression",
    title: "Teen Depression: More Than Just Moodiness",
    description: "Understanding the signs of depression and when to seek help",
    type: "external",
    url: "https://www.nimh.nih.gov/health/publications/teen-depression",
    source: "nimh",
    topics: ["depression"],
    duration: "10 min read",
  },
  {
    id: "nimh-anxiety-children",
    title: "Anxiety Disorders in Children",
    description:
      "Learn about different types of anxiety and evidence-based treatments",
    type: "external",
    url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
    source: "nimh",
    topics: ["anxiety"],
    duration: "12 min read",
  },
  {
    id: "nimh-help-child-teen",
    title: "Helping Children and Adolescents Cope",
    description: "Strategies for supporting young people through difficult times",
    type: "external",
    url: "https://www.nimh.nih.gov/health/publications/helping-children-and-adolescents-cope-with-disasters-and-other-traumatic-events",
    source: "nimh",
    topics: ["trauma", "stress", "family"],
    duration: "15 min read",
  },

  // AACAP Resources (Pediatric Focus)
  {
    id: "aacap-continuum-of-care",
    title: "Understanding Mental Health Care Options",
    description: "A guide to the different types of mental health services available for children",
    type: "external",
    url: "https://www.aacap.org/AACAP/Families_and_Youth/Facts_for_Families/FFF-Guide/The-Continuum-Of-Care-For-Children-And-Adolescents-042.aspx",
    source: "aacap",
    topics: ["getting-started", "family"],
    duration: "5 min read",
  },
  {
    id: "aap-adhd-parents",
    title: "ADHD: What Parents Need to Know",
    description: "Understanding ADHD symptoms, diagnosis, and treatment options",
    type: "external",
    url: "https://www.healthychildren.org/English/health-issues/conditions/adhd/Pages/default.aspx",
    source: "aap",
    topics: ["adhd", "behavior", "school"],
    duration: "15 min read",
  },
  {
    id: "aap-sleep-teens",
    title: "Sleep and Mental Health in Teens",
    description: "How sleep affects mood and strategies for better sleep habits",
    type: "external",
    url: "https://www.healthychildren.org/English/ages-stages/teen/Pages/Stages-of-Adolescence.aspx",
    source: "aap",
    topics: ["sleep", "stress"],
    duration: "8 min read",
  },

  // AACAP Resources (Child & Adolescent Psychiatry)
  {
    id: "aacap-therapy-works",
    title: "Psychotherapy for Children and Adolescents",
    description: "Understanding how therapy helps and what types are available",
    type: "external",
    url: "https://www.aacap.org/AACAP/Families_and_Youth/Facts_for_Families/FFF-Guide/Psychotherapies-For-Children-And-Adolescents-086.aspx",
    source: "aacap",
    topics: ["getting-started"],
    duration: "10 min read",
  },
  {
    id: "aacap-talking-to-kids",
    title: "Talking to Kids About Mental Illness",
    description: "Age-appropriate ways to discuss mental health with your child",
    type: "external",
    url: "https://www.aacap.org/AACAP/Families_and_Youth/Facts_for_Families/FFF-Guide/Talking-To-Kids-About-Mental-Illnesses-084.aspx",
    source: "aacap",
    topics: ["family", "getting-started"],
    duration: "8 min read",
  },
];

/**
 * Contextual help tips organized by form field/section
 *
 * Keys follow pattern: "formName.fieldName" or "chat.context"
 */
export const CONTEXTUAL_TIPS: Record<string, ContextualTips> = {
  // Clinical Intake Form
  "clinical.medications": {
    tips: [
      "Include prescription and over-the-counter medications",
      "Note any supplements or vitamins",
      "This helps therapists understand the full picture",
    ],
    title: "Medication Information",
  },
  "clinical.previousTherapy": {
    tips: [
      "Any previous experience helps us tailor our approach",
      "Include school counseling or support groups",
      "It's okay if this is your first time seeking help",
    ],
    title: "Previous Support",
  },
  "clinical.diagnoses": {
    tips: [
      "Formal diagnoses help with treatment planning",
      "Suspected conditions are also helpful to share",
      "You can update this later if needed",
    ],
    title: "Mental Health History",
  },
  "clinical.hospitalizations": {
    tips: [
      "This information helps us provide appropriate care",
      "Include any emergency room visits for mental health",
      "All information is kept strictly confidential",
    ],
    title: "Medical History",
  },

  // Assessment Form - Page 1: About Your Child
  "assessment.primaryConcerns": {
    tips: [
      "There's no wrong answer - share what feels important",
      "Include changes you've noticed over time",
      "Your perspective as a parent is valuable",
    ],
    title: "Sharing Tips",
    learnMoreId: "what-to-expect-therapy",
  },
  "assessment.concernsDuration": {
    tips: [
      "An estimate is fine - exact dates aren't needed",
      "Think about when you first noticed changes",
      "Include any triggering events if known",
    ],
  },

  // Assessment Form - Page 2: Daily Life Impact
  "assessment.schoolImpact": {
    tips: [
      "Consider grades, attendance, and participation",
      "Include social aspects of school",
      "Any recent changes are relevant",
    ],
    title: "School Impact",
  },
  "assessment.homeImpact": {
    tips: [
      "Think about routines and responsibilities",
      "Include family relationship changes",
      "Sleep and eating patterns are relevant too",
    ],
    title: "Home Life",
  },
  "assessment.severity": {
    tips: [
      "Think about impact on daily activities",
      "Consider how often concerns arise",
      "Trust your instincts as a parent",
    ],
    title: "Understanding Severity",
  },

  // Assessment Form - Page 3: Additional Context
  "assessment.goals": {
    tips: [
      "What would success look like for your family?",
      "Both short-term and long-term goals help",
      "Goals can evolve as therapy progresses",
    ],
    title: "Setting Goals",
  },
  "assessment.additionalInfo": {
    tips: [
      "Share anything else you think is important",
      "Family history or life changes can be relevant",
      "No detail is too small if it feels significant",
    ],
  },

  // Child Info Form
  "child.dateOfBirth": {
    tips: [
      "Age helps us match with therapists who specialize in your child's age group",
      "Different developmental stages need different approaches",
    ],
  },
  "child.grade": {
    tips: [
      "School context helps therapists understand your child's daily life",
      "Select 'Not in school' if applicable",
    ],
  },

  // Chat contexts
  "chat.welcome": {
    tips: [
      "Take your time - there's no rush",
      "You can always come back to add more later",
      "Everything you share is confidential",
    ],
    title: "Getting Started",
    learnMoreId: "what-to-expect-therapy",
  },
  "chat.concerns": {
    tips: [
      "Describe what you've been noticing",
      "Include how long this has been going on",
      "Your observations are valuable",
    ],
    learnMoreId: "aacap-talking-to-kids",
  },
};

/**
 * Get resources filtered by topic
 *
 * @param topic - Topic to filter by
 * @returns Array of resources matching the topic
 */
export function getResourcesByTopic(topic: ResourceTopic): SupportResource[] {
  return SUPPORT_RESOURCES.filter((r) => r.topics.includes(topic));
}

/**
 * Get resources filtered by multiple topics (OR logic)
 *
 * @param topics - Array of topics to filter by
 * @returns Array of resources matching any of the topics
 */
export function getResourcesByTopics(
  topics: ResourceTopic[]
): SupportResource[] {
  return SUPPORT_RESOURCES.filter((r) =>
    topics.some((topic) => r.topics.includes(topic))
  );
}

/**
 * Get featured resources for prominent display
 *
 * @returns Array of featured resources
 */
export function getFeaturedResources(): SupportResource[] {
  return SUPPORT_RESOURCES.filter((r) => r.featured);
}

/**
 * Get contextual tips for a form field
 *
 * @param context - Field context key (e.g., "clinical.medications")
 * @returns ContextualTips object or null if not found
 */
export function getContextualTips(context: string): ContextualTips | null {
  return CONTEXTUAL_TIPS[context] || null;
}

/**
 * Get a specific resource by ID
 *
 * @param id - Resource ID to look up
 * @returns SupportResource or undefined if not found
 */
export function getResourceById(id: string): SupportResource | undefined {
  return SUPPORT_RESOURCES.find((r) => r.id === id);
}

/**
 * Get resources filtered by source
 *
 * @param source - Source to filter by
 * @returns Array of resources from the specified source
 */
export function getResourcesBySource(
  source: ResourceSource
): SupportResource[] {
  return SUPPORT_RESOURCES.filter((r) => r.source === source);
}

/**
 * Get display name for resource source
 *
 * @param source - Source identifier
 * @returns Human-readable source name
 */
export function getSourceDisplayName(source: ResourceSource): string {
  const sourceNames: Record<ResourceSource, string> = {
    daybreak: "Daybreak Health",
    nimh: "NIMH",
    aap: "American Academy of Pediatrics",
    aacap: "AACAP",
  };
  return sourceNames[source];
}

/**
 * Get icon name for resource type
 *
 * @param type - Resource type
 * @returns Icon name from lucide-react
 */
export function getResourceTypeIcon(type: ResourceType): string {
  const typeIcons: Record<ResourceType, string> = {
    article: "FileText",
    webinar: "Video",
    guide: "BookOpen",
    "one-pager": "FileText",
    video: "Play",
    external: "ExternalLink",
  };
  return typeIcons[type];
}
