import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldAlert,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Activity,
  UserCheck,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import { mockAdminService } from '../services/mockAdminService';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const stats = mockAdminService.getStats();

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Administrative Overview"
        subtitle="Operational telemetry, student safety oversight, and platform activity."
        badge={
          <span className="text-xs font-bold text-charcoal bg-stone-200 px-2.5 py-0.5 rounded-full">
            Admin Console
          </span>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card
          onClick={() => navigate('/admin/users')}
          hover
          className="p-5 space-y-2 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-charcoal">{stats.totalUsers}</p>
          <p className="text-xs font-medium text-stone-500">Registered Students</p>
        </Card>

        <Card
          onClick={() => navigate('/admin/users')}
          hover
          className="p-5 space-y-2 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-charcoal">{stats.activeUsers}</p>
          <p className="text-xs font-medium text-stone-500">Active Profiles</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-charcoal">{stats.pendingRequests}</p>
          <p className="text-xs font-medium text-stone-500">Active Invitations</p>
        </Card>

        <Card
          onClick={() => navigate('/admin/reports')}
          hover
          className="p-5 space-y-2 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-charcoal">{stats.openReports}</p>
          <p className="text-xs font-medium text-stone-500">Unresolved Reports</p>
        </Card>
      </div>

      {/* Admin Modules Quick Launch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-charcoal">Student Directory</h3>
                <p className="text-xs text-stone-500">Review student profiles and moderation status</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/admin/users')}
            >
              Open Directory
            </Button>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
            Search registered student accounts by name or college, inspect submitted questionnaires, and toggle moderation flags.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-charcoal">Incident Reports</h3>
                <p className="text-xs text-stone-500">Review peer moderation and grievance tickets</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/admin/reports')}
            >
              Review Reports
            </Button>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
            Evaluate reported violations for misleading profiles, inappropriate conduct, or external commercial broker listings.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
