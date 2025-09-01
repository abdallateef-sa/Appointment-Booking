/**
 * Generate HTML template for OTP email verification
 * @param {string} otp - The 6-digit OTP code
 * @param {string} recipientName - Optional recipient name
 * @returns {string} HTML template for email
 */
export const generateOtpEmailTemplate = (otp, recipientName = "User") => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 300;
            }
            .content {
                padding: 40px 30px;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #555;
            }
            .message {
                font-size: 16px;
                margin-bottom: 30px;
                line-height: 1.8;
                color: #666;
            }
            .otp-container {
                text-align: center;
                margin: 40px 0;
                padding: 30px;
                background: #f8f9ff;
                border-radius: 15px;
                border: 2px dashed #667eea;
            }
            .otp-label {
                font-size: 14px;
                color: #888;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .otp-code {
                font-size: 36px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
                background: white;
                padding: 20px 30px;
                border-radius: 10px;
                display: inline-block;
                box-shadow: 0 2px 10px rgba(102, 126, 234, 0.2);
            }
            .warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
            }
            .warning-icon {
                color: #e17055;
                font-size: 18px;
                margin-right: 10px;
            }
            .warning-text {
                color: #856404;
                font-size: 14px;
                margin: 0;
            }
            .footer {
                background: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #eee;
            }
            .footer p {
                margin: 0;
                font-size: 14px;
                color: #888;
            }
            .company-name {
                color: #667eea;
                font-weight: bold;
            }
            .security-note {
                background: #e8f5e8;
                border-left: 4px solid #28a745;
                padding: 15px 20px;
                margin: 20px 0;
                border-radius: 0 8px 8px 0;
            }
            .security-note p {
                margin: 0;
                font-size: 14px;
                color: #155724;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Email Verification</h1>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Hello ${recipientName}! 👋
                </div>
                
                <div class="message">
                    Welcome to our <span class="company-name">Appointment Booking System</span>! 
                    To complete your registration, please verify your email address using the code below.
                </div>
                
                <div class="otp-container">
                    <div class="otp-label">Your Verification Code</div>
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="warning">
                    <span class="warning-icon">⚠️</span>
                    <p class="warning-text">
                        <strong>Important:</strong> This verification code will expire in <strong>10 minutes</strong>. 
                        Please use it promptly to complete your registration.
                    </p>
                </div>
                
                <div class="security-note">
                    <p>
                        <strong>🛡️ Security Note:</strong> If you did not request this verification code, 
                        please ignore this email. Your account security is important to us.
                    </p>
                </div>
                
                <div class="message">
                    After entering this code, you'll be able to complete your profile and start booking appointments.
                </div>
            </div>
            
            <div class="footer">
                <p>
                    Thank you for choosing <span class="company-name">Appointment Booking System</span>
                </p>
                <p style="margin-top: 10px; font-size: 12px;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Generate simple text version for email clients that don't support HTML
 * @param {string} otp - The 6-digit OTP code
 * @param {string} recipientName - Optional recipient name
 * @returns {string} Plain text template for email
 */
export const generateOtpTextTemplate = (otp, recipientName = "User") => {
  return `
Hello ${recipientName}!

Welcome to Appointment Booking System!

Your email verification code is: ${otp}

Please use this code to verify your email address and complete your registration.

IMPORTANT: This code will expire in 10 minutes.

If you did not request this verification, please ignore this email.

Thank you for joining us!

---
Appointment Booking System
This is an automated message. Please do not reply.
  `.trim();
};
