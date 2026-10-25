import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Sparkles,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { adminService } from '../services/adminService';

export function AdminAcceptedPairsPage() {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [selectedPair, setSelectedPair] = useState(null);

  useEffect(() => {
    const fetchPairs = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAcceptedPairs();
        if (res.data?.pairs) {
          setPairs(res.data.pairs);
        }
      } catch (err) {
        console.error('Failed to load accepted roommate pairs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPairs();
  }, []);

  const filteredPairs = useMemo(() => {
    return pairs.filter((pair) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        pair.sender.name?.toLowerCase().includes(q) ||
        pair.sender.email?.toLowerCase().includes(q) ||
        pair.sender.college?.toLowerCase().includes(q) ||
        pair.receiver.name?.toLowerCase().includes(q) ||
        pair.receiver.email?.toLowerCase().includes(q) ||
        pair.receiver.college?.toLowerCase().includes(q);

      const matchCollege =
        collegeFilter === 'all' ||
        pair.sender.college?.toLowerCase().includes(collegeFilter.toLowerCase()) ||
        pair.receiver.college?.toLowerCase().includes(collegeFilter.toLowerCase());

      return matchSearch && matchCollege;
    });
  }, [pairs, searchQuery, collegeFilter]);

  const uniqueColleges = useMemo(() => {
    return Array.from(
      new Set(
        pairs.flatMap((p) => [p.sender.college, p.receiver.college]).filter(Boolean)
      )
    );
  }, [pairs]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHeader
        title="Accepted Roommate Pairs"
        subtitle="Manage and inspect confirmed student connections and mutual match ratings."
        badge={
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {filteredPairs.length} Pairs
          </span>
        }
      />

      {/* Filter and Search Bar (matching User Directory) */}
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
          <SlidersHorizontal className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-stone-200 text-xs text-charcoal bg-white"
          >
            <option value="all">All Institutions</option>
            {uniqueColleges.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Compact Pairs Table (matching User Directory styling) */}
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
              ) : filteredPairs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-stone-400">
                    No matching accepted roommate pairs found.
                  </td>
                </tr>
              ) : (
                filteredPairs.map((pair) => (
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
                      <p className="font-medium text-charcoal truncate max-w-[190px]">{pair.sender.college}</p>
                      <p className="text-[11px] text-stone-400 truncate max-w-[190px]">with {pair.receiver.college}</p>
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
                        className="text-brand-600 hover:text-brand-700 h-7 px-2.5"
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

      {/* Details Modal */}
      {selectedPair && (
        <Modal
          isOpen={Boolean(selectedPair)}
          onClose={() => setSelectedPair(null)}
          title="Accepted Pair Details"
          description={`Connected roommate profile for ${selectedPair.sender.name} and ${selectedPair.receiver.name}`}
        >
          <div className="space-y-4 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="font-semibold text-emerald-900">Algorithmic Compatibility Score</span>
              <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-full text-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {selectedPair.compatibilityScore}% Match
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400">Student 1 (Sender)</span>
                <p className="font-bold text-sm text-charcoal">{selectedPair.sender.name}</p>
                <p className="text-stone-600">{selectedPair.sender.college}</p>
                <p className="text-stone-500">{selectedPair.sender.course || 'Degree not specified'}</p>
                <p className="text-stone-400">{selectedPair.sender.email}</p>
                {selectedPair.sender.phone && <p className="text-stone-400">Tel: {selectedPair.sender.phone}</p>}
              </div>

              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400">Student 2 (Partner)</span>
                <p className="font-bold text-sm text-charcoal">{selectedPair.receiver.name}</p>
                <p className="text-stone-600">{selectedPair.receiver.college}</p>
                <p className="text-stone-500">{selectedPair.receiver.course || 'Degree not specified'}</p>
                <p className="text-stone-400">{selectedPair.receiver.email}</p>
                {selectedPair.receiver.phone && <p className="text-stone-400">Tel: {selectedPair.receiver.phone}</p>}
              </div>
            </div>

            {selectedPair.message && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-stone-400">Invitation Note</span>
                <p className="italic text-stone-600">"{selectedPair.message}"</p>
              </div>
            )}

            {selectedPair.commonPreferences && selectedPair.commonPreferences.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-stone-400">Harmonious Habits</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPair.commonPreferences.slice(0, 4).map((p, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-100">
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-stone-100">
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

export default AdminAcceptedPairsPage;
