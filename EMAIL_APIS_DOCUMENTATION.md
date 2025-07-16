# Email and Password Reset APIs Documentation

This document describes the email functionality and password reset APIs for institutions in the CBPD Admin Portal.

## Overview

The system now includes:
- Professional email templates for registration confirmation and approval notifications
- Forgot password functionality for institutions
- Password reset with secure token-based verification
- Automatic email notifications for registration and approval events

## Email Templates

### 1. Registration Confirmation Email
- **Trigger**: Sent automatically when an institution registers
- **Recipients**: Institution's contact email address
- **Content**: Welcome message, pending approval status, next steps
- **Design**: Professional layout with CBPD branding

### 2. Approval Notification Email
- **Trigger**: Sent when admin approves an institution
- **Recipients**: Institution's contact email address
- **Content**: Approval confirmation, login credentials, feature overview
- **Design**: Congratulatory design with call-to-action button

### 3. Password Reset Email
- **Trigger**: Sent when institution requests password reset
- **Recipients**: Institution's contact email address
- **Content**: Secure reset link, security instructions, expiry information
- **Design**: Security-focused design with clear instructions

## API Endpoints

### 1. Institution Registration (Updated)
**Endpoint**: `POST /api/institution/registration`

**Changes Made**:
- Added automatic email sending after successful registration
- Email failure doesn't prevent registration completion
- Logs email sending status

**Email Sent**: Registration confirmation email

### 2. Institution Approval (Updated)
**Endpoint**: `PUT /api/admin/institutions/[id]`

**Changes Made**:
- Added email notification when institution is approved
- Only sends email on first-time approval (not re-approval)
- Email failure doesn't prevent approval process

**Email Sent**: Approval notification email

### 3. Forgot Password
**Endpoint**: `POST /api/institution/forgot-password`

**Request Body**:
```json
{
  "email": "institution@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Features**:
- Prevents email enumeration attacks
- Checks institution approval and termination status
- Generates secure reset token with 1-hour expiry
- Clears token if email sending fails

### 4. Reset Password
**Endpoint**: `POST /api/institution/reset-password`

**Request Body**:
```json
{
  "token": "secure-reset-token",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

**Features**:
- Validates token expiry and authenticity
- Enforces password requirements (minimum 6 characters)
- Checks password confirmation match
- Verifies institution status (approved, not terminated)
- Clears reset token after successful reset

### 5. Verify Reset Token
**Endpoint**: `GET /api/institution/reset-password?token=secure-reset-token`

**Response**:
```json
{
  "success": true,
  "data": {
    "institutionName": "Example University",
    "contactName": "John Doe"
  },
  "message": "Reset token is valid"
}
```

**Features**:
- Validates token without consuming it
- Returns institution information for UI display
- Checks institution status

## Database Schema Updates

### Institution Model Changes
Added new fields to the Organization schema:

```typescript
// Password Reset Fields
resetPasswordToken: {
  type: String,
  default: null,
},
resetPasswordExpires: {
  type: Date,
  default: null,
},
```

## Email Service Architecture

### EmailService Class
Located in `/src/lib/emailService.ts`

**Methods**:
- `sendRegistrationConfirmation(email, institutionName, contactName)`
- `sendApprovalNotification(email, institutionName, contactName, loginEmail)`
- `sendPasswordReset(email, institutionName, contactName, resetToken)`

### Email Templates
Located in `/src/lib/emailTemplates.ts`

**Features**:
- Responsive HTML design
- Professional branding
- Plain text fallback
- Security-focused messaging for password reset

### Token Utilities
Located in `/src/lib/tokenUtils.ts`

**Features**:
- Secure token generation using crypto.randomBytes
- Token expiry management
- Verification code generation

## Security Features

### Password Reset Security
1. **Token-based authentication**: Secure random tokens with expiry
2. **Email enumeration prevention**: Same response for valid/invalid emails
3. **Status verification**: Checks approval and termination status
4. **Single-use tokens**: Tokens are cleared after use
5. **Time-limited access**: 1-hour token expiry
6. **Secure token generation**: Uses crypto.randomBytes

### Email Security
1. **Professional templates**: Reduces phishing risk
2. **Clear security messaging**: Educates users about security
3. **No sensitive data in emails**: Only necessary information included
4. **Branded communications**: Consistent CBPD branding

## Environment Variables Required

Ensure these environment variables are set:

```env
# Email Configuration
HOST=smtp.gmail.com
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password

# Application URL (for reset links)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Error Handling

### Email Sending Failures
- Registration: Logs error but doesn't fail registration
- Approval: Logs error but doesn't fail approval
- Password Reset: Clears token and returns error

### Token Validation
- Invalid tokens return appropriate error messages
- Expired tokens are handled gracefully
- Missing tokens return validation errors

## Usage Examples

### Frontend Integration

#### Forgot Password Form
```typescript
const handleForgotPassword = async (email: string) => {
  const response = await fetch('/api/institution/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  // Always shows success message for security
  showMessage(data.message);
};
```

#### Reset Password Form
```typescript
const handleResetPassword = async (token: string, password: string, confirmPassword: string) => {
  const response = await fetch('/api/institution/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password, confirmPassword })
  });
  
  const data = await response.json();
  if (data.success) {
    // Redirect to login
    router.push('/login');
  } else {
    showError(data.error);
  }
};
```

## Testing

### Email Testing
1. Use a test email service or Gmail with app passwords
2. Test all three email types (registration, approval, password reset)
3. Verify email formatting and links

### API Testing
1. Test forgot password with valid/invalid emails
2. Test password reset with valid/invalid/expired tokens
3. Test edge cases (terminated accounts, unapproved accounts)

## Monitoring and Logging

### Email Logs
- Successful email sends are logged with message IDs
- Failed email sends are logged with error details
- Email service errors don't crash the application

### Security Logs
- Password reset requests are logged
- Invalid token attempts are logged
- Failed authentication attempts are logged

## Future Enhancements

### Potential Improvements
1. **Email templates customization**: Admin panel for template editing
2. **Multi-language support**: Localized email templates
3. **Email analytics**: Track open rates and click-through rates
4. **SMS notifications**: Alternative to email notifications
5. **Two-factor authentication**: Enhanced security for password reset
6. **Rate limiting**: Prevent abuse of password reset functionality

### Scalability Considerations
1. **Email queue system**: For high-volume email sending
2. **Template caching**: Improve performance for frequent emails
3. **Email service redundancy**: Multiple email providers for reliability
4. **Database indexing**: Optimize token lookup performance