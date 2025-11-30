/**
 * Home Page Component
 *
 * Landing page for Daybreak Health onboarding.
 * Creates a new session via GraphQL mutation when user clicks "Start Onboarding"
 * and navigates to the assessment page with the real session ID.
 */
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCreateSessionMutation } from "@/types/graphql";
import { setAuthToken } from "@/lib/apollo/client";

/**
 * Renders the home page with a "Start Onboarding" button.
 * On click, creates a new session via the backend API and redirects
 * to the assessment page with the generated session ID.
 */
export default function Home() {
  const router = useRouter();
  const [createSession, { loading, error }] = useCreateSessionMutation();

  /**
   * Handles the "Start Onboarding" button click.
   * Creates a new session, stores the auth token, and navigates to assessment.
   */
  async function handleStartOnboarding(): Promise<void> {
    try {
      const result = await createSession();

      if (result.data?.createSession) {
        const { session, token } = result.data.createSession;

        // Store the JWT token for authenticated requests
        setAuthToken(token);

        // Navigate to the assessment page with the real session ID
        router.push(`/onboarding/${session.id}/assessment`);
      }
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4 text-center">
      <main className="flex max-w-[48rem] flex-col items-center gap-12 w-full">
        <div className="space-y-8 flex flex-col items-center w-full">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-daybreak-teal mb-4">
            Daybreak Health
          </h1>
          <p className="text-xl sm:text-2xl font-medium text-deep-text/80 font-serif">
            AI-guided mental health intake for teens and families.
          </p>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <Button
            size="lg"
            className="bg-daybreak-teal hover:bg-daybreak-teal/90 text-white text-lg px-8 py-6 h-auto rounded-full"
            onClick={handleStartOnboarding}
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Onboarding"}
          </Button>

          {error && (
            <p className="text-red-500 text-sm">
              Failed to start session. Please try again.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
