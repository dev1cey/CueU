import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

interface ProfileSetupProps {
  email: string;
  onComplete: (profile: UserProfile) => void;
}

export interface UserProfile {
  email: string;
  name: string;
  skillLevel: string;
  department: string;
  bio: string;
}

export function ProfileSetup({ email, onComplete }: ProfileSetupProps) {
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [department, setDepartment] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !skillLevel || !department) {
      toast.error('Please fill in all required fields');
      return;
    }

    const profile: UserProfile = {
      email,
      name,
      skillLevel,
      department,
      bio
    };

    toast.success('Profile created successfully!');
    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create Your Billiards Profile</CardTitle>
          <CardDescription>
            Tell us about yourself to get started with the UW Pool League
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="John Husky"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department / College *</Label>
              <Select value={department} onValueChange={setDepartment} required>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">College of Engineering</SelectItem>
                  <SelectItem value="arts-sciences">College of Arts & Sciences</SelectItem>
                  <SelectItem value="business">Foster School of Business</SelectItem>
                  <SelectItem value="information">Information School</SelectItem>
                  <SelectItem value="environment">College of the Environment</SelectItem>
                  <SelectItem value="education">College of Education</SelectItem>
                  <SelectItem value="medicine">School of Medicine</SelectItem>
                  <SelectItem value="law">School of Law</SelectItem>
                  <SelectItem value="social-work">School of Social Work</SelectItem>
                  <SelectItem value="staff">UW Staff</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillLevel">Skill Level *</Label>
              <Select value={skillLevel} onValueChange={setSkillLevel} required>
                <SelectTrigger id="skillLevel">
                  <SelectValue placeholder="Select your skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner - Just learning the game</SelectItem>
                  <SelectItem value="intermediate">Intermediate - Regular player</SelectItem>
                  <SelectItem value="advanced">Advanced - Competitive player</SelectItem>
                  <SelectItem value="expert">Expert - Tournament experience</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Your skill level helps us create fair matchups with handicap adjustments
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your pool playing experience, favorite games, or anything else..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Complete Profile & Join League
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
