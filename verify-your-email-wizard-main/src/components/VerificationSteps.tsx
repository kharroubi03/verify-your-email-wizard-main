
import { cn } from "@/lib/utils";

interface VerificationStepsProps {
  currentStep: number | null;
}

const steps = [
  { id: 1, name: "Syntax", description: "Checking email format" },
  { id: 2, name: "MX Records", description: "Verifying domain mail servers" },
  { id: 3, name: "SMTP", description: "Validating mailbox existence" }
];

export function VerificationSteps({ currentStep }: VerificationStepsProps) {
  if (currentStep === null) return null;
  
  return (
    <div className="my-8 w-full max-w-md">
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start">
            <div className="flex-shrink-0 relative">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2",
                  currentStep > step.id 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : currentStep === step.id 
                      ? "border-primary text-primary animate-pulse-opacity"
                      : "border-muted-foreground/30 text-muted-foreground/50"
                )}
              >
                {step.id}
              </div>
              {step.id < steps.length && (
                <div 
                  className={cn(
                    "absolute top-8 left-4 w-0.5 h-5",
                    currentStep > step.id 
                      ? "bg-primary" 
                      : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
            <div className="ml-4 mt-1">
              <h3 
                className={cn(
                  "text-sm font-medium",
                  currentStep >= step.id 
                    ? "text-foreground" 
                    : "text-muted-foreground/70"
                )}
              >
                {step.name}
              </h3>
              <p 
                className={cn(
                  "text-xs mt-1",
                  currentStep >= step.id 
                    ? "text-muted-foreground" 
                    : "text-muted-foreground/50"
                )}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
