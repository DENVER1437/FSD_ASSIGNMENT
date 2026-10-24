import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '../layouts/Navbar';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-warm flex flex-col justify-between">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-24 flex-1 flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
          {/* Big Brand Logo */}
          <div className="flex justify-center">
            <BrandLogo
              variant="full"
              size="2xl"
              priority
              className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 drop-shadow-md transition-transform duration-300 hover:scale-105"
            />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-charcoal leading-[1.15]">
            Find a roommate who fits{' '}
            <span className="text-brand-600 underline decoration-brand-200 decoration-wavy decoration-2">
              your life.
            </span>
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto shadow-md"
            >
              <span>Find Your Match</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-stone-200/80 bg-white/60 text-center text-xs text-stone-500">
        <p>© {new Date().getFullYear()} NestMatch — Smart Roommate Compatibility Finder. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
