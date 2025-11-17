import { useAuth } from "@/hooks/useAuth";
import AuthPage from "@/components/auth/AuthPage";
import Dashboard from "@/components/dashboard/Dashboard";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full h-20 w-20 bg-primary/20 mx-auto blur-xl"></div>
            <div className="relative animate-spin rounded-full h-20 w-20 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
          </div>
          <p className="text-lg font-medium text-foreground mb-2">Loading your experience</p>
          <p className="text-sm text-muted-foreground">Please wait...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthPage />;
};

export default Index;