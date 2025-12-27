import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, MapPin, Trophy, Users, ChevronRight, Bell, Award } from 'lucide-react-native';

interface ClubEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
}

interface QuickStat {
  label: string;
  value: string;
  subtext?: string;
}

export function HomeScreen() {
  // Mock Club Events
  const events: ClubEvent[] = [
    {
      id: '1',
      title: 'Holiday Party',
      date: 'Dec 24',
      time: '6:00 pm',
      location: 'HUB Games Area',
      organizer: 'UW Pool Club'
    },
    {
      id: '2',
      title: 'Beginner Workshop',
      date: 'Dec 26',
      time: '2:00 pm',
      location: 'IMA Recreation Center',
      organizer: 'UW Pool Club'
    },
    {
      id: '3',
      title: 'Winter Tournament',
      date: 'Dec 28',
      time: '10:00 am',
      location: 'HUB Games Area',
      organizer: 'UW Pool Club'
    }
  ];

  // Mock Quick Stats
  const quickStats: QuickStat[] = [
    { label: 'Skill Level', value: '5', subtext: 'Intermediate' },
    { label: 'Win Rate', value: '67%', subtext: '8-4 record' },
    { label: 'Rank', value: '#7', subtext: 'of 45 players' },
    { label: 'Matches', value: '12', subtext: 'this season' }
  ];

  // Mock Top Rankings (simplified)
  const topRankings = [
    { rank: 1, name: 'Friday Mufasa', wins: 13, losses: 1 },
    { rank: 2, name: 'Oxygen', wins: 14, losses: 2 },
    { rank: 3, name: 'Fluke Twofer', wins: 12, losses: 4 }
  ];

  return (
    <div className="space-y-4">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Dashboard</h2>
          <p className="text-sm text-muted-foreground">Welcome back!</p>
        </div>
        <Button variant="ghost" size="sm">
          <Bell className="h-5 w-5" />
        </Button>
      </div>

      {/* Upcoming Matches Notice - NOW AT TOP */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-center">
          <Calendar className="h-12 w-12 text-primary mx-auto mb-3" />
          <h4 className="font-semibold mb-1">No Upcoming Matches</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Your next league match will be scheduled soon
          </p>
          <Button variant="outline" size="sm">
            View League Schedule
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">YOUR STATS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickStats.map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border"
              >
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs font-semibold text-foreground uppercase tracking-wide mb-0.5">
                  {stat.label}
                </div>
                {stat.subtext && (
                  <div className="text-xs text-muted-foreground">{stat.subtext}</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rankings Preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">TOP RANKINGS</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <CardDescription>Fall 2025 Leaders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topRankings.map((player) => (
              <div
                key={player.rank}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  {player.rank === 1 && '🥇'}
                  {player.rank === 2 && '🥈'}
                  {player.rank === 3 && '🥉'}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{player.name}</div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-green-600 font-semibold">{player.wins}</span>
                    <span className="mx-1">-</span>
                    <span className="text-red-600 font-semibold">{player.losses}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Events Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">EVENTS</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              See All Events
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{event.date}, {event.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                  <div className="text-xs text-muted-foreground/70">{event.organizer}</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
