import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Code, Sparkles, Loader2, Copy, Check, Play } from "lucide-react";
import { SidebarLayout } from "@/components/SidebarLayout";
import { toast } from "@/hooks/use-toast";
import { callGeminiAPI } from "@/lib/gemini";

const CodeGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "typescript", label: "TypeScript" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "No Prompt",
        description: "Please enter a description of the code you want to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const codePrompt = `Generate ${language} code for the following requirement: ${prompt}\n\nPlease provide only the code without explanations, unless the code requires comments for clarity. Use best practices for ${language}.`;

      const code = await callGeminiAPI(codePrompt, {
        temperature: 0.2,
        maxTokens: 2048,
        systemInstruction: `You are an expert ${language} developer. Generate clean, well-structured code that follows best practices. Only return the code, no markdown formatting unless necessary.`,
      });

      // Clean up the response (remove markdown code blocks if present)
      const cleanedCode = code
        .replace(/```[\w]*\n?/g, '')
        .replace(/```$/g, '')
        .trim();

      setGeneratedCode(cleanedCode);
      toast({
        title: "Code Generated",
        description: "Code has been generated successfully.",
      });
    } catch (error) {
      console.error("Code generation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate code.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-ai text-white">
              <Code className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-primary">Code Generator</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4 text-primary" />
                Generate code with Google M
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="shadow-card border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Code Prompt</CardTitle>
              <CardDescription>
                Describe what code you want to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Programming Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-primary/20 rounded-md bg-background"
                  disabled={isGenerating}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <Textarea
                placeholder="e.g., Create a function that calculates the factorial of a number..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[300px] resize-none"
                disabled={isGenerating}
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-ai text-white hover:opacity-90 font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all glow-effect disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Code...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Generate Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="shadow-card border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Code</CardTitle>
                  <CardDescription>
                    AI-generated code in {languages.find(l => l.value === language)?.label}
                  </CardDescription>
                </div>
                {generatedCode && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    className="border-primary/20"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={generatedCode || "Generated code will appear here..."}
                readOnly
                className="min-h-[400px] bg-slate-900 text-green-400 font-mono text-sm resize-none"
                placeholder="Click 'Generate Code' to see results here..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default CodeGenerator;

