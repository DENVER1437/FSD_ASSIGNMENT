import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Inbox,
  Send,
  UserCheck,
  Check,
  X,
  MessageSquare,
  Clock,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import ScoreBadge from '../components/ScoreBadge';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { useMatch } from '../context/MatchContext';

export function RequestsPage() {
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent' | 'accepted'
  const { requests, acceptRequest, rejectRequest, cancelRequest } = useMatch();
  const navigate = useNavigate();

  const receivedRequests = requests.filter(
    (r) => r.type === 'received' && r.status === 'pending'
  );
  const sentRequests = requests.filter(
    (r) => r.type === 'sent' && r.status === 'pending'
  );
  const acceptedRequests = requests.filter((r) => r.status === 'accepted');

  const getActiveList = () => {
    if (activeTab === 'received') return receivedRequests;
    if (activeTab === 'sent') return sentRequests;
    return acceptedRequests;
  };

  const currentList = getActiveList();

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
      <PageHeader
        title="Roommate Requests"
        subtitle="Manage invitations to team up for student apartments and shared housing."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-1">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'received'
              ? 'bg-brand-50 text-brand-800 border border-brand-200'
              : 'text-stone-500 hover:text-charcoal hover:bg-stone-100'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Received</span>
          {receivedRequests.length > 0 && (
            <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {receivedRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'sent'
              ? 'bg-brand-50 text-brand-800 border border-brand-200'
              : 'text-stone-500 hover:text-charcoal hover:bg-stone-100'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Sent</span>
          {sentRequests.length > 0 && (
            <span className="bg-stone-200 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {sentRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('accepted')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'accepted'
              ? 'bg-brand-50 text-brand-800 border border-brand-200'
              : 'text-stone-500 hover:text-charcoal hover:bg-stone-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Connected</span>
          {acceptedRequests.length > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {acceptedRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Requests List */}
      {currentList.length === 0 ? (
        <EmptyState
          icon={activeTab === 'accepted' ? UserCheck : Inbox}
          title={
            activeTab === 'received'
              ? 'No Pending Received Requests'
              : activeTab === 'sent'
              ? 'No Sent Pending Requests'
              : 'No Accepted Connections Yet'
          }
          description={
            activeTab === 'received'
              ? 'When other students find your profile compatible and invite you, requests will appear here.'
              : activeTab === 'sent'
              ? 'You have not dispatched any pending roommate invitations.'
              : 'Accepting incoming requests unlocks direct chat messaging.'
          }
          actionLabel="Browse Compatible Roommates"
          onAction={() => navigate('/matches')}
        />
      ) : (
        <div className="space-y-4">
          {currentList.map((req) => {
            const partner = req.sender || req.receiver;
            return (
              <Card key={req.id} className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={partner?.profileImage}
                      name={partner?.name || 'Student'}
                      size="lg"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-charcoal">
                          {partner?.name}
                        </h3>
                        {partner?.score && (
                          <ScoreBadge score={partner.score} size="sm" showLabel={false} />
                        )}
                      </div>
                      <p className="text-xs text-stone-500">
                        {partner?.college} • {partner?.course || partner?.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        req.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : req.status === 'rejected'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {req.status === 'accepted'
                        ? 'Connected'
                        : req.status === 'rejected'
                        ? 'Declined'
                        : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Optional Message text */}
                {req.message && (
                  <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200/60 leading-relaxed italic">
                    "{req.message}"
                  </p>
                )}

                {/* Actions Footer */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/matches/${partner.id}`)}
                  >
                    View Match Profile
                  </Button>

                  {/* Actions for Received Pending */}
                  {req.type === 'received' && req.status === 'pending' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => rejectRequest(req.id)}
                        className="text-stone-600 hover:text-rose-600"
                        icon={X}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => acceptRequest(req.id)}
                        icon={Check}
                      >
                        Accept Request
                      </Button>
                    </>
                  )}

                  {/* Actions for Sent Pending */}
                  {req.type === 'sent' && req.status === 'pending' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => cancelRequest(req.id)}
                      className="text-stone-500 hover:text-rose-600"
                    >
                      Cancel Request
                    </Button>
                  )}

                  {/* Actions for Accepted */}
                  {req.status === 'accepted' && (
                    <Button
                      size="sm"
                      onClick={() => navigate('/chat')}
                      icon={MessageSquare}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Open Messages
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RequestsPage;
