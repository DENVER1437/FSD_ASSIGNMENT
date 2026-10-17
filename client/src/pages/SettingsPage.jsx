import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Bell,
  Shield,
  LogOut,
  User,
  Moon,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showSignoutModal, setShowSignoutModal] = useState(false);

  // Mock settings toggles
  const [notifications, setNotifications] = useState({
    newMatch: true,
    requestReceived: true,
    chatPings: true,
    campusDigest: false,
  });

  const [privacy, setPrivacy] = useState({
    campusOnly: true,
    hideBudget: false,
  });

  const handleToggleNotif = (key) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      showToast('Notification preferences updated.', 'info');
      return next;
    });
  };

  const handleTogglePrivacy = (key) => {
    setPrivacy((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      showToast('Privacy preferences updated.', 'info');
      return next;
    });
  };

  const handleConfirmSignout = () => {
    logout();
    showToast('Signed out of student session.', 'info');
    navigate('/');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Settings & Preferences"
        subtitle="Manage account details, notification frequencies, and mock session state."
      />

      {/* Account Info Card */}
      <Card className="p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2 pb-3 border-b border-stone-100">
          <User className="w-4 h-4 text-brand-600" />
          Account Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-stone-400 font-medium">Logged In Name</span>
            <p className="font-bold text-sm text-charcoal mt-0.5">{user?.name}</p>
          </div>
          <div>
            <span className="text-stone-400 font-medium">Student Email</span>
            <p className="font-bold text-sm text-charcoal mt-0.5">{user?.email}</p>
          </div>
          <div>
            <span className="text-stone-400 font-medium">Institution</span>
            <p className="font-bold text-sm text-charcoal mt-0.5">{user?.college}</p>
          </div>
          <div>
            <span className="text-stone-400 font-medium">Platform Role</span>
            <p className="font-bold text-sm text-brand-700 uppercase mt-0.5">{user?.role || 'student'}</p>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2 pb-3 border-b border-stone-100">
          <Bell className="w-4 h-4 text-brand-600" />
          Notification Preferences (Mock UI)
        </h3>

        <div className="space-y-3.5">
          <Checkbox
            label="Roommate Request Alerts"
            description="Receive email alerts whenever another student invites you to connect."
            checked={notifications.requestReceived}
            onChange={() => handleToggleNotif('requestReceived')}
          />
          <Checkbox
            label="High Compatibility Match Notifications"
            description="Alert me when a candidate matching 90%+ registers in my campus pool."
            checked={notifications.newMatch}
            onChange={() => handleToggleNotif('newMatch')}
          />
          <Checkbox
            label="Direct Message Pings"
            description="Notify me when an accepted roommate sends an apartment tour message."
            checked={notifications.chatPings}
            onChange={() => handleToggleNotif('chatPings')}
          />
          <Checkbox
            label="Weekly Campus Housing Digest"
            description="Periodic summary of newly posted student apartment groups."
            checked={notifications.campusDigest}
            onChange={() => handleToggleNotif('campusDigest')}
          />
        </div>
      </Card>

      {/* Privacy Controls */}
      <Card className="p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2 pb-3 border-b border-stone-100">
          <Shield className="w-4 h-4 text-brand-600" />
          Privacy & Visibility Controls (Mock UI)
        </h3>

        <div className="space-y-3.5">
          <Checkbox
            label="Restrict Search to Verified Campus Students"
            description="Only allow students from your registered university to inspect match details."
            checked={privacy.campusOnly}
            onChange={() => handleTogglePrivacy('campusOnly')}
          />
          <Checkbox
            label="Hide Exact Budget Range on Public Match Cards"
            description="Keep specific rent targets confidential until mutual request acceptance."
            checked={privacy.hideBudget}
            onChange={() => handleTogglePrivacy('hideBudget')}
          />
        </div>
      </Card>

      {/* Danger Zone: Session Signout */}
      <Card className="p-6 sm:p-8 border-rose-200 bg-rose-50/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-rose-900">Sign Out of Session</h4>
            <p className="text-xs text-rose-700/80 mt-0.5">
              Clears active demonstration session state and returns to the public landing page.
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
            This will reset the active demo session and return you to the NestMatch homepage. Any mock profile edits or questionnaire updates are preserved during active browser runtime.
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
