import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBusinessCard } from "@/integrations/firebase/firestore";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { toast } from "@/hooks/use-toast";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, Loader2, ScanLine, Sparkles, Brain, Zap, Camera, FileText } from "lucide-react";
import { extractTextFromImages, extractDataWithOpenAIVision } from "@/lib/ocr";
import { parseCardDataFromText, enhanceParsedDataWithAI, ParsedCardData } from "@/lib/dataParser";
import { OCRConfirmationDialog } from "@/components/OCRConfirmationDialog";
import { CameraCapture } from "@/components/CameraCapture";

interface CardFormData {
  full_name: string;
  company: string;
  designation: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  notes: string;
  purpose?: string;
  [key: string]: string | undefined; // Allow dynamic fields
}

const Upload = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { uploadImage, uploading } = useCloudinaryUpload();
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>("");
  const [backPreview, setBackPreview] = useState<string>("");
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCardData>({});
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});
  const [ocrProgress, setOcrProgress] = useState<string>("");
  const [showCameraFront, setShowCameraFront] = useState(false);
  const [showCameraBack, setShowCameraBack] = useState(false);
  const [isDraggingFront, setIsDraggingFront] = useState(false);
  const [isDraggingBack, setIsDraggingBack] = useState(false);

  const form = useForm<CardFormData>({
    defaultValues: {
      full_name: "",
      company: "",
      designation: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      notes: "",
      purpose: "",
    },
  });

  const createCardMutation = useMutation({
    mutationFn: async (data: Omit<CardFormData, 'purpose'> & { front_image_url: string; back_image_url?: string; notes?: string }) => {
      // Build data object, only including fields that have values (not empty strings or undefined)
      const cardData: any = {
        full_name: data.full_name,
        front_image_url: data.front_image_url,
      };

      // Only add optional fields if they have actual values
      if (data.company && data.company.trim()) cardData.company = data.company.trim();
      if (data.designation && data.designation.trim()) cardData.designation = data.designation.trim();
      if (data.email && data.email.trim()) cardData.email = data.email.trim();
      if (data.phone && data.phone.trim()) cardData.phone = data.phone.trim();
      if (data.website && data.website.trim()) cardData.website = data.website.trim();
      if (data.address && data.address.trim()) cardData.address = data.address.trim();
      if (data.notes && data.notes.trim()) cardData.notes = data.notes.trim();
      if (data.back_image_url && data.back_image_url.trim()) cardData.back_image_url = data.back_image_url.trim();

      await addBusinessCard(cardData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-cards"] });
      toast({
        title: "Success!",
        description: "Business card uploaded successfully.",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save business card. Check console for details.",
        variant: "destructive",
      });
    },
  });

  // Manual OCR processing function
  const processOCR = async () => {
    if (!frontImage) {
      toast({
        title: "No Image",
        description: "Please upload at least the front image first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessingOCR(true);
    setOcrProgress("Initializing OCR engine...");
    
    try {
      toast({
        title: "Extracting Text...",
        description: "Running OCR on business card images.",
      });
      
      // Collect images to process
      const imagesToProcess: File[] = [frontImage];
      if (backImage) {
        imagesToProcess.push(backImage);
      }
      
      const openAIApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      let parsed: ParsedCardData = {};
      
      // If OpenAI API key is available, use Vision API directly (most accurate)
      if (openAIApiKey) {
        setOcrProgress("Analyzing business card with AI...");
        
        try {
          // Use OpenAI Vision API directly for best accuracy
          parsed = await extractDataWithOpenAIVision(imagesToProcess, openAIApiKey);
          
          // Validate that important fields were extracted
          const hasImportantFields = parsed.company || parsed.full_name || parsed.phone || parsed.email;
          
          if (!hasImportantFields) {
            // If no important fields, try OCR as backup
            setOcrProgress("Enhancing extraction with OCR backup...");
            const ocrResult = await extractTextFromImages(imagesToProcess);
            if (ocrResult.text && ocrResult.text.trim().length > 0) {
              // Parse with regex first
              const ocrParsed = parseCardDataFromText(ocrResult.text);
              // Fill in any missing important fields from OCR
              if (!parsed.company && ocrParsed.company) parsed.company = ocrParsed.company;
              if (!parsed.full_name && ocrParsed.full_name) parsed.full_name = ocrParsed.full_name;
              if (!parsed.phone && ocrParsed.phone) parsed.phone = ocrParsed.phone;
              if (!parsed.email && ocrParsed.email) parsed.email = ocrParsed.email;
              // Fill other fields
              Object.entries(ocrParsed).forEach(([key, value]) => {
                if (value && !parsed[key]) {
                  parsed[key] = value;
                }
              });
              // Enhance with AI
              parsed = await enhanceParsedDataWithAI(ocrResult.text, parsed, openAIApiKey);
            }
          }
        } catch (visionError) {
          console.warn('OpenAI Vision failed, falling back to OCR:', visionError);
          // Show user-friendly message when quota/rate limit occurs
          const message = visionError instanceof Error ? visionError.message : String(visionError);
          if (message.includes('429') || message.toLowerCase().includes('insufficient_quota') || message.includes('OPENAI_VISION_COOLDOWN')) {
            toast({
              title: "AI quota reached",
              description: "Switching to OCR fallback for this extraction.",
            });
          }
          
          // Fallback to OCR if Vision API fails
          setOcrProgress("Processing images with OCR...");
          const ocrResult = await extractTextFromImages(imagesToProcess);
          
          if (!ocrResult.text || ocrResult.text.trim().length === 0) {
            throw new Error("No text could be extracted from the images");
          }
          
          setOcrProgress("Cleaning and parsing OCR text with AI...");
          
          // Parse with regex first
          parsed = parseCardDataFromText(ocrResult.text);
          
          // Then enhance with AI
          parsed = await enhanceParsedDataWithAI(ocrResult.text, parsed, openAIApiKey);
        }
      } else {
        // No OpenAI key - use OCR only
        setOcrProgress("Processing images with OCR...");
        const ocrResult = await extractTextFromImages(imagesToProcess);
        
        if (!ocrResult.text || ocrResult.text.trim().length === 0) {
          throw new Error("No text could be extracted from the images");
        }
        
        setOcrProgress("Parsing extracted text...");
        parsed = parseCardDataFromText(ocrResult.text);
      }
      
      // Separate standard fields from dynamic fields
      const standardFields: ParsedCardData = {};
      const newDynamicFields: Record<string, string> = {};
      
      Object.entries(parsed).forEach(([key, value]) => {
        if (value && typeof value === 'string' && value.trim().length > 0) {
          const standardFieldKeys = ['full_name', 'company', 'designation', 'email', 'phone', 'website', 'address', 'purpose'];
          if (standardFieldKeys.includes(key)) {
            standardFields[key] = value.trim();
          } else {
            // This is a dynamic field
            newDynamicFields[key] = value.trim();
          }
        }
      });
      
      setParsedData(standardFields);
      setDynamicFields(newDynamicFields);
      
      // If we have extracted data, show confirmation dialog
      const allData = { ...standardFields, ...newDynamicFields };
      if (Object.values(allData).some(value => value && value.trim() !== '')) {
        setShowConfirmationDialog(true);
        toast({
          title: "Data Extracted!",
          description: "Review the extracted information below.",
        });
      } else {
        toast({
          title: "No Data Found",
          description: "Could not extract structured data. Please fill manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      toast({
        title: "OCR Processing Failed",
        description: error instanceof Error ? error.message : "Could not extract text. Please fill manually.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingOCR(false);
      setOcrProgress("");
    }
  };

  const handleFrontImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, false);
    }
  };

  const handleBackImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file, true);
    }
  };

  const handleCameraCapture = (file: File, isBack: boolean = false) => {
    if (isBack) {
      setBackImage(file);
      setBackPreview(URL.createObjectURL(file));
    } else {
      setFrontImage(file);
      setFrontPreview(URL.createObjectURL(file));
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, isBack: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBack) {
      setIsDraggingBack(true);
    } else {
      setIsDraggingFront(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent, isBack: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBack) {
      setIsDraggingBack(false);
    } else {
      setIsDraggingFront(false);
    }
  };

  const handleDrop = (e: React.DragEvent, isBack: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isBack) {
      setIsDraggingBack(false);
    } else {
      setIsDraggingFront(false);
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if it's an image
      if (file.type.startsWith('image/')) {
        if (isBack) {
          setBackImage(file);
          setBackPreview(URL.createObjectURL(file));
        } else {
          setFrontImage(file);
          setFrontPreview(URL.createObjectURL(file));
        }
        toast({
          title: "Image Dropped",
          description: `${isBack ? 'Back' : 'Front'} image loaded successfully.`,
        });
      } else {
        toast({
          title: "Invalid File",
          description: "Please drop an image file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = (file: File, isBack: boolean = false) => {
    if (file && file.type.startsWith('image/')) {
      if (isBack) {
        setBackImage(file);
        setBackPreview(URL.createObjectURL(file));
      } else {
        setFrontImage(file);
        setFrontPreview(URL.createObjectURL(file));
      }
    } else {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmExtractedData = () => {
    // Pre-fill form with ALL extracted data comprehensively
    if (parsedData.full_name) form.setValue("full_name", parsedData.full_name);
    if (parsedData.company) form.setValue("company", parsedData.company);
    if (parsedData.designation) form.setValue("designation", parsedData.designation);
    if (parsedData.email) form.setValue("email", parsedData.email);
    if (parsedData.phone) form.setValue("phone", parsedData.phone);
    if (parsedData.website) form.setValue("website", parsedData.website);
    if (parsedData.address) form.setValue("address", parsedData.address);
    if (parsedData.purpose) form.setValue("purpose", parsedData.purpose);
    
    // Combine ALL dynamic fields into notes with proper formatting
    const dynamicFieldsText = Object.entries(dynamicFields)
      .filter(([_, value]) => value && value.trim().length > 0)
      .map(([key, value]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `${label}: ${value}`;
      })
      .join('\n');
    
    if (dynamicFieldsText) {
      const currentNotes = form.getValues("notes") || "";
      form.setValue("notes", currentNotes ? `${currentNotes}\n\nAdditional Information:\n${dynamicFieldsText}` : `Additional Information:\n${dynamicFieldsText}`);
    }
    
    setShowConfirmationDialog(false);
    setParsedData({});
    setDynamicFields({});
    
    toast({
      title: "Data Pre-filled!",
      description: "All extracted information has been filled in. Please review and edit if needed.",
    });
  };

  const handleCancelExtractedData = () => {
    setShowConfirmationDialog(false);
    setParsedData({});
  };

  const onSubmit = async (data: CardFormData) => {
    if (!frontImage) {
      toast({
        title: "Error",
        description: "Please upload the front image of the card.",
        variant: "destructive",
      });
      return;
    }

    // Try to upload images if possible, but do not block saving if upload fails
    let frontUrl: string | null = null;
    try {
      frontUrl = await uploadImage(frontImage);
    } catch {
      // ignore
    }

    let backUrl: string | null = null;
    if (backImage) {
      try {
        backUrl = await uploadImage(backImage);
      } catch {
        // ignore
      }
    }

    // Combine purpose and dynamic fields into notes if needed
    let notes = data.notes || "";
    if (data.purpose) {
      notes = notes ? `Purpose: ${data.purpose}\n\n${notes}` : `Purpose: ${data.purpose}`;
    }

    // Save to Firestore
    const payload: Omit<CardFormData, 'purpose'> & { front_image_url: string; back_image_url?: string; notes?: string } = {
      full_name: data.full_name,
      company: data.company,
      designation: data.designation,
      email: data.email,
      phone: data.phone,
      website: data.website,
      address: data.address,
      notes: notes,
      front_image_url: frontUrl || "",
      back_image_url: backUrl,
    };

    // Use the mutation to save to Firestore
    createCardMutation.mutate(payload);
  };

  const isSubmitting = uploading || createCardMutation.isPending;

  return (
    <SidebarLayout>
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-3xl">
        <Card className="shadow-card border-2 border-primary/20 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-ai opacity-5 pointer-events-none" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-ai text-white">
                <Brain className="h-6 w-6" />
              </div>
              <CardTitle className="text-3xl text-primary font-bold">AI-Powered Card Scanner</CardTitle>
            </div>
            <CardDescription className="text-base">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Upload images and let AI automatically extract all information
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Front Image *
                    </FormLabel>
                    <div 
                      className={`border-2 border-dashed rounded-xl p-4 text-center transition-all relative overflow-hidden ${
                        isProcessingOCR 
                          ? 'border-primary/50 bg-gradient-upload glow-pulse' 
                          : isDraggingFront
                          ? 'border-primary bg-primary/20 bg-gradient-upload scale-105'
                          : 'border-primary/30 hover:border-primary hover:bg-gradient-upload/50'
                      }`}
                      onDragOver={(e) => handleDragOver(e, false)}
                      onDragLeave={(e) => handleDragLeave(e, false)}
                      onDrop={(e) => handleDrop(e, false)}
                    >
                      {isProcessingOCR && (
                        <div className="absolute inset-0 bg-gradient-ai/10 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
                          <div className="relative">
                            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3 glow-effect" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Sparkles className="h-6 w-6 text-accent animate-pulse" />
                            </div>
                          </div>
                          <p className="text-sm font-medium text-primary mt-2">{ocrProgress || "Processing..."}</p>
                          <p className="text-xs text-muted-foreground mt-1">AI is analyzing your card</p>
                        </div>
                      )}
                      {frontPreview ? (
                        <div className="relative">
                          <img src={frontPreview} alt="Front preview" className="w-full h-48 object-contain mb-2 rounded-lg" />
                          {isProcessingOCR && (
                            <div className="absolute inset-0 bg-gradient-ai/20 rounded-lg" />
                          )}
                        </div>
                      ) : (
                        <div className="h-48 flex flex-col items-center justify-center gap-3">
                          {isProcessingOCR ? (
                            <>
                              <div className="relative">
                                <ScanLine className="h-16 w-16 text-primary animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="h-8 w-8 bg-primary/20 rounded-full animate-ping" />
                                </div>
                              </div>
                              <p className="text-xs text-primary font-medium">Scanning...</p>
                            </>
                          ) : (
                            <>
                              <div className="p-4 rounded-full bg-gradient-ai/10">
                                <UploadIcon className="h-10 w-10 text-primary" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {isDraggingFront ? 'Drop image here' : 'Click to upload, drag & drop, or use camera'}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFrontImageChange}
                          className="cursor-pointer flex-1 border-primary/20 text-xs sm:text-sm"
                          disabled={isProcessingOCR}
                        />
                        <Button
                          type="button"
                          onClick={() => setShowCameraFront(true)}
                          disabled={isProcessingOCR}
                          className="bg-gradient-ai text-white hover:opacity-90 active:scale-95 transition-transform"
                          size="icon"
                        >
                          <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4 text-accent" />
                      Back Image (Optional)
                    </FormLabel>
                    <div 
                      className={`border-2 border-dashed rounded-xl p-4 text-center transition-all relative overflow-hidden ${
                        isProcessingOCR 
                          ? 'border-accent/50 bg-gradient-upload glow-pulse' 
                          : isDraggingBack
                          ? 'border-accent bg-accent/20 bg-gradient-upload scale-105'
                          : 'border-accent/30 hover:border-accent hover:bg-gradient-upload/50'
                      }`}
                      onDragOver={(e) => handleDragOver(e, true)}
                      onDragLeave={(e) => handleDragLeave(e, true)}
                      onDrop={(e) => handleDrop(e, true)}
                    >
                      {isProcessingOCR && (
                        <div className="absolute inset-0 bg-gradient-ai/10 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
                          <div className="relative">
                            <Loader2 className="h-10 w-10 animate-spin text-accent mb-3 glow-effect" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                            </div>
                          </div>
                          <p className="text-sm font-medium text-accent mt-2">{ocrProgress || "Processing..."}</p>
                          <p className="text-xs text-muted-foreground mt-1">AI is analyzing your card</p>
                        </div>
                      )}
                      {backPreview ? (
                        <div className="relative">
                          <img src={backPreview} alt="Back preview" className="w-full h-48 object-contain mb-2 rounded-lg" />
                          {isProcessingOCR && (
                            <div className="absolute inset-0 bg-gradient-ai/20 rounded-lg" />
                          )}
                        </div>
                      ) : (
                        <div className="h-48 flex flex-col items-center justify-center gap-3">
                          {isProcessingOCR ? (
                            <>
                              <div className="relative">
                                <ScanLine className="h-16 w-16 text-accent animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="h-8 w-8 bg-accent/20 rounded-full animate-ping" />
                                </div>
                              </div>
                              <p className="text-xs text-accent font-medium">Scanning...</p>
                            </>
                          ) : (
                            <>
                              <div className="p-4 rounded-full bg-gradient-ai/10">
                                <UploadIcon className="h-10 w-10 text-accent" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {isDraggingBack ? 'Drop image here' : 'Click to upload, drag & drop, or use camera'}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleBackImageChange}
                          className="cursor-pointer flex-1 border-accent/20 text-xs sm:text-sm"
                          disabled={isProcessingOCR}
                        />
                        <Button
                          type="button"
                          onClick={() => setShowCameraBack(true)}
                          disabled={isProcessingOCR}
                          className="bg-gradient-ai text-white hover:opacity-90 active:scale-95 transition-transform"
                          size="icon"
                        >
                          <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extract Data Button - Shows when images are uploaded */}
                {(frontImage || backImage) && (
                  <div className="flex flex-col items-center justify-center py-6 border-t border-b border-primary/10 bg-gradient-upload/20 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                      {frontImage && backImage 
                        ? "Both images uploaded! Ready to extract data." 
                        : "Upload back image (optional) or extract data now."}
                    </p>
                    <Button
                      type="button"
                      onClick={processOCR}
                      disabled={isProcessingOCR || !frontImage}
                      className="bg-gradient-ai hover:opacity-90 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all glow-effect disabled:opacity-50 min-w-[200px]"
                    >
                      {isProcessingOCR ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {ocrProgress || "Processing..."}
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-5 w-5" />
                          Extract Data from Images
                        </>
                      )}
                    </Button>
                    {isProcessingOCR && ocrProgress && (
                      <p className="text-xs text-primary mt-2 text-center">{ocrProgress}</p>
                    )}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="full_name"
                  rules={{ required: "Full name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input placeholder="CEO" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 234 567 8900" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, City, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes..." rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-ai hover:opacity-90 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all glow-effect disabled:opacity-50" 
                  disabled={isSubmitting || isProcessingOCR}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading to Cloud...
                    </>
                  ) : isProcessingOCR ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                      AI Processing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-5 w-5" />
                      Save Card with AI
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      <OCRConfirmationDialog
        open={showConfirmationDialog}
        onConfirm={handleConfirmExtractedData}
        onCancel={handleCancelExtractedData}
        data={parsedData}
        dynamicFields={dynamicFields}
        isLoading={isProcessingOCR}
      />
      
      <CameraCapture
        open={showCameraFront}
        onClose={() => setShowCameraFront(false)}
        onCapture={(file) => handleCameraCapture(file, false)}
        label="Capture Front Image"
      />
      
      <CameraCapture
        open={showCameraBack}
        onClose={() => setShowCameraBack(false)}
        onCapture={(file) => handleCameraCapture(file, true)}
        label="Capture Back Image"
      />
    </SidebarLayout>
  );
};

export default Upload;
