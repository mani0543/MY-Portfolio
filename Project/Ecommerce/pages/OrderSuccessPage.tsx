
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ShoppingBag, Navigation, MessageSquare, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrderById } from "../data/orders";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [enableWhatsApp, setEnableWhatsApp] = useState(true);
  
  // Get the order ID from session storage or generate a new one if not found
  const orderId = React.useMemo(() => {
    const storedOrderId = sessionStorage.getItem("latest_order_id");
    if (storedOrderId) {
      return storedOrderId;
    }
    return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  }, []);
  
  const order = getOrderById(orderId);
  
  // Redirect to home if user refreshes this page
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("visited_success", "true");
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    const visited = sessionStorage.getItem("visited_success");
    if (visited) {
      navigate("/");
    }
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      sessionStorage.removeItem("visited_success");
    };
  }, [navigate]);
  
  const handleShareOrder = () => {
    // In a real app, this would open a share dialog
    if (navigator.share) {
      navigator.share({
        title: `Order ${orderId}`,
        text: `I just placed an order with ID: ${orderId}!`,
        url: window.location.href
      });
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      toast.success("Order link copied to clipboard!");
    }
  };
  
  const handleWhatsAppToggle = (checked: boolean) => {
    setEnableWhatsApp(checked);
    if (checked) {
      toast.success("WhatsApp notifications enabled");
    } else {
      toast.info("WhatsApp notifications disabled");
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gradient-to-b from-primary/10 to-background">
      <CheckCircle className="h-16 w-16 text-primary mb-4 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
      
      <h1 className="text-2xl font-bold mb-2 text-gradient">Order Confirmed!</h1>
      
      <p className="text-muted-foreground mb-6">
        Thank you for your purchase. Your order has been confirmed.
      </p>
      
      <Card className="mb-6 w-full max-w-xs p-4 border-none shadow-lg">
        <h3 className="text-sm text-muted-foreground mb-2">Order Number</h3>
        <div className="flex items-center justify-center space-x-2">
          <p className="font-medium text-lg">{orderId}</p>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleShareOrder}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <Label htmlFor="whatsapp-notify" className="text-sm">WhatsApp updates</Label>
          </div>
          <Switch 
            id="whatsapp-notify" 
            checked={enableWhatsApp}
            onCheckedChange={handleWhatsAppToggle}
          />
        </div>
      </Card>
      
      <div className="space-y-4 w-full max-w-xs">
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group relative overflow-hidden shadow-md"
          onClick={() => navigate(`/orders/${orderId}`)}
        >
          <div className="absolute inset-0 w-3 bg-white/20 skew-x-[-20deg] group-hover:animate-[slide-in-right_1s_ease-in-out_infinite]"></div>
          <span className="flex items-center justify-center">
            <Navigation className="mr-2 h-4 w-4" />
            Track Your Order
          </span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full border-primary/20 hover:bg-primary/5"
          onClick={() => navigate("/")}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Continue Shopping
        </Button>
      </div>
      
      <div className="mt-8 p-4 w-full max-w-xs bg-primary/5 rounded-lg">
        <p className="text-sm text-muted-foreground mb-1">
          Your order is now being processed and will be shipped soon.
        </p>
        <p className="text-sm text-primary font-medium">
          Estimated delivery: 3-5 business days
        </p>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
