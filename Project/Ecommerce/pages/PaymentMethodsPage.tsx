
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

// Mock payment methods for demo
interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiry: string;
  isDefault: boolean;
}

const initialPaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "visa",
    last4: "4242",
    expiry: "08/26",
    isDefault: true
  }
];

const PaymentMethodsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardholderName: '',
    expiry: '',
    cvc: '',
    type: 'visa' as 'visa' | 'mastercard' | 'amex'
  });
  
  if (!isAuthenticated) {
    navigate("/login?redirect=payment-methods");
    return null;
  }
  
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send card data to a payment processor
    // Here we just simulate adding the card
    const newCard: PaymentMethod = {
      id: `${paymentMethods.length + 1}`,
      type: cardForm.type,
      last4: cardForm.cardNumber.slice(-4),
      expiry: cardForm.expiry,
      isDefault: paymentMethods.length === 0
    };
    
    setPaymentMethods(prev => [...prev, newCard]);
    setIsAddCardOpen(false);
    toast.success("Payment method added successfully");
    setCardForm({
      cardNumber: '',
      cardholderName: '',
      expiry: '',
      cvc: '',
      type: 'visa'
    });
  };
  
  const handleRemoveCard = (id: string) => {
    setPaymentMethods(prev => {
      const updatedMethods = prev.filter(method => method.id !== id);
      
      // If we removed the default method and there are other methods, make the first one the default
      if (prev.find(method => method.id === id)?.isDefault && updatedMethods.length > 0) {
        updatedMethods[0].isDefault = true;
      }
      
      return updatedMethods;
    });
    
    toast.success("Payment method removed");
  };
  
  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    
    toast.success("Default payment method updated");
  };
  
  const getCardIcon = (type: 'visa' | 'mastercard' | 'amex') => {
    switch (type) {
      case 'visa':
        return "V";
      case 'mastercard':
        return "M";
      case 'amex':
        return "A";
      default:
        return "C";
    }
  };
  
  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold ml-2">Payment Methods</h1>
      </div>
      
      <div className="p-4">
        <Button className="w-full mb-4" onClick={() => setIsAddCardOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Payment Method
        </Button>
        
        {paymentMethods.length > 0 ? (
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <Card key={method.id} className="p-4">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center mr-3">
                      <span className="font-bold">{getCardIcon(method.type)}</span>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium">
                          {method.type.charAt(0).toUpperCase() + method.type.slice(1)} •••• {method.last4}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCard(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {!method.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => handleSetDefault(method.id)}
                  >
                    Set as default
                  </Button>
                )}
                
                {method.isDefault && (
                  <div className="mt-2 text-xs text-primary flex items-center">
                    <span>Default payment method</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-1">No payment methods</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Add a payment method to make checkout faster
            </p>
          </div>
        )}
      </div>
      
      {/* Add Card Dialog */}
      <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCard} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardType">Card Type</Label>
              <RadioGroup 
                defaultValue="visa" 
                className="flex space-x-4"
                onValueChange={(value) => setCardForm({
                  ...cardForm,
                  type: value as 'visa' | 'mastercard' | 'amex'
                })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="visa" id="visa" />
                  <Label htmlFor="visa">Visa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mastercard" id="mastercard" />
                  <Label htmlFor="mastercard">Mastercard</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="amex" id="amex" />
                  <Label htmlFor="amex">American Express</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardForm.cardNumber}
                onChange={(e) => setCardForm({...cardForm, cardNumber: e.target.value})}
                required
                pattern="[0-9]{13,19}"
                maxLength={19}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={cardForm.cardholderName}
                onChange={(e) => setCardForm({...cardForm, cardholderName: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiration Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={cardForm.expiry}
                  onChange={(e) => setCardForm({...cardForm, expiry: e.target.value})}
                  required
                  pattern="[0-9]{2}/[0-9]{2}"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cardForm.cvc}
                  onChange={(e) => setCardForm({...cardForm, cvc: e.target.value})}
                  required
                  pattern="[0-9]{3,4}"
                  maxLength={4}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddCardOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Card</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethodsPage;
