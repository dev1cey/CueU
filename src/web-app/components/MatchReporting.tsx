import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Match } from './LeagueDashboard';
import { AlertCircle } from 'lucide-react-native';

interface MatchReportingProps {
  match: Match;
  onSubmit: (matchId: string, yourScore: number, opponentScore: number) => void;
  onClose: () => void;
}

export function MatchReporting({ match, onSubmit, onClose }: MatchReportingProps) {
  const [yourScore, setYourScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);

  const handleSubmit = () => {
    if (yourScore === 0 && opponentScore === 0) {
      return;
    }
    onSubmit(match.id, yourScore, opponentScore);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Match Result</DialogTitle>
          <DialogDescription>
            Enter the final scores for your match against {match.opponent}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-secondary p-4 rounded-lg">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{new Date(match.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{match.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{match.location}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yourScore">Your Score</Label>
              <Input
                id="yourScore"
                type="number"
                min="0"
                value={yourScore}
                onChange={(e) => setYourScore(parseInt(e.target.value) || 0)}
                className="text-center text-2xl h-16"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opponentScore">Opponent Score</Label>
              <Input
                id="opponentScore"
                type="number"
                min="0"
                value={opponentScore}
                onChange={(e) => setOpponentScore(parseInt(e.target.value) || 0)}
                className="text-center text-2xl h-16"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Awaiting Opponent Confirmation</p>
              <p className="text-blue-700">
                Your opponent will receive a notification to confirm this result. 
                If there's a discrepancy, a league officer will review the match.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={yourScore === 0 && opponentScore === 0}
          >
            Submit Result
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
