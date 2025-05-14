import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Bell, 
  ShieldCheck, 
  HelpCircle, 
  LogOut,
  User,
  Mail,
  Phone,
  Sun,
  Moon,
  Star
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import ProfilePicture from "../components/ProfilePicture";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout, user, updateProfile } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleSignOut = () => {
    logout();
    toast.success("You have been signed out");
    navigate('/login');
  };

  const handlePushNotificationsToggle = (checked: boolean) => {
    setPushNotifications(checked);
    toast.success(`Push notifications ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleEmailNotificationsToggle = (checked: boolean) => {
    setEmailNotifications(checked);
    toast.success(`Email notifications ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleProfilePictureChange = (imageUrl: string) => {
    if (updateProfile) {
      updateProfile({ profilePicture: imageUrl });
      toast.success("Profile picture updated successfully");
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold ml-2">Settings</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your profile information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <ProfilePicture 
              imageUrl={user?.profilePicture} 
              size="lg"
              onImageChange={handleProfilePictureChange}
            />
            <div className="text-center">
              <h3 className="font-medium">{user?.name || 'Guest User'}</h3>
              <p className="text-sm text-muted-foreground">{user?.email || 'Not signed in'}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              View Full Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {isDark ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle dark mode</p>
                </div>
              </div>
              <Switch 
                checked={isDark} 
                onCheckedChange={toggleTheme} 
                aria-label="Toggle dark mode"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <p className="font-medium">Push Notifications</p>
              </div>
              <Switch 
                checked={pushNotifications} 
                onCheckedChange={handlePushNotificationsToggle} 
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <p className="font-medium">Email Notifications</p>
              </div>
              <Switch 
                checked={emailNotifications} 
                onCheckedChange={handleEmailNotificationsToggle} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support & About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate("/privacy-policy")}
            >
              <ShieldCheck className="h-5 w-5 mr-2" />
              Privacy Policy
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate("/support")}
            >
              <HelpCircle className="h-5 w-5 mr-2" />
              Support & Help
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={() => navigate("/reviews")}
            >
              <Star className="h-5 w-5 mr-2" />
              Reviews
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigator.clipboard.writeText("itxmemani0543@gmail.com");
                toast.success("Email copied to clipboard");
              }}
            >
              <Mail className="h-5 w-5 mr-2" />
              Email: itxmemani0543@gmail.com
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => window.open("https://wa.me/923155296456", "_blank")}
            >
              <Phone className="h-5 w-5 mr-2" />
              WhatsApp: +92 315 529 6456
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive" 
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground text-sm">
          Version 1.0.0
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
