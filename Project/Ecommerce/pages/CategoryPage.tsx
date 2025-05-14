
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "../components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { fetchProductsByCategory } from "../services/productService";
import { Skeleton } from "@/components/ui/skeleton";

const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', 'category', id],
    queryFn: () => id ? fetchProductsByCategory(id) : Promise.resolve([]),
    enabled: !!id,
  });
  
  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return "Category";
    
    // Handle different potential formats safely
    try {
      // Check if it's a plain string that needs formatting
      return categoryId
        .toString()
        .split("'")
        .join("'")
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } catch (err) {
      console.error("Error formatting category name:", err);
      // Fallback: just return the category ID as is, converting to string if needed
      return String(categoryId);
    }
  };
  
  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold ml-2">
          {getCategoryName(id)}
        </h1>
      </div>
      
      {isLoading ? (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-lg font-medium mb-2">Error loading products</p>
          <p className="text-muted-foreground text-center mb-4">
            We encountered an error while loading products in this category.
          </p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      ) : products.length > 0 ? (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-lg font-medium mb-2">No products found</p>
          <p className="text-muted-foreground text-center mb-4">
            We couldn't find any products in this category.
          </p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
