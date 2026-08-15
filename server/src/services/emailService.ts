import nodemailer from 'nodemailer';
import { db } from '../config/database.js';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail(options: MailOptions): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || 'MindMend Academy <noreply@mindmend.edu>';

  // Always log to sent_emails table for admin auditing and verification preview
  try {
    db.prepare(
      'INSERT INTO sent_emails (recipient_email, subject, body_html) VALUES (?, ?, ?)'
    ).run(options.to, options.subject, options.html);
  } catch (dbError) {
    console.error('Failed to log email to database:', dbError);
  }

  // If SMTP config is missing, simulate email sending
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log('--------------------------------------------');
    console.log(`✉️  [SIMULATED EMAIL SENT]`);
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body (HTML length): ${options.html.length} chars`);
    console.log('--------------------------------------------');
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`✉️  [EMAIL SENT SUCCESS] To: ${options.to}`);
    return true;
  } catch (error) {
    console.error(`❌ [EMAIL SEND ERROR] Failed to send email to ${options.to}:`, error);
    return false;
  }
}

export function compileStaffVerificationTemplate(params: {
  full_name: string;
  staff_id: string;
  email: string;
  passwordText: string;
  loginUrl: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to MindMend Academy</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8fafc;
      color: #334155;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(106, 27, 154, 0.05);
      border: 1px solid #f1f5f9;
      box-sizing: border-box;
    }
    .header {
      background: linear-gradient(135deg, #6A1B9A, #8E24AA);
      color: #ffffff;
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
    }
    .content {
      padding: 32px;
      line-height: 1.6;
    }
    .credentials-card {
      background-color: #f5effb;
      border: 1px solid #e1bee7;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .credential-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dashed #e1bee7;
      box-sizing: border-box;
    }
    .credential-row:last-child {
      border-bottom: none;
    }
    .credential-label {
      font-weight: 700;
      color: #6a1b9a;
    }
    .credential-value {
      font-family: monospace;
      font-size: 14px;
      color: #1e293b;
    }
    .btn {
      display: inline-block;
      background-color: #6A1B9A;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-weight: bold;
      text-align: center;
      margin: 16px auto;
      display: block;
      width: fit-content;
    }
    .btn:hover {
      background-color: #8E24AA;
    }
    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #d97706;
      color: #92400e;
      padding: 16px;
      border-radius: 8px;
      font-size: 13px;
      margin-top: 24px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="container border-box">
    <div class="header">
      <h1>MindMend Academy</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${params.full_name}</strong>,</p>
      <p>Welcome to the MindMend Academy instructors team! Your trainer profile has been verified and registered by the administrator. Your account is now active.</p>
      
      <p>Please use the following credentials to access the trainer portal:</p>
      
      <div class="credentials-card">
        <div class="credential-row">
          <span class="credential-label">Staff ID:</span>
          <span class="credential-value">${params.staff_id}</span>
        </div>
        <div class="credential-row">
          <span class="credential-label">Login Email:</span>
          <span class="credential-value">${params.email}</span>
        </div>
        <div class="credential-row">
          <span class="credential-label">Temporary Password:</span>
          <span class="credential-value"><strong>${params.passwordText}</strong></span>
        </div>
      </div>
      
      <a href="${params.loginUrl}" class="btn" style="color: #ffffff;">Access Trainer Portal</a>
      
      <div class="warning-box">
        <strong>🔒 Security Reminder:</strong> For your security, you are required to change this temporary password immediately after your first login via your profile dashboard settings.
      </div>
    </div>
    <div class="footer">
      This is an automated email from MindMend Academy. Please do not reply directly to this message.<br>
      © 2026 MindMend Academy. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

export function compileStudentWelcomeTemplate(params: {
  full_name: string;
  student_id: string;
  email: string;
  loginUrl: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to MindMend Academy</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8fafc;
      color: #334155;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(106, 27, 154, 0.05);
      border: 1px solid #f1f5f9;
      box-sizing: border-box;
    }
    .header {
      background: linear-gradient(135deg, #6A1B9A, #8E24AA);
      color: #ffffff;
      padding: 32px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
    }
    .content {
      padding: 32px;
      line-height: 1.6;
    }
    .student-card {
      background-color: #f5effb;
      border: 1px solid #e1bee7;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .card-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dashed #e1bee7;
      box-sizing: border-box;
    }
    .card-row:last-child {
      border-bottom: none;
    }
    .card-label {
      font-weight: 700;
      color: #6a1b9a;
    }
    .card-value {
      font-family: monospace;
      font-size: 14px;
      color: #1e293b;
    }
    .btn {
      display: inline-block;
      background-color: #6A1B9A;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-weight: bold;
      text-align: center;
      margin: 16px auto;
      display: block;
      width: fit-content;
    }
    .btn:hover {
      background-color: #8E24AA;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="container border-box">
    <div class="header">
      <h1>MindMend Academy</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${params.full_name}</strong>,</p>
      <p>Congratulations! Your registration with MindMend Academy was successful. We are excited to support you on your learning journey!</p>
      
      <p>Here are your student enrollment details:</p>
      
      <div class="student-card">
        <div class="card-row">
          <span class="card-label">Student ID:</span>
          <span class="card-value">${params.student_id}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Registered Email:</span>
          <span class="card-value">${params.email}</span>
        </div>
      </div>
      
      <p>You can now log in to the student portal to access your courses, view syllabus details, and complete interactive assignments.</p>
      
      <a href="${params.loginUrl}" class="btn" style="color: #ffffff;">Access Student Portal</a>
    </div>
    <div class="footer">
      This is an automated email from MindMend Academy. Please do not reply directly to this message.<br>
      © 2026 MindMend Academy. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}
