import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-illustration.jpg";
import { Mic, Brain, CheckSquare } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center gradient-hero overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20" style={{ background: "var(--gradient-glow)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, hsl(270, 60%, 55%, 0.2), transparent 70%)" }} />

      <div className="container relative z-10 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Brain className="w-4 h-4" />
              AI-Powered Mind Mapping
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Turn your thoughts into{" "}
              <span className="text-gradient">structured action</span>
              {" "}— instantly.
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Record your ideas with voice, let AI organize them into interactive mind maps, and generate actionable task lists automatically.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button variant="hero" size="xl">Try for Free</Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="hero-outline" size="xl">See How it Works</Button>
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Mic className="w-4 h-4 text-primary" /> Voice Input</div>
              <div className="flex items-center gap-2"><Brain className="w-4 h-4 text-secondary" /> AI Mind Maps</div>
              <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-primary" /> Task Lists</div>
            </div>
          </div>
          <div className="relative animate-float">
            <div className="rounded-2xl overflow-hidden glow-primary shadow-card">
              <img src={heroImage} alt="MindForge AI - AI Mind Mapping Visualization" width={1280} height={720} className="w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
