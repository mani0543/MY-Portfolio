
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

// Mock reviews data
const initialReviews = [
  {
    id: "1",
    userId: "1",
    userName: "John Doe",
    rating: 5,
    comment: "Excellent app with great features! I love the user interface and how easy it is to navigate.",
    date: "2025-05-10"
  },
  {
    id: "2",
    userId: "2",
    userName: "Sarah Johnson",
    rating: 4,
    comment: "Very good app overall. Could use some minor improvements but I'm satisfied with my experience.",
    date: "2025-05-08"
  },
  {
    id: "3",
    userId: "3",
    userName: "Mike Anderson",
    rating: 5,
    comment: "This is exactly what I was looking for. The customer service is amazing too!",
    date: "2025-05-05"
  }
];

const ReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState(initialReviews);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  
  const handleSubmitReview = () => {
    if (!user) {
      toast.error("Please login to leave a review");
      navigate("/login?redirect=reviews");
      return;
    }
    
    if (!newReview.trim()) {
      toast.error("Please write a review");
      return;
    }
    
    const review = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      rating,
      comment: newReview,
      date: new Date().toISOString().split('T')[0]
    };
    
    setReviews(prev => [review, ...prev]);
    setNewReview("");
    setRating(5);
    toast.success("Review submitted successfully");
  };
  
  const StarRating = ({ count, value, onChange }: { count: number, value: number, onChange?: (rating: number) => void }) => {
    const stars = Array.from({ length: count }, (_, i) => i + 1);
    
    return (
      <div className="flex">
        {stars.map(star => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer ${
              star <= value ? "fill-primary text-primary" : "text-muted-foreground"
            }`}
            onClick={() => onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold ml-2">Reviews</h1>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="bg-card rounded-lg p-4 space-y-4">
          <h2 className="font-semibold">Write a Review</h2>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Your Rating</p>
            <StarRating count={5} value={rating} onChange={setRating} />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Your Review</p>
            <Textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Share your experience..."
              className="min-h-[100px]"
            />
          </div>
          
          <Button className="w-full" onClick={handleSubmitReview}>
            Submit Review
          </Button>
        </div>
        
        <div className="space-y-4">
          <h2 className="font-semibold">Customer Reviews ({reviews.length})</h2>
          
          {reviews.map(review => (
            <div key={review.id} className="bg-card rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{review.userName}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
                <StarRating count={5} value={review.rating} />
              </div>
              
              <p className="text-sm">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
