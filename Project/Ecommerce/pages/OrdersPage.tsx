
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../contexts/AuthContext";
import { getUserOrders } from "../data/orders";
import { formatPrice, formatShortDate } from "../utils/format";
import { OrderStatus } from "../types/products";

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case "delivered": return "bg-green-100 text-green-800";
    case "shipped": return "bg-blue-100 text-blue-800";
    case "processing": return "bg-yellow-100 text-yellow-800";
    case "pending": return "bg-gray-100 text-gray-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const orders = user ? getUserOrders(user.id) : [];
  
  if (!isAuthenticated) {
    navigate("/login?redirect=orders");
    return null;
  }
  
  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold ml-2">My Orders</h1>
      </div>
      
      <div className="p-4">
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map(order => (
              <Card 
                key={order.id} 
                className="p-4"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatShortDate(order.createdAt)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      {order.products.reduce((sum, product) => sum + product.quantity, 0)}{" "}
                      {order.products.reduce((sum, product) => sum + product.quantity, 0) === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-1">No orders yet</h2>
            <p className="text-muted-foreground mb-6 text-center">
              When you place orders, they will appear here
            </p>
            <Button onClick={() => navigate("/")}>Start Shopping</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
