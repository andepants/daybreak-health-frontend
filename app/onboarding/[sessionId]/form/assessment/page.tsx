/**
 * Form-based Assessment page - Traditional form fallback for AI chat
 *
 * Multi-page form assessment at `/onboarding/[sessionId]/form/assessment`.
 * Provides alternative to AI chat assessment per AC-3.4.2.
 *
 * Three pages:
 * - Page 1: About Your Child (concerns, duration, severity)
 * - Page 2: Daily Life Impact (sleep, appetite, school, social)
 * - Page 3: Additional Context (recent events, therapy goals)
 *
 * Features:
 * - Auto-save on field blur
 * - Progress indicator
 * - Back/forward navigation
 * - Mode switching back to chat
 * - Summary generation on completion
 */
import { FormAssessmentClient } from "./FormAssessmentClient";

/**
 * Generate static params for the form assessment page
 * Returns a placeholder sessionId for static build
 */
export async function generateStaticParams() {
  return [{ sessionId: "demo" }];
}

/**
 * Props for FormAssessment page
 * Receives sessionId from dynamic route parameter
 */
interface FormAssessmentPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

/**
 * Form-based Assessment page component
 *
 * Server component that passes sessionId to client component.
 * Layout handled by parent onboarding layout.
 *
 * @example
 * // Route: /onboarding/abc123/form/assessment
 * // Params: { sessionId: "abc123" }
 */
export default async function FormAssessmentPage({
  params,
}: FormAssessmentPageProps) {
  const { sessionId } = await params;

  return <FormAssessmentClient sessionId={sessionId} />;
}
