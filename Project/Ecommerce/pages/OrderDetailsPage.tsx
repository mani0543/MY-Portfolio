
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Truck, 
  Package, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Navigation,
  Share2,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getOrderById } from "../data/orders";
import { products } from "../data/products";
import { formatPrice, formatDate } from "../utils/format";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(true);
  const [carPosition, setCarPosition] = useState<{ left: string, top: string }>({ left: "10%", top: "50%" });
  
  const order = id ? getOrderById(id) : null;
  
  // Auto-show map and animate car for shipped or processing orders
  useEffect(() => {
    if (order?.status === "shipped" || order?.status === "processing") {
      const interval = setInterval(() => {
        setCarPosition(prev => {
          const currentLeft = parseInt(prev.left);
          // Reset position if car reaches end of the path
          if (currentLeft >= 70) {
            return { left: "10%", top: "50%" };
          }
          // Move car forward
          return { left: `${currentLeft + 2}%`, top: prev.top };
        });
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [order?.status]);

  const handleShareOrder = () => {
    // In a real app, this would open a share dialog
    if (navigator.share) {
      navigator.share({
        title: `Order ${order?.id}`,
        text: `Check my order status for ${order?.id}`,
        url: window.location.href
      })
      .then(() => console.log('Shared successfully'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      toast.success("Order link copied to clipboard!");
    }
  };

  const handleWhatsAppUpdate = () => {
    // In a real app, this would send a WhatsApp notification via backend API
    toast.success("WhatsApp notification sent for order updates!");
  };
  
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <XCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-lg font-medium mb-1">Order not found</h2>
        <p className="text-muted-foreground mb-6 text-center">
          We couldn't find the order you're looking for
        </p>
        <Button onClick={() => navigate("/orders")}>Back to Orders</Button>
      </div>
    );
  }
  
  // Get product details for each item in the order
  const orderProducts = order.products.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  });
  
  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/orders")}>
            <ArrowLeft />
          </Button>
          <h1 className="text-lg font-semibold ml-2">Order Details</h1>
        </div>
        <div className="flex">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleShareOrder}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share order</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleWhatsAppUpdate}>
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>WhatsApp updates</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-medium text-lg">{order.id}</h2>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <Badge 
            className={
              order.status === "delivered" ? "bg-green-100 text-green-800" :
              order.status === "shipped" ? "bg-blue-100 text-blue-800" :
              order.status === "processing" ? "bg-yellow-100 text-yellow-800" :
              order.status === "cancelled" ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            }
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        
        {(order.status === "shipped" || order.status === "processing") && (
          <Card className="mb-4 border-none shadow-lg overflow-hidden">
            <CardHeader className="pb-2 bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="font-medium">Delivery Information</h3>
                </div>
                {order.tracking && (
                  <div className="text-sm text-muted-foreground">
                    #{order.tracking}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showMap ? (
                <div className="relative w-full h-48 bg-muted mb-3 rounded-md overflow-hidden">
                  {/* Enhanced map visualization */}
                  <div className="absolute inset-0 bg-blue-50 rounded-md">
                    {/* City visualization */}
                    <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-end">
                      <div className="w-8 h-16 bg-gray-300 mx-1"></div>
                      <div className="w-6 h-12 bg-gray-400 mx-1"></div>
                      <div className="w-8 h-20 bg-gray-300 mx-1"></div>
                      <div className="w-6 h-14 bg-gray-400 mx-1"></div>
                      <div className="w-8 h-24 bg-gray-300 mx-1"></div>
                      <div className="w-6 h-16 bg-gray-400 mx-1"></div>
                      <div className="w-8 h-20 bg-gray-300 mx-1"></div>
                      <div className="w-6 h-18 bg-gray-400 mx-1"></div>
                    </div>
                    
                    {/* Roads */}
                    <div className="absolute w-full h-2 bg-gray-700 top-1/2 transform -translate-y-1/2"></div>
                    <div className="absolute w-full h-0.5 bg-yellow-400 top-1/2 transform -translate-y-1/2 
                                  flex justify-between items-center px-4">
                      <div className="w-4 h-0.5"></div>
                      <div className="w-4 h-0.5"></div>
                    </div>
                    
                    {/* Start and end points */}
                    <div className="absolute left-[10%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full pulse"></div>
                    <div className="absolute left-[80%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full"></div>
                    
                    {/* Moving car */}
                    <div 
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 text-primary" 
                      style={{ left: carPosition.left, top: carPosition.top }}
                    >
                      <div className="h-8 w-14 bg-white rounded-md shadow-md flex items-center justify-center">
                        <Navigation className="h-5 w-5 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              
              <div className="mb-3 text-sm">
                <p className="font-medium">Estimated delivery:</p>
                <p className="text-primary font-medium">{order.status === "shipped" ? "Tomorrow by 8:00 PM" : "In 3-5 business days"}</p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? "Hide Tracking Map" : "Show Tracking Map"}
              </Button>
            </CardContent>
          </Card>
        )}
        
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-primary" />
              <h3 className="font-medium">Items</h3>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {orderProducts.map(item => {
                const product = item.product;
                if (!product) return null;
                
                return (
                  <li key={item.productId} className="flex">
                    <div className="w-16 h-16 bg-muted rounded mr-3 flex-shrink-0">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{product.name}</h4>
                      <div className="flex justify-between text-sm">
                        <span>Qty: {item.quantity}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary" />
              <h3 className="font-medium">Shipping Address</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {order.address.street}<br />
              {order.address.city}, {order.address.state} {order.address.zipCode}<br />
              {order.address.country}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Order Summary</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(5.99)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatPrice(order.total * 0.08)}</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total + 5.99 + (order.total * 0.08))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {(order.status === "delivered" || order.status === "shipped") && (
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Report an Issue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;
