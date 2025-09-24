import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Target, ArrowLeft, Star, DollarSign, TrendingUp, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Recommendation {
  id: string;
  career_title: string;
  description: string;
  salary_range: string;
  required_skills: string[];
  growth_prospects: string;
  match_score: number;
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchQuizResult();
      fetchRecommendations();
    }
  }, [user]);

  const fetchQuizResult = async () => {
    const { data } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    
    setQuizResult(data);
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('career_recommendations')
      .select('*')
      .eq('user_id', user?.id)
      .order('match_score', { ascending: false });
    
    if (data) {
      setRecommendations(data);
    }
    setLoading(false);
  };

  const generateRecommendations = async () => {
    if (!user || !quizResult) return;
    
    setGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: { user_id: user.id }
      });

      if (error) throw error;

      toast({
        title: "Recommendations Generated!",
        description: "Your personalized career recommendations are ready."
      });

      fetchRecommendations();
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive"
      });
    }
    
    setGenerating(false);
  };

  const downloadRoadmap = () => {
    if (recommendations.length === 0) {
      toast({
        title: "No Recommendations",
        description: "Generate career recommendations first to download a roadmap.",
        variant: "destructive"
      });
      return;
    }

    // Create roadmap content
    const roadmapContent = `CAREER ROADMAP - ${quizResult.personality_type}
===========================================

Based on your assessment results, here's your personalized career roadmap:

PERSONALITY TYPE: ${quizResult.personality_type}

TOP CAREER RECOMMENDATIONS:
${recommendations.map((rec, index) => `
${index + 1}. ${rec.career_title} (${Math.round(rec.match_score)}% Match)
   Description: ${rec.description}
   Salary Range: ${rec.salary_range}
   Growth Prospects: ${rec.growth_prospects}
   Required Skills: ${rec.required_skills.join(', ')}
`).join('')}

NEXT STEPS:
1. Research these career paths in detail
2. Develop the required skills through courses or experience
3. Network with professionals in these fields
4. Consider internships or entry-level positions
5. Update your resume to highlight relevant skills

Generated on: ${new Date().toLocaleDateString()}
`;

    // Create and download the file
    const blob = new Blob([roadmapContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-roadmap-${quizResult.personality_type}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Roadmap Downloaded!",
      description: "Your career roadmap has been saved to your downloads."
    });
  };

  const scheduleConsultation = () => {
    toast({
      title: "Coming Soon!",
      description: "Career consultation booking will be available soon. For now, use your downloaded roadmap to get started."
    });
  };

  if (!quizResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Complete Quiz First
                </CardTitle>
                <CardDescription>
                  You need to complete the career assessment quiz before viewing recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/quiz')} className="w-full">
                  Take Career Quiz
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-primary" />
                Your Career Recommendations
              </CardTitle>
              <CardDescription>
                Based on your personality type: <Badge variant="default">{quizResult.personality_type}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No recommendations generated yet. Click below to get personalized career suggestions.
                  </p>
                  <Button onClick={generateRecommendations} disabled={generating}>
                    {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Recommendations
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{rec.career_title}</CardTitle>
                      <Badge variant="secondary" className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        {Math.round(rec.match_score)}% Match
                      </Badge>
                    </div>
                    <CardDescription>{rec.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                          <span className="font-medium">Salary Range</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">{rec.salary_range}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="font-medium">Growth Prospects</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">{rec.growth_prospects}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-purple-600" />
                        <span className="font-medium">Required Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-6">
                        {rec.required_skills.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {recommendations.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>
                  Ready to take action on your career recommendations?
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button onClick={generateRecommendations} disabled={generating} variant="outline">
                  {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Refresh Recommendations
                </Button>
                <Button variant="outline" onClick={downloadRoadmap}>
                  Download Career Roadmap
                </Button>
                <Button variant="outline" onClick={scheduleConsultation}>
                  Schedule Career Consultation
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}