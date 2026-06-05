import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic features",
    features: ["5 voice recordings/day", "Basic mind maps", "Up to 10 tasks", "Community support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For power users and teams",
    features: ["Unlimited recordings", "Advanced AI mind maps", "Unlimited tasks", "Export to PDF & text", "Priority support", "Custom templates"],
    cta: "Start Pro Trial",
    highlighted: true,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="container">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Simple, transparent <span className="text-gradient">pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border shadow-card transition-all ${
                plan.highlighted
                  ? "gradient-card border-primary/50 glow-primary scale-105"
                  : "gradient-card border-border/50"
              }`}
            >
              {plan.highlighted && (
                <div className="text-xs font-semibold gradient-primary text-primary-foreground rounded-full px-3 py-1 w-fit mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="block mt-8">
                <Button variant={plan.highlighted ? "hero" : "outline"} className="w-full" size="lg">
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
