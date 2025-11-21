import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // Cloudinary is required for image storage
    if (!cloudName || !uploadPreset) {
      toast({
        title: "Storage Not Configured",
        description: "Please configure Cloudinary in your .env file. Cloudinary is required for image storage.",
        variant: "destructive",
      });
      setUploading(false);
      return null;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const data = await response.json();
      setUploading(false);
      return data.secure_url;
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      setUploading(false);
      return null;
    }
  };

  return { uploadImage, uploading };
};
