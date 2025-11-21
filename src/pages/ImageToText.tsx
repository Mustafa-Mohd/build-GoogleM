import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Upload, Sparkles, Loader2, FileText } from "lucide-react";
import { SidebarLayout } from "@/components/SidebarLayout";
import { toast } from "@/hooks/use-toast";
import { extractTextFromImage } from "@/lib/ocr";

const ImageToText = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setImage(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setExtractedText("");
    }
  };

  const handleExtract = async () => {
    if (!image) {
      toast({
        title: "No Image",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    
    try {
      toast({
        title: "Extracting Text...",
        description: "Processing image with OCR.",
      });

      const result = await extractTextFromImage(image);
      setExtractedText(result.text || "No text could be extracted from the image.");
      
      toast({
        title: "Extraction Complete",
        description: "Text has been extracted successfully.",
      });
    } catch (error) {
      console.error("OCR error:", error);
      toast({
        title: "Extraction Failed",
        description: error instanceof Error ? error.message : "Could not extract text from image.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-ai text-white">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-primary">Image to Text</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4 text-primary" />
                Extract text from images using OCR
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="shadow-card border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>
                Upload an image containing text to extract
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-xl p-6 text-center border-primary/30 hover:border-primary hover:bg-gradient-upload/50 transition-all">
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImage(null);
                        setPreview("");
                        setExtractedText("");
                      }}
                      className="border-primary/20"
                    >
                      Remove Image
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
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        asChild
                        className="bg-gradient-ai text-white hover:opacity-90"
                      >
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Image
                        </label>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {image && (
                <Button
                  onClick={handleExtract}
                  disabled={isExtracting}
                  className="w-full bg-gradient-ai text-white hover:opacity-90 font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all glow-effect disabled:opacity-50"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Extracting Text...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-5 w-5" />
                      Extract Text
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="shadow-card border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Extracted Text
              </CardTitle>
              <CardDescription>
                The text extracted from your image
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={extractedText || "Extracted text will appear here..."}
                readOnly
                className="min-h-[400px] bg-white/60 font-mono text-sm"
                placeholder="Upload an image and click 'Extract Text' to see results here..."
              />
              {extractedText && (
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(extractedText);
                      toast({
                        title: "Copied!",
                        description: "Text copied to clipboard.",
                      });
                    }}
                    className="border-primary/20"
                  >
                    Copy Text
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ImageToText;

