import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Trophy, 
  Calendar, 
  Target, 
  ExternalLink, 
  TrendingUp, 
  MessageSquare, 
  Check, 
  X,
  Award,
  Users,
  ChevronRight
} from 'lucide-react-native';

interface LeagueScreenProps {
  isEnrolled?: boolean;
}

interface Match {
  id: string;
  opponent: string;
  opponentSkill: number;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'pending_result' | 'completed';
  result?: 'win' | 'loss';
  myScore?: number;
  opponentScore?: number;
}

interface PlayerStanding {
  rank: number;
  name: string;
  skillLevel: number;
  wins: number;
  losses: number;
  points: number;
}

export function LeagueScreen({ isEnrolled = false }: LeagueScreenProps) {
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const [showReportForm, setShowReportForm] = useState<string | null>(null);
  const [myScore, setMyScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');

  // Mock player data
  const mySkillLevel = 5;
  const myStats = {
    wins: 8,
    losses: 4,
    rank: 7,
    points: 136
  };

  // Mock matches data
  const upcomingMatches: Match[] = [
    {
      id: '1',
      opponent: 'Sarah Chen',
      opponentSkill: 6,
      date: '2025-12-26',
      time: '6:00 PM',
      location: 'HUB Games Area',
      status: 'upcoming'
    },
    {
      id: '2',
      opponent: 'Michael Torres',
      opponentSkill: 4,
      date: '2025-12-28',
      time: '7:30 PM',
      location: 'IMA Recreation Center',
      status: 'pending_result'
    }
  ];

  // Mock standings data (similar to APA format)
  const standings: PlayerStanding[] = [
    { rank: 1, name: 'Friday Mufasa', skillLevel: 7, wins: 13, losses: 1, points: 190 },
    { rank: 2, name: 'Oxygen', skillLevel: 6, wins: 14, losses: 2, points: 175 },
    { rank: 3, name: 'Fluke Twofer', skillLevel: 7, wins: 12, losses: 4, points: 168 },
    { rank: 4, name: 'Help Wanted', skillLevel: 5, wins: 9, losses: 4, points: 148 },
    { rank: 5, name: 'Jennifer Park', skillLevel: 6, wins: 10, losses: 5, points: 145 },
    { rank: 6, name: 'David Kim', skillLevel: 4, wins: 10, losses: 6, points: 140 },
    { rank: 7, name: 'You', skillLevel: mySkillLevel, wins: myStats.wins, losses: myStats.losses, points: myStats.points },
    { rank: 8, name: 'Alex Johnson', skillLevel: 5, wins: 8, losses: 7, points: 132 },
    { rank: 9, name: 'Sarah Chen', skillLevel: 6, wins: 7, losses: 8, points: 128 },
    { rank: 10, name: 'Michael Torres', skillLevel: 4, wins: 6, losses: 9, points: 118 }
  ];

  const handleSignup = () => {
    // In production, this will open a Google Form
    window.open('https://forms.google.com', '_blank');
  };

  const handleBypass = () => {
    setEnrolled(true);
  };

  const handleReportResult = (matchId: string) => {
    setShowReportForm(matchId);
  };

  const submitResult = (matchId: string) => {
    // In production, this would submit to backend
    console.log(`Reporting match ${matchId}: You ${myScore} - ${opponentScore} Opponent`);
    setShowReportForm(null);
    setMyScore('');
    setOpponentScore('');
  };

  // Not enrolled view
  if (!enrolled) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2>UW Pool League</h2>
          <p className="text-muted-foreground">Join our competitive pool league</p>
        </div>

        {/* Bypass Button for Testing */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm mb-1">🔧 Testing Mode</p>
                <p className="text-xs text-muted-foreground">
                  Skip signup to preview enrolled experience
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleBypass}>
                Bypass Signup
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hero Card */}
        <Card className="bg-gradient-to-r from-primary to-accent border-accent">
          <CardContent className="pt-6 text-center">
            <Trophy className="h-16 w-16 text-white mx-auto mb-4" />
            <h3 className="text-white mb-2">Join the Competition</h3>
            <p className="text-accent mb-4">
              Compete against other players, track your progress, and climb the rankings!
            </p>
            <Button size="lg" onClick={handleSignup} className="bg-white text-primary hover:bg-white/90">
              <ExternalLink className="mr-2 h-5 w-5" />
              Sign Up for League
            </Button>
            <p className="text-accent text-xs mt-3">
              Registration via Google Form
            </p>
          </CardContent>
        </Card>

        {/* League Features */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Everything you need to know about the league</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Weekly Matches</h4>
                  <p className="text-sm text-muted-foreground">
                    Get matched with opponents each week. Schedule matches at your convenience.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Skill Levels (1-7)</h4>
                  <p className="text-sm text-muted-foreground">
                    APA-style skill system ensures fair competition between all players.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Rankings & Stats</h4>
                  <p className="text-sm text-muted-foreground">
                    Track your wins, losses, and see how you stack up against other players.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">In-App Chat</h4>
                  <p className="text-sm text-muted-foreground">
                    Coordinate match times and locations directly with your opponents.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
            <CardDescription>What you need to participate</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">✓</Badge>
                <span className="text-sm">Active UW Pool Club membership</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">✓</Badge>
                <span className="text-sm">Commit to playing at least one match per week</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">✓</Badge>
                <span className="text-sm">Report match results within 24 hours</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Enrolled view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>League Dashboard</h2>
        <p className="text-muted-foreground">Winter 2025 Season</p>
      </div>

      {/* Player Stats Card */}
      <Card className="bg-gradient-to-r from-primary to-accent border-accent">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
              <Trophy className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-white mb-1">Your Stats</h3>
              <p className="text-accent text-sm">Active League Member</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur">
              <div className="text-2xl font-bold text-white">{mySkillLevel}</div>
              <div className="text-xs text-accent">Skill Level</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur">
              <div className="text-2xl font-bold text-white">#{myStats.rank}</div>
              <div className="text-xs text-accent">Rank</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur">
              <div className="text-2xl font-bold text-white">{myStats.wins}</div>
              <div className="text-xs text-accent">Wins</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/10 backdrop-blur">
              <div className="text-2xl font-bold text-white">{myStats.losses}</div>
              <div className="text-xs text-accent">Losses</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Matches */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Matches</CardTitle>
          <CardDescription>Your scheduled matches this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingMatches.map((match) => (
              <div 
                key={match.id} 
                className="p-4 border rounded-lg hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">vs {match.opponent}</h4>
                      <Badge variant="outline" className="text-xs">
                        SL {match.opponentSkill}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(match.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })} • {match.time}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {match.location}
                    </div>
                  </div>
                  {match.status === 'upcoming' && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      Scheduled
                    </Badge>
                  )}
                  {match.status === 'pending_result' && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      Needs Result
                    </Badge>
                  )}
                </div>

                {/* Report Result Form */}
                {showReportForm === match.id ? (
                  <div className="mt-4 p-4 bg-accent/5 rounded-lg border">
                    <h5 className="font-semibold mb-3">Report Match Result</h5>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <Label htmlFor={`my-score-${match.id}`} className="text-xs">
                          Your Score
                        </Label>
                        <Input
                          id={`my-score-${match.id}`}
                          type="number"
                          value={myScore}
                          onChange={(e) => setMyScore(e.target.value)}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`opp-score-${match.id}`} className="text-xs">
                          Opponent Score
                        </Label>
                        <Input
                          id={`opp-score-${match.id}`}
                          type="number"
                          value={opponentScore}
                          onChange={(e) => setOpponentScore(e.target.value)}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => submitResult(match.id)}
                        disabled={!myScore || !opponentScore}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Submit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setShowReportForm(null);
                          setMyScore('');
                          setOpponentScore('');
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    {match.status === 'pending_result' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleReportResult(match.id)}
                      >
                        Report Result
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Player Standings */}
      <Card>
        <CardHeader>
          <CardTitle>Player Standings</CardTitle>
          <CardDescription>Winter 2025 Season Rankings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-2 pb-2 border-b text-xs text-muted-foreground font-semibold">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-2 text-center">Record</div>
              <div className="col-span-2 text-center">SL</div>
              <div className="col-span-2 text-right">Points</div>
            </div>

            {/* Standings Rows */}
            {standings.map((player) => (
              <div
                key={player.rank}
                className={`grid grid-cols-12 gap-2 py-3 rounded-lg hover:bg-accent/5 transition-colors ${
                  player.name === 'You' ? 'bg-primary/5 border border-primary/20' : ''
                }`}
              >
                <div className="col-span-1 font-semibold text-sm flex items-center">
                  {player.rank === 1 && <span className="text-yellow-500">🥇</span>}
                  {player.rank === 2 && <span className="text-gray-400">🥈</span>}
                  {player.rank === 3 && <span className="text-amber-600">🥉</span>}
                  {player.rank > 3 && <span className="text-muted-foreground">{player.rank}</span>}
                </div>
                <div className="col-span-5 flex items-center">
                  <span className={player.name === 'You' ? 'font-semibold text-primary' : ''}>
                    {player.name}
                  </span>
                </div>
                <div className="col-span-2 text-center text-sm flex items-center justify-center">
                  <span className="text-green-600 font-semibold">{player.wins}</span>
                  <span className="text-muted-foreground mx-1">-</span>
                  <span className="text-red-600 font-semibold">{player.losses}</span>
                </div>
                <div className="col-span-2 text-center flex items-center justify-center">
                  <Badge variant="outline" className="text-xs">
                    {player.skillLevel}
                  </Badge>
                </div>
                <div className="col-span-2 text-right font-semibold text-sm flex items-center justify-end">
                  {player.points}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
