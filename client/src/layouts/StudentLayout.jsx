import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  ClipboardList,
  Users,
  UserPlus,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMatch } from '../context/MatchContext';
import Avatar from '../components/Avatar';
import BrandLogo from '../components/BrandLogo';

export function StudentLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { requests } = useMatch();

  const navigate = useNavigate();

  const pendingRequestsCount = requests.filter(
    (r) => r.type === 'received' && r.status === 'pending'
  ).length;

  const navItems = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Find Matches', to: '/matches', icon: Users },
    {
      label: 'Requests',
      to: '/requests',
      icon: UserPlus,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
    },
    { label: 'Questionnaire', to: '/questionnaire', icon: ClipboardList },
    { label: 'My Profile', to: '/profile', icon: User },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface-warm flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200/90 shrink-0 sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center group py-0.5" aria-label="NestMatch Dashboard">
            <BrandLogo variant="horizontal" size="md" priority className="group-hover:opacity-90" />
          </NavLink>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-800 font-semibold shadow-subtle'
                      : 'text-stone-600 hover:text-charcoal hover:bg-stone-100/70'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-brand-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Footer & Admin Link */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/50 space-y-3">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 text-stone-700 hover:border-brand-300 hover:text-brand-700 transition"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-brand-600" />
                Admin Console
              </span>
              <span className="text-[10px] text-stone-400">→</span>
            </button>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                src={user?.profileImage}
                name={user?.name || 'Student'}
                size="sm"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-charcoal truncate">
                  {user?.name || 'Student'}
                </p>
                <p className="text-[11px] text-stone-400 truncate">
                  {user?.college || 'Nirma University'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-stone-200 px-4 h-16 flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center" aria-label="NestMatch Dashboard">
            <BrandLogo variant="horizontal" size="sm" priority />
          </NavLink>

          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="text-[11px] font-semibold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200"
              >
                Admin
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>


        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-stone-200 p-4 space-y-1 shadow-lg z-20 animate-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                      isActive
                        ? 'bg-brand-50 text-brand-800 font-semibold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
            <div className="pt-3 border-t border-stone-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-rose-600 rounded-xl hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
