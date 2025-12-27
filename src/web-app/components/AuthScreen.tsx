import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mail, ShieldCheck } from 'lucide-react-native';
import { toast } from 'sonner';

interface AuthScreenProps {
  onAuthenticate: (email: string) => void;
  onSkipAuth?: () => void;
}

export function AuthScreen({ onAuthenticate, onSkipAuth }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSSO = () => {
    setIsLoading(true);
    // Simulate UW SSO authentication
    setTimeout(() => {
      setIsLoading(false);
      toast.success('SSO authentication successful!');
      onAuthenticate('student@uw.edu');
    }, 1500);
  };

  const handleEmailVerify = () => {
    if (!email.endsWith('@uw.edu')) {
      toast.error('Please use a valid @uw.edu email address');
      return;
    }

    setIsLoading(true);
    // Simulate email verification
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Verification link sent to your email!');
      // In real app, user would click link. For demo, auto-authenticate
      setTimeout(() => {
        onAuthenticate(email);
      }, 1000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-accent rounded-full"></div>
            </div>
          </div>
          <h1 className="text-white mb-2">CueU</h1>
          <p className="text-accent">University of Washington Pool Club</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to CueU</CardTitle>
            <CardDescription>
              Sign in with your UW credentials to join the pool club
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              size="lg"
              onClick={handleSSO}
              disabled={isLoading}
            >
              <ShieldCheck className="mr-2 h-5 w-5" />
              Sign in with UW SSO
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block mb-2">
                UW Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="husky@uw.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-2">
                A verification link will be sent to your email
              </p>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleEmailVerify}
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Send Verification Link'}
            </Button>
            <div className="pt-4 border-t">
              <Badge variant="secondary" className="w-full justify-center py-2">
                UW Students & Staff Only
              </Badge>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/70 mt-6">
          By signing in, you agree to the UW Pool Club terms and conditions
        </p>

        {/* Skip Login for Testing */}
        {onSkipAuth && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <Button
              variant="outline"
              onClick={onSkipAuth}
              className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Skip Login (Testing Only)
            </Button>
            <p className="text-center text-xs text-white/50 mt-2">
              For development and testing purposes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}