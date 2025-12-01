/**
 * Custom 404 Not Found Page
 *
 * Displays a branded 404 error page using the Daybreak Health design system.
 * Features the company logo, friendly messaging, and a button to return home.
 */
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

/**
 * NotFound component displayed when a user navigates to a non-existent route.
 * @returns A centered 404 page with Daybreak branding and navigation back to home
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center text-center">
        {/* Daybreak Logo */}
        <Image
          src="/daybreak_logo.svg"
          alt="Daybreak Health"
          width={200}
          height={40}
          className="mb-8"
          priority
        />

        {/* 404 Heading */}
        <h1 className="font-serif text-6xl font-semibold text-primary md:text-8xl">
          404
        </h1>

        {/* Friendly Message */}
        <h2 className="mt-4 font-serif text-2xl font-semibold text-primary md:text-3xl">
          Page not found
        </h2>

        <p className="mt-4 max-w-md text-muted-foreground">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved. Let&apos;s get you back on track.
        </p>

        {/* Return Home Button */}
        <Button asChild size="lg" className="mt-8 rounded-full px-8">
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    </main>
  );
}
