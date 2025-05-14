
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, LogOut, ShoppingBag, CreditCard, Settings, ChevronRight, Heart, MapPin, Edit2, CircleUser, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import ProfilePicture from "../components/ProfilePicture";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

// Admin role check
const isAdmin = (email: string | undefined): boolean => {
  return email === "admin@example.com";
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || ""
  });
  
  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  
  const menuItems = [
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      label: "My Orders",
      path: "/orders",
      requireAuth: true
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: "My Addresses",
      path: "/addresses",
      requireAuth: true
    },
    {
      icon: <Heart className="h-5 w-5" />,
      label: "Wishlist",
      path: "/wishlist",
      requireAuth: true
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Payment Methods",
      path: "/payment-methods",
      requireAuth: true
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: "Notifications",
      path: "/settings",
      requireAuth: true
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      path: "/settings",
      requireAuth: false
    }
  ];

  // Add admin dashboard link if user is admin
  if (isAdmin(user?.email)) {
    menuItems.push({
      icon: <Settings className="h-5 w-5" />,
      label: "Admin Dashboard",
      path: "/admin",
      requireAuth: true
    });
  }
  
  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the user profile
    toast.success("Profile updated successfully");
    setIsEditProfileOpen(false);
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="text-center mb-8">
          <UserRound className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
          <h2 className="text-2xl font-semibold mb-2">Sign in to your account</h2>
          <p className="text-muted-foreground mb-6">
            Sign in to view your profile, orders, and more
          </p>
        </div>
        
        <div className="w-full max-w-sm space-y-4">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => navigate("/login")}>
            Sign In
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate("/signup")}>
            Create Account
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ProfilePicture 
              imageUrl={profilePicture}
              size="md"
              onImageChange={setProfilePicture}
            />
            <div className="ml-4">
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="opacity-80">{user?.email}</p>
              {isAdmin(user?.email) && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                  Admin
                </span>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 bg-primary-foreground/20 rounded-full"
            onClick={() => setIsEditProfileOpen(true)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <Card className="mb-6 overflow-hidden border-none shadow-lg">
          <div className="p-4">
            <h3 className="font-medium mb-3">Account</h3>
            
            {menuItems.map((item, index) => {
              if (item.requireAuth && !isAuthenticated) return null;
              
              return (
                <React.Fragment key={item.label}>
                  <Button
                    variant="ghost"
                    className="w-full justify-between font-normal h-12 hover:bg-primary/5"
                    onClick={() => navigate(item.path)}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  {index < menuItems.length - 1 && <Separator />}
                </React.Fragment>
              );
            })}
          </div>
        </Card>
        
        <Card className="mb-6 overflow-hidden border-none shadow-lg">
          <div className="p-4">
            <h3 className="font-medium mb-3">Notifications</h3>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-medium">WhatsApp notifications</h4>
                <p className="text-xs text-muted-foreground">Get order updates via WhatsApp</p>
              </div>
              <Switch 
                checked={whatsappNotifications}
                onCheckedChange={setWhatsappNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-medium">Email notifications</h4>
                <p className="text-xs text-muted-foreground">Get order updates via Email</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>
        
        <Button
          variant="outline"
          className="w-full shadow-sm hover:shadow-md transition-all duration-300"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
      
      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex justify-center mb-4">
              <ProfilePicture 
                imageUrl={profilePicture}
                size="lg"
                onImageChange={setProfilePicture}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={profileForm.name}
                onChange={handleProfileFormChange}
                required
                className="border-primary/20 focus-visible:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileFormChange}
                required
                className="border-primary/20 focus-visible:ring-primary"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditProfileOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
