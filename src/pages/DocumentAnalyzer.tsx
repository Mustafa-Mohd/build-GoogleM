import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Sparkles, File, Loader2 } from "lucide-react";
import { SidebarLayout } from "@/components/SidebarLayout";
import { toast } from "@/hooks/use-toast";
import { callGeminiVisionAPI, callGeminiAPI } from "@/lib/gemini";

const DocumentAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysis("");
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "No File",
        description: "Please upload a document first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const prompt = `Analyze this document (${file.name}) and provide a comprehensive analysis. Include:
1. Document type and format
2. Key information and main topics
3. Important dates, names, or facts
4. Summary of the content
5. Any notable patterns or insights

Please provide a detailed analysis in a structured format.`;

      let analysis: string;

      // Check if file is an image
      if (file.type.startsWith('image/')) {
        // Use vision API for images
        analysis = await callGeminiVisionAPI(prompt, [file], {
          temperature: 0.3,
          maxTokens: 2048,
        });
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        // Read text file and analyze
        const text = await file.text();
        analysis = await callGeminiAPI(
          `${prompt}\n\nDocument Content:\n${text}`,
          {
            temperature: 0.3,
            maxTokens: 2048,
          }
        );
      } else {
        // For other file types, try to read as text or use vision if it's an image-like format
        try {
          const text = await file.text();
          analysis = await callGeminiAPI(
            `${prompt}\n\nDocument Content:\n${text}`,
            {
              temperature: 0.3,
              maxTokens: 2048,
            }
          );
        } catch {
          // If reading as text fails, inform user
          throw new Error('Please upload an image file (.jpg, .png, etc.) or a text file (.txt) for analysis.');
        }
      }

      setAnalysis(`Document Analysis Results for: ${file.name}\n\nFile Type: ${file.type || "Unknown"}\nFile Size: ${(file.size / 1024).toFixed(2)} KB\n\n${analysis}`);
      
      toast({
        title: "Analysis Complete",
        description: "Document has been analyzed successfully.",
      });
    } catch (error) {
      console.error("Document analysis error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze document.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-ai text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-primary">Document Analyzer</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4 text-primary" />
                Analyze documents with Google M
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-card border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>
              Upload a document and let Google M analyze it for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="border-2 border-dashed rounded-xl p-8 text-center border-primary/30 hover:border-primary hover:bg-gradient-upload/50 transition-all">
              {file ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <File className="h-12 w-12 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setFile(null)}
                    className="border-primary/20"
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-full bg-gradient-ai/10 mx-auto w-fit">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.txt"
                      className="hidden"
                      id="document-upload"
                    />
                    <Button
                      asChild
                      className="bg-gradient-ai text-white hover:opacity-90"
                    >
                      <label htmlFor="document-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </label>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Analyze Button */}
            {file && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-gradient-ai text-white hover:opacity-90 font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all glow-effect disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing with Google M...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze Document
                  </>
                )}
              </Button>
            )}

            {/* Analysis Results */}
            {analysis && (
              <Card className="border-2 border-primary/20 bg-gradient-upload/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={analysis}
                    readOnly
                    className="min-h-[300px] bg-white/60 font-mono text-sm"
                  />
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default DocumentAnalyzer;

