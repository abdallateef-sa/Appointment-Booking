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
                font-family: 'Arial', 'Helvetica', sans-serif;
                line-height: 1.6;
                color: #2c3e50;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
                font-weight: 500;
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
                    Welcome to our <span class="company-name">Bayan School</span>! 
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
                    Thank you for choosing <span class="company-name">Bayan School</span>
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

Welcome to Bayan School!

Your email verification code is: ${otp}

Please use this code to verify your email address and complete your registration.

IMPORTANT: This code will expire in 10 minutes.

If you did not request this verification, please ignore this email.

Thank you for joining us!

---
Bayan School
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
        : 30; // default 30 minutes (half hour)
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
      `SUMMARY:Session ${i + 1} - ${escapeIcsText(planName)}`,
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
 * @param {number} options.planPrice - Plan price
 * @param {string} options.planCurrency - Plan currency (default: USD)
 * @param {Array<Date>} options.startsAtList - Sorted list of session times
 * @returns {{html: string, text: string}}
 */
export const generateSessionsConfirmedTemplates = ({
  recipientName = "User",
  planName,
  totalSessions,
  planPrice = 0,
  planCurrency = "USD",
  startsAtList,
  displaySessions = [], // Array of { startsAtUTC, userLocalDate, userLocalTime, userCountry, formatted }
  userCountry = null,
}) => {
  // Generate formatted session cards in pairs
  // If displaySessions is provided prefer it (shows DB-stored local date/time)
  const sessionsSource =
    displaySessions && displaySessions.length
      ? displaySessions
      : startsAtList.map((d) => ({ startsAtUTC: d }));

  const sessionCardsHtml = sessionsSource
    .reduce((pairs, date, index) => {
      if (index % 2 === 0) {
        pairs.push([date]);
      } else {
        pairs[pairs.length - 1].push(date);
      }
      return pairs;
    }, [])
    .map((pair, pairIndex) => {
      const pairHtml = pair
        .map((d, indexInPair) => {
          const sessionIndex = pairIndex * 2 + indexInPair;
          // d may be either { startsAtUTC } or displaySessions item
          let dayName = "";
          let dateStr = "";
          let timeStr = "";
          if (d.userLocalDate && d.userLocalTime) {
            // Use DB-stored local date/time
            const dt = new Date(`${d.userLocalDate}T${d.userLocalTime}:00`);
            dayName = dt.toLocaleDateString("en-US", { weekday: "long" });
            dateStr = dt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            timeStr = d.userLocalTime; // keep original format (HH:mm)
          } else {
            const sessionDate = new Date(d.startsAtUTC || d);
            dayName = sessionDate.toLocaleDateString("en-US", {
              weekday: "long",
            });
            dateStr = sessionDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            timeStr = sessionDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
          }

          return `
                        <div class="session-card">
                            <div class="session-number">Session ${
                              sessionIndex + 1
                            }</div>
                            <div class="session-day">${dayName}</div>
                            <div class="session-date">${dateStr}</div>
                            <div class="session-time">🕒 ${timeStr}</div>
                        </div>
                    `;
        })
        .join("");

      return `<div class="session-row">${pairHtml}</div>`;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sessions Confirmed - Appointment Booking</title>
        <style>
            /* Reset and Base Styles */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
                color: #2c3e50; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 0;
                line-height: 1.6;
                font-weight: 400;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }
            
            /* Main Container */
            .container { 
                width: 100%;
                max-width: 600px; 
                margin: 0 auto; 
                background: #fff; 
                border-radius: 0;
                box-shadow: none;
                overflow: hidden;
            }
            
            /* Header */
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: #fff; 
                padding: 30px 20px;
                text-align: center;
            }
            .header h1 { 
                margin: 0; 
                font-size: 28px; 
                font-weight: 700;
                margin-bottom: 10px;
            }
            .header .icon {
                font-size: 40px;
                margin-bottom: 15px;
                display: block;
            }
            
            /* Content Area */
            .content { 
                padding: 30px 20px;
            }
            .greeting { 
                font-size: 22px; 
                margin-bottom: 20px;
                color: #2c3e50;
                font-weight: 600;
            }
            .message { 
                font-size: 16px; 
                line-height: 1.7; 
                margin-bottom: 30px;
                color: #34495e;
            }
            
            /* Sessions Header */
            .sessions-header {
                text-align: center;
                margin: 30px 0 25px 0;
                padding: 20px 15px;
                background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
                border-radius: 12px;
                border: 2px dashed #667eea;
            }
            .sessions-title {
                font-size: 20px;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 8px;
            }
            .sessions-subtitle {
                font-size: 14px;
                color: #7f8c8d;
            }
            
            /* Sessions Grid - 2 columns on all devices */
            .sessions-grid {
                margin: 25px 0;
            }
            .session-row {
                display: table;
                width: 100%;
                margin-bottom: 15px;
                border-spacing: 10px 0;
            }
            .session-card {
                background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
                border: 2px solid #e3e8ff;
                border-radius: 8px;
                padding: 15px 8px;
                text-align: center;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
                position: relative;
                overflow: hidden;
                display: table-cell;
                width: 50%;
                vertical-align: top;
            }
            .session-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            }
            .session-number {
                font-size: 10px;
                font-weight: 600;
                color: #667eea;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 6px;
            }
            .session-day {
                font-size: 14px;
                font-weight: 700;
                color: #2c3e50;
                margin-bottom: 4px;
            }
            .session-date {
                font-size: 11px;
                color: #5a6c7d;
                margin-bottom: 8px;
                line-height: 1.2;
            }
            .session-time {
                font-size: 12px;
                font-weight: 600;
                color: #667eea;
                background: rgba(102, 126, 234, 0.1);
                padding: 4px 8px;
                border-radius: 15px;
                display: inline-block;
            }
            
            /* Notes Sections - Compact */
            .calendar-note, .payment-note {
                border-radius: 8px;
                padding: 15px 12px;
                margin: 15px 0;
                font-size: 13px;
                line-height: 1.4;
            }
            .calendar-note {
                background: linear-gradient(135deg, #e8f5e8 0%, #f0fdf4 100%);
                border: 2px solid #bbf7d0;
                text-align: center;
            }
            .payment-note {
                background: linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%);
                border: 2px solid #ef4444;
                text-align: center;
            }
            .calendar-note .icon, .payment-note .icon {
                font-size: 16px;
                margin-right: 6px;
                display: inline;
            }
            .calendar-note-text, .payment-note-text {
                font-size: 13px;
                font-weight: 500;
                display: inline;
            }
            .calendar-note-text {
                color: #065f46;
            }
            .payment-note-text {
                color: #dc2626;
            }
            
            /* Footer - Compact and Always Visible */
            .footer { 
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 15px 20px;
                text-align: center;
                border-top: 1px solid #dee2e6;
                clear: both;
                width: 100%;
            }
            .footer-logo {
                font-size: 16px;
                margin-bottom: 5px;
            }
            .footer-title {
                font-size: 14px;
                font-weight: 600;
                color: #495057;
                margin-bottom: 8px;
            }
            .company-name {
                color: #667eea;
                font-weight: 700;
            }
            .footer-note {
                font-size: 10px;
                color: #868e96;
                margin-top: 8px;
                border-top: 1px solid #dee2e6;
                padding-top: 8px;
                line-height: 1.3;
                max-width: 100%;
            }
            
            /* Desktop Styles - Enhanced for larger screens */
            @media screen and (min-width: 600px) {
                body {
                    padding: 20px;
                }
                .container {
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                .header {
                    padding: 40px 30px;
                }
                .header h1 {
                    font-size: 32px;
                }
                .header .icon {
                    font-size: 48px;
                }
                .content {
                    padding: 40px 30px;
                }
                .greeting {
                    font-size: 24px;
                }
                .message {
                    font-size: 18px;
                }
                .sessions-grid {
                    margin: 30px 0;
                }
                .session-row {
                    border-spacing: 15px 0;
                }
                .session-card {
                    padding: 20px 15px;
                    border-radius: 12px;
                }
                .session-number {
                    font-size: 12px;
                    margin-bottom: 8px;
                }
                .session-day {
                    font-size: 18px;
                    margin-bottom: 6px;
                }
                .session-date {
                    font-size: 14px;
                    margin-bottom: 10px;
                }
                .session-time {
                    font-size: 16px;
                    padding: 6px 12px;
                    border-radius: 20px;
                }
                .calendar-note, .payment-note {
                    padding: 25px;
                    margin: 30px 0;
                }
                .footer {
                    padding: 30px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="icon">📅</span>
                <h1>Sessions Confirmed!</h1>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Hello ${escapeIcsText(recipientName)}! 👋
                </div>
                
                <div class="message">
                    Congratulations ${escapeIcsText(
                      recipientName
                    )}! Your appointment booking has been successfully confirmed. 
                    We're excited to have you join us for your upcoming sessions.
                </div>

                <div class="sessions-header">
                    <div class="sessions-title">🗓️ Your Upcoming Sessions</div>
                    <div class="sessions-subtitle">
                        Mark your calendar! Here are all your scheduled appointments
                    </div>
                </div>

                <div class="sessions-grid">
                    ${sessionCardsHtml}
                </div>

                <div class="calendar-note">
                    <span class="icon">📎</span>
                    <div class="calendar-note-text">
                        <strong>Calendar Files Attached!</strong><br>
                        We've included .ics calendar files so you can easily add these appointments 
                        to your Google Calendar, Outlook, or any other calendar app.
                    </div>
                </div>

                <div style="text-align:center; margin-top: 10px; font-size: 13px; color: #475569;">
                    <em>Note: The times above are shown in your country's local time${
                      userCountry ? ` (${escapeIcsText(userCountry)})` : ""
                    } as saved in your profile.</em>
                </div>

                <div class="payment-note">
                    <span class="icon">❗</span>
                    <div class="payment-note-text">
                        <strong>Payment Required!</strong><br>
                        Selected Plan: <strong>${escapeIcsText(
                          planName
                        )} Plan, Price: ${planPrice} ${planCurrency}</strong><br>
                        Please contact customer service to confirm payment and complete your enrollment.
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-logo">🎯</div>
                <div class="footer-title">
                    <span class="company-name">Bayan School</span>
                </div>
                <div class="footer-note">
                    This is an automated confirmation message. Please do not reply to this email.<br>
                    If you need to make changes to your appointments, please contact our support team.
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `🎉 Sessions Confirmed!

Hello ${recipientName},

Your ${totalSessions} sessions for plan "${planName}" have been successfully scheduled!

📅 Your Upcoming Sessions:
${startsAtList
  .map((d, index) => {
    const sessionDate = new Date(d);
    const dayName = sessionDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const dateStr = sessionDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = sessionDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `Session ${index + 1}: ${dayName}, ${dateStr} at ${timeStr}`;
  })
  .join("\n")}

📎 Calendar invites (.ics files) are attached to help you add these appointments to your calendar.

Note: The listed times are in the user's local time${
    userCountry ? ` (${userCountry})` : ""
  } as saved in your profile.

Thank you for choosing Bayan School!

---
This is an automated message. Please do not reply.`;

  return { html, text };
};
