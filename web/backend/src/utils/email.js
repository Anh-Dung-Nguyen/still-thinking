import nodemailer from "nodemailer";

const createTransporter = () => {
    if (process.env.NODE_ENV === "production") {
        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
            user: process.env.ETHEREAL_USER,
            pass: process.env.ETHEREAL_PASSWORD,
        },
    });
};

export const sendVerificationEmail = async (email, token, fullname) => {
    try {
        const transporter = createTransporter();

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

        const mailOptions = {
            from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "Verify your email address",
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Your Email</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333333;
                            background-color: #f4f4f4;
                        }
                        .email-wrapper {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 40px 30px;
                            text-align: center;
                        }
                        .header h1 {
                            color: #ffffff;
                            font-size: 28px;
                            margin: 0;
                            font-weight: 600;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .content h2 {
                            color: #333333;
                            font-size: 24px;
                            margin-bottom: 20px;
                            font-weight: 600;
                        }
                        .content p {
                            color: #666666;
                            font-size: 16px;
                            margin-bottom: 20px;
                            line-height: 1.8;
                        }
                        .button-container {
                            text-align: center;
                            margin: 35px 0;
                        }
                        .verify-button {
                            display: inline-block;
                            padding: 16px 40px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: 600;
                            font-size: 16px;
                            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                            transition: transform 0.2s;
                        }
                        .verify-button:hover {
                            transform: translateY(-2px);
                        }
                        .divider {
                            margin: 30px 0;
                            border-bottom: 1px solid #e0e0e0;
                        }
                        .link-section {
                            background-color: #f9f9f9;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .link-section p {
                            font-size: 14px;
                            color: #666666;
                            margin-bottom: 10px;
                        }
                        .verification-link {
                            word-break: break-all;
                            color: #667eea;
                            text-decoration: none;
                            font-size: 14px;
                        }
                        .expiry-notice {
                            background-color: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .expiry-notice p {
                            color: #856404;
                            font-size: 14px;
                            margin: 0;
                        }
                        .footer {
                            background-color: #f9f9f9;
                            padding: 30px;
                            text-align: center;
                            border-top: 1px solid #e0e0e0;
                        }
                        .footer p {
                            color: #999999;
                            font-size: 14px;
                            margin: 5px 0;
                        }
                        .footer a {
                            color: #667eea;
                            text-decoration: none;
                        }
                        .social-links {
                            margin-top: 20px;
                        }
                        .social-links a {
                            display: inline-block;
                            margin: 0 10px;
                            color: #999999;
                            text-decoration: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-wrapper">
                        <div class="header">
                            <h1>✨ ${process.env.APP_NAME}</h1>
                        </div>
                        
                        <div class="content">
                            <h2>Hi ${fullname}! 👋</h2>
                            <p>Thank you for signing up! We're excited to have you on board.</p>
                            <p>To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
                            
                            <div class="button-container">
                                <a href="${verificationUrl}" class="verify-button">Verify Email Address</a>
                            </div>
                            
                            <div class="expiry-notice">
                                <p>⏰ <strong>Important:</strong> This verification link will expire in 30 minutes for security reasons.</p>
                            </div>
                            
                            <div class="divider"></div>
                            
                            <div class="link-section">
                                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                                <a href="${verificationUrl}" class="verification-link">${verificationUrl}</a>
                            </div>
                            
                            <div class="divider"></div>
                            
                            <p style="font-size: 14px; color: #999999;">
                                If you didn't create an account with us, please ignore this email or contact our support team if you have concerns.
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p><strong>${process.env.APP_NAME}</strong></p>
                            <p>Need help? <a href="mailto:${process.env.SUPPORT_EMAIL}">Contact Support</a></p>
                            <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully: ", info.messageId);

        if (process.env.NODE_ENV !== "production") {
            console.log("Preview URL: ", nodemailer.getTestMessageUrl(info));
        }

        return info;

    } catch (error) {
        console.error("Error sending verification email: ", error);
        throw error;
    }
};

export const sendWelcomeEmail = async (email, fullname) => {
    try {
        const transporter = createTransporter();

        const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;

        const mailOptions = {
            from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: `Welcome to ${process.env.APP_NAME}!`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome!</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333333;
                            background-color: #f4f4f4;
                        }
                        .email-wrapper {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                        }
                        .header {
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            padding: 50px 30px;
                            text-align: center;
                        }
                        .header h1 {
                            color: #ffffff;
                            font-size: 32px;
                            margin-bottom: 10px;
                            font-weight: 700;
                        }
                        .header .emoji {
                            font-size: 48px;
                            margin-bottom: 10px;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .content h2 {
                            color: #333333;
                            font-size: 24px;
                            margin-bottom: 20px;
                            font-weight: 600;
                        }
                        .content p {
                            color: #666666;
                            font-size: 16px;
                            margin-bottom: 20px;
                            line-height: 1.8;
                        }
                        .success-badge {
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            color: white;
                            padding: 12px 24px;
                            border-radius: 50px;
                            display: inline-block;
                            font-weight: 600;
                            margin: 20px 0;
                        }
                        .features-grid {
                            display: table;
                            width: 100%;
                            margin: 30px 0;
                        }
                        .feature-item {
                            display: table-row;
                        }
                        .feature-icon {
                            display: table-cell;
                            padding: 15px;
                            font-size: 24px;
                            width: 60px;
                            vertical-align: top;
                        }
                        .feature-content {
                            display: table-cell;
                            padding: 15px;
                            vertical-align: top;
                        }
                        .feature-content h3 {
                            color: #333333;
                            font-size: 18px;
                            margin-bottom: 5px;
                            font-weight: 600;
                        }
                        .feature-content p {
                            color: #666666;
                            font-size: 14px;
                            margin: 0;
                        }
                        .button-container {
                            text-align: center;
                            margin: 35px 0;
                        }
                        .cta-button {
                            display: inline-block;
                            padding: 16px 40px;
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: 600;
                            font-size: 16px;
                            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
                        }
                        .divider {
                            margin: 30px 0;
                            border-bottom: 1px solid #e0e0e0;
                        }
                        .support-section {
                            background-color: #f0fdf4;
                            padding: 25px;
                            border-radius: 8px;
                            border-left: 4px solid #10b981;
                            margin: 20px 0;
                        }
                        .support-section h3 {
                            color: #065f46;
                            font-size: 18px;
                            margin-bottom: 10px;
                            font-weight: 600;
                        }
                        .support-section p {
                            color: #047857;
                            font-size: 14px;
                            margin: 0;
                        }
                        .support-section a {
                            color: #059669;
                            font-weight: 600;
                            text-decoration: none;
                        }
                        .footer {
                            background-color: #f9f9f9;
                            padding: 30px;
                            text-align: center;
                            border-top: 1px solid #e0e0e0;
                        }
                        .footer p {
                            color: #999999;
                            font-size: 14px;
                            margin: 5px 0;
                        }
                        .footer a {
                            color: #10b981;
                            text-decoration: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-wrapper">
                        <div class="header">
                            <div class="emoji">🎉</div>
                            <h1>Welcome Aboard!</h1>
                        </div>
                        
                        <div class="content">
                            <h2>Hi ${fullname}! 👋</h2>
                            
                            <div class="success-badge">
                                ✓ Account Verified Successfully
                            </div>
                            
                            <p>Congratulations! Your account has been verified and you're now part of the <strong>${process.env.APP_NAME}</strong> community. We're thrilled to have you with us!</p>
                            
                            <p>You now have full access to all our features and can start exploring everything we have to offer.</p>
                            
                            <div class="divider"></div>
                            
                            <h3 style="color: #333333; font-size: 20px; margin-bottom: 20px;">What's Next? 🚀</h3>
                            
                            <div class="features-grid">
                                <div class="feature-item">
                                    <div class="feature-icon">👤</div>
                                    <div class="feature-content">
                                        <h3>Complete Your Profile</h3>
                                        <p>Add a profile picture, bio, and preferences to personalize your experience.</p>
                                    </div>
                                </div>
                                
                                <div class="feature-item">
                                    <div class="feature-icon">🔍</div>
                                    <div class="feature-content">
                                        <h3>Explore Features</h3>
                                        <p>Discover all the amazing tools and features available to you.</p>
                                    </div>
                                </div>
                                
                                <div class="feature-item">
                                    <div class="feature-icon">🌟</div>
                                    <div class="feature-content">
                                        <h3>Get Started</h3>
                                        <p>Jump right in and start using the platform to its fullest potential.</p>
                                    </div>
                                </div>
                                
                                <div class="feature-item">
                                    <div class="feature-icon">🤝</div>
                                    <div class="feature-content">
                                        <h3>Connect with Others</h3>
                                        <p>Build your network and engage with our community.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="button-container">
                                <a href="${dashboardUrl}" class="cta-button">Go to Dashboard</a>
                            </div>
                            
                            <div class="divider"></div>
                            
                            <div class="support-section">
                                <h3>💬 Need Help?</h3>
                                <p>Our support team is here to help you succeed. If you have any questions or need assistance, don't hesitate to reach out at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a></p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p><strong>${process.env.APP_NAME}</strong></p>
                            <p>Questions? <a href="mailto:${process.env.SUPPORT_EMAIL}">Contact Support</a></p>
                            <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Welcome email sent successfully: ", info.messageId);

        if (process.env.NODE_ENV !== "production") {
            console.log("Preview URL: ", nodemailer.getTestMessageUrl(info));
        }

        return info;

    } catch (error) {
        console.error("Error sending welcome email: ", error);
        throw error;
    }
};