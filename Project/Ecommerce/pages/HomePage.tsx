
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import ProductCard from "../components/ProductCard";
import CategoryList from "../components/CategoryList";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../services/productService";
import { Skeleton } from "@/components/ui/skeleton";

const HomePage: React.FC = () => {
  const { 
    data: products = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
  
  const featuredProducts = products.filter(p => p.featured);
  const newArrivals = products.slice(0, 4);
  
  return (
    <div className="pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Mani's Ecommerce App</h1>
        <Link to="/search">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-full pl-10"
              placeholder="Search products..."
              readOnly
            />
          </div>
        </Link>
      </div>
      
      <div className="mb-8">
        <Carousel className="w-full">
          <CarouselContent>
            {[1, 2, 3].map((item) => (
              <CarouselItem key={item} className="pl-4 md:basis-1/1 lg:basis-1/1">
                <div className="p-1">
                  <Card>
                    <CardContent className="flex items-center justify-center p-0 aspect-[2/1] bg-muted">
                      <div className="text-center p-6">
                        <h3 className="text-xl font-semibold mb-2">Special Offer {item}</h3>
                        <p className="mb-3">Get up to 50% off on selected items</p>
                        <Button>Shop Now</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      
      <CategoryList />
      
      <div className="px-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Featured Products</h2>
          <Link to="/search" className="text-primary text-sm">View all</Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-40 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center p-4">
            <p className="text-red-500">Failed to load products</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredProducts.length > 0 ? (
              featuredProducts.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              products.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        )}
      </div>
      
      <div className="px-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">New Arrivals</h2>
          <Link to="/search" className="text-primary text-sm">View all</Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-40 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center p-4">
            <p className="text-red-500">Failed to load products</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
