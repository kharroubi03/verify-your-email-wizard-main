
import { ValidationStep } from "./api";

interface ValidationResult {
  isValid: boolean;
  reason: string;
  steps: {
    syntax: ValidationStep;
    mxRecord: ValidationStep;
    smtp: ValidationStep;
  };
}

export async function validateEmail(email: string): Promise<ValidationResult> {
  // Initialize the result with syntax validation
  const result: ValidationResult = {
    isValid: true,
    reason: "Valid email",
    steps: {
      syntax: { valid: true, message: "Valid format" },
      mxRecord: { valid: false, message: "Not checked yet" },
      smtp: { valid: false, message: "Not checked yet" }
    }
  };

  try {
    // 1. Check MX Records
    const mxResult = await checkMXRecords(email);
    result.steps.mxRecord = mxResult;
    
    if (!mxResult.valid) {
      result.isValid = false;
      result.reason = "Domain doesn't have valid mail servers";
      return result;
    }

    // 2. SMTP verification
    const smtpResult = await performSMTPCheck(email);
    result.steps.smtp = smtpResult;
    
    if (!smtpResult.valid) {
      result.isValid = false;
      result.reason = smtpResult.message;
      return result;
    }

    // All checks passed
    result.isValid = true;
    result.reason = "Email is valid and exists";

  } catch (error) {
    console.error("Error in email validation:", error);
    result.isValid = false;
    result.reason = "Verification failed due to an error";
  }

  return result;
}

// Function to check MX records
async function checkMXRecords(email: string): Promise<ValidationStep> {
  try {
    // Simulate MX record check with a delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const domain = email.split('@')[1];
    
    // For demo purposes - some domains we'll mark as invalid
    const invalidDomains = ['invalid.com', 'nonexistent.org', 'fake.net'];
    if (invalidDomains.includes(domain)) {
      return { valid: false, message: `No mail servers found for ${domain}` };
    }
    
    return { valid: true, message: "Mail servers found" };
  } catch (error) {
    console.error("Error checking MX records:", error);
    return { valid: false, message: "Failed to check mail servers" };
  }
}

// Function to perform SMTP check
async function performSMTPCheck(email: string): Promise<ValidationStep> {
  try {
    // Simulate SMTP verification with a delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // For demo purposes - some emails we'll mark as invalid
    const nonExistentEmails = ['nonexistent@gmail.com', 'fake@yahoo.com', 'notreal@hotmail.com'];
    if (nonExistentEmails.includes(email)) {
      return { valid: false, message: "Mailbox doesn't exist" };
    }
    
    // Randomly mark some other addresses as invalid for demonstration
    if (email.includes('test') && Math.random() > 0.7) {
      return { valid: false, message: "Mailbox verification failed" };
    }
    
    return { valid: true, message: "Mailbox exists" };
  } catch (error) {
    console.error("Error in SMTP verification:", error);
    return { valid: false, message: "Failed to verify mailbox" };
  }
}
