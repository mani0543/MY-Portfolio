
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  
  const copyEmail = () => {
    navigator.clipboard.writeText("itxmemani0543@gmail.com");
    toast.success("Email copied to clipboard!");
  };
  
  const openWhatsApp = () => {
    window.open("https://wa.me/923155296456", "_blank");
  };
  
  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold ml-2">Support</h1>
      </div>
      
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>Reach out to our support team for help</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="flex items-center justify-between p-4 bg-card rounded-lg border cursor-pointer"
              onClick={copyEmail}
            >
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">Email Support</h3>
                  <p className="text-sm text-muted-foreground">itxmemani0543@gmail.com</p>
                </div>
              </div>
              <Button size="sm" variant="secondary">Copy</Button>
            </div>
            
            <div 
              className="flex items-center justify-between p-4 bg-card rounded-lg border cursor-pointer"
              onClick={openWhatsApp}
            >
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">WhatsApp Support</h3>
                  <p className="text-sm text-muted-foreground">+92 315 529 6456</p>
                </div>
              </div>
              <Button size="sm" variant="secondary">Chat</Button>
            </div>
            
            <div 
              className="flex items-center justify-between p-4 bg-card rounded-lg border cursor-pointer"
              onClick={() => navigate("/reviews")}
            >
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">Leave a Review</h3>
                  <p className="text-sm text-muted-foreground">Share your experience with us</p>
                </div>
              </div>
              <Button size="sm" variant="secondary">Review</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I track my order?</AccordionTrigger>
                <AccordionContent>
                  You can track your order by going to the "Orders" section in your profile and selecting the specific order you want to track.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>What is your return policy?</AccordionTrigger>
                <AccordionContent>
                  We offer a 30-day return policy for most items. Products must be in original condition with tags attached and original packaging.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>How do I change my password?</AccordionTrigger>
                <AccordionContent>
                  Go to Settings, then select Profile Security, and you'll find the option to change your password.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>Do you ship internationally?</AccordionTrigger>
                <AccordionContent>
                  Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>How do I add items to favorites?</AccordionTrigger>
                <AccordionContent>
                  Simply tap the heart icon on any product to add it to your favorites. You can view all your favorite items in the Favorites section.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportPage;
