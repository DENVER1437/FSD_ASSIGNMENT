import { Link, useNavigate } from 'react-router-dom';
import { Home, Compass, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-warm flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mb-6 border border-brand-200">
        <Compass className="w-8 h-8 animate-spin-slow" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">
        Error 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-sm text-stone-500 max-w-md mx-auto mb-8 leading-relaxed">
        The campus page or roommate profile you are looking for does not exist or has been moved.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          icon={ArrowLeft}
        >
          Go Back
        </Button>
        <Button
          onClick={() => navigate('/dashboard')}
          icon={Home}
        >
          Student Dashboard
        </Button>
      </div>
    </div>
  );
}

export default NotFoundPage;
