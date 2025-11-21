import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileSearch, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { SidebarLayout } from "@/components/SidebarLayout";
import { toast } from "@/hooks/use-toast";
import { callGeminiAPI } from "@/lib/gemini";

const TextSummarizer = () => {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No Text",
        description: "Please enter some text to summarize.",
        variant: "destructive",
      });
      return;
    }

    setIsSummarizing(true);
    
    try {
      const wordCount = inputText.split(/\s+/).length;
      const prompt = `Please provide a concise summary of the following text. The summary should be approximately ${Math.max(50, Math.floor(wordCount * 0.2))} words and capture the key points and main ideas:\n\n${inputText}`;

      const summary = await callGeminiAPI(prompt, {
        temperature: 0.3,
        maxTokens: 500,
        systemInstruction: "You are an expert at creating concise, accurate summaries that preserve the essential meaning and key information from the original text.",
      });

      setSummary(summary);
      toast({
        title: "Summary Complete",
        description: "Text has been summarized successfully.",
      });
    } catch (error) {
      console.error("Summarization error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to summarize text.",
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Summary copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-ai text-white">
              <FileSearch className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-primary">Text Summarizer</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4 text-primary" />
                Summarize long texts with Google M
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="shadow-card border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Enter Text</CardTitle>
              <CardDescription>
                Paste or type the text you want to summarize
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[400px] resize-none"
                disabled={isSummarizing}
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{inputText.split(/\s+/).filter(w => w.length > 0).length} words</span>
                <Button
                  variant="outline"
                  onClick={() => setInputText("")}
                  disabled={isSummarizing}
                  className="border-primary/20"
                >
                  Clear
                </Button>
              </div>
              <Button
                onClick={handleSummarize}
                disabled={isSummarizing || !inputText.trim()}
                className="w-full bg-gradient-ai text-white hover:opacity-90 font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all glow-effect disabled:opacity-50"
              >
                {isSummarizing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Summarize Text
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
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>
                    AI-generated summary of your text
                  </CardDescription>
                </div>
                {summary && (
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
                value={summary || "Summary will appear here..."}
                readOnly
                className="min-h-[400px] bg-white/60 font-mono text-sm resize-none"
                placeholder="Click 'Summarize Text' to generate a summary..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default TextSummarizer;

