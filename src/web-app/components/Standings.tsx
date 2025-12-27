import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { LeaguePlayer } from './LeagueDashboard';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react-native';

interface StandingsProps {
  currentPlayer: string;
}

export function Standings({ currentPlayer }: StandingsProps) {
  // Mock standings data
  const players: LeaguePlayer[] = [
    {
      rank: 1,
      name: currentPlayer,
      department: 'Engineering',
      wins: 1,
      losses: 0,
      winRate: 100,
      skillRating: 1850,
      handicap: 0.8
    },
    {
      rank: 2,
      name: 'Sarah Chen',
      department: 'Business',
      wins: 3,
      losses: 1,
      winRate: 75,
      skillRating: 1820,
      handicap: 0.75
    },
    {
      rank: 3,
      name: 'Mike Johnson',
      department: 'Arts & Sciences',
      wins: 2,
      losses: 1,
      winRate: 67,
      skillRating: 1780,
      handicap: 0.7
    },
    {
      rank: 4,
      name: 'Emma Davis',
      department: 'Information',
      wins: 2,
      losses: 2,
      winRate: 50,
      skillRating: 1650,
      handicap: 0.65
    },
    {
      rank: 5,
      name: 'James Wilson',
      department: 'Engineering',
      wins: 1,
      losses: 2,
      winRate: 33,
      skillRating: 1580,
      handicap: 0.6
    },
    {
      rank: 6,
      name: 'Lisa Anderson',
      department: 'Medicine',
      wins: 1,
      losses: 3,
      winRate: 25,
      skillRating: 1520,
      handicap: 0.55
    },
    {
      rank: 7,
      name: 'David Martinez',
      department: 'Business',
      wins: 0,
      losses: 3,
      winRate: 0,
      skillRating: 1450,
      handicap: 0.5
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>League Standings</CardTitle>
              <CardDescription>Current rankings based on wins, losses, and skill rating</CardDescription>
            </div>
            <Trophy className="h-8 w-8 text-accent" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead className="text-center">W-L</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Win %</TableHead>
                  <TableHead className="text-center hidden lg:table-cell">Rating</TableHead>
                  <TableHead className="text-center">Handicap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow 
                    key={player.rank}
                    className={player.name === currentPlayer ? 'bg-primary/5 font-medium' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {player.rank === 1 && <Trophy className="h-4 w-4 text-accent" />}
                        <span>{player.rank}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {player.name}
                        {player.name === currentPlayer && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {player.department}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{player.wins}-{player.losses}</span>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <span>{player.winRate}%</span>
                        {player.winRate >= 50 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center hidden lg:table-cell">
                      {player.skillRating}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{player.handicap}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-primary to-accent border-accent">
        <CardContent className="pt-6">
          <div className="text-white space-y-2">
            <h4 className="text-white">About Handicaps</h4>
            <p className="text-sm text-accent">
              Handicaps are calculated using the APA (American Poolplayers Association) system.
              They're automatically adjusted after each match to ensure fair competition between
              players of different skill levels. Higher handicaps indicate stronger players.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
