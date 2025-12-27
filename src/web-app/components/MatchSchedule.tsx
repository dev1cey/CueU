import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Match } from './LeagueDashboard';
import { Calendar, Clock, MapPin, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react-native';

interface MatchScheduleProps {
  matches: Match[];
  onChatWithOpponent: (match: Match) => void;
  onReportMatch: (match: Match) => void;
}

export function MatchSchedule({ matches, onChatWithOpponent, onReportMatch }: MatchScheduleProps) {
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const completedMatches = matches.filter(m => m.status === 'completed');
  const disputedMatches = matches.filter(m => m.status === 'disputed');

  const getStatusBadge = (status: Match['status']) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-500">Completed</Badge>;
      case 'disputed':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Disputed</Badge>;
      case 'incomplete':
        return <Badge variant="outline" className="border-red-500 text-red-500">Incomplete</Badge>;
    }
  };

  const renderMatch = (match: Match) => (
    <Card key={match.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3>vs {match.opponent}</h3>
              {getStatusBadge(match.status)}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(match.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{match.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{match.location}</span>
              </div>
            </div>
            {match.result && (
              <div className="mt-3 p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{match.result.yourScore}</div>
                    <div className="text-xs text-muted-foreground">You</div>
                  </div>
                  <div className="text-muted-foreground">-</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{match.result.opponentScore}</div>
                    <div className="text-xs text-muted-foreground">Opponent</div>
                  </div>
                  {match.result.winner && (
                    <div className="ml-auto">
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Winner
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChatWithOpponent(match)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            {match.status === 'upcoming' && (
              <Button
                size="sm"
                onClick={() => onReportMatch(match)}
              >
                Report Result
              </Button>
            )}
            {match.status === 'disputed' && (
              <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-500">
                <AlertCircle className="h-4 w-4 mr-2" />
                View Dispute
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Upcoming Matches */}
      <div>
        <h2 className="mb-4">Upcoming Matches</h2>
        {upcomingMatches.length > 0 ? (
          <div className="space-y-4">
            {upcomingMatches.map(renderMatch)}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No upcoming matches scheduled
            </CardContent>
          </Card>
        )}
      </div>

      {/* Disputed Matches */}
      {disputedMatches.length > 0 && (
        <div>
          <h2 className="mb-4">Disputed Results</h2>
          <div className="space-y-4">
            {disputedMatches.map(renderMatch)}
          </div>
        </div>
      )}

      {/* Completed Matches */}
      <div>
        <h2 className="mb-4">Match History</h2>
        {completedMatches.length > 0 ? (
          <div className="space-y-4">
            {completedMatches.map(renderMatch)}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No completed matches yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
