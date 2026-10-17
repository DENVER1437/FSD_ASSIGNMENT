import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  AlertTriangle,
  LayoutDashboard,
  ArrowLeft,
  Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export function AdminLayout() {
  const { switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleReturnToStudent = () => {
    switchDemoRole('student');
    navigate('/dashboard');
  };

  const navLinks = [
    { label: 'Admin Overview', to: '/admin', icon: LayoutDashboard },
    { label: 'User Directory', to: '/admin/users', icon: Users },
    { label: 'Reports & Flags', to: '/admin/reports', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Admin Demo Warning Bar */}
      <div className="bg-charcoal text-stone-200 px-4 py-2 text-xs flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="font-semibold text-white">NestMatch Administrative Console</span>
          <span className="hidden sm:inline text-stone-400">— Interactive Demonstration Mode (Phase 1 UI)</span>
        </div>
        <button
          onClick={handleReturnToStudent}
          className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Student View
        </button>
      </div>

      {/* Admin Header & Nav */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <NavLink to="/admin" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-charcoal flex items-center justify-center text-white">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-base font-extrabold text-charcoal">
                  NestMatch <span className="text-xs uppercase font-bold text-stone-400 ml-1">Admin</span>
                </span>
              </NavLink>

              <nav className="hidden sm:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/admin'}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? 'bg-stone-100 text-charcoal shadow-sm'
                            : 'text-stone-500 hover:text-charcoal hover:bg-stone-50'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReturnToStudent}
              >
                Student App
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
