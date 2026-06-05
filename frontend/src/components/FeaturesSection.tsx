import { Mic, Brain, ListChecks } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice to Text",
    description: "Simply speak your ideas. Our AI transcribes your voice into clean, structured text in real-time.",
  },
  {
    icon: Brain,
    title: "AI Mind Map Generator",
    description: "Watch your thoughts transform into interactive, visual mind maps with connected nodes and relationships.",
  },
  {
    icon: ListChecks,
    title: "Smart Task Generator",
    description: "Automatically convert mind map nodes into actionable tasks with priorities and checklists.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
      <div className="container relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything you need to <span className="text-gradient">organize your mind</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From raw ideas to structured action plans in seconds.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="gradient-card rounded-2xl p-8 border border-border/50 shadow-card hover:border-primary/30 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
