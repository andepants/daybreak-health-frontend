/**
 * Theme Preview Page
 *
 * Displays all Daybreak design tokens including colors, typography, spacing,
 * border radius, and shadcn/ui components with the Daybreak theme applied.
 * Used for visual validation of the design system implementation.
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Color swatch component for displaying color tokens
 */
function ColorSwatch({
  name,
  cssVar,
  hex,
  className,
}: {
  name: string;
  cssVar: string;
  hex: string;
  className: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`h-16 w-16 rounded-lg border border-border ${className}`}
      />
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">{cssVar}</p>
        <p className="font-mono text-xs text-muted-foreground">{hex}</p>
      </div>
    </div>
  );
}

/**
 * Section wrapper component for consistent layout
 */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-2xl font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export default function ThemePreviewPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="font-serif text-4xl font-bold text-foreground">
            Daybreak Design System
          </h1>
          <p className="text-lg text-muted-foreground">
            Visual preview of all design tokens and components
          </p>
        </header>

        {/* Brand Colors */}
        <Section title="Brand Colors">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ColorSwatch
              name="Daybreak Teal"
              cssVar="--daybreak-teal"
              hex="#2A9D8F"
              className="bg-daybreak-teal"
            />
            <ColorSwatch
              name="Teal Light"
              cssVar="--teal-light"
              hex="#3DBCB0"
              className="bg-teal-light"
            />
            <ColorSwatch
              name="Warm Orange"
              cssVar="--warm-orange"
              hex="#E9A23B"
              className="bg-warm-orange"
            />
            <ColorSwatch
              name="Cream"
              cssVar="--cream"
              hex="#FEF7ED"
              className="bg-cream"
            />
            <ColorSwatch
              name="Deep Text"
              cssVar="--deep-text"
              hex="#1A3C34"
              className="bg-deep-text"
            />
          </div>
        </Section>

        {/* Semantic Colors */}
        <Section title="Semantic Colors">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ColorSwatch
              name="Success"
              cssVar="--success"
              hex="#10B981"
              className="bg-success"
            />
            <ColorSwatch
              name="Warning"
              cssVar="--warning"
              hex="#F59E0B"
              className="bg-warning"
            />
            <ColorSwatch
              name="Error"
              cssVar="--error"
              hex="#E85D5D"
              className="bg-error"
            />
            <ColorSwatch
              name="Info"
              cssVar="--info"
              hex="#3B82F6"
              className="bg-info"
            />
          </div>
        </Section>

        {/* shadcn/ui Semantic Colors */}
        <Section title="shadcn/ui Semantic Colors">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ColorSwatch
              name="Primary"
              cssVar="--primary"
              hex="#2A9D8F"
              className="bg-primary"
            />
            <ColorSwatch
              name="Secondary"
              cssVar="--secondary"
              hex="#F3EDE4"
              className="bg-secondary"
            />
            <ColorSwatch
              name="Accent"
              cssVar="--accent"
              hex="#E9A23B"
              className="bg-accent"
            />
            <ColorSwatch
              name="Muted"
              cssVar="--muted"
              hex="#F3EDE4"
              className="bg-muted"
            />
            <ColorSwatch
              name="Destructive"
              cssVar="--destructive"
              hex="#E85D5D"
              className="bg-destructive"
            />
            <ColorSwatch
              name="Background"
              cssVar="--background"
              hex="#FEF7ED"
              className="bg-background border-2"
            />
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <div className="space-y-6 rounded-lg border border-border bg-card p-6">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                Fraunces (Heading Font)
              </p>
              <h1 className="font-serif text-4xl font-bold">
                The quick brown fox
              </h1>
              <h2 className="font-serif text-3xl font-semibold">
                jumps over the lazy dog
              </h2>
              <h3 className="font-serif text-2xl font-normal">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
              </h3>
            </div>
            <div className="border-t border-border pt-6">
              <p className="mb-2 text-sm text-muted-foreground">
                Inter (Body Font)
              </p>
              <p className="font-sans text-lg font-bold">Bold (700)</p>
              <p className="font-sans text-lg font-semibold">Semibold (600)</p>
              <p className="font-sans text-lg font-medium">Medium (500)</p>
              <p className="font-sans text-lg font-normal">Regular (400)</p>
              <p className="mt-4 font-sans text-base">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          </div>
        </Section>

        {/* Spacing Scale */}
        <Section title="Spacing Scale (4px base)">
          <div className="space-y-4 rounded-lg border border-border bg-card p-6">
            {[
              { name: "xs", value: "4px" },
              { name: "sm", value: "8px" },
              { name: "md", value: "16px" },
              { name: "lg", value: "24px" },
              { name: "xl", value: "32px" },
              { name: "2xl", value: "48px" },
              { name: "3xl", value: "64px" },
            ].map(({ name, value }) => (
              <div key={name} className="flex items-center gap-4">
                <span className="w-12 font-mono text-sm">{name}</span>
                <div
                  className="h-4 bg-primary"
                  style={{ width: value }}
                />
                <span className="text-sm text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Border Radius */}
        <Section title="Border Radius">
          <div className="flex flex-wrap gap-6 rounded-lg border border-border bg-card p-6">
            {[
              { name: "sm", value: "4px", className: "rounded-sm" },
              { name: "md", value: "8px", className: "rounded-md" },
              { name: "lg", value: "12px", className: "rounded-lg" },
              { name: "xl", value: "16px", className: "rounded-xl" },
              { name: "full", value: "9999px", className: "rounded-full" },
            ].map(({ name, value, className }) => (
              <div key={name} className="text-center">
                <div
                  className={`h-16 w-16 bg-primary ${className}`}
                />
                <p className="mt-2 font-mono text-sm">{name}</p>
                <p className="text-xs text-muted-foreground">{value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* shadcn/ui Components */}
        <Section title="shadcn/ui Components">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>
                  Button variants with Daybreak theme
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </CardContent>
            </Card>

            {/* Form Elements */}
            <Card>
              <CardHeader>
                <CardTitle>Form Elements</CardTitle>
                <CardDescription>Input components with theme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Type your message" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">Accept terms and conditions</Label>
                </div>
              </CardContent>
            </Card>

            {/* Select */}
            <Card>
              <CardHeader>
                <CardTitle>Select</CardTitle>
                <CardDescription>Dropdown select component</CardDescription>
              </CardHeader>
              <CardContent>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Card Example */}
            <Card>
              <CardHeader>
                <CardTitle>Example Card</CardTitle>
                <CardDescription>
                  A card component with all parts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  This card demonstrates the Daybreak theme applied to shadcn/ui
                  card components including header, content, and footer.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Submit</Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        {/* Accessibility Test */}
        <Section title="Accessibility Contrast Tests">
          <div className="space-y-4 rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-4 rounded-md bg-cream p-4">
              <span className="text-deep-text">
                Deep Text on Cream (10.8:1) - AAA
              </span>
            </div>
            <div className="flex items-center gap-4 rounded-md bg-cream p-4">
              <span className="text-lg font-bold text-daybreak-teal">
                Daybreak Teal on Cream (3.5:1) - AA Large
              </span>
            </div>
            <div className="flex items-center gap-4 rounded-md bg-primary p-4">
              <span className="text-primary-foreground">
                White on Daybreak Teal (4.6:1) - AA
              </span>
            </div>
            <div className="flex items-center gap-4 rounded-md bg-cream p-4">
              <span className="text-lg text-error">
                Error on Cream (3.4:1) - AA Large
              </span>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <footer className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>Daybreak Health Design System v1.0</p>
          <p>
            View source: <code>app/theme-preview/page.tsx</code>
          </p>
        </footer>
      </div>
    </main>
  );
}
