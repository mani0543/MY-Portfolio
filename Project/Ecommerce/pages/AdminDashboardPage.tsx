
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Package, 
  Users, 
  ShoppingBag, 
  Search, 
  Edit2, 
  Trash2, 
  Plus, 
  BarChart3,
  DollarSign,
  TrendingUp,
  Check,
  X,
  User,
  Truck,
  Mail,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "../contexts/AuthContext";
import { Product, ProductCategory } from "../types/products";
import { formatPrice } from "../utils/format";
import { products } from "../data/products";
import { mockOrders } from "../data/orders";
import { toast } from "sonner";
import { mockUsers } from "../contexts/AuthContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";

// Admin role check
const isAdmin = (email: string | undefined): boolean => {
  return email === "admin@example.com";
};

// Sample data for charts
const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 8000 },
  { name: 'May', sales: 6000 }
];

const categoryData = [
  { name: 'Electronics', value: 45 },
  { name: 'Clothing', value: 20 },
  { name: 'Home', value: 15 },
  { name: 'Beauty', value: 10 },
  { name: 'Other', value: 10 }
];

const COLORS = ['#9b87f5', '#7E69AB', '#D6BCFA', '#E5DEFF', '#1EAEDB'];

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [productsList, setProductsList] = useState<Product[]>(products);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isNotificationFormOpen, setIsNotificationFormOpen] = useState(false);
  const [notificationType, setNotificationType] = useState("email");
  
  // Redirect if not admin
  if (!isAuthenticated || !isAdmin(user?.email)) {
    navigate("/");
    return null;
  }
  
  const filteredProducts = productsList.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsProductFormOpen(true);
  };
  
  const handleAddProduct = () => {
    setCurrentProduct(null);
    setIsProductFormOpen(true);
  };
  
  const handleDeleteProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteProduct = () => {
    if (currentProduct) {
      setProductsList(prevProducts => prevProducts.filter(p => p.id !== currentProduct.id));
      toast.success("Product deleted successfully");
      setIsDeleteDialogOpen(false);
    }
  };

  const handleSendNotification = () => {
    toast.success(`${notificationType === 'email' ? 'Email' : 'WhatsApp'} notification sent to customers!`);
    setIsNotificationFormOpen(false);
  };
  
  const handleAddUser = () => {
    // In a real app, this would add a user to the database
    toast.success("User added successfully");
    setIsUserFormOpen(false);
  };
  
  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 flex items-center shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold ml-2">Admin Dashboard</h1>
        <Badge variant="outline" className="ml-2 bg-primary text-primary-foreground">
          Admin
        </Badge>
      </div>
      
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="dashboard">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <DollarSign className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-semibold">{formatPrice(12876.55)}</p>
                  <Badge variant="outline" className="mt-2 bg-green-100 text-green-800 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" /> +15.3%
                  </Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Package className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Total Products</p>
                  <p className="text-2xl font-semibold">{productsList.length}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-2xl font-semibold">{mockOrders.length}</p>
                  <Badge variant="outline" className="mt-2 bg-green-100 text-green-800 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" /> +8.4%
                  </Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                  <p className="text-2xl font-semibold">{mockUsers.length}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#9b87f5" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={() => setIsNotificationFormOpen(true)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
              <Button className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="products">
            <div className="flex justify-between mb-4">
              <div className="relative flex-1 mr-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </div>
            
            <div className="space-y-4">
              {filteredProducts.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="flex">
                    <div className="w-20 h-20 bg-muted">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-4 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                          </p>
                          <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex mt-2">
                        <Badge variant={product.inStock ? "default" : "destructive"} className="text-xs mr-2">
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                        {product.featured && (
                          <Badge variant="outline" className="text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="orders">
            <div className="flex justify-between mb-4">
              <div className="relative flex-1 mr-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search orders..."
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              {mockOrders.map(order => (
                <Card key={order.id} className="p-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{order.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
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
                      <Select defaultValue={order.status}>
                        <SelectTrigger className="h-8 w-[130px]">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                  
                  <div className="flex justify-between mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      View Details
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex items-center">
                        <Truck className="h-4 w-4 mr-1" /> Track
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" /> Notify
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <div className="flex justify-between mb-4">
              <div className="relative flex-1 mr-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search users..."
                />
              </div>
              <Button onClick={() => setIsUserFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add User
              </Button>
            </div>
            
            <div className="space-y-4">
              {mockUsers.map(mockUser => (
                <Card key={mockUser.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{mockUser.name}</h3>
                        <p className="text-sm text-muted-foreground">{mockUser.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {mockUser.email === "admin@example.com" && (
                        <Badge className="bg-primary/20 text-primary mr-2">Admin</Badge>
                      )}
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Product Form Dialog - Simple version for demo */}
      <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                defaultValue={currentProduct?.name || ""}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  defaultValue={currentProduct?.price || 0}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={currentProduct?.category || "electronics"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="beauty">Beauty</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                defaultValue={currentProduct?.description || ""}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  defaultValue={currentProduct?.rating || 4.5}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reviews">Number of Reviews</Label>
                <Input
                  id="reviews"
                  type="number"
                  defaultValue={currentProduct?.reviews || 0}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                defaultValue={currentProduct?.image || "/placeholder.svg"}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="inStock"
                  defaultChecked={currentProduct?.inStock ?? true}
                />
                <Label htmlFor="inStock">In Stock</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  defaultChecked={currentProduct?.featured ?? false}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsProductFormOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success(currentProduct ? "Product updated successfully" : "Product added successfully");
              setIsProductFormOpen(false);
            }}>
              {currentProduct ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Are you sure you want to delete "{currentProduct?.name}"?</p>
            <p className="text-sm text-muted-foreground mt-1">This action cannot be undone.</p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteProduct}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add User Dialog */}
      <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Full Name</Label>
              <Input id="user-name" placeholder="John Doe" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input id="user-email" type="email" placeholder="john@example.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user-password">Password</Label>
              <Input id="user-password" type="password" placeholder="••••••••" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="is-admin" />
              <Label htmlFor="is-admin">Admin User</Label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsUserFormOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              Add User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Notification Dialog */}
      <Dialog open={isNotificationFormOpen} onOpenChange={setIsNotificationFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notification-type">Notification Method</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notification-title">Title</Label>
              <Input id="notification-title" placeholder="Sale Announcement" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notification-message">Message</Label>
              <Textarea
                id="notification-message"
                rows={3}
                placeholder="Enter your message here..."
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsNotificationFormOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSendNotification}>
              Send Notification
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboardPage;
