import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Languages, Sparkles, Loader2, Copy, Check, ArrowRightLeft } from "lucide-react";
import { SidebarLayout } from "@/components/SidebarLayout";
import { toast } from "@/hooks/use-toast";
import { callGeminiAPI } from "@/lib/gemini";

const Translator = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "pt", label: "Portuguese" },
    { value: "zh", label: "Chinese" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
    { value: "ar", label: "Arabic" },
    { value: "hi", label: "Hindi" },
  ];

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No Text",
        description: "Please enter some text to translate.",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    
    try {
      const sourceLangName = languages.find(l => l.value === sourceLang)?.label || sourceLang;
      const targetLangName = languages.find(l => l.value === targetLang)?.label || targetLang;

      const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}. Preserve the meaning, tone, and context. Only return the translated text without any additional explanations or notes:\n\n${inputText}`;

      const translation = await callGeminiAPI(prompt, {
        temperature: 0.3,
        maxTokens: 2048,
        systemInstruction: `You are an expert translator. Translate accurately while preserving the original meaning, tone, and context. Return only the translated text.`,
      });

      setTranslatedText(translation.trim());
      toast({
        title: "Translation Complete",
        description: `Text translated from ${sourceLangName} to ${targetLangName}.`,
      });
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to translate text.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Translation copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-ai text-white">
              <Languages className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-primary">Translator</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4 text-primary" />
                Translate text with Google M
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-card border-2 border-primary/20 mb-6">
          <CardHeader>
            <CardTitle>Language Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">From</label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full px-3 py-2 border border-primary/20 rounded-md bg-background"
                  disabled={isTranslating}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwap}
                disabled={isTranslating}
                className="mt-6 border-primary/20"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">To</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full px-3 py-2 border border-primary/20 rounded-md bg-background"
                  disabled={isTranslating}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="shadow-card border-2 border-primary/20">
            <CardHeader>
              <CardTitle>
                {languages.find(l => l.value === sourceLang)?.label || "Source"} Text
              </CardTitle>
              <CardDescription>
                Enter the text you want to translate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter text to translate..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[300px] resize-none"
                disabled={isTranslating}
              />
              <Button
                onClick={handleTranslate}
                disabled={isTranslating || !inputText.trim()}
                className="w-full bg-gradient-ai text-white hover:opacity-90 font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all glow-effect disabled:opacity-50"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Languages className="mr-2 h-5 w-5" />
                    Translate
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
                  <CardTitle>
                    {languages.find(l => l.value === targetLang)?.label || "Target"} Translation
                  </CardTitle>
                  <CardDescription>
                    Translated text output
                  </CardDescription>
                </div>
                {translatedText && (
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
                value={translatedText || "Translation will appear here..."}
                readOnly
                className="min-h-[300px] bg-white/60 font-mono text-sm resize-none"
                placeholder="Click 'Translate' to see results here..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Translator;

