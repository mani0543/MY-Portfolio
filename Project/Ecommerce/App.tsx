
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";

import BottomNavigation from "./components/BottomNavigation";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import SearchPage from "./pages/SearchPage";
import CategoryPage from "./pages/CategoryPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import AddressesPage from "./pages/AddressesPage";
import WishlistPage from "./pages/WishlistPage";
import PaymentMethodsPage from "./pages/PaymentMethodsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFound from "./pages/NotFound";
import WelcomeScreen from "./components/WelcomeScreen";
import SettingsPage from "./pages/SettingsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import FavoritesPage from "./pages/FavoritesPage";
import ReviewsPage from "./pages/ReviewsPage";
import SupportPage from "./pages/SupportPage";

const App = () => {
  // Create QueryClient inside the component to ensure proper hook context
  const queryClient = new QueryClient();
  const [showWelcome, setShowWelcome] = React.useState(true);

  React.useEffect(() => {
    // Hide welcome screen after 2 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <BrowserRouter>
                  {showWelcome && <WelcomeScreen />}
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/category/:id" element={<CategoryPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-success" element={<OrderSuccessPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:id" element={<OrderDetailsPage />} />
                    <Route path="/addresses" element={<AddressesPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/reviews" element={<ReviewsPage />} />
                    <Route path="/payment-methods" element={<PaymentMethodsPage />} />
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/help" element={<HelpSupportPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <BottomNavigation />
                </BrowserRouter>
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
