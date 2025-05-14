
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Address } from '../types/products';

interface AddressFormProps {
  initialAddress?: Address;
  onSave: (address: Address, setDefault: boolean) => void;
  onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ 
  initialAddress, 
  onSave,
  onCancel
}) => {
  const [address, setAddress] = useState<Address>(initialAddress || {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });
  
  const [setAsDefault, setSetAsDefault] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(address, setAsDefault);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          name="street"
          value={address.street}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={address.city}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            value={address.state}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            name="zipCode"
            value={address.zipCode}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            value={address.country}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="default" 
          checked={setAsDefault}
          onCheckedChange={(checked) => setSetAsDefault(checked as boolean)} 
        />
        <Label htmlFor="default">Set as default address</Label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Address</Button>
      </div>
    </form>
  );
};

export default AddressForm;
