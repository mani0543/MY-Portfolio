
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

const HelpSupportPage: React.FC = () => {
  const navigate = useNavigate();

  const handleContactClick = (method: string) => {
    if (method === 'email') {
      window.location.href = 'mailto:support@example.com';
    } else if (method === 'whatsapp') {
      // This would normally link to WhatsApp, but we'll just show a toast for demo purposes
      toast.success("WhatsApp support feature activated!");
    } else {
      toast.success(`${method} support feature activated!`);
    }
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold ml-2">Help & Support</h1>
      </div>

      <div className="p-4 space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-4">How can we help you?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent transition-colors" 
                  onClick={() => handleContactClick('email')}>
              <Mail className="h-10 w-10 mb-2 text-primary" />
              <h3 className="font-medium">Email Support</h3>
              <p className="text-sm text-muted-foreground">Get help via email</p>
            </Card>
            
            <Card className="p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleContactClick('phone')}>
              <Phone className="h-10 w-10 mb-2 text-primary" />
              <h3 className="font-medium">Phone Support</h3>
              <p className="text-sm text-muted-foreground">Talk to our team</p>
            </Card>
            
            <Card className="p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleContactClick('whatsapp')}>
              <MessageCircle className="h-10 w-10 mb-2 text-primary" />
              <h3 className="font-medium">WhatsApp Support</h3>
              <p className="text-sm text-muted-foreground">Message us directly</p>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I track my order?</AccordionTrigger>
              <AccordionContent>
                You can track your order by going to the Orders section in your profile and clicking on the specific order you want to track. There you'll find real-time updates about your order status.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
              <AccordionContent>
                We accept various payment methods including credit/debit cards, PayPal, Apple Pay, Google Pay, and Payoneer. All payment information is securely processed.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>How can I return a product?</AccordionTrigger>
              <AccordionContent>
                To return a product, go to your Order Details page, select the item you wish to return, and follow the return instructions. Our return policy allows returns within 30 days of delivery.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>How do I update my shipping address?</AccordionTrigger>
              <AccordionContent>
                You can update your shipping address by going to your Profile page, selecting "Addresses" and then editing your existing address or adding a new one.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>Do you offer international shipping?</AccordionTrigger>
              <AccordionContent>
                Yes, we offer international shipping to most countries. Shipping rates and estimated delivery times vary by location. You can see the shipping options available during checkout.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
};

export default HelpSupportPage;
