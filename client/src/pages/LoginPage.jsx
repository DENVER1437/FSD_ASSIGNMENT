import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Checkbox from '../components/Checkbox';
import Card from '../components/Card';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast('Successfully signed in!', 'success');
        if (res.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.message || 'Login failed');
      }
    } catch {
      setError('An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (type = 'student') => {
    if (type === 'student') {
      setEmail('alex@university.edu');
      setPassword('Password123!');
      setError('');
    } else {
      setEmail('admin@nestmatch.edu');
      setPassword('AdminSecret123!');
      setError('');
    }
  };


  return (
    <div className="min-h-screen bg-surface-warm flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          className="inline-flex justify-center mb-5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-2xl"
          aria-label="NestMatch Home"
        >
          <BrandLogo variant="horizontal" size="lg" priority className="group-hover:scale-105" />
        </Link>
        <h2 className="text-2xl font-extrabold text-charcoal tracking-tight">
          Welcome back to campus
        </h2>
        <p className="mt-1.5 text-xs text-stone-500">
          Sign in to view your matched roommates and requests
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="p-6 sm:p-8">
          {/* Demo Alert Box */}
          <div className="mb-6 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-charcoal flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-brand-600" />
                Phase 1 Demo Access
              </span>
              <span className="text-[10px] bg-brand-100 text-brand-800 px-1.5 py-0.5 rounded font-bold">
                1-Click Fill
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('student')}
                className="flex-1 py-1 px-2 rounded-lg bg-white border border-stone-200 hover:border-brand-400 text-[11px] font-semibold text-stone-700 transition"
              >
                Fill Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('admin')}
                className="flex-1 py-1 px-2 rounded-lg bg-white border border-stone-200 hover:border-brand-400 text-[11px] font-semibold text-stone-700 transition"
              >
                Fill Admin Demo
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="University Email"
              type="email"
              icon={Mail}
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Password recovery demo simulated.', 'info');
                }}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full justify-center mt-2 shadow-sm"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
