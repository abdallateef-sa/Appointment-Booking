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

/**
 * Generate HTML template for Admin Password Reset
 * @param {string} resetUrl - The password reset URL
 * @param {string} recipientName - Optional recipient name
 * @returns {string} HTML template for email
 */
export const generateAdminForgotPasswordTemplate = (
  resetUrl,
  recipientName = "Admin"
) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Password Reset</title>
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
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
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
            .reset-button {
                display: inline-block;
                background: #dc3545;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
                box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
            }
            .reset-button:hover {
                background: #c82333;
                box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
            }
            .warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
            }
            .warning-icon {
                color: #856404;
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
                color: #dc3545;
                font-weight: bold;
            }
            .security-note {
                background: #f8d7da;
                border-left: 4px solid #dc3545;
                padding: 15px 20px;
                margin: 20px 0;
                border-radius: 0 8px 8px 0;
            }
            .security-note p {
                margin: 0;
                font-size: 14px;
                color: #721c24;
            }
            .reset-link {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                word-break: break-all;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                color: #495057;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Admin Password Reset</h1>
            </div>

            <div class="content">
                <div class="greeting">
                    Hello ${recipientName}! 👋
                </div>

                <div class="message">
                    You have requested to reset your admin password for the <span class="company-name">Appointment Booking System</span>.
                    Click the button below to reset your password.
                </div>

                <div style="text-align: center;">
                    <a href="${resetUrl}" class="reset-button">Reset Password</a>
                </div>

                <div class="message">
                    If the button doesn't work, you can copy and paste this link into your browser:
                </div>

                <div class="reset-link">
                    ${resetUrl}
                </div>

                <div class="warning">
                    <span class="warning-icon">⚠️</span>
                    <p class="warning-text">
                        <strong>Important:</strong> This password reset link will expire in <strong>10 minutes</strong>.
                        Please use it promptly to reset your password.
                    </p>
                </div>

                <div class="security-note">
                    <p>
                        <strong>🛡️ Security Note:</strong> If you did not request this password reset,
                        please ignore this email. Your admin account security is important to us.
                    </p>
                </div>

                <div class="message">
                    After resetting your password, you will be able to access the admin panel and manage appointments.
                </div>
            </div>

            <div class="footer">
                <p>
                    Thank you for being part of <span class="company-name">Appointment Booking System</span>
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
 * Generate simple text version for admin password reset email
 * @param {string} resetUrl - The password reset URL
 * @param {string} recipientName - Optional recipient name
 * @returns {string} Plain text template for email
 */
export const generateAdminForgotPasswordTextTemplate = (
  resetUrl,
  recipientName = "Admin"
) => {
  return `
Hello ${recipientName}!

You have requested to reset your admin password for Appointment Booking System.

Please use this link to reset your password (valid for 10 minutes):
${resetUrl}

IMPORTANT:
- This link will expire in 10 minutes
- If you did not request this reset, please ignore this email

After resetting your password, you will be able to access the admin panel.

---
Appointment Booking System
This is an automated message. Please do not reply.
  `.trim();
};

/**
 * Generate HTML template for Admin Password Reset OTP
 * @param {string} otp - The 6-digit OTP code
 * @param {string} recipientName - Optional recipient name
 * @returns {string} HTML template for email
 */
export const generateAdminOtpTemplate = (otp, recipientName = "Admin") => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Password Reset OTP</title>
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
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
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
                border: 2px dashed #dc3545;
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
                color: #dc3545;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
                background: white;
                padding: 20px 30px;
                border-radius: 10px;
                display: inline-block;
                box-shadow: 0 2px 10px rgba(220, 53, 69, 0.2);
            }
            .warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
            }
            .warning-icon {
                color: #856404;
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
                color: #dc3545;
                font-weight: bold;
            }
            .security-note {
                background: #f8d7da;
                border-left: 4px solid #dc3545;
                padding: 15px 20px;
                margin: 20px 0;
                border-radius: 0 8px 8px 0;
            }
            .security-note p {
                margin: 0;
                font-size: 14px;
                color: #721c24;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Admin Password Reset OTP</h1>
            </div>

            <div class="content">
                <div class="greeting">
                    Hello ${recipientName}! 👋
                </div>

                <div class="message">
                    You requested a password reset for your admin account in the <span class="company-name">Appointment Booking System</span>.
                    Use the OTP code below to reset your password.
                </div>

                <div class="otp-container">
                    <div class="otp-label">Your Reset Code</div>
                    <div class="otp-code">${otp}</div>
                </div>

                <div class="warning">
                    <span class="warning-icon">⚠️</span>
                    <p class="warning-text">
                        <strong>Important:</strong> This OTP will expire in <strong>10 minutes</strong>.
                        Please use it promptly to reset your password.
                    </p>
                </div>

                <div class="security-note">
                    <p>
                        <strong>🛡️ Security Note:</strong> If you did not request this password reset,
                        please ignore this email. Your admin account security is important to us.
                    </p>
                </div>

                <div class="message">
                    After resetting your password, you will be able to access the admin panel and manage appointments.
                </div>
            </div>

            <div class="footer">
                <p>
                    Thank you for being part of <span class="company-name">Appointment Booking System</span>
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
 * Generate simple text version for admin OTP email
 * @param {string} otp - The 6-digit OTP code
 * @param {string} recipientName - Optional recipient name
 * @returns {string} Plain text template for email
 */
export const generateAdminOtpTextTemplate = (otp, recipientName = "Admin") => {
  return `
Hello ${recipientName}!

You requested a password reset for your admin account in Appointment Booking System.

Your OTP is: ${otp}

This OTP will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
Appointment Booking System
  `.trim();
};

/**
 * Build an ICS (iCalendar) string for one or more sessions.
 * Each session is a VEVENT with a default 60-minute duration.
 * Times are encoded as UTC (Z) using DTSTART/DTEND.
 * @param {Object} options
 * @param {string} options.uidBase - Base UID seed, e.g., subscription id or email
 * @param {string} options.organizerEmail - Organizer email (FROM address)
 * @param {string} options.userEmail - Attendee email
 * @param {string} options.planName - Plan name used in SUMMARY
 * @param {Array<{startsAt: Date, durationMinutes?: number, notes?: string}>} options.events
 */
export const buildIcsForSessions = ({
  uidBase,
  organizerEmail,
  userEmail,
  planName,
  events,
}) => {
  const dtStamp = formatIcsDate(new Date());
  const prodId = "-//Appointment Booking System//EN";
  const lines = [
    "BEGIN:VCALENDAR",
    "PRODID:" + prodId,
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const start = toUtcDate(ev.startsAt);
    const duration =
      ev.durationMinutes && Number.isFinite(ev.durationMinutes)
        ? ev.durationMinutes
        : 60; // default 1 hour
    const end = new Date(start.getTime() + duration * 60000);
    const uid = `${uidBase}-${start.getTime()}-${i}@appointments`;
    const desc = (ev.notes || "")
      .replace(/\r?\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");

    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:Session - ${escapeIcsText(planName)}`,
      `DESCRIPTION:${desc}`,
      `ORGANIZER:MAILTO:${organizerEmail}`,
      `ATTENDEE;CN=${escapeIcsText(
        userEmail
      )};ROLE=REQ-PARTICIPANT:MAILTO:${userEmail}`,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
};

function toUtcDate(d) {
  // ensure Date instance and return a new Date in UTC (Date always stores UTC internally)
  return new Date(d);
}

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatIcsDate(d) {
  // yyyymmddThhmmssZ in UTC
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcsText(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/**
 * Generate HTML and text for sessions confirmation email.
 * @param {Object} options
 * @param {string} options.recipientName
 * @param {string} options.planName
 * @param {number} options.totalSessions
 * @param {Array<Date>} options.startsAtList - Sorted list of session times
 * @returns {{html: string, text: string}}
 */
export const generateSessionsConfirmedTemplates = ({
  recipientName = "User",
  planName,
  totalSessions,
  startsAtList,
}) => {
  const itemsHtml = startsAtList
    .map((d) => `<li>${new Date(d).toLocaleString()}</li>`) // basic human-readable
    .join("");
  const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Sessions Confirmed</title>
            <style>
                body { font-family: Arial, sans-serif; color: #333; background: #f6f8fa; padding: 20px; }
                .container { max-width: 640px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
                .header { background: linear-gradient(135deg, #22c1c3 0%, #0f8cfa 100%); color: #fff; padding: 24px; }
                .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
                .content { padding: 24px; }
                .greeting { font-size: 16px; margin-bottom: 10px; }
                .message { font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
                ul { padding-left: 20px; }
                .footer { background: #f1f3f5; padding: 16px; text-align: center; font-size: 12px; color: #677; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header"><h1>Sessions Confirmed</h1></div>
                <div class="content">
                    <div class="greeting">Hello ${escapeIcsText(
                      recipientName
                    )} 👋</div>
                    <div class="message">Your ${totalSessions} sessions for plan <b>${escapeIcsText(
    planName
  )}</b> have been scheduled.</div>
                    <div class="message">We've attached calendar invites (.ics) so you can add them easily.</div>
                    <ul>${itemsHtml}</ul>
                </div>
                <div class="footer">Appointment Booking System — automated message</div>
            </div>
        </body>
        </html>
    `;

  const text = `Hello ${recipientName},\n\nYour ${totalSessions} sessions for plan ${planName} have been scheduled.\nCalendar invites are attached.\n\n${startsAtList
    .map((d) => `- ${new Date(d).toLocaleString()}`)
    .join("\n")}`;

  return { html, text };
};
