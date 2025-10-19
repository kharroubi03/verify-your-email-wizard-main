
import { useState } from "react";
import { EmailVerificationResult } from "@/server/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface VerificationResultProps {
  result: EmailVerificationResult | null;
  onBack: () => void;
}

export function VerificationResult({ result, onBack }: VerificationResultProps) {
  const [showJson, setShowJson] = useState(false);

  if (!result) return null;

  const jsonResult = {
    email: result.email,
    isValid: result.isValid,
    reason: result.reason
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Verification Result</CardTitle>
            <Badge
              variant="outline"
              className={`${
                result.isValid 
                  ? "bg-valid/10 text-valid border-valid/30" 
                  : "bg-invalid/10 text-invalid border-invalid/30"
              }`}
            >
              {result.isValid ? "Valid" : "Invalid"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="font-mono text-sm break-all">{result.email}</p>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Verification Steps</div>
            
            <div className="space-y-2">
              <StepResult 
                name="Syntax Check" 
                result={result.steps.syntax} 
              />
              <StepResult 
                name="MX Records" 
                result={result.steps.mxRecord} 
              />
              <StepResult 
                name="SMTP Verification" 
                result={result.steps.smtp} 
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowJson(!showJson)}
            >
              {showJson ? "Hide" : "Show"} JSON Response
            </Button>
            
            {showJson && (
              <div className="bg-muted p-3 rounded-md overflow-x-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                  {JSON.stringify(jsonResult, null, 2)}
                </pre>
              </div>
            )}

            <Button 
              className="w-full"
              onClick={onBack}
            >
              Verify Another Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StepResultProps {
  name: string;
  result: { valid: boolean; message: string };
}

function StepResult({ name, result }: StepResultProps) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
          result.valid ? "bg-valid/20" : "bg-invalid/20"
        }`}>
          {result.valid 
            ? <Check className="w-3 h-3 text-valid" /> 
            : <X className="w-3 h-3 text-invalid" />
          }
        </div>
        <span className="text-sm font-medium">{name}</span>
      </div>
      <span className="text-xs text-muted-foreground">{result.message}</span>
    </div>
  );
}
