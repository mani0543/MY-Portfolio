
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold ml-2">Privacy Policy</h1>
      </div>

      <div className="p-4 space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-3">Our Commitment to Privacy</h2>
          <p className="text-muted-foreground">
            We respect your privacy and are committed to protecting it through our compliance with this policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Information We Collect</h2>
          <p className="text-muted-foreground mb-2">
            We collect several types of information from and about users of our website, including:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Personal information (name, email address, etc.)</li>
            <li>Usage information and browsing history</li>
            <li>Device and browser information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">How We Use Your Information</h2>
          <p className="text-muted-foreground mb-2">
            We use information that we collect about you or that you provide to us:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>To provide and improve our services</li>
            <li>To process your orders and transactions</li>
            <li>To communicate with you about your account or orders</li>
            <li>To personalize your experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Security of Your Information</h2>
          <p className="text-muted-foreground">
            We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Contact Information</h2>
          <p className="text-muted-foreground">
            If you have any questions about this privacy policy or our practices, please contact us at privacy@example.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
