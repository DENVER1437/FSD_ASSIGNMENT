import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  User,
  ShieldCheck,
  Building,
  GraduationCap,
  MapPin,
  Mail,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showSignoutModal, setShowSignoutModal] = useState(false);

  const handleConfirmSignout = () => {
    logout();
    showToast('Signed out of student session.', 'info');
    navigate('/');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Settings & Session"
        subtitle="Manage your student account information and active login session."
      />

      {/* Account Info Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            Account Summary
          </h3>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Active Account
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
            <span className="text-stone-400 font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Logged In Name
            </span>
            <p className="font-bold text-sm text-charcoal">{user?.name || 'Student'}</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
            <span className="text-stone-400 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Registered Email
            </span>
            <p className="font-bold text-sm text-charcoal">{user?.email}</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
            <span className="text-stone-400 font-medium flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" /> University / College
            </span>
            <p className="font-bold text-sm text-charcoal">{user?.college || 'Not set'}</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
            <span className="text-stone-400 font-medium flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> Program / Course
            </span>
            <p className="font-bold text-sm text-charcoal">{user?.course || 'Not set'}</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
            <span className="text-stone-400 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Current City
            </span>
            <p className="font-bold text-sm text-charcoal">{user?.city || 'Not set'}</p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
            <span className="text-stone-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Platform Role
            </span>
            <p className="font-bold text-sm text-brand-700 uppercase">{user?.role || 'student'}</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
          <span>Need to update your academic details or bio?</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/profile')}
          >
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Session Signout Card */}
      <Card className="p-6 sm:p-8 border-rose-200 bg-rose-50/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-rose-900">Sign Out of Session</h4>
            <p className="text-xs text-rose-700/80 mt-0.5">
              Securely ends your authenticated session and clears credentials on this machine.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowSignoutModal(true)}
            icon={LogOut}
            className="shrink-0"
          >
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Confirmation Dialog Modal */}
      <Modal
        isOpen={showSignoutModal}
        onClose={() => setShowSignoutModal(false)}
        title="Confirm Sign Out"
        description="Are you sure you want to end your current session?"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-stone-600">
            This will log you out of your account on this device. Your profile, questionnaire answers, roommate requests, and preferences will remain safely persisted on the server.
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSignoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmSignout}
            >
              Confirm Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SettingsPage;
