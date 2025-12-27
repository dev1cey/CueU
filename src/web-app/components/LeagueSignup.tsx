import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trophy, Users, Calendar, Target, ExternalLink } from 'lucide-react-native';

interface LeagueSignupProps {
  onSignupComplete?: () => void;
}

export function LeagueSignup({ onSignupComplete }: LeagueSignupProps) {
  const handleSignup = () => {
    // In production, this will open a Google Form
    window.open('https://forms.google.com', '_blank');
    // For demo purposes, we can simulate signup completion
    // onSignupComplete?.();
  };

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <Card className="bg-gradient-to-r from-primary to-accent border-accent">
        <CardContent className="pt-6 text-center">
          <Trophy className="h-16 w-16 text-white mx-auto mb-4" />
          <h2 className="text-white mb-2">Join the UW Pool League</h2>
          <p className="text-accent">
            Compete against other players, track your progress, and climb the rankings!
          </p>
        </CardContent>
      </Card>

      {/* League Information */}
      <Card>
        <CardHeader>
          <CardTitle>What is the Pool League?</CardTitle>
          <CardDescription>A competitive environment for all skill levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            The UW Pool League is a structured competitive league where club members can 
            participate in scheduled matches, track their performance, and improve their skills 
            through regular competition. All skill levels are welcome!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Weekly Matches</h4>
                <p className="text-sm text-muted-foreground">
                  Scheduled matches with opponents of similar skill levels
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Handicap System</h4>
                <p className="text-sm text-muted-foreground">
                  Fair competition with APA handicap adjustments
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Rankings & Stats</h4>
                <p className="text-sm text-muted-foreground">
                  Track your progress and see where you stand
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Community Chat</h4>
                <p className="text-sm text-muted-foreground">
                  Coordinate with opponents and discuss matches
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* League Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>League Requirements</CardTitle>
          <CardDescription>What you need to participate</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">✓</Badge>
              <span className="text-sm">Must be a UW Pool Club member</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">✓</Badge>
              <span className="text-sm">Commit to playing at least one match per week</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">✓</Badge>
              <span className="text-sm">Available for matches at HUB or IMA locations</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">✓</Badge>
              <span className="text-sm">Agree to league rules and sportsmanship guidelines</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Sign Up CTA */}
      <Card className="border-primary">
        <CardContent className="pt-6 text-center">
          <h3 className="mb-2">Ready to Join?</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Complete the registration form to join the league. You'll receive a confirmation email 
            within 24 hours with your league start date.
          </p>
          <Button size="lg" onClick={handleSignup} className="w-full sm:w-auto">
            <ExternalLink className="mr-2 h-5 w-5" />
            Sign Up for Pool League
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            You'll be redirected to a Google Form to complete your registration
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
