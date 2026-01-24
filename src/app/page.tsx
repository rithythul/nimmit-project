import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Nimmit</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-5xl font-bold tracking-tight mb-6">
            Wake up to work{" "}
            <span className="text-blue-600">already done</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Your overnight assistant team. Send tasks before bed, wake up to
            completed work. Video editing, graphic design, web development, and
            more.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Start for free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign in
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 text-left">
            <div className="p-6 rounded-lg border">
              <div className="text-3xl mb-4">🌙</div>
              <h3 className="text-xl font-semibold mb-2">Overnight delivery</h3>
              <p className="text-gray-600">
                Submit tasks before bed. Our Cambodia-based team works while you
                sleep.
              </p>
            </div>
            <div className="p-6 rounded-lg border">
              <div className="text-3xl mb-4">👤</div>
              <h3 className="text-xl font-semibold mb-2">Dedicated assistant</h3>
              <p className="text-gray-600">
                Work with the same person who learns your preferences over time.
              </p>
            </div>
            <div className="p-6 rounded-lg border">
              <div className="text-3xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">Quality guaranteed</h3>
              <p className="text-gray-600">
                All workers are vetted and trained by the KOOMPI team.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Nimmit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
