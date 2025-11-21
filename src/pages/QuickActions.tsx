import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Sparkles, Loader2, Copy, Check, Lightbulb, FileText, MessageSquare } from "lucide-react";
import { SidebarLayout } from "@/components/SidebarLayout";
import { toast } from "@/hooks/use-toast";
import { callGeminiAPI } from "@/lib/gemini";

const QuickActions = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [action, setAction] = useState("improve");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const actions = [
    { value: "improve", label: "Improve Writing", icon: Lightbulb, description: "Enhance and improve your text" },
    { value: "expand", label: "Expand Text", icon: FileText, description: "Expand and elaborate on your text" },
    { value: "rewrite", label: "Rewrite", icon: MessageSquare, description: "Rewrite in a different style" },
  ];

  const handleProcess = async () => {
    if (!input.trim()) {
      toast({
        title: "No Input",
        description: "Please enter some text to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const actionConfig = actions.find(a => a.value === action);
      let prompt = "";
      let systemInstruction = "";

      switch (action) {
        case "improve":
          prompt = `Improve the following text by enhancing clarity, grammar, style, and overall quality while preserving the original meaning:\n\n${input}`;
          systemInstruction = "You are an expert editor. Improve the text while maintaining its original intent and meaning.";
          break;
        case "expand":
          prompt = `Expand and elaborate on the following text, adding more detail, context, and depth:\n\n${input}`;
          systemInstruction = "You are a skilled writer. Expand the text with relevant details while staying true to the original message.";
          break;
        case "rewrite":
          prompt = `Rewrite the following text in a different style while preserving the core message:\n\n${input}`;
          systemInstruction = "You are a versatile writer. Rewrite the text in a fresh, engaging style while keeping the essential meaning.";
          break;
        default:
          prompt = `Process the following text: ${input}`;
      }

      const result = await callGeminiAPI(prompt, {
        temperature: 0.7,
        maxTokens: 2048,
        systemInstruction,
      });

      setResult(result);
      toast({
        title: "Processing Complete",
        description: `Text has been ${actionConfig?.label.toLowerCase()}ed successfully.`,
      });
    } catch (error) {
      console.error("Text processing error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process text.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Result copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-ai text-white">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-primary">Quick Actions</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4 text-primary" />
                Quick AI-powered text transformations
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-card border-2 border-primary/20 mb-6">
          <CardHeader>
            <CardTitle>Select Action</CardTitle>
            <CardDescription>
              Choose what you want to do with your text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {actions.map((act) => {
                const Icon = act.icon;
                return (
                  <Button
                    key={act.value}
                    variant={action === act.value ? "default" : "outline"}
                    className={`h-auto p-4 flex flex-col items-center gap-2 ${
                      action === act.value ? "bg-primary" : "border-primary/20"
                    }`}
                    onClick={() => setAction(act.value)}
                    disabled={isProcessing}
                  >
                    <Icon className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-semibold">{act.label}</div>
                      <div className="text-xs opacity-70">{act.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="shadow-card border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
              <CardDescription>
                Enter the text you want to process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your text here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[300px] resize-none"
                disabled={isProcessing}
              />
              <Button
                onClick={handleProcess}
                disabled={isProcessing || !input.trim()}
                className="w-full bg-gradient-ai text-white hover:opacity-90 font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all glow-effect disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Process Text
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
                  <CardTitle>Result</CardTitle>
                  <CardDescription>
                    Processed text output
                  </CardDescription>
                </div>
                {result && (
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
                value={result || "Result will appear here..."}
                readOnly
                className="min-h-[300px] bg-white/60 font-mono text-sm resize-none"
                placeholder="Click 'Process Text' to see results here..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default QuickActions;

