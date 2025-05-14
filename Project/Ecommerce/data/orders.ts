
import { Order, OrderStatus } from "../types/products";
import { mockUsers } from "../contexts/AuthContext";

const generateOrderId = () => {
  return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
};

export const mockOrders: Order[] = [
  {
    id: generateOrderId(),
    userId: mockUsers[0].id,
    products: [
      { productId: "1", quantity: 2, price: 129.99 },
      { productId: "4", quantity: 1, price: 24.99 }
    ],
    total: 2 * 129.99 + 24.99,
    status: "delivered" as OrderStatus,
    createdAt: "2025-04-28T10:30:00Z",
    address: {
      street: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "USA"
    },
    tracking: "USPS12345678"
  },
  {
    id: generateOrderId(),
    userId: mockUsers[0].id,
    products: [
      { productId: "6", quantity: 1, price: 119.99 }
    ],
    total: 119.99,
    status: "shipped" as OrderStatus,
    createdAt: "2025-05-05T14:20:00Z",
    address: {
      street: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "USA"
    },
    tracking: "FEDEX87654321"
  },
  {
    id: generateOrderId(),
    userId: mockUsers[0].id,
    products: [
      { productId: "2", quantity: 1, price: 249.99 },
      { productId: "10", quantity: 2, price: 22.99 }
    ],
    total: 249.99 + 2 * 22.99,
    status: "processing" as OrderStatus,
    createdAt: "2025-05-09T09:15:00Z",
    address: {
      street: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "USA"
    }
  },
  {
    id: "ORD-190919",
    userId: mockUsers[0].id,
    products: [
      { productId: "3", quantity: 1, price: 179.99 }
    ],
    total: 179.99,
    status: "shipped" as OrderStatus,
    createdAt: "2025-05-11T08:30:00Z",
    address: {
      street: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "USA"
    },
    tracking: "DHL98765432"
  }
];

export const getUserOrders = (userId: string) => {
  return mockOrders.filter(order => order.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getOrderById = (orderId: string) => {
  // First try exact match
  const exactMatch = mockOrders.find(order => order.id === orderId);
  if (exactMatch) {
    return exactMatch;
  }
  
  // If not found, try case-insensitive match
  return mockOrders.find(order => 
    order.id.toLowerCase() === orderId.toLowerCase()
  );
};

