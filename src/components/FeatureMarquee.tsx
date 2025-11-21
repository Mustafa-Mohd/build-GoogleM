import { useEffect, useState } from "react";
import { 
  CreditCard, 
  MessageSquare, 
  FileText, 
  Image as ImageIcon,
  FileSearch,
  Code,
  Zap,
  Languages
} from "lucide-react";

const features = [
  { icon: CreditCard, name: "Card Scanner", description: "AI-powered business card scanning" },
  { icon: MessageSquare, name: "AI Chat", description: "Chat with Google M assistant" },
  { icon: FileText, name: "Document Analyzer", description: "Analyze documents with AI" },
  { icon: ImageIcon, name: "Image to Text", description: "Extract text from images" },
  { icon: FileSearch, name: "Text Summarizer", description: "Summarize long texts instantly" },
  { icon: Code, name: "Code Generator", description: "Generate code from descriptions" },
  { icon: Zap, name: "Quick Actions", description: "Improve and transform text" },
  { icon: Languages, name: "Translator", description: "Translate between 11 languages" },
];

export function FeatureMarquee() {
  const [duplicatedFeatures, setDuplicatedFeatures] = useState(features);

  useEffect(() => {
    // Duplicate features for seamless loop
    setDuplicatedFeatures([...features, ...features, ...features]);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-blue-100 via-red-100 to-yellow-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border-t-2 border-blue-200 dark:border-slate-700 py-6">
      <div className="flex animate-marquee whitespace-nowrap will-change-transform">
        {duplicatedFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="inline-flex items-center gap-4 mx-6 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 backdrop-blur-sm border-2 border-blue-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all hover:scale-105"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{feature.name}</span>
                <span className="text-xs text-slate-600 dark:text-slate-400">{feature.description}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

