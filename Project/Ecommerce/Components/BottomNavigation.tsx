
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingCart, User, Settings, Heart } from "lucide-react";

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t flex items-center justify-around z-10">
      <Link
        to="/"
        className={`flex flex-col items-center justify-center w-1/5 ${
          isActive("/") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Home className="h-5 w-5" />
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link
        to="/search"
        className={`flex flex-col items-center justify-center w-1/5 ${
          isActive("/search") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Search className="h-5 w-5" />
        <span className="text-xs mt-1">Search</span>
      </Link>
      
      <Link
        to="/favorites"
        className={`flex flex-col items-center justify-center w-1/5 ${
          isActive("/favorites") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Heart className="h-5 w-5" />
        <span className="text-xs mt-1">Favorites</span>
      </Link>
      
      <Link
        to="/cart"
        className={`flex flex-col items-center justify-center w-1/5 ${
          isActive("/cart") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="text-xs mt-1">Cart</span>
      </Link>
      
      <Link
        to="/profile"
        className={`flex flex-col items-center justify-center w-1/5 ${
          isActive("/profile") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <User className="h-5 w-5" />
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </div>
  );
};

export default BottomNavigation;
