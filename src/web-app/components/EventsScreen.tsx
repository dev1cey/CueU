import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Clock, MapPin, User, Trophy, MessageSquare } from 'lucide-react-native';

interface Event {
  id: string;
  type: 'match' | 'tournament' | 'meeting';
  title: string;
  opponent?: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'pending' | 'completed';
}

export function EventsScreen() {
  // Mock data for user's events
  const myEvents: Event[] = [
    {
      id: '1',
      type: 'match',
      title: 'League Match',
      opponent: 'Sarah Chen',
      date: '2025-12-23',
      time: '6:00 PM',
      location: 'HUB Games Area',
      status: 'upcoming'
    },
    {
      id: '2',
      type: 'tournament',
      title: 'Winter Championship',
      date: '2025-12-26',
      time: '2:00 PM',
      location: 'IMA Recreation Center',
      status: 'upcoming'
    },
    {
      id: '3',
      type: 'match',
      title: 'League Match',
      opponent: 'Michael Torres',
      date: '2025-12-28',
      time: '7:30 PM',
      location: 'HUB Games Area',
      status: 'pending'
    },
    {
      id: '4',
      type: 'meeting',
      title: 'Technique Workshop',
      date: '2025-12-27',
      time: '6:00 PM',
      location: 'IMA Recreation Center',
      status: 'upcoming'
    }
  ];

  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'match':
        return <User className="h-5 w-5" />;
      case 'tournament':
        return <Trophy className="h-5 w-5" />;
      case 'meeting':
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Welcome to CueU</h2>
        <p className="text-muted-foreground">Your upcoming matches, tournaments, and meetings</p>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {myEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No upcoming events</p>
              <Button variant="outline">Browse Events</Button>
            </CardContent>
          </Card>
        ) : (
          myEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    {getEventIcon(event.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h4 className="font-semibold">{event.title}</h4>
                        {event.opponent && (
                          <p className="text-sm text-muted-foreground">vs {event.opponent}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {event.type === 'match' && (
                        <>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                          <Button size="sm" variant="outline">View Details</Button>
                        </>
                      )}
                      {event.type === 'tournament' && (
                        <Button size="sm" variant="outline">View Bracket</Button>
                      )}
                      {event.type === 'meeting' && (
                        <Button size="sm" variant="outline">View Details</Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}