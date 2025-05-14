
import { Product } from "../types/products";

export const products: Product[] = [
  {
    id: "1",
    name: "Wireless Earbuds",
    description: "Premium wireless earbuds with noise cancellation and crystal clear sound quality. Perfect for workouts and daily commute.",
    price: 129.99,
    category: "electronics",
    image: "/placeholder.svg",
    inStock: true,
    rating: 4.8,
    reviews: 245,
    featured: true
  },
  {
    id: "2",
    name: "Smart Watch",
    description: "Feature-packed smartwatch with health monitoring, notifications, and a 5-day battery life. Water resistant and stylish design.",
    price: 249.99,
    category: "electronics",
    image: "/placeholder.svg",
    inStock: true,
    rating: 4.6,
    reviews: 189,
    featured: true
  },
  {
    id: "3",
    name: "Bluetooth Speaker",
    description: "Portable Bluetooth speaker with 360° sound and 24-hour battery life. Waterproof and dustproof for outdoor adventures.",
    price: 79.99,
    category: "electronics",
    image: "/placeholder.svg",
    inStock: true,
    rating: 4.5,
    reviews: 132
  },
  {
    id: "4",
    name: "Premium T-Shirt",
    description: "Super soft cotton t-shirt with a modern fit. Breathable fabric keeps you comfortable all day long.",
    price: 24.99,
    category: "clothing",
    image: "/placeholder.svg",
    inStock: true,
    rating: 4.3,
    reviews: 98
  },
  {
    id: "5",
    name: "Slim Fit Jeans",
    description: "Classic slim fit jeans with stretch denim for comfort. Versatile style for casual and semi-formal occasions.",
    price: 59.99,
    category: "clothing",
    image: "/placeholder.svg",
    inStock: true,
    rating: 4.4,
    reviews: 156,
    featured: true
  },
  {
    id: "6",
    name: "Running Shoes",
    description: "Lightweight running shoes with responsive cushioning and breathable mesh. Designed for performance and comfort.",
    price: 119.99,
    category: "sports",
    image: "/placeholder.svg",
    inStock: true,
    rating: 4.7,
    reviews: 203
  },
  {
    id: "7",
    name: "Yoga Mat",
    description: "Premium non-slip yoga mat with optimal cushioning. Eco-friendly material and includes carrying strap.",
    price: 39.99,
    category: "sports",
    image: "/placeholder.svg",
    inStock: true,
    rating: 4.6,
    reviews: 87
  },
  {
    id: "8",
    name: "Coffee Maker",
    description: "Programmable coffee maker with thermal carafe to keep your coffee hot for hours. Simple to use and clean.",
    price: 89.99,
    category: "home",
    image: "/placeholder.svg",
    inStock: true,
    rating: 4.4,
    reviews: 112
  },
  {
    id: "9",
    name: "Bed Sheets Set",
    description: "Luxuriously soft 100% cotton bed sheets. Includes fitted sheet, flat sheet, and 2 pillowcases.",
    price: 49.99,
    category: "home",
    image: "/placeholder.svg",
    inStock: true,
    rating: 4.5,
    reviews: 76
  },
  {
    id: "10",
    name: "Face Moisturizer",
    description: "Hydrating face moisturizer suitable for all skin types. Non-greasy formula with SPF 30 protection.",
    price: 22.99,
    category: "beauty",
    image: "/placeholder.svg",
    inStock: true,
    rating: 4.7,
    reviews: 145
  },
  {
    id: "11",
    name: "Hair Styling Kit",
    description: "Complete hair styling kit with blow dryer, straightener, and curling iron. Professional quality for home use.",
    price: 129.99,
    category: "beauty",
    image: "/placeholder.svg",
    inStock: true,
    rating: 4.3,
    reviews: 68
  },
  {
    id: "12",
    name: "Bestselling Novel",
    description: "Award-winning novel that topped charts for months. Captivating story that will keep you engaged until the last page.",
    price: 15.99,
    category: "books",
    image: "/placeholder.svg",
    inStock: true,
    rating: 4.9,
    reviews: 234
  }
];

export const getProductsByCategory = (category: string) => {
  return products.filter(product => product.category === category);
};

export const getFeaturedProducts = () => {
  return products.filter(product => product.featured);
};

export const searchProducts = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    product => 
      product.name.toLowerCase().includes(lowercaseQuery) || 
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
  );
};
