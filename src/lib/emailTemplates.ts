export const emailTemplates = {
  // Registration confirmation email
  registrationConfirmation: (institutionName: string, contactName: string) => ({
    subject: "Registration Successful - CBPD",
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
            <img src="cid:cbpdlogo" alt="CBPD Logo" style="max-height: 80px; margin-bottom: 15px;" />
            <div style="color: #666; font-size: 16px;">Central Board Of Professional Development</div>
          </div>
          
          <h2 class="title">Registration Successful!</h2>
          
          <div class="content">
            <p>Dear <strong>${contactName}</strong>,</p>
            
            <p>Thank you for registering <strong>${institutionName}</strong> with the CBPD. We have successfully received your registration request.</p>
            
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
              <p>📧 Email: info@cbpd.co.uk<br>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated message from CBPD. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Dear ${contactName},
      
      Thank you for registering ${institutionName} with the CBPD.
      
      Your registration is currently pending approval. You will receive another email notification once your account has been approved.
      
      If you have any questions, please contact our support team at info@cbpd.co.uk.
      
      Best regards,
      CBPD
    `,
  }),

  // Approval notification email
  approvalNotification: (
    institutionName: string,
    contactName: string,
    loginEmail: string
  ) => ({
    subject: "Account Approved - Welcome to CBPD",
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
            <img src="cid:cbpdlogo" alt="CBPD Logo" style="max-height: 80px; margin-bottom: 15px;" />
            <div style="color: #666; font-size: 16px;">Central Board Of Professional Development</div>
          </div>
          
          <h2 class="title">🎉 Congratulations! Your Account is Approved</h2>
          
          <div class="content">
            <p>Dear <strong>${contactName}</strong>,</p>
            
            <p>Great news! Your institution <strong>${institutionName}</strong> has been approved and is now active in the CBPD</p>
            
            <p><span class="success-badge">✓ Account Approved</span></p>
            
            <div class="login-info">
              <h3 style="margin-top: 0; color: #28a745;">Your Login Details</h3>
              <p><strong>Email:</strong> ${loginEmail}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${
                process.env.NEXT_PUBLIC_APP_URL || "https://cbpd.co.uk"
              }/login" class="cta-button">Login to Your Account</a>
            </div>
            
            
            <h3 style="color: #2c3e50;">Need Help Getting Started?</h3>
            <p>Our support team is here to help you make the most of the CBPD</p>
            <p>📧 Email: info@cbpd.co.uk<br>
          </div>
          
          <div class="footer">
            <p>Welcome to the CBPD! We're excited to have you on board.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Dear ${contactName},
      
      Congratulations! Your institution ${institutionName} has been approved for the CBPD.
      
      Login Details:
      Email: ${loginEmail}
      Password: Use your existing password
      
      Login URL: ${process.env.NEXT_PUBLIC_APP_URL || "https:/cbpd.co.uk"}/login
      
      If you need assistance, contact our support team at info@cbpd.com.
      
      Welcome to CBPD!
    `,
  }),

  // Password reset email
  passwordReset: (
    institutionName: string,
    contactName: string,
    resetToken: string
  ) => ({
    subject: "Password Reset Request - CBPD",
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
            <img src="cid:cbpdlogo" alt="CBPD Logo" style="max-height: 80px; margin-bottom: 15px;" />
            <div style="color: #666; font-size: 16px;">Central Board Of Professional Development</div>
          </div>
          
          <h2 class="title">🔐 Password Reset Request</h2>
          
          <div class="content">
            <p>Dear <strong>${contactName}</strong>,</p>
            
            <p>We received a request to reset the password for your CBPD account associated with <strong>${institutionName}</strong>.</p>
            
            <div class="reset-info">
              <h3 style="margin-top: 0; color: #856404;">Reset Your Password</h3>
              <p>Click the button below to reset your password. This link will expire in 1 hour for security reasons.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${
                process.env.NEXT_PUBLIC_APP_URL || "https://cbpd-admin.com"
              }/reset-password?token=${resetToken}" class="cta-button">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${
                process.env.NEXT_PUBLIC_APP_URL || "https://cbpd-admin.com"
              }/reset-password?token=${resetToken}
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
            <p>📧 Email: info@cbpd.co.uk
          </div>
          
          <div class="footer">
            <p>This is an automated security message from CBPD Admin Portal.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Dear ${contactName},
      
      We received a request to reset the password for your CBPD Admin Portal account for ${institutionName}.
      
      Reset your password by clicking this link:
      ${
        process.env.NEXT_PUBLIC_APP_URL || "https://cbpd-admin.com"
      }/reset-password?token=${resetToken}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this reset, please ignore this email.
      
      For assistance, contact info@cbpd.co.uk
      
      CBPD
    `,
  }),
  // Certificate Request Under Review
  certificateUnderReview: (
    institutionName: string,
  ) => ({
    subject: "Certificate Request Status - Under Review",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate Request Status</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
          .container { background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #ffc107; }
          .logo { font-size: 28px; font-weight: bold; color: #ffc107; margin-bottom: 10px; }
          .content { margin-bottom: 30px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: left; color: #333; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="cid:cbpdlogo" alt="CBPD Logo" style="max-height: 80px; margin-bottom: 15px;" />
            <div style="color: #666; font-size: 16px;">Central Board Of Professional Development</div>
          </div>
          
          <div class="content">
            <p>Dear ${institutionName},</p>
            
            <p>Thank you for contacting the CBPD Certification Services regarding your certificate status request.</p>
            
            <p>We confirm that your submitted learner records and certification documents have been received successfully and are currently <strong>under review</strong> by our Certification & Compliance team.</p>
            
            <p>Our team is presently conducting the internal verification and quality assurance review process. Once the review is completed, the status will be updated in your institution CRM dashboard accordingly.</p>
            
            <p>We kindly request your patience while this process is underway. If any additional information or supporting documentation is required, our team will notify you through the portal or by email.</p>
            
            <p>Thank you for your cooperation.</p>
          </div>
          
          <div class="footer">
            <p>Warm regards,</p>
            <p><strong>Cole Bennett</strong><br>Certification & Compliance Officer<br>The CBPD Certification Services</p>
            <p>1 Canada Square<br>Canary Wharf<br>London E14 5DY<br>United Kingdom.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Dear ${institutionName},
      
      Thank you for contacting the CBPD Certification Services regarding your certificate status request.
      
      We confirm that your submitted learner records and certification documents have been received successfully and are currently under review by our Certification & Compliance team.
      
      Our team is presently conducting the internal verification and quality assurance review process. Once the review is completed, the status will be updated in your institution CRM dashboard accordingly.
      
      We kindly request your patience while this process is underway. If any additional information or supporting documentation is required, our team will notify you through the portal or by email.
      
      Thank you for your cooperation.
      
      Warm regards,
      Cole Bennett
      Certification & Compliance Officer
      The CBPD Certification Services
      1 Canada Square, Canary Wharf, London E14 5DY, United Kingdom.
    `,
  }),

  // Certificate Request Approved
  certificateApproved: (
    institutionName: string,
    batchNumber: string
  ) => ({
    subject: "Certificate Request Status - Approved",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate Request Status</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
          .container { background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #28a745; }
          .logo { font-size: 28px; font-weight: bold; color: #28a745; margin-bottom: 10px; }
          .content { margin-bottom: 30px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: left; color: #333; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="cid:cbpdlogo" alt="CBPD Logo" style="max-height: 80px; margin-bottom: 15px;" />
            <div style="color: #666; font-size: 16px;">Central Board Of Professional Development</div>
          </div>
          
          <div class="content">
            <p>Dear ${institutionName},</p>
            
            <p>Thank you for your certificate status enquiry.</p>
            
            <p>We are pleased to confirm that your submitted learner records have been successfully <strong>reviewed and approved</strong> by the CBPD Certification & Compliance team.</p>
            
            <p>The certification request <strong>for Batch ${batchNumber}</strong> has now moved to <strong>the next stage of processing</strong>. Certificate preparation / printing will proceed accordingly, and <strong>dispatch details will be updated in your institution dashboard</strong> once available.</p>
            
            <p>Thank you for your continued cooperation and for <strong>maintaining the required submission standards</strong>.</p>
          </div>
          
          <div class="footer">
            <p>Warm regards,</p>
            <p><strong>Cole Bennett</strong><br>Certification & Compliance Officer<br>The CBPD Certification Services</p>
            <p>1 Canada Square<br>Canary Wharf<br>London E14 5DY<br>United Kingdom.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Dear ${institutionName},
      
      Thank you for your certificate status enquiry.
      
      We are pleased to confirm that your submitted learner records have been successfully reviewed and approved by the CBPD Certification & Compliance team.
      
      The certification request for Batch ${batchNumber} has now moved to the next stage of processing. Certificate preparation / printing will proceed accordingly, and dispatch details will be updated in your institution dashboard once available.
      
      Thank you for your continued cooperation and for maintaining the required submission standards.
      
      Warm regards,
      Cole Bennett
      Certification & Compliance Officer
      The CBPD Certification Services
      1 Canada Square, Canary Wharf, London E14 5DY, United Kingdom.
    `,
  }),

  // Certificate Request Rejected
  certificateRejected: (
    institutionName: string,
    batchNumber: string
  ) => ({
    subject: "Certificate Request Status - Requires Correction",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate Request Status</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
          .container { background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #dc3545; }
          .logo { font-size: 28px; font-weight: bold; color: #dc3545; margin-bottom: 10px; }
          .content { margin-bottom: 30px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: left; color: #333; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="cid:cbpdlogo" alt="CBPD Logo" style="max-height: 80px; margin-bottom: 15px;" />
            <div style="color: #666; font-size: 16px;">Central Board Of Professional Development</div>
          </div>
          
          <div class="content">
            <p>Dear ${institutionName},</p>
            
            <p>Thank you for your recent certificate status request.</p>
            
            <p>Following our review, we regret to inform you that the submitted learner records for <strong>Batch ${batchNumber}</strong> could not be approved at this stage and currently require correction before certification can proceed.</p>
            
            <p>Our review team has identified one or more issues within the submission, such as incomplete documentation, missing learner information, or discrepancies in the submitted records.</p>
            
            <p>We kindly request that you review the submission and upload the required corrections through your institution CRM portal. Once updated, our Certification & Compliance team will re-review the records as a priority.</p>
            
            <p>Should you require any support regarding the required amendments, please feel free to contact us.</p>
            
            <p>Thank you for your cooperation.</p>
          </div>
          
          <div class="footer">
            <p>Warm regards,</p>
            <p><strong>Cole Bennett</strong><br>Certification & Compliance Officer<br>The CBPD Certification Services</p>
            <p>1 Canada Square<br>Canary Wharf<br>London E14 5DY<br>United Kingdom.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Dear ${institutionName},
      
      Thank you for your recent certificate status request.
      
      Following our review, we regret to inform you that the submitted learner records for Batch ${batchNumber} could not be approved at this stage and currently require correction before certification can proceed.
      
      Our review team has identified one or more issues within the submission, such as incomplete documentation, missing learner information, or discrepancies in the submitted records.
      
      We kindly request that you review the submission and upload the required corrections through your institution CRM portal. Once updated, our Certification & Compliance team will re-review the records as a priority.
      
      Should you require any support regarding the required amendments, please feel free to contact us.
      
      Thank you for your cooperation.
      
      Warm regards,
      Cole Bennett
      Certification & Compliance Officer
      The CBPD Certification Services
      1 Canada Square, Canary Wharf, London E14 5DY, United Kingdom.
    `,
  }),
};
