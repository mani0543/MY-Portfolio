
import React from "react";
import { Link } from "react-router-dom";
import { Product } from "../types/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, Heart } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { formatPrice } from "../utils/format";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product.id);
    }
  };
  
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <Link to={`/product/${product.id}`} className="flex-grow">
        <div className="relative pb-[100%] overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium px-2 py-1 rounded-md">
                Out of Stock
              </span>
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            className={`absolute top-2 right-2 rounded-full bg-background/70 backdrop-blur-sm ${
              isFavorite(product.id) ? "text-red-500 hover:text-red-600" : ""
            }`}
            onClick={handleToggleFavorite}
          >
            <Heart className={`h-4 w-4 ${isFavorite(product.id) ? "fill-current" : ""}`} />
          </Button>
        </div>
        
        <CardContent className="p-4 flex-grow">
          <h3 className="font-medium text-lg line-clamp-1">{product.name}</h3>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-primary text-primary mr-1" />
              <span>{product.rating}</span>
            </div>
            <span className="mx-1">•</span>
            <span>{product.reviews} reviews</span>
          </div>
          <p className="mt-2 font-semibold text-foreground">
            {formatPrice(product.price)}
          </p>
        </CardContent>
      </Link>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          disabled={!product.inStock}
          onClick={(e) => {
            e.preventDefault();
            addToCart(product);
          }}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
