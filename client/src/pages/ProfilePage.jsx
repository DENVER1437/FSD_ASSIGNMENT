import { useState } from 'react';
import {
  User,
  Building,
  MapPin,
  BookOpen,
  DollarSign,
  Moon,
  Sparkles,
  Utensils,
  Volume2,
  Users,
  Edit2,
  Check,
  X,
  Camera,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import Avatar from '../components/Avatar';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useMatch } from '../context/MatchContext';
import { useToast } from '../context/ToastContext';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { preferences, setPreferences } = useMatch();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);

  // Form local state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: user?.college || '',
    course: user?.course || '',
    city: user?.city || '',
    age: user?.age || 21,
    bio: user?.bio || '',
    // Preferences
    budget: preferences?.budget || '5000-8000',
    sleepSchedule: preferences?.sleepSchedule || 'night_owl',
    wakeUpSchedule: preferences?.wakeUpSchedule || 'after_9am',
    cleanliness: preferences?.cleanliness || 'meticulous',
    foodPreference: preferences?.foodPreference || 'vegetarian',
    noisePreference: preferences?.noisePreference || 'silent',
    studyHabit: preferences?.studyHabit || 'in_room_quiet',
    socialLevel: preferences?.socialLevel || 'ambivert',
    smokingPreference: preferences?.smokingPreference || 'strictly_non_smoker',
    guestPreference: preferences?.guestPreference || 'occasional_guests',
    preferredLocation: preferences?.preferredLocation || 'Downtown / University District',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    // Update user in AuthContext
    updateUser({
      name: formData.name,
      college: formData.college,
      course: formData.course,
      city: formData.city,
      age: Number(formData.age),
      bio: formData.bio,
    });

    // Update preferences in MatchContext
    setPreferences((prev) => ({
      ...prev,
      budget: formData.budget,
      sleepSchedule: formData.sleepSchedule,
      wakeUpSchedule: formData.wakeUpSchedule,
      cleanliness: formData.cleanliness,
      foodPreference: formData.foodPreference,
      noisePreference: formData.noisePreference,
      studyHabit: formData.studyHabit,
      socialLevel: formData.socialLevel,
      smokingPreference: formData.smokingPreference,
      guestPreference: formData.guestPreference,
      preferredLocation: formData.preferredLocation,
    }));

    setIsEditing(false);
    showToast('Profile and preferences updated successfully!', 'success');
  };

  const handleCancel = () => {
    // Reset back to saved values
    setFormData({
      name: user?.name || '',
      college: user?.college || '',
      course: user?.course || '',
      city: user?.city || '',
      age: user?.age || 21,
      bio: user?.bio || '',
      budget: preferences?.budget || '5000-8000',
      sleepSchedule: preferences?.sleepSchedule || 'night_owl',
      wakeUpSchedule: preferences?.wakeUpSchedule || 'after_9am',
      cleanliness: preferences?.cleanliness || 'meticulous',
      foodPreference: preferences?.foodPreference || 'vegetarian',
      noisePreference: preferences?.noisePreference || 'silent',
      studyHabit: preferences?.studyHabit || 'in_room_quiet',
      socialLevel: preferences?.socialLevel || 'ambivert',
      smokingPreference: preferences?.smokingPreference || 'strictly_non_smoker',
      guestPreference: preferences?.guestPreference || 'occasional_guests',
      preferredLocation: preferences?.preferredLocation || 'Downtown / University District',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Student Profile"
        subtitle="Manage your campus information and domestic lifestyle preferences."
        action={
          !isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              icon={Edit2}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                icon={X}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                icon={Check}
              >
                Save Changes
              </Button>
            </div>
          )
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card Header */}
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar
                src={user?.profileImage}
                name={user?.name || 'Student'}
                size="2xl"
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={() => showToast('Avatar upload simulated.', 'info')}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-brand-600 text-white shadow-md hover:bg-brand-700 transition"
                  title="Change avatar"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal">
                  {user?.name}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verified Student
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{user?.college}</span>
                <span>•</span>
                <span>{user?.course}</span>
                <span>•</span>
                <span>{user?.city}</span>
              </p>
              <p className="text-xs text-stone-600 max-w-xl pt-1 italic">
                "{user?.bio}"
              </p>
            </div>
          </div>
        </Card>

        {/* Section 1: Academic & Personal Details */}
        <Card className="p-6 sm:p-8 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal pb-3 border-b border-stone-100 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            Academic & Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
            <Input
              label="Age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              disabled={!isEditing}
            />
            <Input
              label="College / University"
              name="college"
              icon={Building}
              value={formData.college}
              onChange={handleChange}
              disabled={!isEditing}
            />
            <Input
              label="Course & Degree"
              name="course"
              icon={BookOpen}
              value={formData.course}
              onChange={handleChange}
              disabled={!isEditing}
            />
            <Input
              label="City"
              name="city"
              icon={MapPin}
              value={formData.city}
              onChange={handleChange}
              disabled={!isEditing}
            />
            <Input
              label="Preferred Neighborhood / Locality"
              name="preferredLocation"
              value={formData.preferredLocation}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <Textarea
            label="Short Bio & Roommate Intro"
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            disabled={!isEditing}
            helperText="Tell prospective roommates about your typical day, hobbies, and communication style."
          />
        </Card>

        {/* Section 2: Lifestyle Habits & Preferences */}
        <Card className="p-6 sm:p-8 space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal pb-3 border-b border-stone-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            Domestic Lifestyle & Roommate Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Monthly Rent Budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              disabled={!isEditing}
              options={[
                { label: 'Under $5,000 / mo', value: '<5000' },
                { label: '$5,000 – $8,000 / mo', value: '5000-8000' },
                { label: '$8,000 – $12,000 / mo', value: '8000-12000' },
                { label: '$12,000+ / mo', value: '12000+' },
              ]}
            />

            <Select
              label="Sleep Schedule"
              name="sleepSchedule"
              value={formData.sleepSchedule}
              onChange={handleChange}
              disabled={!isEditing}
              options={[
                { label: 'Night Owl (Past midnight)', value: 'night_owl' },
                { label: 'Early Bird (Before 11 PM)', value: 'early_bird' },
                { label: 'Flexible / Variable', value: 'flexible' },
              ]}
            />

            <Select
              label="Wake-Up Time"
              name="wakeUpSchedule"
              value={formData.wakeUpSchedule}
              onChange={handleChange}
              disabled={!isEditing}
              options={[
                { label: 'Before 7:00 AM', value: 'before_7am' },
                { label: '7:00 AM – 9:00 AM', value: '7am_9am' },
                { label: 'After 9:00 AM', value: 'after_9am' },
              ]}
            />

            <Select
              label="Cleanliness Standard"
              name="cleanliness"
              value={formData.cleanliness}
              onChange={handleChange}
              disabled={!isEditing}
              options={[
                { label: 'Meticulous (Daily tidy, chore schedule)', value: 'meticulous' },
                { label: 'Moderate (Tidy on weekends)', value: 'moderate' },
                { label: 'Relaxed (Casual approach)', value: 'relaxed' },
              ]}
            />

            <Select
              label="Dietary / Cooking Style"
              name="foodPreference"
              value={formData.foodPreference}
              onChange={handleChange}
              disabled={!isEditing}
              options={[
                { label: 'Vegetarian Only', value: 'vegetarian' },
                { label: 'Eggetarian', value: 'eggetarian' },
                { label: 'Non-Vegetarian', value: 'non_vegetarian' },
                { label: 'Vegan', value: 'vegan' },
              ]}
            />

            <Select
              label="Room Noise Preference"
              name="noisePreference"
              value={formData.noisePreference}
              onChange={handleChange}
              disabled={!isEditing}
              options={[
                { label: 'Silent study environment', value: 'silent' },
                { label: 'Moderate ambient sounds / TV', value: 'moderate' },
                { label: 'Tolerant of music and chatter', value: 'tolerant' },
              ]}
            />

            <Select
              label="Social Extroversion"
              name="socialLevel"
              value={formData.socialLevel}
              onChange={handleChange}
              disabled={!isEditing}
              options={[
                { label: 'Introvert (Recharges in quiet)', value: 'introvert' },
                { label: 'Ambivert (Balanced)', value: 'ambivert' },
                { label: 'Extrovert (Loves group hangs)', value: 'extrovert' },
              ]}
            />

            <Select
              label="Smoking Preference"
              name="smokingPreference"
              value={formData.smokingPreference}
              onChange={handleChange}
              disabled={!isEditing}
              options={[
                { label: 'Strictly Non-Smoking Home', value: 'strictly_non_smoker' },
                { label: 'Balcony / Outside only', value: 'outside_only' },
                { label: 'Tolerant', value: 'tolerant' },
              ]}
            />

            <Select
              label="Guest & Visitor Policy"
              name="guestPreference"
              value={formData.guestPreference}
              onChange={handleChange}
              disabled={!isEditing}
              options={[
                { label: 'Occasional guests with heads-up', value: 'occasional_guests' },
                { label: 'No overnight visitors', value: 'no_overnight_guests' },
                { label: 'Frequent friends & open-house', value: 'open_house' },
              ]}
            />
          </div>
        </Card>

        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

export default ProfilePage;
