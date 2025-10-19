
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { EmailVerificationResult } from "@/server/api";

interface EmailFormProps {
  onVerificationComplete: (result: EmailVerificationResult) => void;
  onVerificationStart: () => void;
}

export function EmailForm({ onVerificationComplete, onVerificationStart }: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  
  // Define the API URL - will fallback to mock verification if the API is not available
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to verify",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsVerifying(true);
      onVerificationStart();
      
      // Try to use the backend API first
      try {
        console.log(`Attempting to connect to backend API at ${API_URL}/verify`);
        const response = await fetch(`${API_URL}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Verification result from API:', result);
          onVerificationComplete(result);
          return;
        }
        
        // If we're here, the API request failed but we'll fallback to the mock
        console.warn('Backend API request failed, falling back to mock verification');
        toast({
          title: "Backend Connection Failed",
          description: "Using simplified verification instead. For best results, ensure the backend server is running.",
          variant: "destructive",
        });
      } catch (apiError) {
        console.warn('Error calling backend API, falling back to mock verification:', apiError);
        toast({
          title: "Backend Connection Failed",
          description: "Using simplified verification instead. For best results, ensure the backend server is running.",
          variant: "destructive",
        });
      }
      
      // Fallback to the mock verification (original implementation)
      const { verifyEmail } = await import('@/server/api');
      const result = await verifyEmail(email);
      onVerificationComplete(result);
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Failed",
        description: "There was an error verifying the email address",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Enter email address to verify"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isVerifying}
          className="w-full h-12"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full h-12"
        disabled={isVerifying}
      >
        {isVerifying ? "Verifying..." : "Verify Email"}
      </Button>
    </form>
  );
}
