
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import CartItem from "../components/CartItem";
import { formatPrice } from "../utils/format";
import { useAuth } from "../contexts/AuthContext";

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, itemCount, total, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };
  
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-4">
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6 text-center">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button onClick={() => navigate("/")}>Start Shopping</Button>
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold ml-2">Shopping Cart ({itemCount})</h1>
      </div>
      
      <div className="p-4">
        {items.map(item => (
          <CartItem 
            key={item.product.id} 
            product={item.product} 
            quantity={item.quantity} 
          />
        ))}
        
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            className="text-primary" 
            onClick={clearCart}
          >
            Clear Cart
          </Button>
        </div>
        
        <Separator className="my-6" />
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatPrice(total > 0 ? 5.99 : 0)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatPrice(total > 0 ? total + 5.99 : 0)}</span>
          </div>
          
          <Button className="w-full" size="lg" onClick={handleCheckout}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
