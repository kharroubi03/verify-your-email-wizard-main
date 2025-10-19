
import { validateEmail } from "./emailValidator";

// Function to handle the email verification API request
export async function verifyEmail(email: string): Promise<EmailVerificationResult> {
  try {
    // Start with basic validation
    const syntaxResult = validateEmailSyntax(email);
    if (!syntaxResult.isValid) {
      return {
        email,
        isValid: false,
        reason: syntaxResult.reason,
        steps: {
          syntax: { valid: false, message: syntaxResult.reason },
          mxRecord: { valid: false, message: "Not checked" },
          smtp: { valid: false, message: "Not checked" }
        }
      };
    }

    // Perform full validation
    const result = await validateEmail(email);
    return {
      email,
      isValid: result.isValid,
      reason: result.reason,
      steps: result.steps
    };
  } catch (error) {
    console.error("Error verifying email:", error);
    return {
      email,
      isValid: false,
      reason: "Verification failed due to an error",
      steps: {
        syntax: { valid: true, message: "Valid format" },
        mxRecord: { valid: false, message: "Error during check" },
        smtp: { valid: false, message: "Error during check" }
      }
    };
  }
}

// Function to validate email syntax
function validateEmailSyntax(email: string): { isValid: boolean; reason: string } {
  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, reason: "Email is required" };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, reason: "Invalid email format" };
  }
  
  return { isValid: true, reason: "Valid email format" };
}

// Types
export interface EmailVerificationResult {
  email: string;
  isValid: boolean;
  reason: string;
  steps: {
    syntax: ValidationStep;
    mxRecord: ValidationStep;
    smtp: ValidationStep;
  };
}

export interface ValidationStep {
  valid: boolean;
  message: string;
}
