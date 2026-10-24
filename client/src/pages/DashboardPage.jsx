import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Clock,
  ArrowRight,
  ClipboardCheck,
  Check,
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

  // Dynamic profile completeness calculation matching backend userController criteria
  const calculateCompletion = () => {
    let score = 0;
    if (user?.name && user.name.trim().length >= 2) score += 20;
    if (user?.college && user.college.trim().length >= 2) score += 20;
    if (user?.course && user.course.trim().length >= 2) score += 20;
    if (user?.city && user.city.trim().length >= 2) score += 20;
    if (user?.bio && user.bio.trim().length >= 10) score += 20;
    return score;
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
              {profileCompletion === 100
                ? 'Your student profile is 100% complete and fully verified for matching.'
                : 'Complete your college, course, city, and a short bio to reach 100% profile completeness.'}
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

      {/* Top Recommended Matches */}
      <div className="space-y-4">
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
              const candidateId = match.user?._id || match.user?.id || match.userId;
              const existingReq = requests.find(
                (r) =>
                  (r.receiverId === candidateId || r.senderId === candidateId) &&
                  r.status !== 'rejected'
              );
              const isAccepted = existingReq?.status === 'accepted';
              const hasRequested = Boolean(existingReq);
              const topThreeTraits = (match.commonPreferences || []).slice(0, 3);

              return (
                <Card
                  key={match.id}
                  className="p-5 hover:border-stone-300 transition-all shadow-subtle"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={match.user?.profileImage}
                        name={match.user?.name}
                        size="lg"
                      />
                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-charcoal">
                          {match.user?.name}
                        </h3>
                        <p className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
                          <span>{match.user?.college || 'Nirma University'}</span>
                          <span className="text-stone-300">•</span>
                          <span className="text-stone-600">{match.user?.city || 'Ahmedabad'}</span>
                        </p>
                      </div>
                    </div>

                    <ScoreBadge score={match.score} size="md" className="self-start" />
                  </div>

                  {/* Top 3 Matching Questionnaire Info */}
                  <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5 max-w-xl">
                      {topThreeTraits.map((pref, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-1 rounded-lg flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span>{pref}</span>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/matches/${match.id}`)}
                        className="flex-1 sm:flex-none justify-center text-xs"
                      >
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        disabled={hasRequested}
                        onClick={() => sendRequest(match.user)}
                        className="flex-1 sm:flex-none justify-center text-xs"
                      >
                        {isAccepted ? 'Connected' : hasRequested ? 'Requested' : 'Send Request'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
      </div>
    </div>
  );
}

export default DashboardPage;
