
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Product } from "../types/products";
import { products } from "../data/products";
import { formatPrice } from "../utils/format";
import { toast } from "sonner";
import { useFavorites } from "../contexts/FavoritesContext";

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { favorites, removeFromFavorites } = useFavorites();
  
  // Get actual product objects for the favorites items
  const favoriteProducts = products.filter(product => 
    favorites.includes(product.id)
  );
  
  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success("Added to cart");
  };
  
  if (!isAuthenticated) {
    navigate("/login?redirect=favorites");
    return null;
  }
  
  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold ml-2">My Favorites</h1>
      </div>
      
      <div className="p-4">
        {favoriteProducts.length > 0 ? (
          <div className="space-y-4">
            {favoriteProducts.map(product => (
              <Card key={product.id} className="overflow-hidden">
                <div className="flex">
                  <div 
                    className="w-24 h-24 bg-muted flex-shrink-0"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-3 flex-1">
                    <div 
                      className="mb-2"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {product.description}
                      </p>
                      <p className="font-semibold mt-1">{formatPrice(product.price)}</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => removeFromFavorites(product.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                      
                      <Button 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        {product.inStock ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-1">Your favorites list is empty</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Add items you love to your favorites
            </p>
            <Button onClick={() => navigate("/")}>Start Shopping</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
