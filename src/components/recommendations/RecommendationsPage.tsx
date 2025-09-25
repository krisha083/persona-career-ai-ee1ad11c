import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Target, ArrowLeft, Star, DollarSign, TrendingUp, BookOpen, Download, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
                <Dialog open={roadmapOpen} onOpenChange={setRoadmapOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Generate AI Roadmap
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Generate Career Roadmap</DialogTitle>
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
                        className="w-full"
                      >
                        {generatingRoadmap && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Roadmap
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                {roadmapContent && (
                  <Button variant="outline" onClick={() => setRoadmapViewOpen(true)}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Last Roadmap
                  </Button>
                )}
                <Button variant="outline" onClick={scheduleConsultation}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Career Consultation
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Roadmap Viewer Dialog */}
          <Dialog open={roadmapViewOpen} onOpenChange={setRoadmapViewOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Career Roadmap: {selectedCareer}</DialogTitle>
                <DialogDescription>
                  Your personalized AI-generated career roadmap
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-4 bg-muted/10 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                  {roadmapContent}
                </pre>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setRoadmapViewOpen(false)}>
                  Close
                </Button>
                <Button onClick={downloadRoadmap}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}