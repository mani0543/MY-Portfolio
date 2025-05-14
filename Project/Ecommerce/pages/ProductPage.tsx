
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { fetchProductById } from "../services/productService";
import { useCart } from "../contexts/CartContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { formatPrice } from "../utils/format";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  
  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id || ''),
    enabled: !!id,
  });

  const handleToggleFavorite = () => {
    if (!product) return;
    
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product.id);
    }
  };
  
  if (isLoading) {
    return (
      <div className="pb-20">
        <div className="sticky top-0 bg-background z-10 p-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <h1 className="text-lg font-semibold ml-2">Product Details</h1>
        </div>
        
        <div className="relative">
          <Skeleton className="aspect-square w-full" />
        </div>
        
        <div className="p-4">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />
          
          <Skeleton className="h-10 w-full mb-4" />
          
          <Separator className="my-6" />
          
          <div className="flex gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">
          We couldn't find the product you're looking for.
        </p>
        <Button onClick={() => navigate("/")}>Return to Home</Button>
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold ml-2">Product Details</h1>
      </div>
      
      <div className="relative">
        <div className="aspect-square bg-muted">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain p-4"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className={`absolute top-4 right-4 rounded-full bg-background/70 backdrop-blur-sm ${
            isFavorite(product.id) ? "text-red-500 hover:text-red-600" : ""
          }`}
          onClick={handleToggleFavorite}
        >
          <Heart className={`h-5 w-5 ${isFavorite(product.id) ? "fill-current" : ""}`} />
        </Button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-semibold">{product.name}</h2>
          <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
        </div>
        
        <div className="flex items-center mb-4">
          <div className="flex items-center mr-2">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="ml-1">{product.rating}</span>
          </div>
          <span className="text-muted-foreground">
            ({product.reviews} reviews)
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto text-xs"
            onClick={() => navigate("/reviews")}
          >
            See All Reviews
          </Button>
        </div>
        
        <Tabs defaultValue="description" className="mb-6">
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="text-sm">
            <p>{product.description}</p>
          </TabsContent>
          
          <TabsContent value="specifications" className="text-sm">
            <ul className="space-y-2">
              <li><strong>Category:</strong> {product.category}</li>
              <li><strong>In Stock:</strong> {product.inStock ? 'Yes' : 'No'}</li>
              <li><strong>Rating:</strong> {product.rating} out of 5</li>
              <li><strong>Reviews:</strong> {product.reviews}</li>
            </ul>
          </TabsContent>
          
          <TabsContent value="reviews" className="text-sm">
            <div className="space-y-2">
              <p>See what other customers are saying about this product.</p>
              <Button size="sm" onClick={() => navigate("/reviews")}>View All Reviews</Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-6" />
        
        <div className="flex gap-4">
          <Button 
            className="flex-1" 
            disabled={!product.inStock}
            onClick={() => {
              addToCart(product);
              toast.success("Added to cart");
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
          <Button 
            variant="secondary" 
            className="flex-1"
            disabled={!product.inStock}
            onClick={() => {
              addToCart(product);
              navigate("/cart");
            }}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
