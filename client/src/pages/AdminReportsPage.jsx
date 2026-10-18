import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Ban,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';

export function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const { showToast } = useToast();

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getReports();
      if (res.data?.reports) {
        setReports(res.data.reports);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load moderation reports', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleResolve = async (id) => {
    setActionLoadingId(id);
    try {
      await adminService.updateReportStatus(id, { status: 'resolved' });
      setReports((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? { ...r, status: 'resolved' } : r))
      );
      showToast('Report marked as resolved.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update report status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDismiss = async (id) => {
    setActionLoadingId(id);
    try {
      await adminService.updateReportStatus(id, { status: 'dismissed', action: 'dismiss' });
      setReports((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? { ...r, status: 'dismissed' } : r))
      );
      showToast('Report dismissed without action.', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to dismiss report', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSuspendUser = async (id) => {
    setActionLoadingId(id);
    try {
      await adminService.updateReportStatus(id, { action: 'suspend_user' });
      setReports((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? { ...r, status: 'resolved' } : r))
      );
      showToast('Reported student account has been suspended and ticket resolved.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to suspend user', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openTickets = reports.filter((r) => r.status === 'open' || r.status === 'investigating' || r.status === 'pending');

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHeader
        title="Incident Reports & Moderation"
        subtitle="Review community grievance tickets, safety flags, and policy violation reports."
        badge={
          <span className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            {openTickets.length} Open Tickets
          </span>
        }
      />

      {loading ? (
        <Card className="p-8 text-center text-stone-400">Loading incident tickets...</Card>
      ) : reports.length === 0 ? (
        <Card className="p-8 text-center text-stone-400">No grievance reports recorded in system.</Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const reportId = report._id || report.id;
            const reporter = report.reporterId || {};
            const reported = report.reportedUserId || {};
            const isOpen = report.status === 'open' || report.status === 'investigating' || report.status === 'pending';

            return (
              <Card key={reportId} className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        report.severity === 'high'
                          ? 'bg-rose-100 text-rose-700'
                          : report.severity === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-charcoal">
                          {report.reason || 'Safety Grievance'}
                        </h3>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            report.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : report.status === 'dismissed'
                              ? 'bg-stone-100 text-stone-600'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">
                        Filed on {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-stone-500">
                    Severity:{' '}
                    <strong
                      className={`uppercase font-bold ${
                        report.severity === 'high'
                          ? 'text-rose-600'
                          : report.severity === 'medium'
                          ? 'text-amber-600'
                          : 'text-stone-500'
                      }`}
                    >
                      {report.severity || 'normal'}
                    </strong>
                  </div>
                </div>

                {/* Reporter & Reported Student Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                  <div>
                    <span className="text-stone-400 font-medium">Reporting Student:</span>
                    <p className="font-bold text-charcoal mt-0.5">
                      {reporter.name || 'Anonymous Student'} ({reporter.email || '—'})
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-400 font-medium">Reported Profile:</span>
                    <p className="font-bold text-rose-700 mt-0.5">
                      {reported.name || 'Flagged User'} ({reported.email || '—'})
                    </p>
                  </div>
                </div>

                {/* Reason Description */}
                <div className="text-xs text-stone-700 leading-relaxed">
                  <span className="font-bold text-charcoal block mb-1">Grievance Description:</span>
                  <p className="bg-white p-3 rounded-xl border border-stone-200">
                    "{report.description || report.reason}"
                  </p>
                </div>

                {/* Actions */}
                {isOpen && (
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-stone-100">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionLoadingId === reportId}
                      onClick={() => handleDismiss(reportId)}
                      icon={XCircle}
                    >
                      Dismiss Ticket
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionLoadingId === reportId}
                      onClick={() => handleSuspendUser(reportId)}
                      icon={Ban}
                      className="text-rose-600 hover:bg-rose-50"
                    >
                      Suspend Reported User
                    </Button>
                    <Button
                      size="sm"
                      disabled={actionLoadingId === reportId}
                      onClick={() => handleResolve(reportId)}
                      icon={CheckCircle2}
                    >
                      Mark as Resolved
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminReportsPage;
