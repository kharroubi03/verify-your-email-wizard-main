
const { verify } = require('email-verifier');

/**
 * Verifies an email address using the email-verifier package
 * @param {string} email - The email address to verify
 * @returns {Promise<object>} - Verification result
 */
async function verifyEmailWithService(email) {
  return new Promise((resolve, reject) => {
    verify(email, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
}

/**
 * Formats the verification result in a standardized format
 * @param {string} email - The email address that was verified
 * @param {object} verificationInfo - Raw verification info from the service
 * @returns {object} Formatted verification result
 */
function formatVerificationResult(email, verificationInfo) {
  const mxValid = verificationInfo.mxRecords && verificationInfo.mxRecords.length > 0;
  const smtpValid = verificationInfo.smtpCheck === 'true' || verificationInfo.smtpCheck === true;
  const formatValid = verificationInfo.formatCheck === 'true' || verificationInfo.formatCheck === true;

  const isValid = formatValid && mxValid && smtpValid;
  
  let reason = isValid ? 'Email is valid and exists' : 'Email validation failed';
  if (!formatValid) reason = 'Invalid email format';
  else if (!mxValid) reason = 'Domain does not have valid mail servers';
  else if (!smtpValid) reason = 'Mailbox verification failed';

  return {
    email,
    isValid,
    reason,
    steps: {
      syntax: { 
        valid: formatValid, 
        message: formatValid ? 'Valid format' : 'Invalid format' 
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
 * Main function to verify an email address
 * @param {string} email - The email address to verify
 * @returns {Promise<object>} - Verification result in a standardized format
 */
async function verifyEmail(email) {
  try {
    // Basic validation first before calling the service
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        email,
        isValid: false,
        reason: 'Invalid email format',
        steps: {
          syntax: { valid: false, message: 'Invalid format' },
          mxRecord: { valid: false, message: 'Not checked' },
          smtp: { valid: false, message: 'Not checked' }
        }
      };
    }

    // Call the email-verifier service
    const verificationInfo = await verifyEmailWithService(email);
    
    // Format and return the result
    return formatVerificationResult(email, verificationInfo);
  } catch (error) {
    console.error('Error in email verification service:', error);
    
    // Return a formatted error response
    return {
      email,
      isValid: false,
      reason: `Verification failed: ${error.message || 'Unknown error'}`,
      steps: {
        syntax: { valid: true, message: 'Valid format' },
        mxRecord: { valid: false, message: 'Error during check' },
        smtp: { valid: false, message: 'Error during check' }
      }
    };
  }
}

module.exports = { verifyEmail };
