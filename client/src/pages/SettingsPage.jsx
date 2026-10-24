import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Shield,
  LogOut,
  User,
  Loader2,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showSignoutModal, setShowSignoutModal] = useState(false);
  const [savingKey, setSavingKey] = useState(null);

  // Real persisted settings state derived from user account
  const [settings, setSettings] = useState({
    emailNotifications: user?.settings?.emailNotifications ?? true,
    matchAlerts: user?.settings?.matchAlerts ?? true,
    requestAlerts: user?.settings?.requestAlerts ?? true,
    hideBudgetFromPublic: user?.settings?.hideBudgetFromPublic ?? false,
  });

  // Keep local state in sync when user context refreshes
  useEffect(() => {
    if (user?.settings) {
      setSettings({
        emailNotifications: user.settings.emailNotifications ?? true,
        matchAlerts: user.settings.matchAlerts ?? true,
        requestAlerts: user.settings.requestAlerts ?? true,
        hideBudgetFromPublic: user.settings.hideBudgetFromPublic ?? false,
      });
    }
  }, [user?.settings]);

  const handleToggle = async (key) => {
    const previousValue = settings[key];
    const nextValue = !previousValue;
    const nextSettings = { ...settings, [key]: nextValue };

    // Optimistically update
    setSettings(nextSettings);
    setSavingKey(key);

    try {
      const res = await userService.updateMySettings({ [key]: nextValue });
      if (res.data?.user) {
        updateUser(res.data.user);
      }
      showToast('Setting saved successfully.', 'success');
    } catch (err) {
      // Revert optimistic state on failure
      setSettings((prev) => ({ ...prev, [key]: previousValue }));
      showToast(err.response?.data?.message || 'Failed to update setting.', 'error');
    } finally {
      setSavingKey(null);
    }
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
        subtitle="Manage account details, notification preferences, and active student session."
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
            <p className="font-bold text-sm text-charcoal mt-0.5">{user?.college || 'Not set'}</p>
          </div>
          <div>
            <span className="text-stone-400 font-medium">Platform Role</span>
            <p className="font-bold text-sm text-brand-700 uppercase mt-0.5">{user?.role || 'student'}</p>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-600" />
            Notification Preferences
          </h3>
          <span className="text-xs text-stone-400">Auto-saved to your profile</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Checkbox
              label="Roommate Request Alerts"
              description="Receive in-app and email alerts whenever another student invites you to connect."
              checked={settings.requestAlerts}
              onChange={() => handleToggle('requestAlerts')}
              disabled={savingKey === 'requestAlerts'}
            />
            {savingKey === 'requestAlerts' && <Loader2 className="w-4 h-4 text-brand-600 animate-spin mt-1" />}
          </div>

          <div className="flex items-start justify-between">
            <Checkbox
              label="High Compatibility Match Notifications"
              description="Alert me when a candidate matching 90%+ registers in my campus pool."
              checked={settings.matchAlerts}
              onChange={() => handleToggle('matchAlerts')}
              disabled={savingKey === 'matchAlerts'}
            />
            {savingKey === 'matchAlerts' && <Loader2 className="w-4 h-4 text-brand-600 animate-spin mt-1" />}
          </div>


          {/* Unsupported Mock Feature clearly identified */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 opacity-60">
            <Checkbox
              label="Weekly Campus Housing Digest (Planned for v2.0)"
              description="Periodic email summary of newly posted student apartment groups. (Currently disabled as email service is not configured in local environment)."
              checked={false}
              disabled={true}
            />
          </div>
        </div>
      </Card>

      {/* Privacy Controls */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-600" />
            Privacy & Visibility Controls
          </h3>
          <span className="text-xs text-stone-400">Persisted securely</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Checkbox
              label="Hide Exact Budget Range on Public Match Cards"
              description="Keep specific rent targets confidential until mutual roommate request acceptance."
              checked={settings.hideBudgetFromPublic}
              onChange={() => handleToggle('hideBudgetFromPublic')}
              disabled={savingKey === 'hideBudgetFromPublic'}
            />
            {savingKey === 'hideBudgetFromPublic' && <Loader2 className="w-4 h-4 text-brand-600 animate-spin mt-1" />}
          </div>

          {/* Unsupported Mock Feature clearly identified */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 opacity-60">
            <Checkbox
              label="Restrict Search to Verified Campus Students Only (Coming in v2.0)"
              description="Only allow students from your registered university to inspect match details. (Currently all users are registered college students)."
              checked={true}
              disabled={true}
            />
          </div>
        </div>
      </Card>

      {/* Danger Zone: Session Signout */}
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
