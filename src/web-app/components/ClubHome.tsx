import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { UserProfile } from './ProfileSetup';
import { Calendar, MapPin, Users, Clock } from 'lucide-react-native';

interface ClubHomeProps {
  profile: UserProfile;
}

interface ClubMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: number;
}

export function ClubHome({ profile }: ClubHomeProps) {
  // Mock data for club meetings
  const upcomingMeetings: ClubMeeting[] = [
    {
      id: '1',
      title: 'Weekly Pool Night',
      date: '2025-12-24',
      time: '7:00 PM - 10:00 PM',
      location: 'HUB Games Area',
      description: 'Casual pool night open to all skill levels. Come practice and meet other members!',
      attendees: 15
    },
    {
      id: '2',
      title: 'Technique Workshop',
      date: '2025-12-27',
      time: '6:00 PM - 8:00 PM',
      location: 'IMA Recreation Center',
      description: 'Learn advanced techniques from experienced players. Focus on bank shots and spin control.',
      attendees: 8
    },
    {
      id: '3',
      title: 'New Year Tournament Prep',
      date: '2025-12-30',
      time: '5:00 PM - 9:00 PM',
      location: 'HUB Games Area',
      description: 'Practice session for the upcoming New Year tournament. All participants welcome!',
      attendees: 12
    }
  ];

  return (
    <div className="space-y-6">
      {/* Profile Overview Card */}
      <Card className="bg-gradient-to-r from-primary to-accent border-accent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">{profile.name.charAt(0)}</span>
                </div>
              </div>
              <div>
                <h2 className="text-white">{profile.name}</h2>
                <p className="text-accent text-sm">{profile.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="bg-white/90">
                    {profile.skillLevel}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/90">
                    Club Member
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Join us at our next club meetings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingMeetings.map((meeting) => (
            <div key={meeting.id} className="border-l-4 border-l-primary pl-4 py-3 hover:bg-accent/5 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{meeting.title}</h4>
                    <Badge variant="outline" className="ml-2">
                      {meeting.attendees} attending
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{meeting.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{meeting.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{meeting.location}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="flex-shrink-0">
                  RSVP
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Club Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About UW Pool Club</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Join us for casual games, skill-building workshops, and competitive tournaments. 
            Whether you're a beginner or an experienced player, there's a place for you in our community.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="text-center p-3 rounded-lg bg-accent/5">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="font-semibold">50+ Members</div>
              <div className="text-xs text-muted-foreground">Active community</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-accent/5">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="font-semibold">Weekly Events</div>
              <div className="text-xs text-muted-foreground">Regular meetups</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-accent/5">
              <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="font-semibold">HUB & IMA</div>
              <div className="text-xs text-muted-foreground">Multiple locations</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}