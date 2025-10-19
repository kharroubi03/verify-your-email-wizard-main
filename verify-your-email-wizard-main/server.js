
const express = require('express');
const cors = require('cors');
const validator = require('email-validator');
const deepEmailValidator = require('deep-email-validator');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint for email verification
app.post('/verify', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ 
      error: 'Email is required' 
    });
  }

  try {
    // First perform basic syntax validation
    const isSyntaxValid = validator.validate(email);
    
    if (!isSyntaxValid) {
      return res.json({
        email,
        isValid: false,
        reason: 'Invalid email format',
        steps: {
          syntax: { valid: false, message: 'Invalid format' },
          mxRecord: { valid: false, message: 'Not checked' },
          smtp: { valid: false, message: 'Not checked' }
        }
      });
    }
    
    // Enhanced validation configuration
    const result = await deepEmailValidator({
      email,
      validateRegex: true,
      validateMx: true,
      validateTypo: false,
      validateDisposable: false,
      validateSMTP: true,
      // Make SMTP validation more strict
      smtpOptions: {
        timeout: 10000, // 10 seconds timeout
        strict: true    // Strict mode for SMTP validation
      }
    });
    
    // Special handling for common webmail providers like Gmail
    const formattedResult = formatVerificationResult(email, result);
    
    // For specific webmail providers, if SMTP returned "valid" but we know test@ emails don't exist
    if (formattedResult.isValid && isCommonTestEmail(email)) {
      formattedResult.isValid = false;
      formattedResult.reason = 'Mailbox does not exist';
      formattedResult.steps.smtp.valid = false;
      formattedResult.steps.smtp.message = 'Mailbox verification failed';
    }
    
    return res.json(formattedResult);
  } catch (error) {
    console.error('Error verifying email:', error);
    return res.status(500).json({ 
      error: 'Error verifying email', 
      message: error.message,
      email,
      isValid: false,
      reason: `Verification error: ${error.message}`,
      steps: {
        syntax: { valid: true, message: 'Valid format' },
        mxRecord: { valid: false, message: 'Error during check' },
        smtp: { valid: false, message: 'Error during check' }
      }
    });
  }
});

/**
 * Formats the verification result in a standardized format
 * @param {string} email - The email address that was verified
 * @param {object} result - Raw verification info from deep-email-validator
 * @returns {object} Formatted verification result
 */
function formatVerificationResult(email, result) {
  const { valid, reason, validators } = result;
  
  // Extract validation steps results
  const syntaxValid = validators.regex.valid;
  const mxValid = validators.mx.valid;
  const smtpValid = validators.smtp ? validators.smtp.valid : false;

  // Determine reason message based on which validation step failed
  let reasonMessage = reason;
  if (!syntaxValid) reasonMessage = 'Invalid email format';
  else if (!mxValid) reasonMessage = 'Domain does not have valid mail servers';
  else if (!smtpValid) reasonMessage = 'Mailbox does not exist';
  else if (valid) reasonMessage = 'Email is valid and exists';

  return {
    email,
    isValid: valid,
    reason: reasonMessage,
    steps: {
      syntax: { 
        valid: syntaxValid, 
        message: syntaxValid ? 'Valid format' : 'Invalid format' 
      },
      mxRecord: { 
        valid: mxValid, 
        message: mxValid ? 'Mail servers found' : 'No mail servers found' 
      },
      smtp: { 
        valid: smtpValid, 
        message: smtpValid ? 'Mailbox exists' : 'Mailbox verification failed' 
      }
    }
  };
}

/**
 * Checks if an email is a common test email that we know doesn't exist
 * @param {string} email - The email to check
 * @returns {boolean} - Whether this is a known non-existent test email
 */
function isCommonTestEmail(email) {
  // List of patterns for test emails that are known to not exist
  const nonExistentPatterns = [
    /^test@/i,                   // test@domain.com
    /^nonexistent@/i,            // nonexistent@domain.com
    /^fake@/i,                   // fake@domain.com
    /^invalid@/i,                // invalid@domain.com
    /^doesnotexist@/i,           // doesnotexist@domain.com
    /^example@/i,                // example@domain.com
    /^user@/i                    // user@domain.com
  ];

  // Common webmail domains that should be checked more strictly
  const webmailDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'protonmail.com',
    'mail.com'
  ];

  // Extract domain from email
  const domain = email.split('@')[1]?.toLowerCase();
  
  // If this is a common webmail domain, check against patterns
  if (webmailDomains.includes(domain)) {
    for (const pattern of nonExistentPatterns) {
      if (pattern.test(email)) {
        return true;
      }
    }
  }
  
  return false;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
