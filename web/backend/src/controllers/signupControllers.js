import User from "../models/User.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../utils/email.js";
import { generateToken, generateVerificationCode, generateVerificationToken } from "../utils/generation.js";
import { sendVerificationSMS } from "../utils/phone.js";

export const checkAvailability = async (req, res) => {
    try {
        const {field, value} = req.body;

        if (!field || !value) {
            return res.status(400).json({
                success: false,
                message: "Field and value are required",
            });
        }

        const validFields = ["nickname", "email", "phoneNumber"];
        if (!validFields.includes(field)) {
            return res.status(400).json({
                success: false,
                message: "Invalid field",
            });
        }

        const query = {[field]: field === "email" || field === "nickname" ? value.toLowerCase() : value};
        const exists = await User.findOne(query);

        res.status(200).json({
            success: true,
            available: !exists,
            message: exists ? `This ${field} is already taken` : `This ${field} is available`,
        });

    } catch (error) {
        console.error("Check availability error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const signup = async (req, res) => {
    try {
        const {fullname, nickname, email, password, phoneNumber, dateOfBirth, gender, verificationMethod} = req.body;
    
        if (!fullname || !nickname || !email || !password || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
                fields: ["fullname", "nickname", "email", "password", "phoneNumber"],
            });
        }

        if (!verificationMethod || !["email", "phone"].includes(verificationMethod)) {
            return res.status(400).json({
                success: false,
                message: "Please select a verification method (email or phone)",
                field: "verificationMethod",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
                field: "email",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
                field: "password",
            });
        }

        const nicknameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!nicknameRegex.test(nickname)) {
            return res.status(400).json({
                success: false,
                message: "Nickname must be 3-20 characters and contains only letters, numbers and underscores",
                field: "nickname",
            });
        }

        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber.replace(/[\s()-]/g, ''))) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number format",
                field: "phoneNumber",
            });
        }

        if (dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 18) {
                return res.status(400).json({
                    success: false,
                    message: "You must be at least 18 years old to register",
                    field: "dateOfBirth",
                });
            }
        }

        const existingUser = await User.findOne({
            $or: [
                {email: email.toLowerCase()},
                {nickname: nickname.toLowerCase()},
                {phoneNumber},
            ],
        });

        if (existingUser) {
            let field = "";
            let message = "";

            if (existingUser.email == email.toLowerCase()) {
                field = "email";
                message = "Email is already registered";
            } else if (existingUser.nickname == nickname.toLowerCase()) {
                field = "nickname";
                message = "Nickname is already taken";
            } else if (existingUser.phoneNumber == phoneNumber) {
                field = "phoneNumber";
                message = "Phone number is already registered";
            }

            return res.status(409).json({
                success: false,
                message,
                field,
            });
        }

        let verificationData = {};
        if (verificationMethod === "email") {
            const emailVerificationToken = generateVerificationToken();
            verificationData = {
                emailVerificationToken,
                emailVerificationExpires: Date.now() + 30 * 60 * 1000,
            };
        } else if (verificationMethod === "phone") {
            const phoneVerificationToken = generateVerificationCode();
            verificationData = {
                phoneVerificationToken,
                phoneVerificationExpires: Date.now() + 30 * 60 * 1000,
            };
        }

        const user = await User.create({
            fullname,
            nickname: nickname.toLowerCase(),
            email: email.toLowerCase(),
            password,
            phoneNumber,
            dateOfBirth: dateOfBirth || undefined,
            accountStatus: "pending",
            isOnboarded: false,
            onboardingStep: 0,
            ...verificationData,
        });

        try {
            if (verificationMethod === "email") {
                await sendVerificationEmail(
                    user.email,
                    verificationData.emailVerificationToken,
                    user.fullname,
                );
            } else if (verificationMethod === "phone") {
                await sendVerificationSMS(
                    user.phoneNumber,
                    verificationData.phoneVerificationToken,
                );
            }
        } catch (error) {
            console.error("Verification sending error: ", error);
        }

        const token = generateToken(user._id);

        const userResponse = {
            id: user._id,
            fullname: user.fullname,
            nickname: user.nickname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            accountStatus: user.accountStatus,
            isOnboarded: user.isOnboarded,
            verificationMethod,
            verification: {
                email: user.verification.email,
                phone: user.verification.phone,
            },
        };

        const message = verificationMethod === "email"
            ? "Account created successfully. Please check your email for verification."
            : "Account created successfully. Please check your phone for verification code.";

        res.status(201).json({
            success: true,
            message,
            user: userResponse,
            token,
        });

    } catch (error) {
        console.error("Signup error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error during registration",
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const {token} = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token is required",
            });
        }

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: {$gt: Date.now()},
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token",
            });
        }

        user.verification.email = true;
        user.verification.verifyAt = new Date();
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        if (user.accountStatus === "pending") {
            user.accountStatus = "active";
        }

        await user.save();

        try {
            await sendWelcomeEmail(user.email, user.fullname);
        } catch (error) {
            console.error("Welcome email error: ", error);
        }

        res.status(200).json({
            success: true,
            message: "Email verified successfully! Welcome to our platform.",
            user: {
                id: user._id,
                email: user.email,
                verified: user.verification.email,
                accountStatus: user.accountStatus,
            },
        });

    } catch (error) {
        console.error("Email verification error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error during verification",
        });
    }
};

export const verifyPhone = async (req, res) => {
    try {
        const {phoneNumber, code} = req.body;

        if (!phoneNumber || !code) {
            return res.status(400).json({
                success: false,
                message: "Phone number and verification code are required.",
            });
        }

        const user = await User.findOne({
            phoneNumber,
            phoneVerificationToken: code,
            phoneVerificationExpires: {$gt: Date.now()},
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code",
            });
        }

        user.verification.phone = true;
        user.verification.verifyAt = new Date();
        user.phoneVerificationToken = undefined;
        user.phoneVerificationExpires = undefined;

        if (user.accountStatus === "pending") {
            user.accountStatus = "active";
        }

        await user.save();

        try {
            await sendWelcomeEmail(user.email, user.fullname);
        } catch (error) {
            console.error("Welcome email error: ", error);
        }

        res.status(200).json({
            success: true,
            message: "Phone verified successfully! Welcome to out platform.",
            user: {
                id: user._id,
                phoneNumber: user.phoneNumber,
                verified: user.verification.phone,
                accountStatus: user.accountStatus,
            },
        });

    } catch (error) {
        console.error("Phone verification error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error during verification",
        });
    }
};

export const resendVerificationEmail = async (req, res) => {
    try {
        const {email} = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.verification.email) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified",
            });
        }

        const emailVerificationToken = generateVerificationToken();
        const emailVerificationExpires = Date.now() + 30 * 60 * 1000;

        user.emailVerificationToken = emailVerificationToken;
        user.emailVerificationExpires = emailVerificationExpires;

        await user.save();

        await sendVerificationEmail(user.email, emailVerificationToken, user.fullname);

        res.status(200).json({
            success: true,
            message: "Verification email sent successfully",
        });
    } catch (error) {
        console.error("Resend verification error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const resendVerificationPhone = async (req, res) => {
    try {
        const {phoneNumber} = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        const user = await User.findOne({phoneNumber});

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.verification.phone) {
            return res.status(400).json({
                success: false,
                message: "Phone is already verified",
            });
        }

        const phoneVerificationToken = generateVerificationCode();
        const phoneVerificationExpires = Date.now() + 30 * 60 * 1000;

        user.phoneVerificationToken = phoneVerificationToken;
        user.phoneVerificationExpires = phoneVerificationExpires;

        await user.save();

        await sendVerificationSMS(user.phoneNumber, phoneVerificationToken);

        res.status(200).json({
            success: true,
            message: "Verification code sent successfully",
        });

    } catch (error) {
        console.error("Resend phone verification error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};