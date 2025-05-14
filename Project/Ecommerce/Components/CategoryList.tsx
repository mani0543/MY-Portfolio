
import React from "react";
import { Link } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../services/productService";
import { Skeleton } from "@/components/ui/skeleton";

// Default categories in case API fails
const defaultCategories = [
  { id: "electronics", name: "Electronics" },
  { id: "men's clothing", name: "Men's Clothing" },
  { id: "women's clothing", name: "Women's Clothing" },
  { id: "jewelery", name: "Jewelry" }
];

const CategoryList: React.FC = () => {
  const { data: apiCategories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  // Process categories - handle both string format (from FakeStoreAPI) and 
  // object format (from DummyJSON API)
  const categories = React.useMemo(() => {
    if (!apiCategories || apiCategories.length === 0) {
      return defaultCategories;
    }
    
    return apiCategories.map(category => {
      // Check if category is a string (from FakeStoreAPI) or an object (from DummyJSON)
      if (typeof category === 'string') {
        return {
          id: category,
          name: category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        };
      } else if (typeof category === 'object' && category !== null) {
        // For DummyJSON API format
        return {
          id: category.slug || category.id || category.name,
          name: category.name || category
        };
      }
      
      // Fallback for unexpected format
      return {
        id: String(category),
        name: String(category)
      };
    });
  }, [apiCategories]);

  const getCategoryEmoji = (category: string): string => {
    const lowercaseCategory = category.toLowerCase();
    if (lowercaseCategory.includes('electronics')) return '📱';
    if (lowercaseCategory.includes('men')) return '👔';
    if (lowercaseCategory.includes('women')) return '👗';
    if (lowercaseCategory.includes('jewelery')) return '💍';
    if (lowercaseCategory.includes('book')) return '📚';
    if (lowercaseCategory.includes('home')) return '🏠';
    if (lowercaseCategory.includes('beauty')) return '💄';
    if (lowercaseCategory.includes('sport')) return '🏀';
    return '🛒';
  };

  return (
    <div className="my-4">
      <h2 className="font-semibold text-lg mb-3 px-4">Categories</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 px-4">
          {isLoading ? (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="flex-shrink-0 flex flex-col items-center">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="w-16 h-4 mt-2" />
              </div>
            ))
          ) : (
            categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="flex-shrink-0 flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
                  <span className="text-2xl">{getCategoryEmoji(category.name)}</span>
                </div>
                <span className="text-sm text-center">{category.name}</span>
              </Link>
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default CategoryList;
