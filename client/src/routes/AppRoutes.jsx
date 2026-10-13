import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

/**
 * Foundation Component for Phase 0
 * Displays project confirmation and technical stack verification
 */
function FoundationLanding() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-6 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Phase 0 Foundation Initialized
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          NestMatch
        </h1>
        <p className="text-lg text-slate-400 font-medium mb-6">
          Smart Roommate Compatibility Finder
        </p>
        
        <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-700/60 text-left mb-8 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Technical Stack Locked
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
            <div><span className="text-slate-500">Frontend:</span> React + Vite + Tailwind</div>
            <div><span className="text-slate-500">Backend:</span> Node.js + Express REST API</div>
            <div><span className="text-slate-500">Routing:</span> React Router DOM v7</div>
            <div><span className="text-slate-500">Database:</span> MongoDB + Mongoose</div>
            <div><span className="text-slate-500">HTTP Client:</span> Axios Configured</div>
            <div><span className="text-slate-500">Next Step:</span> Phase 1 — Frontend UI</div>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Architecture, routing, environment variables, and folder structures are locked and ready for modular implementation.
        </p>
      </div>
    </div>
  );
}

/**
 * AppRoutes - Main Routing Configuration
 * Future pages will be attached here according to the defined ROUTES specification.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<FoundationLanding />} />
      {/* Additional public, student, and admin routes will be attached in subsequent phases */}
    </Routes>
  );
}
