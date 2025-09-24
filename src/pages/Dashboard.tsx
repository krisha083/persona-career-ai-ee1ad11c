import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User, Brain, Target, Download, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Signed Out',
        description: 'You have been signed out successfully.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PersonaCareer AI
            </h1>
            <p className="text-sm text-muted-foreground">AI-Powered Career Recommendation System</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.email?.split('@')[0]}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome to Your Career Journey</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover your perfect career path through our AI-powered personality assessment and personalized recommendations.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/profile')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  Complete Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Tell us about yourself, your skills, interests, and educational background to get personalized recommendations.
                </p>
                <Button className="w-full">Fill Profile Info</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/quiz')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Brain className="w-6 h-6 text-secondary" />
                  </div>
                  Take Career Quiz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Complete our RIASEC personality assessment to understand your career preferences and working style.
                </p>
                <Button variant="secondary" className="w-full">Start Career Quiz</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/recommendations')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Target className="w-6 h-6 text-accent-foreground" />
                  </div>
                  View Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Explore AI-generated career suggestions based on your profile and personality assessment results.
                </p>
                <Button variant="outline" className="w-full">View Career Suggestions</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/roadmap')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-muted/10 rounded-lg">
                    <Download className="w-6 h-6 text-muted-foreground" />
                  </div>
                  Career Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get a detailed skill development roadmap and download your personalized career plan as PDF.
                </p>
                <Button variant="outline" className="w-full">Download Roadmap PDF</Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0%</div>
                <div className="text-sm text-muted-foreground">Profile Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">0</div>
                <div className="text-sm text-muted-foreground">Quizzes Taken</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-foreground">0</div>
                <div className="text-sm text-muted-foreground">Recommendations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">0</div>
                <div className="text-sm text-muted-foreground">Roadmaps Generated</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;