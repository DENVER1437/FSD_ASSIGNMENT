import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building, MapPin, Eye, EyeOff } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Checkbox from '../components/Checkbox';
import Card from '../components/Card';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    city: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) return setError('Full name is required.');
    if (!formData.email.trim() || !formData.email.includes('@'))
      return setError('A valid university or personal email is required.');
    if (formData.password.length < 6)
      return setError('Password must be at least 6 characters.');
    if (formData.password !== formData.confirmPassword)
      return setError('Passwords do not match.');
    if (!formData.college.trim()) return setError('College / University is required.');
    if (!formData.city.trim()) return setError('City is required.');
    if (!formData.agreeTerms)
      return setError('You must agree to the student community terms.');

    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        showToast('Registration successful! Please complete your questionnaire.', 'success');
        navigate('/questionnaire');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-warm flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          className="inline-flex justify-center mb-5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-2xl"
          aria-label="NestMatch Home"
        >
          <BrandLogo variant="horizontal" size="lg" priority className="group-hover:scale-105" />
        </Link>
        <h2 className="text-2xl font-extrabold text-charcoal tracking-tight">
          Create student account
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Find your ideal roommate on your campus
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              name="name"
              icon={User}
              placeholder="e.g., Alex Johnson"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="University Email"
              type="email"
              name="email"
              icon={Mail}
              placeholder="student@university.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="College / Campus"
                name="college"
                icon={Building}
                placeholder="Apex Institute"
                value={formData.college}
                onChange={handleChange}
                required
              />
              <Input
                label="Study City"
                name="city"
                icon={MapPin}
                placeholder="Boston"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                icon={Lock}
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
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

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              icon={Lock}
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <div className="pt-2">
              <Checkbox
                name="agreeTerms"
                label="I agree to community safety guidelines and terms"
                description="Respectful domestic communication is required."
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full justify-center mt-3 shadow-sm"
            >
              Register & Continue
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default RegisterPage;
