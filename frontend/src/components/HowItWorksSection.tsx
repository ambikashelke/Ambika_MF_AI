import { Mic, Brain, ListChecks, ArrowRight } from "lucide-react";

const steps = [
  { icon: Mic, label: "Speak", description: "Record your thoughts using voice input" },
  { icon: Brain, label: "Map", description: "AI generates an interactive mind map" },
  { icon: ListChecks, label: "Act", description: "Get actionable tasks from your ideas" },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 gradient-hero">
      <div className="container">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            How <span className="text-gradient">MindForge AI</span> Works
          </h2>
          <p className="text-muted-foreground text-lg">Three simple steps to turn chaos into clarity.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4">
              <div className="gradient-card rounded-2xl p-8 border border-border/50 shadow-card text-center w-64 hover:border-primary/40 transition-all">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-sm text-primary font-semibold mb-1">Step {i + 1}</div>
                <h3 className="text-xl font-bold mb-2">{step.label}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block w-8 h-8 text-primary/50" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
