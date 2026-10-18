import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({ limit: 100 });
      if (res.data?.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchQuery =
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.college?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const handleToggleStatus = (user) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedUser) return;

    const targetId = selectedUser.id || selectedUser._id;
    const newStatus = selectedUser.status === 'suspended' ? 'active' : 'suspended';

    setActionLoading(true);
    try {
      await adminService.updateUserStatus(targetId, newStatus);
      setUsers((prev) =>
        prev.map((u) => ((u.id || u._id) === targetId ? { ...u, status: newStatus } : u))
      );

      showToast(
        `Account for ${selectedUser.name} has been ${newStatus === 'suspended' ? 'suspended' : 'reactivated'}.`,
        newStatus === 'suspended' ? 'error' : 'success'
      );
      setShowConfirmModal(false);
      setSelectedUser(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user status', 'error');
    } finally {
      setActionLoading(false);
    }
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
            <option value="suspended">Suspended Only</option>
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
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-stone-400">
                    Loading student directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-stone-400">
                    No matching student records found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const uid = u.id || u._id;
                  const isSuspended = u.status === 'suspended';
                  return (
                    <tr key={uid} className="hover:bg-stone-50/60 transition">
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
                        <p className="font-medium text-charcoal">{u.college || '—'}</p>
                        <p className="text-[11px] text-stone-400">{u.course || u.city || '—'}</p>
                      </td>
                      <td className="py-3.5 px-4 text-stone-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                            isSuspended
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant={isSuspended ? 'outline' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleStatus(u)}
                          className={
                            isSuspended
                              ? 'text-emerald-700 hover:bg-emerald-50'
                              : 'text-rose-600 hover:bg-rose-50'
                          }
                        >
                          {isSuspended ? 'Reactivate' : 'Suspend'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={
          selectedUser?.status === 'suspended'
            ? `Reactivate ${selectedUser?.name}?`
            : `Suspend ${selectedUser?.name}?`
        }
        description="Verify moderation change"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-stone-600">
            {selectedUser?.status === 'suspended'
              ? 'This will restore the student profile to active visibility in the compatibility match pool.'
              : 'Suspending this student hides their match card and temporarily pauses active roommate requests pending review.'}
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading}
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant={selectedUser?.status === 'suspended' ? 'primary' : 'danger'}
              size="sm"
              loading={actionLoading}
              onClick={confirmToggleStatus}
            >
              {selectedUser?.status === 'suspended' ? 'Confirm Reactivation' : 'Confirm Suspension'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminUsersPage;
