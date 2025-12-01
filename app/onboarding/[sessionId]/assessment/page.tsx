/**
 * Assessment page - AI-guided conversation interface
 *
 * Main page for the AI assessment experience. Displays chat interface
 * where parents have a conversational assessment with the Daybreak AI.
 * Replaces traditional form-based assessments with a natural chat flow.
 */
import { AssessmentClient } from "./AssessmentClient";

/**
 * Generate static params for the assessment page
 * Returns a placeholder sessionId for static build
 */
// export async function generateStaticParams() {
//   return [{ sessionId: "demo" }];
// }

/**
 * Props for Assessment page
 * Receives sessionId from dynamic route parameter
 */
interface AssessmentPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

/**
 * Assessment page component
 *
 * Displays the chat interface for AI-guided assessment.
 * In production, this will fetch real conversation data from GraphQL API.
 * Currently uses mock data for development and testing.
 *
 * Layout:
 * - Full viewport height minus header
 * - Centered max-width 640px on desktop
 * - Mobile-first responsive design
 *
 * @example
 * // Route: /onboarding/abc123/assessment
 * // Params: { sessionId: "abc123" }
 */
export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { sessionId } = await params;

  return <AssessmentClient sessionId={sessionId} />;
}
