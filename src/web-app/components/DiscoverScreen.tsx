import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trophy, Calendar, Users, Target, Clock, MapPin } from 'lucide-react-native';

interface Competition {
  id: string;
  type: 'tournament' | 'league' | 'workshop';
  title: string;
  description: string;
  startDate: string;
  duration: string;
  location: string;
  participants: number;
  maxParticipants?: number;
  skillLevel: string;
  registrationDeadline: string;
}

export function DiscoverScreen() {
  const availableCompetitions: Competition[] = [
    {
      id: '1',
      type: 'tournament',
      title: 'Winter Championship 2025',
      description: 'Single elimination tournament open to all skill levels. Prizes for top 3 finishers!',
      startDate: '2025-12-26',
      duration: '1 day',
      location: 'IMA Recreation Center',
      participants: 24,
      maxParticipants: 32,
      skillLevel: 'All Levels',
      registrationDeadline: '2025-12-25'
    },
    {
      id: '2',
      type: 'league',
      title: 'Spring Pool League',
      description: 'Competitive league with weekly matches. Handicap system ensures fair play for all skill levels.',
      startDate: '2026-01-15',
      duration: '10 weeks',
      location: 'HUB Games Area',
      participants: 18,
      maxParticipants: 24,
      skillLevel: 'All Levels',
      registrationDeadline: '2026-01-10'
    },
    {
      id: '3',
      type: 'workshop',
      title: 'Advanced Shot-Making Clinic',
      description: 'Learn advanced techniques including jump shots, masse shots, and complex bank shots from expert players.',
      startDate: '2025-12-29',
      duration: '3 hours',
      location: 'IMA Recreation Center',
      participants: 8,
      maxParticipants: 12,
      skillLevel: 'Intermediate-Advanced',
      registrationDeadline: '2025-12-28'
    },
    {
      id: '4',
      type: 'tournament',
      title: 'Doubles Tournament',
      description: 'Team up with a partner for this exciting doubles competition. Sign up solo or with a teammate!',
      startDate: '2026-01-05',
      duration: '1 day',
      location: 'HUB Games Area',
      participants: 10,
      maxParticipants: 16,
      skillLevel: 'All Levels',
      registrationDeadline: '2026-01-03'
    },
    {
      id: '5',
      type: 'workshop',
      title: 'Beginner Basics Workshop',
      description: 'Perfect for new players! Learn fundamental stance, stroke, and aiming techniques.',
      startDate: '2025-12-30',
      duration: '2 hours',
      location: 'HUB Games Area',
      participants: 6,
      maxParticipants: 10,
      skillLevel: 'Beginner',
      registrationDeadline: '2025-12-29'
    }
  ];

  const getTypeIcon = (type: Competition['type']) => {
    switch (type) {
      case 'tournament':
        return <Trophy className="h-5 w-5" />;
      case 'league':
        return <Target className="h-5 w-5" />;
      case 'workshop':
        return <Users className="h-5 w-5" />;
    }
  };

  const getTypeBadgeColor = (type: Competition['type']) => {
    switch (type) {
      case 'tournament':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'league':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'workshop':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Discover</h2>
        <p className="text-muted-foreground">Find new competitions, leagues, and events to join</p>
      </div>

      {/* Competitions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {availableCompetitions.map((competition) => (
          <Card key={competition.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    {getTypeIcon(competition.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{competition.title}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className={getTypeBadgeColor(competition.type)}>
                        {competition.type}
                      </Badge>
                      <Badge variant="outline">{competition.skillLevel}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {competition.description}
              </p>

              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Starts {new Date(competition.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{competition.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{competition.location}</span>
                </div>
                {competition.maxParticipants && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{competition.participants}/{competition.maxParticipants} participants</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-3">
                  Registration closes {new Date(competition.registrationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <div className="flex gap-2">
                  <Button className="flex-1">Register</Button>
                  <Button variant="outline">Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
