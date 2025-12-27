import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { UserProfile } from './ProfileSetup';
import { User, Mail, Building2, Target, Calendar, Bell, Shield, LogOut, MapPin, Clock, Plus, X } from 'lucide-react-native';
import { toast } from 'sonner';

interface SettingsScreenProps {
  profile: UserProfile;
  onLogout: () => void;
}

interface TimeRange {
  start: string;
  end: string;
}

interface DayAvailability {
  day: string;
  enabled: boolean;
  timeRanges: TimeRange[];
}

export function SettingsScreen({ profile, onLogout }: SettingsScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  // Enhanced availability with custom time ranges
  const [dayAvailability, setDayAvailability] = useState<DayAvailability[]>([
    { day: 'Monday', enabled: profile.availability.includes('Monday'), timeRanges: [] },
    { day: 'Tuesday', enabled: profile.availability.includes('Tuesday'), timeRanges: [] },
    { day: 'Wednesday', enabled: profile.availability.includes('Wednesday'), timeRanges: [{ start: '14:00', end: '18:00' }] },
    { day: 'Thursday', enabled: profile.availability.includes('Thursday'), timeRanges: [] },
    { day: 'Friday', enabled: profile.availability.includes('Friday'), timeRanges: [{ start: '17:00', end: '21:00' }] },
    { day: 'Saturday', enabled: profile.availability.includes('Saturday'), timeRanges: [{ start: '10:00', end: '22:00' }] },
    { day: 'Sunday', enabled: profile.availability.includes('Sunday'), timeRanges: [{ start: '12:00', end: '20:00' }] },
  ]);

  // Track input values for each day
  const [timeInputs, setTimeInputs] = useState<{ [key: string]: { start: string; end: string } }>({});

  // Preferred locations with custom input
  const [preferredLocations, setPreferredLocations] = useState<string[]>([
    'HUB Games Area',
    'IMA Recreation Center'
  ]);
  const [newLocation, setNewLocation] = useState('');

  const toggleDay = (index: number) => {
    const updated = [...dayAvailability];
    updated[index].enabled = !updated[index].enabled;
    setDayAvailability(updated);
  };

  const addTimeRange = (dayIndex: number) => {
    const day = dayAvailability[dayIndex].day;
    const inputs = timeInputs[day];
    
    if (!inputs?.start || !inputs?.end) {
      toast.error('Please enter both start and end times');
      return;
    }

    // Convert to comparable format for validation
    const startTime = inputs.start;
    const endTime = inputs.end;

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    const updated = [...dayAvailability];
    updated[dayIndex].timeRanges.push({ start: startTime, end: endTime });
    setDayAvailability(updated);

    // Clear inputs for this day
    setTimeInputs({
      ...timeInputs,
      [day]: { start: '', end: '' }
    });

    toast.success('Time range added');
  };

  const removeTimeRange = (dayIndex: number, rangeIndex: number) => {
    const updated = [...dayAvailability];
    updated[dayIndex].timeRanges.splice(rangeIndex, 1);
    setDayAvailability(updated);
    toast.success('Time range removed');
  };

  const updateTimeInput = (day: string, field: 'start' | 'end', value: string) => {
    setTimeInputs({
      ...timeInputs,
      [day]: {
        ...timeInputs[day],
        [field]: value
      }
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const addLocation = () => {
    if (newLocation.trim() && !preferredLocations.includes(newLocation.trim())) {
      setPreferredLocations([...preferredLocations, newLocation.trim()]);
      setNewLocation('');
      toast.success('Location added');
    } else if (preferredLocations.includes(newLocation.trim())) {
      toast.error('Location already added');
    }
  };

  const removeLocation = (location: string) => {
    setPreferredLocations(preferredLocations.filter(loc => loc !== location));
    toast.success('Location removed');
  };

  const handleSaveProfile = () => {
    toast.success('Profile settings saved successfully');
  };

  const handleSavePreferences = () => {
    toast.success('Preferences saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Settings</h2>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your personal details and club information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">{profile.name.charAt(0)}</span>
            </div>
            <div>
              <h3>{profile.name}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input id="name" defaultValue={profile.name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input id="email" defaultValue={profile.email} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Department
              </Label>
              <Input id="department" defaultValue={profile.department} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillLevel" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Skill Level
              </Label>
              <Input id="skillLevel" defaultValue={profile.skillLevel} disabled />
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleSaveProfile}>Save Profile Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Availability & Time Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability & Time Preferences
          </CardTitle>
          <CardDescription>Set your availability and specific time ranges for each day</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dayAvailability.map((dayPref, dayIndex) => (
            <div 
              key={dayPref.day}
              className={`p-4 rounded-lg border transition-colors ${
                dayPref.enabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-muted'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Badge 
                  variant={dayPref.enabled ? 'default' : 'outline'}
                  className="cursor-pointer min-w-[90px] justify-center"
                  onClick={() => toggleDay(dayIndex)}
                >
                  {dayPref.day}
                </Badge>
              </div>

              {dayPref.enabled && (
                <div className="space-y-3 mt-3">
                  {/* Display existing time ranges */}
                  {dayPref.timeRanges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {dayPref.timeRanges.map((range, rangeIndex) => (
                        <Badge
                          key={rangeIndex}
                          variant="secondary"
                          className="flex items-center gap-2 pr-1 bg-primary/10 text-primary border-primary/20"
                        >
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(range.start)} - {formatTime(range.end)}</span>
                          <button
                            onClick={() => removeTimeRange(dayIndex, rangeIndex)}
                            className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add time range inputs */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-muted">
                    <div className="flex-1">
                      <Label htmlFor={`${dayPref.day}-start`} className="text-xs text-muted-foreground">
                        Start Time
                      </Label>
                      <Input
                        id={`${dayPref.day}-start`}
                        type="time"
                        value={timeInputs[dayPref.day]?.start || ''}
                        onChange={(e) => updateTimeInput(dayPref.day, 'start', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`${dayPref.day}-end`} className="text-xs text-muted-foreground">
                        End Time
                      </Label>
                      <Input
                        id={`${dayPref.day}-end`}
                        type="time"
                        value={timeInputs[dayPref.day]?.end || ''}
                        onChange={(e) => updateTimeInput(dayPref.day, 'end', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => addTimeRange(dayIndex)}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="pt-2">
            <p className="text-xs text-muted-foreground">
              💡 Tip: You can add multiple time ranges for each day (e.g., 1 PM - 3 PM and 5 PM - 9 PM)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferred Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Preferred Locations
          </CardTitle>
          <CardDescription>Add your preferred places to play pool</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Location Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter location (e.g., HUB Games Area)"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addLocation();
                }
              }}
            />
            <Button onClick={addLocation} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Display Locations */}
          <div className="space-y-2">
            {preferredLocations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No preferred locations added yet</p>
              </div>
            ) : (
              preferredLocations.map((location, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-primary/5 border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{location}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLocation(location)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="pt-2">
            <Button onClick={handleSavePreferences}>Save Location Preferences</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about match schedules and messages
                </p>
              </div>
            </div>
            <Button
              variant={notificationsEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              {notificationsEnabled ? 'On' : 'Off'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Email Updates</p>
                <p className="text-sm text-muted-foreground">
                  Receive weekly summaries and event announcements
                </p>
              </div>
            </div>
            <Button
              variant={emailUpdates ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEmailUpdates(!emailUpdates)}
            >
              {emailUpdates ? 'On' : 'Off'}
            </Button>
          </div>

          <div className="pt-4">
            <Button onClick={handleSavePreferences}>Save Notification Preferences</Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Security</CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Connected Account</p>
              <p className="text-sm text-muted-foreground">
                Your account is secured via UW SSO authentication
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full sm:w-auto text-muted-foreground">
              Privacy Policy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <LogOut className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-semibold">Sign Out</p>
                <p className="text-sm text-muted-foreground">
                  Sign out of your CueU account
                </p>
              </div>
            </div>
            <Button variant="destructive" onClick={onLogout}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
