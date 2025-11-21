import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  url: string;
  gradient?: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, description, url, gradient, delay = 0 }: FeatureCardProps) {
  return (
    <Link to={url} className="group block h-full">
      <Card 
        className={cn(
          "h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400",
          "opacity-0 animate-fade-in-up bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm relative overflow-hidden",
          gradient
        )}
        style={{ animationDelay: `${delay}ms` }}
      >
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500" />
        
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white transition-all duration-500",
              "group-hover:scale-110 group-hover:rotate-6 shadow-lg group-hover:shadow-blue-500/50"
            )}>
              <Icon className="h-7 w-7" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-2 transition-all duration-300" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <CardDescription className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

