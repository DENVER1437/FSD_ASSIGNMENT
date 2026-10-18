import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Building,
  MapPin,
  BookOpen,
  Sparkles,
  Send,
  MessageSquare,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import ScoreBadge from '../components/ScoreBadge';
import EmptyState from '../components/EmptyState';
import { useMatch } from '../context/MatchContext';
import { matchService } from '../services/matchService';

export function MatchDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matches, requests, sendRequest } = useMatch();

  const [directMatch, setDirectMatch] = useState(null);
  const [loading, setLoading] = useState(false);

  const contextMatch = matches.find((m) => m.id === id || m.userId === id);
  const match = contextMatch || directMatch;

  useEffect(() => {
    if (!contextMatch && id) {
      setLoading(true);
      matchService
        .getMatchDetails(id)
        .then((res) => {
          if (res?.data?.match) {
            setDirectMatch(res.data.match);
          }
        })
        .catch((err) => {
          console.warn('Match direct lookup failed:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, contextMatch]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
        <p className="text-sm text-stone-500">Calculating compatibility breakdown...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="py-12">
        <EmptyState
          icon={AlertTriangle}
          title="Student Profile Not Found"
          description={`No match record was found matching identifier "${id}". The student may have updated their preferences.`}
          actionLabel="Back to Find Matches"
          onAction={() => navigate('/matches')}
        />
      </div>
    );
  }

  const isRequested = requests.some(
    (r) => (r.receiverId === match.user.id || r.senderId === match.user.id) && r.status !== 'rejected'
  );
  const isAccepted = requests.some(
    (r) => (r.receiverId === match.user.id || r.senderId === match.user.id) && r.status === 'accepted'
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-150">
      {/* Back button */}
      <button
        onClick={() => navigate('/matches')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-charcoal transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Matches</span>
      </button>

      {/* Profile Overview Header Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div className="flex items-start gap-4 sm:gap-5">
            <Avatar
              src={match.user.profileImage}
              name={match.user.name}
              size="2xl"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
                  {match.user.name}, {match.user.age}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-stone-500">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-stone-400" />
                  {match.user.college}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {match.user.city}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                  {match.user.course}
                </span>
              </div>
            </div>
          </div>

          <ScoreBadge score={match.score} size="lg" className="self-start sm:self-center" />
        </div>

        {/* Bio & Intro */}
        <div className="pt-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              About {match.user.name.split(' ')[0]}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200/60">
              "{match.user.bio}"
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isAccepted ? (
              <Button
                onClick={() => navigate('/chat')}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                icon={MessageSquare}
              >
                Connected • Open Chat
              </Button>
            ) : (
              <Button
                disabled={isRequested}
                onClick={() => sendRequest(match.user)}
                className="gap-2"
                icon={Send}
              >
                {isRequested ? 'Request Already Sent' : 'Send Roommate Request'}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate('/matches')}
            >
              Browse Other Students
            </Button>
          </div>
        </div>
      </Card>

      {/* Explainable Compatibility Narrative Breakdown */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            Compatibility Explanation Breakdown
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Calculated by comparing your lifestyle survey responses with {match.user.name}'s questionnaire data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shared Traits */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Harmonious Lifestyle Matches ({match.commonPreferences.length})
            </h3>
            <ul className="space-y-2">
              {match.commonPreferences.map((pref, i) => (
                <li
                  key={i}
                  className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-950 flex items-start gap-2"
                >
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{pref}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Differences / Discussion Points */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              Habits Worth Discussing Upfront ({match.differences.length})
            </h3>
            <ul className="space-y-2">
              {match.differences.map((diff, i) => (
                <li
                  key={i}
                  className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-950 flex items-start gap-2"
                >
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{diff}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Category-Level Compatibility Breakdown */}
      <Card className="p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-charcoal">
          Category Compatibility Index
        </h2>

        <div className="space-y-5">
          {match.categoryBreakdown.map((cat, idx) => {
            const hasScore = cat.score !== null && cat.score !== undefined;
            const scoreColor = !hasScore
              ? 'text-stone-400'
              : cat.score >= 90
              ? 'text-emerald-600'
              : cat.score >= 70
              ? 'text-brand-600'
              : 'text-amber-600';
            const barBg = !hasScore
              ? 'bg-stone-300'
              : cat.score >= 90
              ? 'bg-emerald-600'
              : cat.score >= 70
              ? 'bg-brand-600'
              : 'bg-amber-500';

            return (
              <div key={idx} className="space-y-1.5 pb-4 border-b border-stone-100 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-charcoal">{cat.name}</span>
                  <span className={scoreColor}>
                    {hasScore ? `${cat.score}%` : 'N/A'} • {cat.status}
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${barBg}`}
                    style={{ width: hasScore ? `${cat.score}%` : '0%' }}
                  />
                </div>
                <p className="text-[11px] text-stone-500 pt-0.5">{cat.note}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default MatchDetailsPage;
