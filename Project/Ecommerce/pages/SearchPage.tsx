
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "../components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../services/productService";
import { Product } from "../types/products";

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
  
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  
  // Update search results when query or products change
  useEffect(() => {
    if (!allProducts.length) return;
    
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setSearchResults([]);
      return;
    }
    
    const results = allProducts.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
  }, [searchQuery, allProducts]);
  
  // Update URL when search query changes
  useEffect(() => {
    if (searchQuery) {
      setSearchParams({ q: searchQuery });
    } else {
      setSearchParams({});
    }
  }, [searchQuery, setSearchParams]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };
  
  const clearSearch = () => {
    setSearchQuery("");
  };
  
  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <h1 className="text-lg font-semibold ml-2">Search</h1>
        </div>
        
        <form onSubmit={handleSearch} className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-full pl-10 pr-10"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-40 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : searchQuery && searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium mb-2">No products found</p>
            <p className="text-muted-foreground text-center mb-4">
              Try different keywords or browse categories
            </p>
            <Button variant="outline" onClick={() => navigate("/")}>Browse Categories</Button>
          </div>
        ) : searchQuery ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{searchQuery}"
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {searchResults.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              Start typing to search products
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
