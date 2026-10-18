import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Clock,
  ArrowRight,
  ClipboardCheck,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import ScoreBadge from '../components/ScoreBadge';
import { useAuth } from '../context/AuthContext';
import { useMatch } from '../context/MatchContext';

export function DashboardPage() {
  const { user } = useAuth();
  const { matches, requests, sendRequest } = useMatch();
  const navigate = useNavigate();

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const acceptedRequests = requests.filter((r) => r.status === 'accepted');

  // Top 3 Recommended Matches
  const topMatches = matches.slice(0, 3);

  // Dynamic profile completeness calculation
  const calculateCompletion = () => {
    let score = 20; // baseline for registered account
    if (user?.name) score += 15;
    if (user?.college) score += 15;
    if (user?.course) score += 10;
    if (user?.bio && user.bio.trim().length > 10) score += 20;
    if (user?.gender) score += 10;
    if (user?.profileImage) score += 10;
    return Math.min(100, score);
  };
  const profileCompletion = calculateCompletion();

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-stone-500 text-sm max-w-xl">
            You have <strong className="text-charcoal font-semibold">{pendingRequests.length} pending request{pendingRequests.length === 1 ? '' : 's'}</strong> and <strong className="text-charcoal font-semibold">{matches.length} compatible candidates</strong> matched to your lifestyle preferences.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button
            onClick={() => navigate('/matches')}
            className="flex-1 md:flex-none justify-center gap-2"
          >
            <span>Explore All Matches</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <Card className="p-5 bg-gradient-to-r from-stone-50 via-white to-stone-50 border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Profile Completeness
              </span>
              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                {profileCompletion}% Complete
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Add your preferred move-in date and room amenities to unlock 100% precision.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/profile')}
            className="shrink-0"
          >
            Update Profile
          </Button>
        </div>
        <div className="w-full bg-stone-200 h-2 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card
          onClick={() => navigate('/matches')}
          hover
          className="p-5 space-y-2 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-charcoal">{matches.length}</p>
          <p className="text-xs font-medium text-stone-500">Compatible Roommates</p>
        </Card>

        <Card
          onClick={() => navigate('/requests')}
          hover
          className="p-5 space-y-2 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-charcoal">{pendingRequests.length}</p>
          <p className="text-xs font-medium text-stone-500">Pending Requests</p>
        </Card>

        <Card
          onClick={() => navigate('/requests')}
          hover
          className="p-5 space-y-2 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-charcoal">{acceptedRequests.length}</p>
          <p className="text-xs font-medium text-stone-500">Accepted Connections</p>
        </Card>

        <Card
          onClick={() => navigate('/questionnaire')}
          hover
          className="p-5 space-y-2 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold text-charcoal">15 / 15</p>
          <p className="text-xs font-medium text-stone-500">Survey Questions Answered</p>
        </Card>
      </div>

      {/* Main Grid: Top Recommended Matches & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recommended Matches List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-lg font-bold text-charcoal">Top Compatible Roommates</h2>
              <p className="text-xs text-stone-500">Ranked by mutual lifestyle compatibility</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/matches')}
              className="text-xs"
            >
              View all ({matches.length}) →
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {topMatches.map((match) => {
              const isRequested = requests.some(
                (r) => r.receiverId === match.user.id || r.senderId === match.user.id
              );
              return (
                <Card
                  key={match.id}
                  className="p-5 hover:border-stone-300 transition-all shadow-subtle"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={match.user.profileImage}
                        name={match.user.name}
                        size="lg"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-charcoal">
                            {match.user.name}, {match.user.age}
                          </h3>
                        </div>
                        <p className="text-xs text-stone-500">
                          {match.user.college} • {match.user.course}
                        </p>
                        <p className="text-xs text-stone-600 line-clamp-2 pt-1 max-w-lg">
                          "{match.user.bio}"
                        </p>
                      </div>
                    </div>

                    <ScoreBadge score={match.score} size="md" className="self-start" />
                  </div>

                  {/* Shared Habits preview */}
                  <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {match.commonPreferences.slice(0, 2).map((pref, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg"
                        >
                          ✓ {pref}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/matches/${match.id}`)}
                        className="flex-1 sm:flex-none justify-center"
                      >
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        disabled={isRequested}
                        onClick={() => sendRequest(match.user)}
                        className="flex-1 sm:flex-none justify-center"
                      >
                        {isRequested ? 'Requested' : 'Send Request'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity & Next Steps */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5">
            <h3 className="font-bold text-sm text-charcoal mb-4 flex items-center justify-between">
              <span>Recent Activity</span>
              <span className="text-[10px] uppercase font-bold text-stone-400">Live Feed</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-charcoal">
                    Connected with Marcus Taylor
                  </p>
                  <p className="text-stone-500">Mutual roommate request accepted</p>
                  <span className="text-[10px] text-stone-400">Yesterday</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-charcoal">
                    New Request from Jordan Lee
                  </p>
                  <p className="text-stone-500">94% Compatibility match</p>
                  <span className="text-[10px] text-stone-400">2 days ago</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-charcoal">
                    Lifestyle Survey Saved
                  </p>
                  <p className="text-stone-500">Weights applied across 15 criteria</p>
                  <span className="text-[10px] text-stone-400">Last week</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Chat Shortcut */}
          <Card className="p-5 bg-stone-900 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Roommate Chat</h4>
                <p className="text-[11px] text-stone-400">
                  {acceptedRequests.length > 0 ? `${acceptedRequests.length} Active Connection` : 'Connected conversations'}
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-300 mb-4 leading-relaxed">
              {acceptedRequests.length > 0
                ? `You have ${acceptedRequests.length} mutual connection. Coordinate apartment visits and discuss lease splits directly.`
                : 'Send roommate requests to your top matches to unlock direct mutual messaging.'}
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/chat')}
              className="w-full justify-center bg-white text-stone-900 hover:bg-stone-100"
            >
              Open Messages
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
