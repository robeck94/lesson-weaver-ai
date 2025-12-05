import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  Zap, 
  CheckCircle2, 
  Star,
  ArrowRight,
  Globe,
  Clock,
  Target,
  Lightbulb,
  GraduationCap
} from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Create complete ESL lessons in seconds with our advanced AI that understands pedagogy and language learning."
    },
    {
      icon: BookOpen,
      title: "PPP Structure",
      description: "Every lesson follows the proven Presentation-Practice-Production methodology for effective language acquisition."
    },
    {
      icon: Target,
      title: "CEFR Aligned",
      description: "Lessons automatically adapt vocabulary and complexity to A1-C2 proficiency levels."
    },
    {
      icon: Users,
      title: "Age Appropriate",
      description: "Content tailored for kids, teens, or adults with age-appropriate topics and activities."
    },
    {
      icon: Zap,
      title: "Interactive Activities",
      description: "Matching games, fill-in-the-blank, quizzes, role-plays, and more to keep students engaged."
    },
    {
      icon: CheckCircle2,
      title: "Quality Validated",
      description: "Built-in grammar checking, cultural sensitivity filtering, and content validation."
    }
  ];

  const benefits = [
    "Save 2-3 hours per lesson",
    "Professional slide designs",
    "Teacher notes included",
    "Instant image generation",
    "Save & reuse lessons",
    "Multiple activity types"
  ];

  const testimonials = [
    {
      quote: "This tool has completely transformed my lesson planning. What used to take hours now takes minutes!",
      author: "Sarah M.",
      role: "ESL Teacher, Japan",
      rating: 5
    },
    {
      quote: "The quality of generated content is impressive. My students love the interactive activities.",
      author: "David L.",
      role: "Language School Director, Spain",
      rating: 5
    },
    {
      quote: "Finally, a tool that understands the PPP methodology and creates pedagogically sound lessons.",
      author: "Maria K.",
      role: "TEFL Instructor, Brazil",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold">ESL Lesson Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/generator">
              <Button variant="ghost">Try Free</Button>
            </Link>
            <Link to="/generator">
              <Button className="gradient-hero text-primary-foreground">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl" />
        </div>
        
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center space-y-6 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Lesson Generation
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight">
              Create Engaging{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ESL Lessons
              </span>
              <br />in Minutes, Not Hours
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate complete, pedagogically-sound English lessons with interactive activities, 
              professional slides, and teacher notes. Powered by AI, designed by educators.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/generator">
                <Button size="lg" className="gradient-hero text-primary-foreground text-lg px-8 h-14 shadow-depth hover:shadow-float transition-all">
                  Start Creating Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>30-second generation</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span>10,000+ teachers worldwide</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Everything You Need to Teach Effectively
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI understands pedagogy, not just language. Every feature is designed 
              to help you create lessons that actually work.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-medium bg-card"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                Focus on Teaching,
                <br />
                <span className="text-primary">Not Lesson Planning</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Stop spending hours creating materials. Our AI generates complete, 
                classroom-ready lessons that follow best practices in language teaching.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Link to="/generator" className="inline-block mt-8">
                <Button size="lg" className="gradient-hero text-primary-foreground">
                  Try It Now - It's Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="relative">
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 border border-border shadow-depth overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                      <Lightbulb className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground font-medium">Live Preview Demo</p>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-xl gradient-hero shadow-float flex items-center justify-center animate-float-gentle">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-xl bg-accent shadow-depth flex items-center justify-center" style={{ animationDelay: '1s' }}>
                <Target className="w-8 h-8 text-accent-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Loved by Teachers Worldwide
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of educators who've transformed their lesson planning
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50 bg-card">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-3xl gradient-hero p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
                Ready to Transform Your Teaching?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Start creating professional ESL lessons today. No credit card required.
              </p>
              <Link to="/generator">
                <Button size="lg" variant="secondary" className="text-lg px-8 h-14 bg-background text-foreground hover:bg-background/90">
                  Start Creating - It's Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold">ESL Lesson Pro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ESL Lesson Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
