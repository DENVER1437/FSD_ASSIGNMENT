import { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Shield,
  Ban,
  CheckCircle2,
  AlertTriangle,
  X,
  Filter,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { mockAdminService } from '../services/mockAdminService';
import { useToast } from '../context/ToastContext';

export function AdminUsersPage() {
  const [users, setUsers] = useState(mockAdminService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { showToast } = useToast();

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchQuery =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.college.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const handleToggleStatus = (user) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = () => {
    if (!selectedUser) return;

    const newStatus = selectedUser.status === 'flagged' ? 'active' : 'flagged';
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, status: newStatus } : u))
    );

    showToast(
      `Account for ${selectedUser.name} has been ${newStatus === 'flagged' ? 'suspended' : 'reactivated'}.`,
      newStatus === 'flagged' ? 'error' : 'success'
    );
    setShowConfirmModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHeader
        title="Student User Directory"
        subtitle="Manage student account records, verification states, and moderation flags."
        badge={
          <span className="text-xs font-bold text-stone-700 bg-stone-200 px-2.5 py-0.5 rounded-full">
            {filteredUsers.length} Users
          </span>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search student, email, campus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-stone-200 text-xs text-charcoal bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="flagged">Flagged / Suspended</option>
          </select>
        </div>
      </Card>

      {/* User Table */}
      <Card className="overflow-hidden border-stone-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Campus & Degree</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.profileImage} name={u.name} size="sm" />
                      <div>
                        <p className="font-bold text-charcoal">{u.name}</p>
                        <p className="text-[11px] text-stone-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    <p className="font-medium text-charcoal">{u.college}</p>
                    <p className="text-[11px] text-stone-400">{u.course}</p>
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">
                    {u.joinedDate || '2026-09-01'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                        u.status === 'flagged'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {u.status === 'flagged' ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant={u.status === 'flagged' ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={() => handleToggleStatus(u)}
                      className={
                        u.status === 'flagged'
                          ? 'text-emerald-700 hover:bg-emerald-50'
                          : 'text-rose-600 hover:bg-rose-50'
                      }
                    >
                      {u.status === 'flagged' ? 'Reactivate' : 'Suspend'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={
          selectedUser?.status === 'flagged'
            ? `Reactivate ${selectedUser?.name}?`
            : `Suspend ${selectedUser?.name}?`
        }
        description="Verify moderation change"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-stone-600">
            {selectedUser?.status === 'flagged'
              ? 'This will restore the student profile to active visibility in the compatibility match pool.'
              : 'Suspending this student hides their match card and temporarily pauses active roommate requests pending review.'}
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant={selectedUser?.status === 'flagged' ? 'primary' : 'danger'}
              size="sm"
              onClick={confirmToggleStatus}
            >
              {selectedUser?.status === 'flagged' ? 'Confirm Reactivation' : 'Confirm Suspension'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminUsersPage;
