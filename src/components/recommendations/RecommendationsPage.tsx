import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Target, ArrowLeft, Star, DollarSign, TrendingUp, BookOpen, Download, Calendar, Sparkles, Brain, MapPin, Clock, Zap, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoadmapViewer } from "@/components/roadmap/RoadmapViewer";

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
  const [selectedCareer, setSelectedCareer] = useState<string>("");
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [roadmapContent, setRoadmapContent] = useState<string>("");
  const [roadmapViewOpen, setRoadmapViewOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchQuizResult();
      fetchRecommendations();
    }
  }, [user]);

  // Auto-generate recommendations if quiz is completed but no recommendations exist
  useEffect(() => {
    if (quizResult && recommendations.length === 0 && !loading && !generating) {
      console.log('Auto-generating recommendations for completed quiz');
      generateRecommendations();
    }
  }, [quizResult, recommendations, loading, generating]);

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

  const generatePersonalizedRoadmap = async () => {
    if (!selectedCareer) {
      toast({
        title: "Select a Career",
        description: "Please select a career to generate a personalized roadmap.",
        variant: "destructive"
      });
      return;
    }

    setGeneratingRoadmap(true);

    try {
      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Find the selected career recommendation
      const selectedRecommendation = recommendations.find(
        rec => rec.career_title === selectedCareer
      );

      if (!selectedRecommendation) {
        throw new Error('Selected career not found');
      }

      const { data, error } = await supabase.functions.invoke('generate-career-roadmap', {
        body: {
          careerTitle: selectedRecommendation.career_title,
          careerDescription: selectedRecommendation.description,
          requiredSkills: selectedRecommendation.required_skills,
          userProfile: profile,
          personalityType: quizResult.personality_type
        }
      });

      if (error) throw error;

      // Store the roadmap content for viewing
      const fullRoadmapContent = `AI-GENERATED CAREER ROADMAP
===========================
Career: ${selectedCareer}
Personality Type: ${quizResult.personality_type}
Generated: ${new Date().toLocaleDateString()}

${data.roadmap}
`;

      setRoadmapContent(fullRoadmapContent);
      setRoadmapViewOpen(true);

      toast({
        title: "Roadmap Generated!",
        description: `Your personalized ${selectedCareer} roadmap is ready to view.`
      });

      setRoadmapOpen(false);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate roadmap. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  const scheduleConsultation = () => {
    toast({
      title: "Coming Soon!",
      description: "Career consultation booking will be available soon. For now, use your downloaded roadmap to get started."
    });
  };

  const downloadRoadmap = () => {
    const blob = new Blob([roadmapContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCareer.toLowerCase().replace(/\s+/g, '-')}-roadmap.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Your roadmap has been downloaded as a text file."
    });
  };

  if (!quizResult) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--gradient-background)' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <Button variant="ghost" onClick={() => navigate('/')} className="mr-4 hover:bg-white/80">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>

            <Card className="card-professional animate-scale-in">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl mb-2">Complete the Quiz First</CardTitle>
                <CardDescription className="text-base">
                  You need to complete the career assessment quiz before viewing recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pt-2">
                <Button onClick={() => navigate('/quiz')} size="lg" className="hover-scale">
                  <Brain className="h-4 w-4 mr-2" />
                  Take the Quiz
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-background)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8 animate-fade-in">
            <Button variant="ghost" onClick={() => navigate('/')} className="mr-4 hover:bg-white/80">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Header Card */}
          <Card className="card-professional mb-8 animate-fade-in-up">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary-light/5">
              <CardTitle className="flex items-center text-3xl font-bold">
                <Sparkles className="h-8 w-8 mr-3 text-primary animate-glow" />
                Your Career Recommendations
              </CardTitle>
              <CardDescription className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Based on your personality type: 
                <Badge variant="default" className="bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold">
                  {quizResult.personality_type}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {recommendations.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Target className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Ready to Discover Your Perfect Career?</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Generate personalized career recommendations based on your personality assessment and preferences.
                  </p>
                  <Button onClick={generateRecommendations} disabled={generating} className="btn-gradient h-12 px-8 text-lg">
                    {generating && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    <Zap className="mr-2 h-5 w-5" />
                    Generate My Recommendations
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
              {recommendations.map((rec, index) => (
                <Card key={rec.id} className="card-professional hover:shadow-professional-lg transition-all duration-300 animate-fade-in-up" 
                      style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <Target className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-foreground">{rec.career_title}</CardTitle>
                          <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border-primary/20 flex items-center gap-1 w-fit">
                            <Star className="h-3 w-3" />
                            {Math.round(rec.match_score)}% Match
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-base leading-relaxed mt-3 text-muted-foreground">
                      {rec.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Salary Range</span>
                            <p className="text-sm text-muted-foreground">{rec.salary_range}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Growth Prospects</span>
                            <p className="text-sm text-muted-foreground">{rec.growth_prospects}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="font-semibold text-foreground">Required Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-11">
                        {rec.required_skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="bg-muted/50 hover:bg-muted transition-colors">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {recommendations.length > 0 && (
            <Card className="mt-8 card-professional animate-fade-in-up">
              <CardHeader className="bg-gradient-to-r from-accent/50 to-primary/5">
                <CardTitle className="flex items-center text-2xl font-bold">
                  <MapPin className="h-6 w-6 mr-3 text-primary" />
                  Next Steps
                </CardTitle>
                <CardDescription className="text-base">
                  Ready to take action on your career recommendations?
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Dialog open={roadmapOpen} onOpenChange={setRoadmapOpen}>
                    <DialogTrigger asChild>
                      <div className="group cursor-pointer">
                        <div className="p-6 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 text-center">
                          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Sparkles className="h-6 w-6 text-primary" />
                          </div>
                          <h4 className="font-semibold text-foreground mb-2">Generate AI Roadmap</h4>
                          <p className="text-sm text-muted-foreground">Get a personalized career development plan</p>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Generate Career Roadmap
                        </DialogTitle>
                        <DialogDescription>
                          Select a career from your recommendations to generate a personalized AI-powered roadmap.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <Select value={selectedCareer} onValueChange={setSelectedCareer}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a career..." />
                          </SelectTrigger>
                          <SelectContent>
                            {recommendations.map((rec) => (
                              <SelectItem key={rec.id} value={rec.career_title}>
                                {rec.career_title} ({Math.round(rec.match_score)}% match)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={generatePersonalizedRoadmap} 
                          disabled={!selectedCareer || generatingRoadmap}
                          className="w-full btn-gradient h-12"
                        >
                          {generatingRoadmap && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <Zap className="mr-2 h-4 w-4" />
                          Generate Roadmap
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {roadmapContent && (
                    <div className="group cursor-pointer" onClick={() => setRoadmapViewOpen(true)}>
                      <div className="p-6 rounded-xl border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 text-center">
                        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h4 className="font-semibold text-foreground mb-2">View Last Roadmap</h4>
                        <p className="text-sm text-muted-foreground">Review your generated career plan</p>
                      </div>
                    </div>
                  )}

                  <div className="group cursor-pointer opacity-50">
                    <div className="p-6 rounded-xl border-2 border-dashed border-orange-300 text-center">
                      <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">Career Consultation</h4>
                      <p className="text-sm text-muted-foreground">Coming soon!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Roadmap Viewer */}
          <RoadmapViewer 
            open={roadmapViewOpen}
            onOpenChange={setRoadmapViewOpen}
            roadmapContent={roadmapContent}
            selectedCareer={selectedCareer}
          />
        </div>
      </div>
    </div>
  );
}