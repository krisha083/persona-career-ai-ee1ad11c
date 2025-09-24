import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Brain, 
  Target, 
  FileText, 
  Download, 
  LogOut,
  CheckCircle,
  Clock
} from "lucide-react";

interface Profile {
  name: string | null;
  age: number | null;
  education_level: string | null;
  cgpa: number | null;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [completionStatus, setCompletionStatus] = useState({
    profile: false,
    quiz: false,
    recommendations: false
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      checkCompletionStatus();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('name, age, education_level, cgpa')
      .eq('user_id', user?.id)
      .maybeSingle();
    
    setProfile(data);
  };

  const checkCompletionStatus = async () => {
    if (!user) return;

    // Check profile completion
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // Check quiz completion
    const { data: quizData } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // Check recommendations
    const { data: recommendationsData } = await supabase
      .from('career_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);

    setCompletionStatus({
      profile: !!(profileData && profileData.name && profileData.age),
      quiz: !!quizData,
      recommendations: !!(recommendationsData && recommendationsData.length > 0)
    });
  };

  const getProgressPercentage = () => {
    const completed = Object.values(completionStatus).filter(Boolean).length;
    return Math.round((completed / 3) * 100);
  };

  const dashboardCards = [
    {
      title: "Complete Your Profile",
      description: "Add your personal information, skills, and interests",
      icon: User,
      completed: completionStatus.profile,
      action: "Fill Profile Info",
      href: "/profile"
    },
    {
      title: "Take Career Quiz",
      description: "Discover your personality type with our RIASEC assessment",
      icon: Brain,
      completed: completionStatus.quiz,
      action: "Start Career Quiz",
      href: "/quiz"
    },
    {
      title: "View Career Suggestions", 
      description: "Get AI-powered career recommendations based on your profile",
      icon: Target,
      completed: completionStatus.recommendations,
      action: "View Suggestions",
      href: "/recommendations"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Persona Career AI</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {profile?.name || user?.email}
            </p>
          </div>
          <Button variant="ghost" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary" />
              Your Progress
            </CardTitle>
            <CardDescription>
              Complete all steps to get personalized career recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
              <Badge variant={getProgressPercentage() === 100 ? "default" : "secondary"}>
                {getProgressPercentage()}% Complete
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 mr-2 text-primary" />
                      {card.title}
                    </div>
                    {card.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                <Button 
                  className="w-full" 
                  variant={card.completed ? "secondary" : "default"}
                  onClick={() => window.location.href = card.href}
                >
                  {card.completed ? "Update" : card.action}
                </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Actions */}
        {completionStatus.recommendations && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Career Resources
              </CardTitle>
              <CardDescription>
                Download your personalized career roadmap and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Career Roadmap PDF
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Detailed Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}