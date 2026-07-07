import { Hero } from './components/Hero';
import { FakeStats } from './components/FakeStats';
import { AIFeatures } from './components/AIFeatures';
import { Petition } from './components/Petition';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { ComparisonTable } from './components/ComparisonTable';
import { ProgressBar } from './components/ProgressBar';
import { PlotTwist } from './components/PlotTwist';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { FloatingNotification } from './components/FloatingNotification';

function App() {
  return (
    <div className="relative min-h-screen bg-[#050505]">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/5 via-transparent to-pink-900/5 pointer-events-none" />

      {/* Main content */}
      <main className="relative">
        <Hero />

        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>

        <FakeStats />

        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>

        <AIFeatures />

        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>

        <Petition />

        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>

        <Testimonials />

        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>

        <Pricing />

        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>

        <FAQ />

        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>

        <ProgressBar />

        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>

        <ComparisonTable />

        <div className="w-full max-w-5xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>

        <PlotTwist />

        <Footer />
      </main>

      {/* Floating elements */}
      <CookieBanner />
      <FloatingNotification />
    </div>
  );
}

export default App;
