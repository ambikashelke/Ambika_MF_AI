import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { mockSignIn } from "@/lib/mockAuth";
import logo from "@/assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Attempt local mock auth (handles demo account + any signed-up users)
      mockSignIn(email, password);
      toast({ title: "Welcome back!", description: "Login successful." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err?.message ?? "Invalid credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fill in demo credentials instantly
  const fillDemo = () => {
    setEmail("demo@mindforge.ai");
    setPassword("MindForge123");
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md gradient-card rounded-2xl border border-border/50 shadow-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/"><img src={logo} alt="MindForge AI" className="h-16 mx-auto mb-4" /></Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Log in to your account</p>
        </div>

        {/* Demo credentials hint */}
        <div
          className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={fillDemo}
          title="Click to fill demo credentials"
        >
          <p className="font-semibold text-primary mb-1">🚀 Try the demo account</p>
          <p className="text-muted-foreground">Email: <span className="text-foreground">demo@mindforge.ai</span></p>
          <p className="text-muted-foreground">Password: <span className="text-foreground">MindForge123</span></p>
          <p className="text-xs text-muted-foreground mt-1 italic">Click this box to fill automatically</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-muted border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-muted border-border"
            />
          </div>
          <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
