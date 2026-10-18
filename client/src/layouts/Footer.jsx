import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link
              to="/"
              className="inline-block bg-white/95 hover:bg-white px-3.5 py-1.5 rounded-2xl shadow-sm transition"
              aria-label="NestMatch Home"
            >
              <BrandLogo variant="horizontal" size="md" />
            </Link>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Smart Roommate Compatibility Platform for university students. Discover harmonious living through lifestyle preference alignment and explainable scores.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Shield className="w-3.5 h-3.5 text-brand-500" />
              <span>Full Stack Development (FSD) College Capstone Project</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/matches" className="hover:text-white transition">
                  Find Matches
                </Link>
              </li>
              <li>
                <Link to="/questionnaire" className="hover:text-white transition">
                  Lifestyle Survey
                </Link>
              </li>
              <li>
                <Link to="/requests" className="hover:text-white transition">
                  Roommate Requests
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Access & Admin Demo */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Demonstration
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">
                  Student Registration
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-brand-400 hover:text-brand-300 transition font-medium">
                  Admin Dashboard Demo →
                </Link>
              </li>
              <li>
                <span className="text-stone-500 text-xs">
                  MIT License • Phase 1 Frontend
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 NestMatch. Built for student compatibility.</p>
          <p className="flex items-center gap-1">
            Engineered with React 19, Tailwind CSS, & Vite
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
