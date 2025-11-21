import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X, RotateCcw, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface CameraCaptureProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  label?: string;
}

export function CameraCapture({ open, onClose, onCapture, label = "Take Photo" }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const isMobile = useIsMobile();
  // Default to back camera on mobile, front on desktop
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    isMobile ? "environment" : "user"
  );
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update facing mode when mobile state changes
  useEffect(() => {
    if (isMobile) {
      setFacingMode("environment"); // Back camera on mobile
    } else {
      setFacingMode("user"); // Front camera on desktop
    }
  }, [isMobile]);

  useEffect(() => {
    if (open) {
      // Small delay to ensure dialog is fully mounted before requesting camera
      const timer = setTimeout(() => {
        startCamera();
      }, 100);
      
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
      setCapturedImage(null);
      setError(null);
      setHasPermission(null);
    }
  }, [open, facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      setHasPermission(null);
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera API not supported in this browser. Please use file upload instead.");
        setHasPermission(false);
        return;
      }

      // Adaptive constraints optimized for mobile and desktop
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          // Mobile-optimized: use device capabilities
          ...(isMobile ? {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
          } : {
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
          }),
          // Better mobile camera support
          aspectRatio: isMobile ? { ideal: 4 / 3 } : { ideal: 16 / 9 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setError(null); // Clear any previous errors
      }
    } catch (err) {
      // Silently handle errors - we show user-friendly messages in UI
      setHasPermission(false);
      
      if (err instanceof DOMException || err instanceof Error) {
        const errorName = err.name || (err as any).code;
        
        if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
          setError("Camera permission was denied. Please allow camera access in your browser settings and try again.");
        } else if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
          setError("No camera found. Please connect a camera or use file upload instead.");
        } else if (errorName === "NotReadableError" || errorName === "TrackStartError") {
          setError("Camera is already in use by another application. Please close other apps using the camera.");
        } else if (errorName === "OverconstrainedError" || errorName === "ConstraintNotSatisfiedError") {
          setError("Camera doesn't support the required settings. Please try a different camera or use file upload.");
        } else {
          setError("Failed to access camera. Please check your browser settings or use file upload instead.");
        }
      } else {
        setError("Failed to access camera. Please try again or use file upload.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        setIsCapturing(true);
      }
    }, "image/jpeg", 0.95);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsCapturing(false);
    startCamera();
  };

  const confirmPhoto = () => {
    if (!canvasRef.current || !capturedImage) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        
        onCapture(file);
        stopCamera();
        setCapturedImage(null);
        setIsCapturing(false);
        onClose();
        
        toast({
          title: "Photo Captured!",
          description: "Processing image with AI...",
        });
      }
    }, "image/jpeg", 0.95);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'max-w-full w-full h-full m-0 rounded-none' : 'max-w-4xl'} p-0 gap-0 bg-black/95 border-primary/20`}>
        <DialogHeader className={`${isMobile ? 'p-3' : 'p-4'} bg-gradient-ai/10 border-b border-primary/20`}>
          <DialogTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
            <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
            {label}
          </DialogTitle>
          <DialogDescription className="text-white/70 text-xs sm:text-sm">
            Position the business card in the frame and take a photo
          </DialogDescription>
        </DialogHeader>

        <div className="relative bg-black">
          {error ? (
            <div className="flex flex-col items-center justify-center p-12 text-white min-h-[400px]">
              <div className="p-4 rounded-full bg-destructive/20 mb-4">
                <X className="h-12 w-12 text-destructive" />
              </div>
              <p className="text-xl font-bold mb-3">Camera Access Error</p>
              <p className="text-sm text-white/80 text-center max-w-md mb-6 leading-relaxed">{error}</p>
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                >
                  Close
                </Button>
                <Button
                  onClick={startCamera}
                  className="bg-gradient-ai text-white hover:opacity-90"
                >
                  Try Again
                </Button>
              </div>
              <p className="text-xs text-white/50 mt-6 text-center max-w-sm">
                💡 Tip: Make sure you've allowed camera permissions in your browser settings
              </p>
            </div>
          ) : hasPermission === null ? (
            <div className="flex items-center justify-center p-12 text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p>Accessing camera...</p>
              </div>
            </div>
          ) : capturedImage ? (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured"
                className={`w-full ${isMobile ? 'h-[calc(100vh-200px)]' : 'max-h-[70vh]'} object-contain mx-auto`}
              />
              <div className={`absolute ${isMobile ? 'bottom-2' : 'bottom-4'} left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 w-full px-4 justify-center`}>
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70 text-sm sm:text-base px-3 sm:px-4"
                >
                  <RotateCcw className="h-4 w-4 mr-1 sm:mr-2" />
                  {isMobile ? 'Retake' : 'Retake'}
                </Button>
                <Button
                  onClick={confirmPhoto}
                  className="bg-gradient-ai text-white hover:opacity-90 text-sm sm:text-base px-3 sm:px-4"
                >
                  <Check className="h-4 w-4 mr-1 sm:mr-2" />
                  {isMobile ? 'Use' : 'Use This Photo'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full ${isMobile ? 'h-[calc(100vh-150px)] object-cover' : 'max-h-[70vh] object-contain'}`}
                style={facingMode === "user" ? { transform: 'scaleX(-1)' } : {}}
              />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className={`absolute ${isMobile ? 'bottom-2' : 'bottom-4'} left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 items-center w-full px-4 justify-center`}>
                {isMobile && (
                  <Button
                    onClick={switchCamera}
                    variant="outline"
                    className="bg-black/50 border-white/20 text-white hover:bg-black/70 h-12 w-12 rounded-full p-0"
                    title="Switch Camera"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                )}
                <Button
                  onClick={capturePhoto}
                  className={`${isMobile ? 'h-20 w-20' : 'h-16 w-16'} rounded-full bg-gradient-ai text-white hover:opacity-90 border-4 border-white/30 shadow-lg active:scale-95 transition-transform`}
                  title="Capture Photo"
                >
                  <Camera className={`${isMobile ? 'h-8 w-8' : 'h-6 w-6'}`} />
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className={`bg-black/50 border-white/20 text-white hover:bg-black/70 ${isMobile ? 'h-12 w-12 rounded-full p-0' : ''}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

