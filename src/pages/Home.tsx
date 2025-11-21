import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { FeatureCard } from "@/components/FeatureCard";
import { FeatureMarquee } from "@/components/FeatureMarquee";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  MessageSquare, 
  FileText, 
  Image as ImageIcon,
  FileSearch,
  Code,
  Zap,
  Languages,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen
} from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "Card Scanner",
    description: "Scan business cards with AI-powered OCR. Automatically extract contact information, company details, and more with Google M.",
    url: "/card-scanner",
    gradient: "bg-gradient-to-br from-blue-500/10 to-blue-600/10",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description: "Chat with Google M. Get instant answers, assistance, and intelligent responses to your questions.",
    url: "/ai-chat",
    gradient: "bg-gradient-to-br from-red-500/10 to-red-600/10",
  },
  {
    icon: FileText,
    title: "Document Analyzer",
    description: "Analyze documents with Gemini Vision API. Extract key information, summarize content, and get insights from your documents.",
    url: "/document-analyzer",
    gradient: "bg-gradient-to-br from-yellow-500/10 to-yellow-600/10",
  },
  {
    icon: ImageIcon,
    title: "Image to Text",
    description: "Extract text from images using advanced OCR technology. Perfect for digitizing printed documents and images.",
    url: "/image-to-text",
    gradient: "bg-gradient-to-br from-green-500/10 to-green-600/10",
  },
  {
    icon: FileSearch,
    title: "Text Summarizer",
    description: "Summarize long texts instantly. Get concise summaries that capture key points and main ideas using AI.",
    url: "/text-summarizer",
    gradient: "bg-gradient-to-br from-blue-500/10 to-purple-600/10",
  },
  {
    icon: Code,
    title: "Code Generator",
    description: "Generate code from natural language descriptions. Support for JavaScript, Python, TypeScript, and more.",
    url: "/code-generator",
    gradient: "bg-gradient-to-br from-purple-500/10 to-pink-600/10",
  },
  {
    icon: Zap,
    title: "Quick Actions",
    description: "Improve, expand, or rewrite text instantly. Transform your writing with AI-powered text processing.",
    url: "/quick-actions",
    gradient: "bg-gradient-to-br from-orange-500/10 to-red-600/10",
  },
  {
    icon: Languages,
    title: "Translator",
    description: "Translate text between 11 languages. Accurate, context-aware translations powered by Google M.",
    url: "/translator",
    gradient: "bg-gradient-to-br from-cyan-500/10 to-blue-600/10",
  },
  {
    icon: BookOpen,
    title: "Flash Cards",
    description: "Create colorful flash cards from any topic or text. Study smarter with AI-generated questions and answers.",
    url: "/flash-cards",
    gradient: "bg-gradient-to-br from-violet-500/10 to-purple-600/10",
  },
];

const benefits = [
  "Powered by Google M",
  "8 Powerful Features",
  "Real-time Processing",
  "Secure & Private",
  "Easy to Use",
  "Free to Start",
];

export default function Home() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set(['hero']));
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section');
            if (sectionId) {
              setVisibleSections((prev) => new Set(prev).add(sectionId));
            }
          }
        });
      },
      { threshold: 0.05, rootMargin: '50px' }
    );

    const refs = [
      { ref: heroRef, id: 'hero' },
      { ref: featuresRef, id: 'features' },
      { ref: statsRef, id: 'stats' },
    ];

    refs.forEach(({ ref, id }) => {
      if (ref.current) {
        ref.current.setAttribute('data-section', id);
        observer.observe(ref.current);
      }
    });

    return () => {
      refs.forEach(({ ref }) => {
        if (ref.current) observer.unobserve(ref.current);
      });
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-16 sm:py-24 lg:py-32"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        {/* Animated background blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-400/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-yellow-400/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`max-w-6xl mx-auto text-center transition-all duration-1000 ${visibleSections.has('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 to-red-500/10 border-2 border-blue-500/20 mb-8 shadow-lg backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Powered by Google M</span>
            </div>
            
            <div className="mb-8 px-4 overflow-visible">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-600 via-red-500 to-yellow-500 bg-clip-text text-transparent animate-gradient break-words inline-block" style={{ lineHeight: '1.2', paddingBottom: '0.3em', paddingTop: '0.1em' }}>
                Google M
              </h1>
            </div>
              
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-200 mb-4 leading-relaxed px-4">
                Your AI-Powered Productivity Suite
              </p>
              <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto px-4">
                Harness the power of Google M with 8 advanced features designed to transform your workflow
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mb-12 max-w-4xl mx-auto">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-blue-500/20 hover:border-blue-500/50 shadow-md hover:shadow-lg transition-all hover:scale-105 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-105 rounded-xl font-semibold w-full sm:w-auto"
                >
                  <Link to="/card-scanner" className="flex items-center justify-center">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 rounded-xl font-semibold hover:shadow-lg transition-all w-full sm:w-auto"
                >
                  <Link to="/ai-chat" className="flex items-center justify-center">
                    Try AI Chat
                  </Link>
                </Button>
              </div>
          </div>
        </div>
      </section>

        {/* Features Section */}
        <section 
          ref={featuresRef}
          className="py-16 sm:py-24 lg:py-32 bg-white dark:bg-slate-900"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-16 sm:mb-20 transition-all duration-1000 ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-block px-6 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6 shadow-sm">
                FEATURES
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent px-4">
                Powerful AI Tools
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed px-4">
                Everything you need to boost productivity, streamline workflows, and unlock the power of Google M
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 px-4 sm:px-0">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.url}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  url={feature.url}
                  gradient={feature.gradient}
                  delay={visibleSections.has('features') ? index * 100 : 0}
                />
              ))}
            </div>

            <div className="text-center mt-16">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 border-2 border-green-500/30">
                <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  All features are ready to use. Click any card to get started!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section 
          ref={statsRef}
          className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-blue-50 via-red-50/30 to-yellow-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 border-y border-blue-200 dark:border-slate-700"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 transition-all duration-1000 ${visibleSections.has('stats') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-center p-6 md:p-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-800 hover:border-blue-500 hover:shadow-2xl transition-all hover:scale-105 transform">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-3">9</div>
                <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-semibold">AI Features</div>
              </div>
              <div className="text-center p-6 md:p-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-red-200 dark:border-red-800 hover:border-red-500 hover:shadow-2xl transition-all hover:scale-105 transform">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-3">100%</div>
                <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-semibold">AI Powered</div>
              </div>
              <div className="text-center p-6 md:p-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-yellow-200 dark:border-yellow-800 hover:border-yellow-500 hover:shadow-2xl transition-all hover:scale-105 transform">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent mb-3">11</div>
                <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-semibold">Languages</div>
              </div>
              <div className="text-center p-6 md:p-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-green-200 dark:border-green-800 hover:border-green-500 hover:shadow-2xl transition-all hover:scale-105 transform">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-3">∞</div>
                <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-semibold">Possibilities</div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <FeatureMarquee />
      </div>
    );
}

