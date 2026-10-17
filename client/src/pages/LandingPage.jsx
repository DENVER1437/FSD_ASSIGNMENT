import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Compass,
  Sliders,
  MessageCircle,
  HelpCircle,
  HeartHandshake,
  Check,
} from 'lucide-react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ScoreBadge from '../components/ScoreBadge';
import Avatar from '../components/Avatar';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-warm flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines & Call to Action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-800 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Smart Roommate Compatibility Engine</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-charcoal leading-[1.15]">
                Find a roommate who fits{' '}
                <span className="text-brand-600 underline decoration-brand-200 decoration-wavy decoration-2">
                  your life.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Stop gambling with random college room allocations. NestMatch pairs university students based on sleep rhythms, cleanliness, budget parity, and study habits—with complete, explainable compatibility scores.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto shadow-md"
                >
                  <span>Find Your Match</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto"
                >
                  How It Works
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-stone-200/70 grid grid-cols-3 gap-4 text-center lg:text-left max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-xl font-extrabold text-charcoal">10+</div>
                  <div className="text-xs text-stone-500 font-medium">Lifestyle Factors</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-brand-600">Weighted</div>
                  <div className="text-xs text-stone-500 font-medium">Matching Engine</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-charcoal">100%</div>
                  <div className="text-xs text-stone-500 font-medium">Explainable Scores</div>
                </div>
              </div>
            </div>

            {/* Right Column: Illustrative Compatibility Card Composition */}
            <div className="lg:col-span-5 relative">
              {/* Main Sample Match Card */}
              <Card className="relative z-10 p-6 shadow-card hover:shadow-cardHover border-stone-200/90 max-w-md mx-auto">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400"
                      name="Jordan Lee"
                      size="lg"
                    />
                    <div>
                      <h3 className="font-bold text-base text-charcoal">Jordan Lee, 21</h3>
                      <p className="text-xs text-stone-500">Apex Institute • Data Science</p>
                    </div>
                  </div>
                  <ScoreBadge score={94} size="sm" />
                </div>

                {/* Compatibility Breakdown Highlights */}
                <div className="space-y-2.5 bg-stone-50 rounded-xl p-3.5 border border-stone-200/60 mb-5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Why You Match (94% Compatibility)
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>Sleep: Both sleep past midnight (Night Owl)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>Budget: Exact parity ($5,000–$8,000 bracket)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-700">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>Living: Daily chores & vegetarian kitchen</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => navigate('/login')}
                    className="flex-1 justify-center"
                    size="sm"
                  >
                    Send Roommate Request
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/login')}
                    size="sm"
                  >
                    View Breakdown
                  </Button>
                </div>
              </Card>

              {/* Decorative floating preview badge */}
              <div className="hidden sm:block absolute -bottom-5 -left-4 z-20 bg-white border border-stone-200 rounded-xl p-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-charcoal">Mutual Acceptance</p>
                    <p className="text-[10px] text-stone-500">Direct messaging unlocks upon mutual consent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Simple 3-Step Process
            </h2>
            <h3 className="text-3xl font-extrabold text-charcoal tracking-tight">
              How NestMatch Finds Your Roommate
            </h3>
            <p className="text-stone-500 text-sm mt-2">
              A structured workflow built specifically for students moving to campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/70 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-lg flex items-center justify-center mb-5 shadow-sm">
                1
              </div>
              <h4 className="font-bold text-lg text-charcoal mb-2">Create Your Profile</h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Register with your university credentials, department, and campus location. Establish your verified student identity.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/70 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-lg flex items-center justify-center mb-5 shadow-sm">
                2
              </div>
              <h4 className="font-bold text-lg text-charcoal mb-2">Share Your Lifestyle</h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Take our 15-question survey covering sleep, study atmosphere, budget limits, cleanliness standards, and guest policies.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/70 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-lg flex items-center justify-center mb-5 shadow-sm">
                3
              </div>
              <h4 className="font-bold text-lg text-charcoal mb-2">Discover Compatible Roommates</h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Inspect calculated match breakdowns. Send connection requests and connect through secure messaging when accepted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 md:py-24 bg-surface-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Engineered For Student Life
            </h2>
            <h3 className="text-3xl font-extrabold text-charcoal tracking-tight">
              Everything You Need For Conflict-Free Living
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-charcoal">Lifestyle-Based Matching</h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Sleep schedules, noise tolerance, and cleaning routines are prioritized over vague personal descriptions.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-charcoal">Explainable Scores</h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                No opaque black-box recommendations. See exactly where your habits align and what slight differences to discuss.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-charcoal">Budget & Locality Parity</h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Filter by realistic rent brackets and transit corridors so financial discussions are settled upfront.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-charcoal">Mutual Roommate Requests</h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                No unwanted unsolicited messaging. Chat unlocks only when both students accept a roommate request.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-charcoal">Verified Academic Focus</h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Tailored for college campuses to connect verified classmates, campus peers, and department colleagues.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-charcoal">Responsible Moderation</h4>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Dedicated incident reporting tools and administrative review oversight for community safety.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Compatibility Preview Section */}
      <section id="preview" className="py-16 md:py-24 bg-white border-t border-stone-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              Explainable Intelligence
            </h2>
            <h3 className="text-3xl font-extrabold text-charcoal tracking-tight">
              Side-By-Side Trait Breakdown
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-2">
              Sample demonstration of how NestMatch compares two student profiles.
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-stone-50/50 border-stone-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
              <div className="flex items-center gap-4">
                <Avatar
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
                  name="You (Meet)"
                  size="md"
                />
                <span className="text-xs font-bold text-stone-400">vs</span>
                <Avatar
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400"
                  name="Jordan Lee"
                  size="md"
                />
                <div>
                  <h4 className="font-bold text-sm text-charcoal">You and Jordan Lee</h4>
                  <p className="text-xs text-stone-500">Apex Institute of Technology</p>
                </div>
              </div>
              <ScoreBadge score={94} size="lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Shared Preferences
                </h5>
                <ul className="space-y-2 text-xs text-stone-700">
                  <li className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/60 flex items-center justify-between">
                    <span>Bedtime Rhythm</span>
                    <span className="font-semibold text-emerald-900">Both Night Owls (12 AM+)</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/60 flex items-center justify-between">
                    <span>Monthly Rent Target</span>
                    <span className="font-semibold text-emerald-900">$5,000–$8,000</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/60 flex items-center justify-between">
                    <span>Cleanliness Level</span>
                    <span className="font-semibold text-emerald-900">Meticulous / Daily</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  Points Worth Discussing
                </h5>
                <ul className="space-y-2 text-xs text-stone-700">
                  <li className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/60 flex items-center justify-between">
                    <span>Daytime Noise Tolerance</span>
                    <span className="font-semibold text-amber-900">Moderate vs Silent</span>
                  </li>
                  <li className="p-2.5 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-between">
                    <span>Weekend Routine</span>
                    <span className="font-semibold text-stone-800">Gaming vs Coding</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-brand-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to find your ideal college roommate?
          </h2>
          <p className="text-brand-100 text-sm sm:text-base max-w-xl mx-auto">
            Join students from your campus, take the lifestyle compatibility survey, and connect with respectful roommates.
          </p>
          <div className="pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-brand-900 hover:bg-brand-50 shadow-lg"
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
