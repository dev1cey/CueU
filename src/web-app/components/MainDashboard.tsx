import { useState } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { HomeScreen } from './HomeScreen';
import { NewsScreen } from './NewsScreen';
import { LeagueScreen } from './LeagueScreen';
import { SettingsScreen } from './SettingsScreen';
import { UserProfile } from './ProfileSetup';
import { Home, Trophy, Settings, CircleDot, Newspaper } from 'lucide-react-native';

interface MainDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
}

export function MainDashboard({ profile, onLogout }: MainDashboardProps) {
  const [activeTab, setActiveTab] = useState('home');
  // For demo purposes, we'll use state to track league enrollment
  // In production, this would come from backend/database
  const [isEnrolledInLeague, setIsEnrolledInLeague] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-white border-b border-accent/30 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <CircleDot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-white">CueU</h1>
                <p className="text-accent text-sm">UW Pool Club</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-white">{profile.name}</p>
                <p className="text-xs text-accent">{profile.department}</p>
              </div>
              <div className="text-white text-4xl font-bold">
                W
              </div>
            </div>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Tab Content */}
          <TabsContent value="home" className="mt-0">
            <HomeScreen />
          </TabsContent>

          <TabsContent value="news" className="mt-0">
            <NewsScreen />
          </TabsContent>

          <TabsContent value="league" className="mt-0">
            <LeagueScreen isEnrolled={isEnrolledInLeague} />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <SettingsScreen profile={profile} onLogout={onLogout} />
          </TabsContent>
        </div>

        {/* Bottom Navigation */}
        <TabsList className="fixed bottom-0 left-0 right-0 w-full h-20 grid grid-cols-4 rounded-none border-t bg-background z-50 m-0 p-0">
          <TabsTrigger 
            value="home" 
            className="flex-col h-full gap-1 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </TabsTrigger>
          <TabsTrigger 
            value="news" 
            className="flex-col h-full gap-1 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Newspaper className="h-5 w-5" />
            <span className="text-xs">News</span>
          </TabsTrigger>
          <TabsTrigger 
            value="league" 
            className="flex-col h-full gap-1 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Trophy className="h-5 w-5" />
            <span className="text-xs">League</span>
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex-col h-full gap-1 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}