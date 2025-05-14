
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { formatPrice } from "../utils/format";
import { Product } from "../types/products";

interface CartItemProps {
  product: Product;
  quantity: number;
}

const CartItem: React.FC<CartItemProps> = ({ product, quantity }) => {
  const { updateQuantity, removeFromCart } = useCart();
  
  return (
    <Card className="flex p-4 mb-4">
      <div className="w-24 h-24 bg-muted rounded mr-4 flex-shrink-0">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover rounded"
        />
      </div>
      
      <div className="flex-grow">
        <div className="flex justify-between">
          <h3 className="font-medium">{product.name}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => removeFromCart(product.id)}
          >
            <X size={16} />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
          {product.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => updateQuantity(product.id, quantity - 1)}
            >
              <Minus size={16} />
            </Button>
            
            <span className="w-8 text-center">{quantity}</span>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => updateQuantity(product.id, quantity + 1)}
            >
              <Plus size={16} />
            </Button>
          </div>
          
          <p className="font-semibold">
            {formatPrice(product.price * quantity)}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CartItem;
