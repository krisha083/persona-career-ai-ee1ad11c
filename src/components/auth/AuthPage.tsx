import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain, Target, TrendingUp } from "lucide-react";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: "Please check your email for verification link."
      });
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        toast({
          title: "Email Not Verified",
          description: "Please check your email and click the verification link before signing in.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive"
        });
      }
    }
    setLoading(false);
  };

  const resendVerification = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Verification Email Sent",
        description: "Please check your email for the new verification link."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative p-5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl shadow-xl">
                <Brain className="h-12 w-12 text-primary" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-3">
            Persona Career AI
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover your ideal career path with AI-powered recommendations
          </p>
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Brain className="h-4 w-4 text-primary" />
                <span className="font-bold text-foreground">Smart</span>
              </div>
              <p className="text-xs text-muted-foreground">AI Analysis</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-bold text-foreground">Accurate</span>
              </div>
              <p className="text-xs text-muted-foreground">Predictions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-bold text-foreground">Growth</span>
              </div>
              <p className="text-xs text-muted-foreground">Focused</p>
            </div>
          </div>
        </div>

        <Card className="card-gradient border-0 shadow-2xl animate-scale-in">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription className="text-base">
              Sign in or create an account to get personalized career recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      minLength={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Personality Quiz
            </div>
            <div className="flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              AI Recommendations
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Career Roadmaps
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}