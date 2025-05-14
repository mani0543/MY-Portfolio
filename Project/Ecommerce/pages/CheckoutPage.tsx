
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import GuestCheckoutAlert from "../components/GuestCheckoutAlert";

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  if (items.length === 0) {
    navigate("/cart");
    return null;
  }
  
  // If not authenticated, show guest checkout alert
  if (!isAuthenticated) {
    return (
      <div className="pb-20">
        <div className="sticky top-0 bg-background z-10 p-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <h1 className="text-lg font-semibold ml-2">Checkout</h1>
        </div>
        <GuestCheckoutAlert returnUrl="/checkout" />
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold ml-2">Checkout</h1>
      </div>
      
      <div className="p-4">
        {/* Checkout form would go here */}
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            This is a demo checkout page. In a real app, you would implement a complete
            checkout flow with shipping, payment, etc.
          </p>
          <Button 
            onClick={() => {
              clearCart();
              navigate("/order-success");
            }}
          >
            Complete Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
