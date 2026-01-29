import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Icons as simple SVG components
function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--nimmit-bg-primary)]">
      {/* Hero gradient overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 0%, rgba(224, 122, 95, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 100%, rgba(129, 178, 154, 0.06) 0%, transparent 50%)
          `,
        }}
      />

      {/* Header */}
      <header className="relative border-b border-[var(--nimmit-border)]">
        <div className="container-nimmit py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-[var(--nimmit-radius-md)] bg-[var(--nimmit-accent-primary)] flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-semibold text-sm">N</span>
            </div>
            <span className="text-xl font-semibold text-[var(--nimmit-text-primary)]">
              Nimmit
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-[var(--nimmit-text-secondary)] hover:text-[var(--nimmit-text-primary)] transition-colors text-sm"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-[var(--nimmit-text-secondary)] hover:text-[var(--nimmit-text-primary)] transition-colors text-sm"
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className="text-[var(--nimmit-text-secondary)] hover:text-[var(--nimmit-text-primary)] transition-colors text-sm"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative section-padding">
        <div className="container-nimmit">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="soft" className="mb-6 animate-fade-down">
              Now accepting early access clients
            </Badge>

            <h1 className="text-display-xl mb-6 animate-fade-up">
              Wake up to work{" "}
              <span className="gradient-text">already done</span>
            </h1>

            <p className="text-body-lg max-w-2xl mx-auto mb-10 animate-fade-up stagger-1">
              Your overnight assistant team. Send tasks before bed, wake up to
              completed work. Video editing, graphic design, web development,
              and administrative tasks—delivered while you sleep.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up stagger-2">
              <Link href="/register">
                <Button size="xl" className="w-full sm:w-auto group">
                  Start for free
                  <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  Sign in
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex items-center justify-center gap-8 text-[var(--nimmit-text-tertiary)] text-sm animate-fade-up stagger-3">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-[var(--nimmit-accent-tertiary)]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-[var(--nimmit-accent-tertiary)]" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-[var(--nimmit-accent-tertiary)]" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-[var(--nimmit-bg-secondary)]">
        <div className="container-nimmit">
          <div className="text-center mb-16">
            <h2 className="text-display-lg mb-4">
              Why clients love Nimmit
            </h2>
            <p className="text-body-lg max-w-2xl mx-auto">
              We combine the reliability of a dedicated assistant with the
              convenience of overnight delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-[var(--nimmit-radius-2xl)] bg-[var(--nimmit-bg-elevated)] border border-[var(--nimmit-border)] shadow-[var(--nimmit-shadow-sm)] card-hover">
              <div className="w-14 h-14 rounded-[var(--nimmit-radius-xl)] bg-[var(--nimmit-accent-primary-light)] flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <MoonIcon className="w-7 h-7 text-[var(--nimmit-accent-primary)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[var(--nimmit-text-primary)]">
                Overnight delivery
              </h3>
              <p className="text-[var(--nimmit-text-secondary)] leading-relaxed">
                Submit tasks before bed. Our Cambodia-based team works while you
                sleep, delivering completed work by morning.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-[var(--nimmit-radius-2xl)] bg-[var(--nimmit-bg-elevated)] border border-[var(--nimmit-border)] shadow-[var(--nimmit-shadow-sm)] card-hover">
              <div className="w-14 h-14 rounded-[var(--nimmit-radius-xl)] bg-[var(--nimmit-success-bg)] flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <UserIcon className="w-7 h-7 text-[var(--nimmit-accent-tertiary)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[var(--nimmit-text-primary)]">
                Dedicated assistant
              </h3>
              <p className="text-[var(--nimmit-text-secondary)] leading-relaxed">
                Work with the same person who learns your preferences, style,
                and standards over time. Build a real working relationship.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-[var(--nimmit-radius-2xl)] bg-[var(--nimmit-bg-elevated)] border border-[var(--nimmit-border)] shadow-[var(--nimmit-shadow-sm)] card-hover">
              <div className="w-14 h-14 rounded-[var(--nimmit-radius-xl)] bg-[var(--nimmit-info-bg)] flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <CheckCircleIcon className="w-7 h-7 text-[var(--nimmit-info)]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[var(--nimmit-text-primary)]">
                Quality guaranteed
              </h3>
              <p className="text-[var(--nimmit-text-secondary)] leading-relaxed">
                All workers are vetted and trained by the KOOMPI team.
                Unlimited revisions until you're completely satisfied.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section-padding">
        <div className="container-nimmit">
          <div className="text-center mb-16">
            <h2 className="text-display-lg mb-4">How it works</h2>
            <p className="text-body-lg max-w-2xl mx-auto">
              Getting started is simple. Submit a task, go to sleep, wake up to
              results.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-8 top-12 bottom-12 w-px bg-[var(--nimmit-border)] hidden md:block" />

              {/* Step 1 */}
              <div className="relative flex gap-8 mb-12 group">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[var(--nimmit-accent-primary)] flex items-center justify-center shadow-[var(--nimmit-shadow-md)] transition-transform group-hover:scale-110 z-10">
                  <UploadIcon className="w-7 h-7 text-white" />
                </div>
                <div className="pt-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="ghost" size="sm">
                      Step 1
                    </Badge>
                    <ClockIcon className="w-4 h-4 text-[var(--nimmit-text-tertiary)]" />
                    <span className="text-sm text-[var(--nimmit-text-tertiary)]">
                      2 minutes
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[var(--nimmit-text-primary)]">
                    Submit your task
                  </h3>
                  <p className="text-[var(--nimmit-text-secondary)] leading-relaxed max-w-lg">
                    Describe what you need, upload reference files, and set your
                    deadline. Our AI helps match you with the perfect assistant.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex gap-8 mb-12 group">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[var(--nimmit-accent-secondary)] flex items-center justify-center shadow-[var(--nimmit-shadow-md)] transition-transform group-hover:scale-110 z-10">
                  <MoonIcon className="w-7 h-7 text-white" />
                </div>
                <div className="pt-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="ghost" size="sm">
                      Step 2
                    </Badge>
                    <ClockIcon className="w-4 h-4 text-[var(--nimmit-text-tertiary)]" />
                    <span className="text-sm text-[var(--nimmit-text-tertiary)]">
                      8 hours
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[var(--nimmit-text-primary)]">
                    Sleep while we work
                  </h3>
                  <p className="text-[var(--nimmit-text-secondary)] leading-relaxed max-w-lg">
                    Your dedicated assistant picks up the task and works through
                    the night. They'll message you if they need clarification.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex gap-8 group">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[var(--nimmit-accent-tertiary)] flex items-center justify-center shadow-[var(--nimmit-shadow-md)] transition-transform group-hover:scale-110 z-10">
                  <CheckCircleIcon className="w-7 h-7 text-white" />
                </div>
                <div className="pt-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="ghost" size="sm">
                      Step 3
                    </Badge>
                    <ClockIcon className="w-4 h-4 text-[var(--nimmit-text-tertiary)]" />
                    <span className="text-sm text-[var(--nimmit-text-tertiary)]">
                      Morning
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[var(--nimmit-text-primary)]">
                    Wake up to results
                  </h3>
                  <p className="text-[var(--nimmit-text-secondary)] leading-relaxed max-w-lg">
                    Review the deliverables, request revisions if needed, and
                    approve when satisfied. It's like having work done by magic.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-[var(--nimmit-bg-secondary)]">
        <div className="container-nimmit">
          <div className="text-center mb-16">
            <h2 className="text-display-lg mb-4">What we can help with</h2>
            <p className="text-body-lg max-w-2xl mx-auto">
              Our team handles a wide range of tasks, from creative work to
              administrative duties.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Video Editing", desc: "YouTube, TikTok, Reels" },
              { name: "Graphic Design", desc: "Social media, presentations" },
              { name: "Web Development", desc: "Landing pages, bug fixes" },
              { name: "Social Media", desc: "Content scheduling, engagement" },
              { name: "Data Entry", desc: "Spreadsheets, CRM updates" },
              { name: "Research", desc: "Market research, competitor analysis" },
            ].map((service) => (
              <div
                key={service.name}
                className="p-6 rounded-[var(--nimmit-radius-xl)] bg-[var(--nimmit-bg-elevated)] border border-[var(--nimmit-border)] hover:border-[var(--nimmit-accent-primary)] transition-colors cursor-default"
              >
                <h4 className="font-semibold text-[var(--nimmit-text-primary)] mb-1">
                  {service.name}
                </h4>
                <p className="text-sm text-[var(--nimmit-text-secondary)]">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding">
        <div className="container-nimmit">
          <div className="text-center mb-16">
            <h2 className="text-display-lg mb-4">What clients say</h2>
            <p className="text-body-lg max-w-2xl mx-auto">
              Join hundreds of satisfied clients who wake up to completed work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Testimonial 1 */}
            <div className="p-8 rounded-[var(--nimmit-radius-2xl)] bg-[var(--nimmit-bg-elevated)] border border-[var(--nimmit-border)] shadow-[var(--nimmit-shadow-sm)]">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-[var(--nimmit-warning)]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[var(--nimmit-text-primary)] mb-6 leading-relaxed italic">
                "I submit my video editing tasks before bed and wake up to
                polished content ready to upload. It's completely transformed my
                content creation workflow."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--nimmit-accent-primary-light)] flex items-center justify-center">
                  <span className="text-[var(--nimmit-accent-primary)] font-semibold">
                    JD
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-[var(--nimmit-text-primary)]">
                    John Doe
                  </p>
                  <p className="text-xs text-[var(--nimmit-text-tertiary)]">
                    Content Creator
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 rounded-[var(--nimmit-radius-2xl)] bg-[var(--nimmit-bg-elevated)] border border-[var(--nimmit-border)] shadow-[var(--nimmit-shadow-sm)]">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-[var(--nimmit-warning)]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[var(--nimmit-text-primary)] mb-6 leading-relaxed italic">
                "The same assistant works on all my projects, so they understand
                my brand perfectly. It's like having a full-time employee at a
                fraction of the cost."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--nimmit-success-bg)] flex items-center justify-center">
                  <span className="text-[var(--nimmit-accent-tertiary)] font-semibold">
                    SM
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-[var(--nimmit-text-primary)]">
                    Sarah Mitchell
                  </p>
                  <p className="text-xs text-[var(--nimmit-text-tertiary)]">
                    Startup Founder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-nimmit">
          <div className="relative overflow-hidden rounded-[var(--nimmit-radius-2xl)] bg-[var(--nimmit-accent-secondary)] p-12 md:p-16 text-center">
            {/* Background decoration */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                                  radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
              }}
            />

            <div className="relative z-10">
              <h2 className="text-display-lg text-white mb-4">
                Ready to wake up to completed work?
              </h2>
              <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
                Join Nimmit today and experience the magic of overnight
                delivery. Start your 14-day free trial.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button
                    size="xl"
                    className="w-full sm:w-auto bg-white text-[var(--nimmit-accent-secondary)] hover:bg-white/90"
                  >
                    Start free trial
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    size="xl"
                    variant="outline"
                    className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10"
                  >
                    Learn more
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--nimmit-border)] bg-[var(--nimmit-bg-secondary)]">
        <div className="container-nimmit py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-[var(--nimmit-radius-md)] bg-[var(--nimmit-accent-primary)] flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">N</span>
                </div>
                <span className="text-xl font-semibold text-[var(--nimmit-text-primary)]">
                  Nimmit
                </span>
              </Link>
              <p className="text-[var(--nimmit-text-secondary)] text-sm max-w-sm mb-4">
                Your overnight assistant team. US clients sleep, wake up to
                completed work by our dedicated Cambodia-based team.
              </p>
              <div className="flex items-center gap-3">
                <MessageIcon className="w-5 h-5 text-[var(--nimmit-text-tertiary)]" />
                <span className="text-sm text-[var(--nimmit-text-secondary)]">
                  support@nimmit.com
                </span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-[var(--nimmit-text-primary)] mb-4">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#features"
                    className="text-sm text-[var(--nimmit-text-secondary)] hover:text-[var(--nimmit-text-primary)] transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-sm text-[var(--nimmit-text-secondary)] hover:text-[var(--nimmit-text-primary)] transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-it-works"
                    className="text-sm text-[var(--nimmit-text-secondary)] hover:text-[var(--nimmit-text-primary)] transition-colors"
                  >
                    How it works
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[var(--nimmit-text-primary)] mb-4">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[var(--nimmit-text-secondary)] hover:text-[var(--nimmit-text-primary)] transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[var(--nimmit-text-secondary)] hover:text-[var(--nimmit-text-primary)] transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-[var(--nimmit-text-secondary)] hover:text-[var(--nimmit-text-primary)] transition-colors"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--nimmit-border)] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--nimmit-text-tertiary)]">
              &copy; {new Date().getFullYear()} Nimmit. All rights reserved.
            </p>
            <p className="text-sm text-[var(--nimmit-text-tertiary)]">
              Made with care by the KOOMPI team in Cambodia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
