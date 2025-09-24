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
import { Loader2, Brain, ArrowLeft, ArrowRight } from "lucide-react";
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
    if (!user) return;
    
    setLoading(true);
    
    try {
      const riasecScores = calculateRIASECScores();
      const personalityType = getPersonalityType(riasecScores);

      const { error } = await supabase
        .from('quiz_results')
        .upsert({
          user_id: user.id,
          quiz_answers: answers,
          riasec_scores: riasecScores,
          personality_type: personalityType
        });

      if (error) throw error;

      toast({
        title: "Quiz Completed!",
        description: `Your personality type is ${personalityType}. You can now view career recommendations.`
      });

      navigate('/recommendations');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save quiz results. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const retakeQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setExistingResult(null);
  };

  if (existingResult) {
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
                  <Brain className="h-5 w-5 mr-2 text-primary" />
                  Quiz Already Completed
                </CardTitle>
                <CardDescription>
                  You have already completed the career assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge variant="default" className="text-lg p-2">
                    Your Personality Type: {existingResult.personality_type}
                  </Badge>
                </div>
                
                <div className="grid gap-2">
                  <h4 className="font-semibold">Your RIASEC Scores:</h4>
                  {Object.entries(existingResult.riasec_scores).map(([type, score]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="font-medium">{type}</span>
                      <Badge variant="outline">{score as number}/25</Badge>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => navigate('/recommendations')} className="flex-1">
                    View Recommendations
                  </Button>
                  <Button variant="outline" onClick={retakeQuiz} className="flex-1">
                    Retake Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / RIASEC_QUESTIONS.length) * 100;
  const isLastQuestion = currentQuestion === RIASEC_QUESTIONS.length - 1;
  const canProceed = answers[RIASEC_QUESTIONS[currentQuestion].id] !== undefined;

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
                <Brain className="h-5 w-5 mr-2 text-primary" />
                Career Assessment Quiz
              </CardTitle>
              <CardDescription>
                Answer these questions honestly to discover your career interests
              </CardDescription>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Question {currentQuestion + 1} of {RIASEC_QUESTIONS.length}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {RIASEC_QUESTIONS[currentQuestion].text}
                </h3>
                
                <RadioGroup
                  value={answers[RIASEC_QUESTIONS[currentQuestion].id]?.toString() || ""}
                  onValueChange={handleAnswer}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="strongly-disagree" />
                    <Label htmlFor="strongly-disagree">Strongly Disagree</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="disagree" />
                    <Label htmlFor="disagree">Disagree</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="neutral" />
                    <Label htmlFor="neutral">Neutral</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="agree" />
                    <Label htmlFor="agree">Agree</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="strongly-agree" />
                    <Label htmlFor="strongly-agree">Strongly Agree</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {isLastQuestion ? (
                  <Button
                    onClick={submitQuiz}
                    disabled={!canProceed || loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    disabled={!canProceed}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}