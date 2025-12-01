/**
 * Onboarding Session Page
 *
 * Entry point for the onboarding flow at `/onboarding/[sessionId]`.
 * This page will render the current step of the onboarding process.
 *
 * TODO: Implement actual onboarding flow logic in future stories.
 */

/**
 * Generate static params for the onboarding page
 */
// export async function generateStaticParams() {
//   return [{ sessionId: "demo" }];
// }

/**
 * Page props with session ID from route params
 */
interface OnboardingPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

/**
 * Renders the onboarding page for a specific session
 * @param params - Route parameters containing sessionId
 */
export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { sessionId } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold font-serif text-foreground">
        Welcome to Daybreak Health
      </h1>
      <p className="text-muted-foreground">
        Let&apos;s get started with your mental health journey.
      </p>
      <p className="text-sm text-muted-foreground">
        Session ID: {sessionId}
      </p>
    </div>
  );
}
