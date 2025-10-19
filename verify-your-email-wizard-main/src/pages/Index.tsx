
import { useState } from "react";
import { EmailVerificationResult } from "@/server/api";
import { EmailForm } from "@/components/EmailForm";
import { VerificationResult } from "@/components/VerificationResult";
import { VerificationSteps } from "@/components/VerificationSteps";
import { motion } from "framer-motion";

const Index = () => {
  const [verificationResult, setVerificationResult] = useState<EmailVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  const handleVerificationStart = () => {
    setVerificationResult(null);
    setIsVerifying(true);
    setCurrentStep(1);
    
    // Simulate step progression
    const stepTimers = [
      setTimeout(() => setCurrentStep(2), 1000),
      setTimeout(() => setCurrentStep(3), 2000)
    ];
    
    return () => stepTimers.forEach(timer => clearTimeout(timer));
  };

  const handleVerificationComplete = (result: EmailVerificationResult) => {
    setVerificationResult(result);
    setIsVerifying(false);
    setCurrentStep(null);
  };

  const handleBack = () => {
    setVerificationResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mb-8 text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Email Verification</h1>
        <p className="text-muted-foreground">
          Validate email addresses with syntax checking, MX records, and SMTP verification
        </p>
      </motion.div>
      
      {verificationResult ? (
        <VerificationResult 
          result={verificationResult} 
          onBack={handleBack} 
        />
      ) : (
        <>
          <EmailForm
            onVerificationStart={handleVerificationStart}
            onVerificationComplete={handleVerificationComplete}
          />
          
          <VerificationSteps currentStep={currentStep} />
          
          {isVerifying && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center text-sm text-muted-foreground"
            >
              Verifying email, please wait...
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Index;
