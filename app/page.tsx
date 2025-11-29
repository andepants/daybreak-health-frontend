import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4 text-center">
      <main className="flex max-w-3xl flex-col items-center gap-12 w-full">
        <div className="space-y-6 flex flex-col items-center w-full">
          <Image
            src="/daybreak_logo.svg"
            alt="Daybreak Health"
            width={600}
            height={85}
            priority
            className="h-auto w-full max-w-[600px]"
          />
          <p className="mx-auto max-w-xl text-2xl font-medium text-deep-text/80 font-serif">
            AI-guided mental health intake for teens and families.
          </p>
        </div>

        <div className="flex gap-4">
          <Button asChild size="lg" className="bg-daybreak-teal hover:bg-daybreak-teal/90 text-white text-lg px-8 py-6 h-auto rounded-full">
            <Link href="/onboarding/demo">Start Onboarding</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-daybreak-teal text-daybreak-teal hover:bg-daybreak-teal/10 text-lg px-8 py-6 h-auto rounded-full">
            <Link href="/theme-preview">View Theme</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
