export const emailTemplates = {
  // Registration confirmation email
  registrationConfirmation: (institutionName: string, contactName: string) => ({
    subject: "Registration Successful - CBPD Admin Portal",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmation</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
          .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #007bff;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
          }
          .title {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .highlight {
            background-color: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
            margin: 20px 0;
          }
          .status-badge {
            display: inline-block;
            background-color: #ffc107;
            color: #212529;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .contact-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">CBPD Admin Portal</div>
            <div style="color: #666; font-size: 16px;">Capacity Building and Professional Development</div>
          </div>
          
          <h2 class="title">Registration Successful!</h2>
          
          <div class="content">
            <p>Dear <strong>${contactName}</strong>,</p>
            
            <p>Thank you for registering <strong>${institutionName}</strong> with the CBPD Admin Portal. We have successfully received your registration request.</p>
            
            <div class="highlight">
              <h3 style="margin-top: 0; color: #007bff;">Current Status</h3>
              <p><span class="status-badge">Pending Approval</span></p>
              <p>Your institution registration is currently under review by our administrative team. You will receive another email notification once your account has been approved.</p>
            </div>
            
            <h3 style="color: #2c3e50;">What happens next?</h3>
            <ul style="padding-left: 20px;">
              <li>Our team will review your registration details</li>
              <li>We may contact you if additional information is required</li>
              <li>Once approved, you'll receive login credentials and access instructions</li>
              <li>You'll be able to access all portal features and manage your students</li>
            </ul>
            
            <div class="contact-info">
              <h4 style="margin-top: 0; color: #2c3e50;">Need Help?</h4>
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team:</p>
              <p>📧 Email: support@cbpd.com<br>
              📞 Phone: +1 (555) 123-4567<br>
              🕒 Business Hours: Monday - Friday, 9:00 AM - 5:00 PM</p>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated message from CBPD Admin Portal. Please do not reply to this email.</p>
            <p>&copy; 2024 CBPD Admin Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Dear ${contactName},
      
      Thank you for registering ${institutionName} with the CBPD Admin Portal.
      
      Your registration is currently pending approval. You will receive another email notification once your account has been approved.
      
      If you have any questions, please contact our support team at support@cbpd.com or +1 (555) 123-4567.
      
      Best regards,
      CBPD Admin Portal Team
    `
  }),

  // Approval notification email
  approvalNotification: (institutionName: string, contactName: string, loginEmail: string) => ({
    subject: "Account Approved - Welcome to CBPD Admin Portal",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #28a745;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #28a745;
            margin-bottom: 10px;
          }
          .title {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .success-badge {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
          }
          .login-info {
            background-color: #e8f5e8;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #28a745;
            margin: 20px 0;
          }
          .cta-button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .features-list {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">CBPD Admin Portal</div>
            <div style="color: #666; font-size: 16px;">Capacity Building and Professional Development</div>
          </div>
          
          <h2 class="title">🎉 Congratulations! Your Account is Approved</h2>
          
          <div class="content">
            <p>Dear <strong>${contactName}</strong>,</p>
            
            <p>Great news! Your institution <strong>${institutionName}</strong> has been approved and is now active in the CBPD Admin Portal.</p>
            
            <p><span class="success-badge">✓ Account Approved</span></p>
            
            <div class="login-info">
              <h3 style="margin-top: 0; color: #28a745;">Your Login Details</h3>
              <p><strong>Email:</strong> ${loginEmail}</p>
              <p><strong>Password:</strong> Use your existing password</p>
              <p style="margin-bottom: 0;"><em>If you've forgotten your password, you can reset it using the "Forgot Password" link on the login page.</em></p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cbpd-admin.com'}/login" class="cta-button">Login to Your Account</a>
            </div>
            
            <div class="features-list">
              <h3 style="margin-top: 0; color: #2c3e50;">What you can do now:</h3>
              <ul style="padding-left: 20px; margin-bottom: 0;">
                <li>Manage student registrations and profiles</li>
                <li>Access course materials and resources</li>
                <li>Generate reports and analytics</li>
                <li>Bulk upload student data</li>
                <li>Export student information</li>
                <li>Track student progress and achievements</li>
              </ul>
            </div>
            
            <h3 style="color: #2c3e50;">Need Help Getting Started?</h3>
            <p>Our support team is here to help you make the most of the CBPD Admin Portal:</p>
            <p>📧 Email: support@cbpd.com<br>
            📞 Phone: +1 (555) 123-4567<br>
            🕒 Business Hours: Monday - Friday, 9:00 AM - 5:00 PM</p>
          </div>
          
          <div class="footer">
            <p>Welcome to the CBPD community! We're excited to have you on board.</p>
            <p>&copy; 2024 CBPD Admin Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Dear ${contactName},
      
      Congratulations! Your institution ${institutionName} has been approved for the CBPD Admin Portal.
      
      Login Details:
      Email: ${loginEmail}
      Password: Use your existing password
      
      Login URL: ${process.env.NEXT_PUBLIC_APP_URL || 'https://cbpd-admin.com'}/login
      
      If you need assistance, contact our support team at support@cbpd.com or +1 (555) 123-4567.
      
      Welcome to CBPD!
      CBPD Admin Portal Team
    `
  }),

  // Password reset email
  passwordReset: (institutionName: string, contactName: string, resetToken: string) => ({
    subject: "Password Reset Request - CBPD Admin Portal",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #dc3545;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #dc3545;
            margin-bottom: 10px;
          }
          .title {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .reset-info {
            background-color: #fff3cd;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
          }
          .cta-button {
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .security-note {
            background-color: #f8d7da;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #dc3545;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">CBPD Admin Portal</div>
            <div style="color: #666; font-size: 16px;">Capacity Building and Professional Development</div>
          </div>
          
          <h2 class="title">🔐 Password Reset Request</h2>
          
          <div class="content">
            <p>Dear <strong>${contactName}</strong>,</p>
            
            <p>We received a request to reset the password for your CBPD Admin Portal account associated with <strong>${institutionName}</strong>.</p>
            
            <div class="reset-info">
              <h3 style="margin-top: 0; color: #856404;">Reset Your Password</h3>
              <p>Click the button below to reset your password. This link will expire in 1 hour for security reasons.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://cbpd-admin.com'}/reset-password?token=${resetToken}" class="cta-button">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${process.env.NEXT_PUBLIC_APP_URL || 'https://cbpd-admin.com'}/reset-password?token=${resetToken}
            </p>
            
            <div class="security-note">
              <h4 style="margin-top: 0; color: #721c24;">Security Notice</h4>
              <ul style="margin-bottom: 0; padding-left: 20px;">
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>This reset link will expire in 1 hour</li>
                <li>For security, this link can only be used once</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <p>If you continue to have problems or didn't request this reset, please contact our support team:</p>
            <p>📧 Email: support@cbpd.com<br>
            📞 Phone: +1 (555) 123-4567</p>
          </div>
          
          <div class="footer">
            <p>This is an automated security message from CBPD Admin Portal.</p>
            <p>&copy; 2024 CBPD Admin Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Dear ${contactName},
      
      We received a request to reset the password for your CBPD Admin Portal account for ${institutionName}.
      
      Reset your password by clicking this link:
      ${process.env.NEXT_PUBLIC_APP_URL || 'https://cbpd-admin.com'}/reset-password?token=${resetToken}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this reset, please ignore this email.
      
      For assistance, contact support@cbpd.com or +1 (555) 123-4567.
      
      CBPD Admin Portal Team
    `
  })
};