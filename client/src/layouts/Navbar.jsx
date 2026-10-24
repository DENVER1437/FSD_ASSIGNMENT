import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center py-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-lg"
            aria-label="NestMatch — Home"
          >
            <BrandLogo variant="horizontal" size="md" priority className="group-hover:opacity-90" />
          </Link>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate('/dashboard')}
                size="sm"
                className="gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Log in
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="gap-1.5"
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-600 hover:text-charcoal hover:bg-stone-100 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-2.5 pt-2">
            {isAuthenticated ? (
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full justify-center"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full justify-center"
                >
                  Log in
                </Button>
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                  className="w-full justify-center"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
