
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const WelcomeScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading progress
    const timer = setTimeout(() => {
      setProgress(100);
    }, 1000);

    // Navigate to home page after animation completes
    const navigationTimer = setTimeout(() => {
      navigate('/');
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(navigationTimer);
    };
  }, [navigate]);

  // Update progress smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-primary text-white z-50">
      <h1 className="text-3xl font-bold mb-2">Mani's Ecommerce App</h1>
      <p className="text-lg mb-8">Login And Order Your Style</p>
      
      <div className="w-64 mb-4">
        <Progress value={progress} className="h-2 bg-white/20" />
      </div>
    </div>
  );
};

export default WelcomeScreen;
