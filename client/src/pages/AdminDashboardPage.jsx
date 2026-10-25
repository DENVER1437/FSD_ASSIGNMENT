import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  UserCheck,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { adminService } from '../services/adminService';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    completedSurveys: 0,
    totalConnections: 0,
  });
  const [recentPairs, setRecentPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPairs, setShowPairs] = useState(false);
  const [selectedPair, setSelectedPair] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [metricsRes, pairsRes] = await Promise.allSettled([
          adminService.getMetrics(),
          adminService.getAcceptedPairs(),
        ]);

        if (metricsRes.status === 'fulfilled') {
          const res = metricsRes.value;
          if (res.data?.metrics) {
            setStats(res.data.metrics);
          } else if (res.data) {
            setStats({
              totalUsers: res.data.totalUsers || 0,
              totalStudents: res.data.totalStudents || 0,
              completedSurveys: res.data.completedSurveys || 0,
              totalConnections: res.data.totalConnections || 0,
            });
          }
        }

        if (pairsRes.status === 'fulfilled' && pairsRes.value?.data?.pairs) {
          setRecentPairs(pairsRes.value.data.pairs);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Administrative Overview"
        subtitle="Live operational telemetry, confirmed roommate pairings, and student platform metrics."
        badge={
          <span className="text-xs font-bold text-charcoal bg-stone-200 px-2.5 py-0.5 rounded-full">
            Admin Console
          </span>
        }
      />

      {/* Primary Key Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card
          onClick={() => navigate('/admin/users')}
          hover
          className="p-5 space-y-2 cursor-pointer transition hover:border-brand-300"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
              View Directory →
            </span>
          </div>
          <p className="text-3xl font-extrabold text-charcoal">
            {loading ? '...' : stats.totalUsers || stats.totalStudents}
          </p>
          <p className="text-xs font-medium text-stone-500">Registered Students</p>
        </Card>

        <Card
          onClick={() => navigate('/admin/users')}
          hover
          className="p-5 space-y-2 cursor-pointer transition hover:border-emerald-300"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Questionnaires
            </span>
          </div>
          <p className="text-3xl font-extrabold text-charcoal">
            {loading ? '...' : stats.completedSurveys}
          </p>
          <p className="text-xs font-medium text-stone-500">Completed Surveys</p>
        </Card>

        <Card
          onClick={() => setShowPairs((prev) => !prev)}
          hover
          className="p-5 space-y-2 cursor-pointer transition hover:border-amber-300 border-amber-200/80 bg-amber-50/20"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              {showPairs ? (
                <>
                  Hide Pairs <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  View Pairs <ChevronDown className="w-3 h-3" />
                </>
              )}
            </span>
          </div>
          <p className="text-3xl font-extrabold text-charcoal">
            {loading ? '...' : recentPairs.length || stats.totalConnections}
          </p>
          <p className="text-xs font-medium text-stone-600 font-semibold">Accepted Roommate Pairs</p>
        </Card>
      </div>

      {/* Admin Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-charcoal">Student Directory</h3>
                <p className="text-xs text-stone-500">Manage student profiles, accounts, and survey data</p>
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
            Search registered student accounts by name or college, inspect submitted questionnaires, and toggle moderation status.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-charcoal">Accepted Roommate Pairs</h3>
                <p className="text-xs text-stone-500">Inspect mutual roommate matches and student connections</p>
              </div>
            </div>
            <Button
              size="sm"
              variant={showPairs ? 'primary' : 'outline'}
              onClick={() => setShowPairs((prev) => !prev)}
            >
              {showPairs ? 'Hide Pairs' : 'View Pairs'}
            </Button>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
            Click to {showPairs ? 'hide' : 'reveal'} the list of confirmed roommate pairs, compatibility ratings, and college alignment directly below.
          </p>
        </Card>
      </div>

      {/* Accepted Roommate Pairs Section - Displayed only when button is clicked (not by default) */}
      {showPairs && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Accepted Roommate Pairs
              </h3>
              <p className="text-xs text-stone-500">
                Concise directory of connected student pairs and compatibility ratings
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/admin/accepted-pairs')}
              icon={ArrowRight}
            >
              Full Page View ({recentPairs.length})
            </Button>
          </div>

          {/* Compact Table like User Directory */}
          <Card className="overflow-hidden border-stone-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Student 1 (Sender)</th>
                    <th className="py-3 px-4">Student 2 (Partner)</th>
                    <th className="py-3 px-4">Institutions</th>
                    <th className="py-3 px-4">Compatibility</th>
                    <th className="py-3 px-4">Accepted Date</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-stone-400">
                        Loading accepted pairs...
                      </td>
                    </tr>
                  ) : recentPairs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-stone-400">
                        No accepted roommate pairs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentPairs.map((pair) => (
                      <tr key={pair.id} className="hover:bg-stone-50/60 transition">
                        {/* Student 1 */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={pair.sender.name} size="sm" />
                            <div>
                              <p className="font-bold text-charcoal">{pair.sender.name}</p>
                              <p className="text-[11px] text-stone-400">{pair.sender.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Student 2 */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={pair.receiver.name} size="sm" />
                            <div>
                              <p className="font-bold text-charcoal">{pair.receiver.name}</p>
                              <p className="text-[11px] text-stone-400">{pair.receiver.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Institutions */}
                        <td className="py-3 px-4 text-stone-600">
                          <p className="font-medium text-charcoal truncate max-w-[180px]">{pair.sender.college}</p>
                          <p className="text-[11px] text-stone-400 truncate max-w-[180px]">with {pair.receiver.college}</p>
                        </td>

                        {/* Compatibility */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            {pair.compatibilityScore}%
                          </span>
                        </td>

                        {/* Accepted Date */}
                        <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                          {formatDate(pair.acceptedDate)}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedPair(pair)}
                            className="text-brand-600 hover:text-brand-700 h-7 px-2"
                            icon={Eye}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Details Modal for selected pair */}
      {selectedPair && (
        <Modal
          isOpen={Boolean(selectedPair)}
          onClose={() => setSelectedPair(null)}
          title="Accepted Pair Summary"
          description={`Mutual connection between ${selectedPair.sender.name} and ${selectedPair.receiver.name}`}
        >
          <div className="space-y-4 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="font-semibold text-emerald-900">Calculated Compatibility</span>
              <span className="px-2.5 py-0.5 bg-emerald-600 text-white font-bold rounded-full text-xs">
                {selectedPair.compatibilityScore}% Score
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400">Student 1</span>
                <p className="font-bold text-sm text-charcoal">{selectedPair.sender.name}</p>
                <p className="text-stone-500">{selectedPair.sender.college}</p>
                <p className="text-stone-400">{selectedPair.sender.email}</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400">Student 2</span>
                <p className="font-bold text-sm text-charcoal">{selectedPair.receiver.name}</p>
                <p className="text-stone-500">{selectedPair.receiver.college}</p>
                <p className="text-stone-400">{selectedPair.receiver.email}</p>
              </div>
            </div>

            {selectedPair.message && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 italic text-stone-600">
                "{selectedPair.message}"
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedPair(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminDashboardPage;
