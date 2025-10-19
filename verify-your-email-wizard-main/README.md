
# Email Verification App

This application verifies email addresses by checking syntax validity, MX records, and performing SMTP validation.

## Features

- Email syntax validation
- MX records check
- SMTP mailbox verification
- Detailed verification steps visualization
- JSON response format

## Setup and Running

### Frontend

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Access the app at http://localhost:5173 (or the port shown in the console)

### Backend

1. Install backend dependencies:
   ```
   npm install
   ```

2. Run the backend server:
   ```
   node server.js
   ```

3. The backend API will be available at http://localhost:3001

## API Endpoint

- **POST /verify**
  - Body: `{ "email": "example@domain.com" }`
  - Response: JSON with verification result
  ```json
  {
    "email": "example@domain.com",
    "isValid": true,
    "reason": "Email is valid and exists",
    "steps": {
      "syntax": { "valid": true, "message": "Valid format" },
      "mxRecord": { "valid": true, "message": "Mail servers found" },
      "smtp": { "valid": true, "message": "Mailbox exists" }
    }
  }
  ```

## Note

- The frontend will automatically fall back to mock verification if the backend is not available.
- To connect to the backend, make sure it's running on the same machine.
