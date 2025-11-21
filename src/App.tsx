import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Data from "./pages/Data";
import Dashboard from "./pages/Dashboard";
import CardScanner from "./pages/CardScanner";
import AIChat from "./pages/AIChat";
import DocumentAnalyzer from "./pages/DocumentAnalyzer";
import ImageToText from "./pages/ImageToText";
import TextSummarizer from "./pages/TextSummarizer";
import CodeGenerator from "./pages/CodeGenerator";
import QuickActions from "./pages/QuickActions";
import Translator from "./pages/Translator";
import FlashCards from "./pages/FlashCards";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/data" element={<Data />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
          {/* Google M Features */}
          <Route path="/card-scanner" element={<CardScanner />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/document-analyzer" element={<DocumentAnalyzer />} />
          <Route path="/image-to-text" element={<ImageToText />} />
          <Route path="/text-summarizer" element={<TextSummarizer />} />
          <Route path="/code-generator" element={<CodeGenerator />} />
          <Route path="/quick-actions" element={<QuickActions />} />
          <Route path="/translator" element={<Translator />} />
          <Route path="/flash-cards" element={<FlashCards />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
