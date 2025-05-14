
import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface GuestCheckoutAlertProps {
  returnUrl: string;
}

const GuestCheckoutAlert: React.FC<GuestCheckoutAlertProps> = ({ returnUrl }) => {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
  };
  
  const handleSignup = () => {
    navigate(`/signup?redirect=${encodeURIComponent(returnUrl)}`);
  };
  
  return (
    <Card className="mx-auto max-w-md my-8">
      <CardContent className="pt-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground mb-4">
          You need to sign in or create an account to continue with your order.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button className="w-full" onClick={handleLogin}>
          Sign In
        </Button>
        <Button variant="outline" className="w-full" onClick={handleSignup}>
          Create Account
        </Button>
        <Button 
          variant="ghost" 
          className="w-full" 
          onClick={() => navigate("/")}
        >
          Continue Browsing
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GuestCheckoutAlert;
