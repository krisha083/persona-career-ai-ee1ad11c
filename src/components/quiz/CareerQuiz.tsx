import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain, ArrowLeft, ArrowRight, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RIASEC_QUESTIONS = [
  // Realistic (R)
  { id: 1, text: "I enjoy working with tools and machinery", category: "R" },
  { id: 2, text: "I like to build things with my hands", category: "R" },
  { id: 3, text: "I prefer practical, hands-on activities", category: "R" },
  { id: 4, text: "I enjoy outdoor activities and physical work", category: "R" },
  { id: 5, text: "I like to fix things that are broken", category: "R" },
  
  // Investigative (I)
  { id: 6, text: "I enjoy solving complex problems", category: "I" },
  { id: 7, text: "I like to analyze data and information", category: "I" },
  { id: 8, text: "I enjoy conducting research and experiments", category: "I" },
  { id: 9, text: "I like to understand how things work", category: "I" },
  { id: 10, text: "I enjoy learning about science and technology", category: "I" },
  
  // Artistic (A)
  { id: 11, text: "I enjoy creative and artistic activities", category: "A" },
  { id: 12, text: "I like to express myself through art, music, or writing", category: "A" },
  { id: 13, text: "I enjoy working in unstructured environments", category: "A" },
  { id: 14, text: "I like to create original ideas and designs", category: "A" },
  { id: 15, text: "I enjoy performing or entertaining others", category: "A" },
  
  // Social (S)
  { id: 16, text: "I enjoy helping and teaching others", category: "S" },
  { id: 17, text: "I like to work in teams and collaborate", category: "S" },
  { id: 18, text: "I enjoy counseling or advising people", category: "S" },
  { id: 19, text: "I like to volunteer for community causes", category: "S" },
  { id: 20, text: "I enjoy working with people from diverse backgrounds", category: "S" },
  
  // Enterprising (E)
  { id: 21, text: "I enjoy leading and managing others", category: "E" },
  { id: 22, text: "I like to persuade and influence people", category: "E" },
  { id: 23, text: "I enjoy taking risks and making decisions", category: "E" },
  { id: 24, text: "I like to start new projects and ventures", category: "E" },
  { id: 25, text: "I enjoy competing and achieving goals", category: "E" },
  
  // Conventional (C)
  { id: 26, text: "I enjoy working with details and data", category: "C" },
  { id: 27, text: "I like following established procedures", category: "C" },
  { id: 28, text: "I enjoy organizing and maintaining records", category: "C" },
  { id: 29, text: "I like working in structured environments", category: "C" },
  { id: 30, text: "I enjoy mathematical and clerical tasks", category: "C" }
];

export default function CareerQuiz() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [existingResult, setExistingResult] = useState<any>(null);

  useEffect(() => {
    if (user) {
      checkExistingResults();
    }
  }, [user]);

  const checkExistingResults = async () => {
    const { data } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    
    if (data) {
      setExistingResult(data);
    }
  };

  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [RIASEC_QUESTIONS[currentQuestion].id]: parseInt(value)
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < RIASEC_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateRIASECScores = () => {
    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    
    RIASEC_QUESTIONS.forEach(question => {
      const answer = answers[question.id] || 0;
      scores[question.category as keyof typeof scores] += answer;
    });

    return scores;
  };

  const getPersonalityType = (scores: Record<string, number>) => {
    const sortedTypes = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
    
    return sortedTypes.join('');
  };

  const submitQuiz = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit the quiz.",
        variant: "destructive"
      });
      return;
    }

    // Check if all questions are answered
    const unansweredQuestions = RIASEC_QUESTIONS.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const riasecScores = calculateRIASECScores();
      const personalityType = getPersonalityType(riasecScores);

      console.log('Submitting quiz with scores:', riasecScores, 'Type:', personalityType);

      const { error } = await supabase
        .from('quiz_results')
        .upsert({
          user_id: user.id,
          quiz_answers: answers,
          riasec_scores: riasecScores,
          personality_type: personalityType
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving quiz:', error);
        throw error;
      }

      console.log('Quiz saved successfully, navigating to recommendations');

      // Navigate immediately to prevent brief flash of quiz page
      navigate('/recommendations', { 
        state: { 
          justCompleted: true, 
          personalityType 
        } 
      });

      // Show toast after navigation
      toast({
        title: "Quiz Completed! 🎉",
        description: `Your personality type is ${personalityType}.`
      });
    } catch (error) {
      console.error('Quiz submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save quiz results. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const retakeQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setExistingResult(null);
  };

  if (existingResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex items-center mb-6 animate-fade-in">
            <Button variant="ghost" onClick={() => navigate('/')} className="hover-scale">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <Card className="card-gradient border-0 shadow-xl animate-scale-in">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl">
                    <Brain className="h-10 w-10 text-primary" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-3xl mb-2">
                Quiz Already Completed
              </CardTitle>
              <CardDescription className="text-base">
                You have already completed the career assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-transparent rounded-xl border border-primary/20">
                <p className="text-sm text-muted-foreground mb-2">Your Personality Type</p>
                <Badge variant="default" className="text-2xl px-6 py-3 font-bold">
                  {existingResult.personality_type}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Your RIASEC Scores
                </h4>
                <div className="grid gap-3">
                  {Object.entries(existingResult.riasec_scores).map(([type, score]) => (
                    <div key={type} className="flex justify-between items-center p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                      <span className="font-medium text-foreground">{type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                            style={{ width: `${((score as number) / 25) * 100}%` }}
                          />
                        </div>
                        <Badge variant="outline" className="min-w-[4rem] justify-center">{score as number}/25</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={() => navigate('/recommendations')} className="flex-1 hover-scale" size="lg">
                  View Recommendations
                </Button>
                <Button variant="outline" onClick={retakeQuiz} className="flex-1 hover-scale" size="lg">
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / RIASEC_QUESTIONS.length) * 100;
  const isLastQuestion = currentQuestion === RIASEC_QUESTIONS.length - 1;
  const canProceed = answers[RIASEC_QUESTIONS[currentQuestion].id] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center mb-6 animate-fade-in">
          <Button variant="ghost" onClick={() => navigate('/')} className="hover-scale">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="card-gradient border-0 shadow-xl animate-scale-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">
              Career Assessment Quiz
            </CardTitle>
            <CardDescription className="text-base">
              Answer these questions honestly to discover your career interests
            </CardDescription>
            <div className="space-y-3 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Question {currentQuestion + 1} of {RIASEC_QUESTIONS.length}</span>
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="relative h-3 bg-secondary/50 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/80 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 py-8">
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-br from-secondary/30 to-transparent rounded-xl border border-border/50">
                <h3 className="text-xl font-semibold mb-6 text-foreground">
                  {RIASEC_QUESTIONS[currentQuestion].text}
                </h3>
                
                <RadioGroup
                  value={answers[RIASEC_QUESTIONS[currentQuestion].id]?.toString() || ""}
                  onValueChange={handleAnswer}
                  className="space-y-3"
                >
                  {[
                    { value: "5", label: "Strongly Agree", emoji: "😍" },
                    { value: "4", label: "Agree", emoji: "👍" },
                    { value: "3", label: "Neutral", emoji: "😐" },
                    { value: "2", label: "Disagree", emoji: "👎" },
                    { value: "1", label: "Strongly Disagree", emoji: "😣" }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-secondary/50 transition-all cursor-pointer group">
                      <RadioGroupItem value={option.value} id={option.value} className="hover-scale" />
                      <Label 
                        htmlFor={option.value} 
                        className="flex-1 cursor-pointer text-base font-medium group-hover:text-primary transition-colors flex items-center gap-3"
                      >
                        <span className="text-2xl">{option.emoji}</span>
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  className="flex-1 hover-scale"
                  size="lg"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={isLastQuestion ? submitQuiz : nextQuestion}
                  disabled={!canProceed || loading}
                  className="flex-1 hover-scale font-semibold"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : isLastQuestion ? (
                    "Complete Quiz"
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          </Card>
        </div>
      </div>
  );
}