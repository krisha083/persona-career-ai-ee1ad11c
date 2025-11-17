import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Persona Career AI
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back, <span className="font-semibold text-foreground">{profile?.name || user?.email}</span>
              </p>
            </div>
            <Button variant="ghost" onClick={signOut} className="hover-scale">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Overview */}
        <Card className="mb-8 card-gradient border-0 shadow-xl animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              Your Journey Progress
            </CardTitle>
            <CardDescription className="text-base mt-2">Complete all steps to unlock personalized career recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Overall Progress</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {getProgressPercentage()}%
                </span>
              </div>
              <div className="relative h-4 bg-secondary/50 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/80 transition-all duration-700 ease-out rounded-full shadow-lg"
                  style={{ width: `${getProgressPercentage()}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              <div className="flex gap-3 pt-2 flex-wrap">
                {Object.entries(completionStatus).map(([key, completed]) => (
                  <Badge 
                    key={key} 
                    variant={completed ? "default" : "secondary"}
                    className="capitalize px-4 py-2 text-sm font-medium hover-scale"
                  >
                    {completed ? <CheckCircle className="h-4 w-4 mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={index}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 card-professional group animate-fade-in ${
                  card.completed ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-transparent' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {card.completed && (
                  <div className="absolute top-4 right-4 animate-scale-in">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
                      <CheckCircle className="relative h-7 w-7 text-primary" />
                    </div>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-xl transition-all duration-300 group-hover:scale-110 ${
                      card.completed 
                        ? 'bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg shadow-primary/20' 
                        : 'bg-gradient-to-br from-secondary to-secondary/80'
                    }`}>
                      <Icon className={`h-7 w-7 ${
                        card.completed ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {card.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {card.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate(card.href)}
                    variant={card.completed ? "secondary" : "default"}
                    className="w-full hover-scale font-semibold"
                    size="lg"
                  >
                    {card.completed ? (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Update
                      </>
                    ) : (
                      card.action
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}