
import React, { useState } from "react";
import { CircleUser, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProfilePictureProps {
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  onImageChange?: (imageUrl: string) => void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  imageUrl,
  size = "md",
  onImageChange
}) => {
  const [image, setImage] = useState<string | undefined>(imageUrl);
  const [isLoading, setIsLoading] = useState(false);
  
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-24 w-24",
    lg: "h-32 w-32"
  };
  
  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-16 w-16",
    lg: "h-20 w-20"
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newImageUrl = event.target.result.toString();
        setImage(newImageUrl);
        if (onImageChange) {
          onImageChange(newImageUrl);
        }
        toast.success("Profile picture updated!");
      }
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="relative">
      <div className={`rounded-full bg-muted flex items-center justify-center overflow-hidden ${sizeClasses[size]}`}>
        {image ? (
          <img 
            src={image} 
            alt="Profile" 
            className="h-full w-full object-cover"
          />
        ) : (
          <CircleUser className={`text-muted-foreground ${iconSizes[size]}`} />
        )}
        
        {isLoading && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full">
            <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
      
      <label htmlFor="profile-upload">
        <Button 
          type="button"
          size="icon"
          variant="secondary"
          className={`h-8 w-8 rounded-full absolute bottom-0 right-0 shadow cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <Upload className="h-4 w-4" />
        </Button>
      </label>
      <input 
        id="profile-upload" 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleImageUpload}
        disabled={isLoading}
      />
    </div>
  );
};

export default ProfilePicture;
