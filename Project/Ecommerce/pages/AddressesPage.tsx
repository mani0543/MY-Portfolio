
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, MapPin, Edit2, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "../contexts/AuthContext";
import { Address, UserAddress } from "../types/products";
import AddressForm from "../components/AddressForm";
import { toast } from "sonner";

// Demo addresses
const initialAddresses: UserAddress[] = [
  {
    id: "1",
    userId: "1",
    isDefault: true,
    address: {
      street: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "USA"
    }
  }
];

const AddressesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [addresses, setAddresses] = useState<UserAddress[]>(initialAddresses);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<UserAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  
  if (!isAuthenticated) {
    navigate("/login?redirect=addresses");
    return null;
  }
  
  const handleAddAddress = () => {
    setCurrentAddress(null);
    setIsAddressFormOpen(true);
  };
  
  const handleEditAddress = (address: UserAddress) => {
    setCurrentAddress(address);
    setIsAddressFormOpen(true);
  };
  
  const handleSaveAddress = (addressData: Address, setDefault: boolean) => {
    if (currentAddress) {
      // Edit existing address
      setAddresses(prevAddresses => {
        const updatedAddresses = prevAddresses.map(addr => {
          if (addr.id === currentAddress.id) {
            return {
              ...addr,
              address: addressData,
              isDefault: setDefault ? true : addr.isDefault
            };
          }
          return setDefault ? { ...addr, isDefault: false } : addr;
        });
        return updatedAddresses;
      });
      toast.success("Address updated");
    } else {
      // Add new address
      const newAddress: UserAddress = {
        id: `${addresses.length + 1}`,
        userId: user?.id || "1",
        isDefault: setDefault || addresses.length === 0,
        address: addressData
      };
      
      setAddresses(prevAddresses => {
        const updatedAddresses = setDefault 
          ? prevAddresses.map(addr => ({ ...addr, isDefault: false }))
          : [...prevAddresses];
          
        return [...updatedAddresses, newAddress];
      });
      toast.success("Address added");
    }
    
    setIsAddressFormOpen(false);
  };
  
  const handleDeleteAddress = (addressId: string) => {
    setAddressToDelete(addressId);
  };
  
  const confirmDeleteAddress = () => {
    if (addressToDelete) {
      setAddresses(prevAddresses => {
        const deletedAddress = prevAddresses.find(addr => addr.id === addressToDelete);
        const filteredAddresses = prevAddresses.filter(addr => addr.id !== addressToDelete);
        
        // If we're deleting the default address, make the first remaining address the default
        if (deletedAddress?.isDefault && filteredAddresses.length > 0) {
          filteredAddresses[0].isDefault = true;
        }
        
        return filteredAddresses;
      });
      
      toast.success("Address deleted");
      setAddressToDelete(null);
    }
  };
  
  const handleSetDefault = (addressId: string) => {
    setAddresses(prevAddresses => 
      prevAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }))
    );
    toast.success("Default address updated");
  };
  
  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold ml-2">My Addresses</h1>
      </div>
      
      <div className="p-4">
        <Button className="w-full mb-4" onClick={handleAddAddress}>
          <Plus className="mr-2 h-4 w-4" /> Add New Address
        </Button>
        
        {addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map(address => (
              <Card key={address.id} className="p-4">
                <div className="flex justify-between">
                  <div className="flex">
                    <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm">
                        {address.address.street}<br />
                        {address.address.city}, {address.address.state} {address.address.zipCode}<br />
                        {address.address.country}
                      </p>
                      
                      {address.isDefault && (
                        <div className="flex items-center mt-2 text-xs text-primary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Default address
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditAddress(address)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Set as default
                  </Button>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-1">No addresses yet</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Add an address to make checkout faster
            </p>
          </div>
        )}
      </div>
      
      {/* Address Form Dialog */}
      <Dialog open={isAddressFormOpen} onOpenChange={setIsAddressFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>
          <AddressForm
            initialAddress={currentAddress?.address}
            onSave={handleSaveAddress}
            onCancel={() => setIsAddressFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!addressToDelete} onOpenChange={() => setAddressToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAddress}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddressesPage;
