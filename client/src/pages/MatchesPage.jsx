import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import ScoreBadge from '../components/ScoreBadge';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { useMatch } from '../context/MatchContext';

export function MatchesPage() {
  const {
    matches,
    requests,
    sendRequest,
    matchesLoading,
    matchesError,
    refreshMatches,
    preferences,
  } = useMatch();
  const navigate = useNavigate();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [minScore, setMinScore] = useState('50');
  const [sortBy, setSortBy] = useState('compatibility');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Dynamically derive available colleges and cities from real loaded matches
  const availableColleges = useMemo(() => {
    const list = matches.map((m) => m.user?.college).filter(Boolean);
    return Array.from(new Set(list));
  }, [matches]);

  const availableCities = useMemo(() => {
    const list = matches.map((m) => m.user?.city).filter(Boolean);
    return Array.from(new Set(list));
  }, [matches]);

  // Filtered and Sorted Matches
  const filteredMatches = useMemo(() => {
    let result = [...matches];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.user?.name?.toLowerCase().includes(q) ||
          m.user?.college?.toLowerCase().includes(q) ||
          m.user?.course?.toLowerCase().includes(q)
      );
    }

    // College filter
    if (selectedCollege !== 'all') {
      result = result.filter(
        (m) => m.user?.college?.toLowerCase() === selectedCollege.toLowerCase()
      );
    }

    // City filter
    if (selectedCity !== 'all') {
      result = result.filter(
        (m) => m.user?.city?.toLowerCase() === selectedCity.toLowerCase()
      );
    }

    // Min Score
    result = result.filter((m) => m.score >= Number(minScore));

    // Sorting
    if (sortBy === 'compatibility') {
      result.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.user?.name || '').localeCompare(b.user?.name || ''));
    }

    return result;
  }, [matches, searchQuery, selectedCollege, selectedCity, minScore, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCollege('all');
    setSelectedCity('all');
    setMinScore('50');
    setSortBy('compatibility');
  };

  const isFiltered =
    searchQuery !== '' ||
    selectedCollege !== 'all' ||
    selectedCity !== 'all' ||
    minScore !== '50' ||
    sortBy !== 'compatibility';

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHeader
        title="Find Compatible Roommates"
        subtitle="Ranked algorithmically based on your lifestyle preferences and survey responses."
        badge={
          <span className="text-xs font-bold text-brand-800 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
            {filteredMatches.length} Matches Found
          </span>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, campus, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-charcoal placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="compatibility">Sort by: Highest Compatibility</option>
              <option value="name">Sort by: Name (A-Z)</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="sm:hidden shrink-0"
              icon={SlidersHorizontal}
            >
              Filters
            </Button>
          </div>
        </div>

        {/* Detailed Filter Options (Always visible on desktop, toggleable on mobile) */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-100 ${
            showFiltersMobile ? 'block' : 'hidden sm:grid'
          }`}
        >
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
              Campus / College
            </label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-charcoal bg-white"
            >
              <option value="all">All Colleges ({availableColleges.length > 0 ? availableColleges.length : 'Any'})</option>
              {availableColleges.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
              City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-charcoal bg-white"
            >
              <option value="all">All Cities ({availableCities.length > 0 ? availableCities.length : 'Any'})</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
              Min. Compatibility
            </label>
            <select
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-charcoal bg-white"
            >
              <option value="50">50% and above</option>
              <option value="70">70% and above</option>
              <option value="80">80% and above</option>
              <option value="90">90% and above (Top)</option>
            </select>
          </div>

          <div className="flex items-end">
            {isFiltered ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="w-full text-xs text-rose-600 hover:bg-rose-50"
                icon={X}
              >
                Reset Filters
              </Button>
            ) : (
              <span className="text-xs text-stone-400 self-center pl-2">
                Filtering by 10 lifestyle traits
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {matchesLoading ? (
        <div className="py-20 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-stone-600">
            Evaluating compatibility algorithms across student preferences...
          </p>
        </div>
      ) : matchesError ? (
        /* Error State with Retry */
        <Card className="p-8 text-center border-rose-200 bg-rose-50/20 max-w-xl mx-auto space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-bold text-base text-rose-900">Unable to Load Roommate Matches</h3>
          <p className="text-xs text-stone-600">{matchesError}</p>
          <div className="pt-2">
            <Button size="sm" onClick={refreshMatches} icon={RefreshCw}>
              Retry Search
            </Button>
          </div>
        </Card>
      ) : !preferences ? (
        /* Incomplete Questionnaire Prompt */
        <Card className="p-8 text-center border-brand-200 bg-brand-50/30 max-w-2xl mx-auto space-y-3">
          <Sparkles className="w-10 h-10 text-brand-600 mx-auto" />
          <h3 className="text-lg font-bold text-charcoal">Complete Your Lifestyle Questionnaire</h3>
          <p className="text-xs text-stone-600 max-w-md mx-auto">
            To generate personalized roommate compatibility scores, please fill out your sleep rhythms, cleanliness habits, and budget.
          </p>
          <div className="pt-2">
            <Button onClick={() => navigate('/questionnaire')}>
              Start Questionnaire
            </Button>
          </div>
        </Card>
      ) : matches.length === 0 ? (
        /* Empty Database / No Candidates */
        <EmptyState
          icon={Users}
          title="No Roommate Candidates Found"
          description="There are currently no other active student profiles available in your campus pool. Check back soon!"
        />
      ) : filteredMatches.length === 0 ? (
        /* Filter Empty State */
        <EmptyState
          icon={Users}
          title="No Roommates Match These Filters"
          description="Try loosening your minimum compatibility score or selecting 'All Colleges' to broaden the search."
          actionLabel="Clear All Filters"
          onAction={resetFilters}
        />
      ) : (
        /* Single Row Matches List */
        <Card className="divide-y divide-stone-100 overflow-hidden border-stone-200">
          {filteredMatches.map((match) => {
            const candidateId = match.user?._id || match.user?.id || match.userId;
            const existingReq = requests.find(
              (r) =>
                (r.receiverId === candidateId || r.senderId === candidateId) &&
                r.status !== 'rejected'
            );
            const isAccepted = existingReq?.status === 'accepted';
            const hasRequested = Boolean(existingReq);

            return (
              <div
                key={match.id}
                className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
              >
                {/* Name */}
                <span className="font-semibold text-charcoal text-sm sm:text-base">
                  {match.user?.name}
                </span>

                {/* Percentage Match & Send Request Button */}
                <div className="flex items-center gap-3.5 shrink-0">
                  <ScoreBadge score={match.score} size="sm" showLabel={false} />
                  <Button
                    size="sm"
                    disabled={hasRequested}
                    onClick={() => sendRequest(match.user)}
                    className="min-w-[120px] justify-center text-xs"
                  >
                    {isAccepted ? 'Connected' : hasRequested ? 'Requested' : 'Send Request'}
                  </Button>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

export default MatchesPage;
