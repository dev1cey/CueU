import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MatchSchedule } from './MatchSchedule';
import { Standings } from './Standings';
import { MatchReporting } from './MatchReporting';
import { ChatInterface } from './ChatInterface';
import { UserProfile } from './ProfileSetup';
import { Trophy, Calendar, MessageSquare, BarChart3, LogOut, CircleDot } from 'lucide-react-native';
import { toast } from 'sonner';

interface LeagueDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
  isEmbedded?: boolean; // New prop to indicate if it's embedded in MainDashboard
}

export interface Match {
  id: string;
  opponent: string;
  opponentEmail: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'completed' | 'disputed' | 'incomplete';
  result?: {
    yourScore: number;
    opponentScore: number;
    winner: string;
  };
}

export interface LeaguePlayer {
  rank: number;
  name: string;
  department: string;
  wins: number;
  losses: number;
  winRate: number;
  skillRating: number;
  handicap: number;
}

export function LeagueDashboard({ profile, onLogout, isEmbedded = false }: LeagueDashboardProps) {
  const [activeTab, setActiveTab] = useState('matches');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatOpponent, setChatOpponent] = useState<string | null>(null);

  // Mock data for matches
  const [matches] = useState<Match[]>([
    {
      id: '1',
      opponent: 'Sarah Chen',
      opponentEmail: 'schen@uw.edu',
      date: '2025-12-23',
      time: '6:00 PM',
      location: 'HUB Games Area',
      status: 'upcoming'
    },
    {
      id: '2',
      opponent: 'Mike Johnson',
      opponentEmail: 'mikej@uw.edu',
      date: '2025-12-20',
      time: '7:00 PM',
      location: 'HUB Games Area',
      status: 'completed',
      result: {
        yourScore: 5,
        opponentScore: 3,
        winner: profile.name
      }
    },
    {
      id: '3',
      opponent: 'Emma Davis',
      opponentEmail: 'emmad@uw.edu',
      date: '2025-12-27',
      time: '5:30 PM',
      location: 'IMA Recreation Center',
      status: 'upcoming'
    }
  ]);

  const handleChatWithOpponent = (match: Match) => {
    setChatOpponent(match.opponent);
    setShowChat(true);
  };

  const handleReportMatch = (match: Match) => {
    setSelectedMatch(match);
  };

  const handleSubmitResult = (matchId: string, yourScore: number, opponentScore: number) => {
    toast.success('Match result submitted! Waiting for opponent confirmation.');
    setSelectedMatch(null);
  };

  return (
    <div className={isEmbedded ? '' : 'min-h-screen bg-background'}>
      {/* Header - only show if not embedded */}
      {!isEmbedded && (
        <header className="bg-primary text-white border-b border-accent/30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <CircleDot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-white">CueU</h1>
                  <p className="text-accent text-sm">UW Pool League</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-white">{profile.name}</p>
                  <p className="text-xs text-accent">{profile.department}</p>
                </div>
                <Button variant="outline" size="sm" onClick={onLogout} className="bg-white/10 border-accent/30 text-white hover:bg-white/20">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className={isEmbedded ? '' : 'container mx-auto px-4 py-8'}>
        {/* Profile Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary to-accent border-accent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">{profile.name.charAt(0)}</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-white">{profile.name}</h2>
                  <p className="text-accent">{profile.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="bg-white/90">
                      {profile.skillLevel}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/90">
                      Handicap: 0.8
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex gap-6 text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-xs text-accent">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">1</div>
                  <div className="text-xs text-accent">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-xs text-accent">Losses</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="matches">
              <Calendar className="h-4 w-4 mr-2" />
              Matches
            </TabsTrigger>
            <TabsTrigger value="standings">
              <Trophy className="h-4 w-4 mr-2" />
              Standings
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="h-4 w-4 mr-2" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            <MatchSchedule
              matches={matches}
              onChatWithOpponent={handleChatWithOpponent}
              onReportMatch={handleReportMatch}
            />
          </TabsContent>

          <TabsContent value="standings">
            <Standings currentPlayer={profile.name} />
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Performance Statistics</CardTitle>
                <CardDescription>Your league performance and skill metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <div className="text-3xl font-bold text-primary">100%</div>
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <div className="text-3xl font-bold text-primary">0.8</div>
                    <div className="text-sm text-muted-foreground">APA Handicap</div>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <div className="text-3xl font-bold text-primary">5.0</div>
                    <div className="text-sm text-muted-foreground">Avg Score</div>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <div className="text-3xl font-bold text-primary">3</div>
                    <div className="text-sm text-muted-foreground">Total Games</div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="mb-4">Recent Performance Trend</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-500">W</Badge>
                      <span className="text-sm">vs Mike Johnson - 5:3</span>
                      <span className="text-xs text-muted-foreground ml-auto">Dec 20</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Match Reporting Modal */}
      {selectedMatch && (
        <MatchReporting
          match={selectedMatch}
          onSubmit={handleSubmitResult}
          onClose={() => setSelectedMatch(null)}
        />
      )}

      {/* Chat Interface */}
      {showChat && chatOpponent && (
        <ChatInterface
          opponent={chatOpponent}
          onClose={() => {
            setShowChat(false);
            setChatOpponent(null);
          }}
        />
      )}
    </div>
  );
}